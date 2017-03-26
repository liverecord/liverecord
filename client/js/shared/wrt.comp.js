/**
 * Created by zoonman on 3/22/17.
 */

/**
 *
 *
 * @param {object} $rootScope
 * @param {object} $scope
 */

function wrtcController($rootScope, $scope, socket, $timeout) {
  var self = this;
  var localStream,
      peerConnections = [];
  var configuration = null;
  var offerOptions = {
    offerToReceiveAudio: 1,
    offerToReceiveVideo: 1
  };

  self.tooltip = '';
  self.onCall = false;

  var constraints = window.constraints = {
    audio: true,
    video: true
  };

  function trace(arg) {
    var now = (window.performance.now() / 1000).toFixed(3);
    console.log(now + ': ', arg);
  }

  //
  var localPeerConnection,
      remotePeerConnection,
      localVideo,
      remoteVideo,
      servers = {
        iceServers: [
          {urls: 'stun:stun.l.google.com:19302'}
        ]
      };

  /*
  socket.on('call', function(data) {
    console.log('socket.call', data);

    if (!localPeerConnection) {
      makeTheCall(false);
    }
    if (data.sdp) {
      localPeerConnection.setRemoteDescription(
          new RTCSessionDescription(data.sdp)
      );
    } else {


    }
  });

   // for chrome
   mandatory: {chromeMediaSource: 'screen'}
   // or desktop-Capturing
   mandatory: {chromeMediaSource: 'desktop'}

   // for Firefox
   video: {
   mediaSource: 'window' || 'screen'
   }

  */

  function l(a) {
    console.log(a);
  }

  function gotLocalIceCandidate(evt) {
    socket.emit('new-ice-candidate', {candidate: evt.candidate});
    console.log('gotLocalIceCandidate', evt);
  }

  function gotRemoteStream(evt) {
    console.log('gotRemoteStream', evt);
    remoteVideo = document.querySelector('#remoteVideo');
    remoteVideo.srcObject = evt.stream;
    self.onCall = true;

  }

  socket.on('new-ice-candidate', function(data) {
    console.log('new-ice-candidate', data);
    if (!localPeerConnection) {
      makeTheCall(false);
    }
    if (data.candidate) {
      localPeerConnection.addIceCandidate(
          new RTCIceCandidate(data.candidate)
      );
    }
  });


  function initPeer() {
    localPeerConnection = new RTCPeerConnection(servers);
    localPeerConnection.onicecandidate = gotLocalIceCandidate;
    localPeerConnection.onaddstream = gotRemoteStream;
  }

  socket.on('video-offer', function(offer) {
    console.log('video-offer received', offer);
    if (!localPeerConnection) {
      initPeer();
    }
    self.onCall = true;

    localPeerConnection
        .setRemoteDescription(
            new RTCSessionDescription(offer)
        )
        .then(function() {
          return navigator
              .mediaDevices
              .getUserMedia(constraints);
        })
        .then(function(evt) {
          console.log('video-offer local video', evt);

          localVideo = document.querySelector('#localVideo');
          localVideo.srcObject = evt;
          return localPeerConnection.addStream(evt);
        })
        .then(function() {
          l('video-offer stream added');
          return localPeerConnection.createAnswer();
        })
        .then(function(answer) {
          l('video-offer answer created');
          return localPeerConnection.setLocalDescription(answer);
        })
        .then(function() {
          l('video-offer local description set');
          socket.emit('video-answer', localPeerConnection.localDescription);
        })
        .catch(handleError);
  });

  socket.on('video-answer', function(answer) {
    console.log('video-answer received', answer);
    self.onCall = true;

    if (!localPeerConnection) {
      initPeer();
    }
    localPeerConnection
        .setRemoteDescription(
            new RTCSessionDescription(answer)
        )
        .then(function() {
          l('video-answer remote description set');
        })
        .catch(handleError);

  });



  function makeTheCall(isCaller) {
    if (!localPeerConnection) {
      initPeer();
    }
    if (isCaller) {
      navigator
          .mediaDevices
          .getUserMedia(constraints)
          .then(function(localStream) {
            'use strict';
            localVideo = document.querySelector('#localVideo');
            localVideo.srcObject = localStream;
            localPeerConnection.addStream(localStream);
            localPeerConnection
                .createOffer(offerOptions)
                .then(function(offer) {
                  l('createOffer negotiationneeded');
                  return localPeerConnection.setLocalDescription(offer);
                })
                .then(function() {
                  l('createOffer share localDescription');
                  socket.emit('video-offer', localPeerConnection.localDescription);
                })
                .catch(handleError);

          })
          .catch(handleError);
    }

    /*
    localPeerConnection = new RTCPeerConnection(servers);
    localPeerConnection.onicecandidate = gotLocalIceCandidate;
    localPeerConnection.onaddstream = gotRemoteStream;
    l('call...');
    navigator
        .mediaDevices
        .getUserMedia({audio: true, video: true})
        .then(function(stream) {
          // get local stream
          localVideo = document.querySelector('#localVideo');
          localVideo.srcObject = stream;
          l('got user media');
          if (isCaller) {
            l('createOffer');
            localPeerConnection.addStream(stream);
            localPeerConnection
                .createOffer(offerOptions)
                .then(function(offer) {
                  l('createOffer negotiationneeded');
                  return localPeerConnection.setLocalDescription(offer);
                })
                .then(function() {
                  l('createOffer share localDescription');

                  socket.emit('call', localPeerConnection.localDescription);
                })
                .catch(handleError);
          } else {
            // localPeerConnection.remoteDescription
            localPeerConnection
                .createAnswer()
                .then(function(answer) {
                  l('createAnswer..');
                  return localPeerConnection.setLocalDescription(answer);
                })
                .then(function(desc) {
                  l('createAnswer.then.')
                  socket.emit('call', {'sdp': desc});
                })
                .catch(handleError);
            /*localPeerConnection.remoteDescription,
             gotDescription* /
          }

          function gotDescription(desc) {
            l('gotDescription');
            localPeerConnection.setLocalDescription(desc);

          }
        })
        .catch(handleError);

      */
  }

  var handleError = console.log;


  self.callIn = function() {
    self.onCall = true;
    makeTheCall(true);
  };

  self.hangUp = function() {
    self.onCall = false;

    localPeerConnection.close();
    localVideo.srcObject.getTracks().forEach(function(track) {
      track.stop();
    });
    localVideo.srcObject = null;
    remoteVideo.srcObject.getTracks().forEach(function(track) {
      track.stop();
    });
    remoteVideo.srcObject = null;
  };


}

app.component('lrRtc', {
  templateUrl: '/dist/t/rtc.tpl',
  controller: wrtcController,
  bindings: {
    topic: '=',
    user: '='
  }
});
