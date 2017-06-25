/**
 * Created by zoonman on 3/22/17.
 */

/**
 *
 *
 * @param {object} $rootScope
 * @param {object} $scope
 */

function wrtcController($rootScope, $q, socket, $timeout) {
  var self = this;
  var sharedLocalStream = null,
    sharedLocalStreamPromise = null;
  var offerOptions = {
    offerToReceiveAudio: 1,
    offerToReceiveVideo: 1
  };
  var constraints = window.constraints = {
    audio: true,
    video: true
  };

  self.callStarted = 0;
  self.callTime = 0;
  self.tooltip = '';
  self.onCall = false;
  self.audioIsEnabled = true;
  self.videoIsEnabled = true;
  self.fullScreenIsEnabled = false;
  self.remoteStreams = {};

  function trace(arg) {
    var now = (window.performance.now() / 1000).toFixed(3);
    console.log(now + ': ', arg);
  }

  //
  var
      peers = {},
      localVideo,
      remoteVideo,
      servers = {
        iceServers: [
          {urls: 'stun:stun.l.google.com:19302'},
          {urls: 'stun:stun1.l.google.com:19302'},
          {urls: 'stun:stun2.l.google.com:19302'},
          {urls: 'stun:stun3.l.google.com:19302'},
          {urls: 'stun:stun4.l.google.com:19302'},
          {urls: 'stun:stun.services.mozilla.com:3478'},
          {urls: 'stun:stun.samsungsmartcam.com:3478'},
          {urls: 'stun:stun.qq.com:3478'},
          {urls: 'stun:stun.ekiga.net'},
          {urls: 'stun:numb.viagenie.ca:3478'},
          {
            urls: 'turn:numb.viagenie.ca:3478',
            credential: 'g4839vEwGv7q3nf',
            username: 'philipp@zoonman.com'
          },
          {
            urls: 'turn:192.158.29.39:3478?transport=udp',
            credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
            username: '28224511:1379330808'
          },
          {
            urls: 'turn:192.158.29.39:3478?transport=tcp',
            credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
            username: '28224511:1379330808'
          }
        ]
      };

  /*

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


  var updateCallTimer = function() {
    if (self.onCall) {
      self.callTime = Date.now() - self.callStarted;
      $timeout(updateCallTimer, 1000);
    }
  };

  function gotRemoteStream(evt) {
    console.log('gotRemoteStream', evt);
    self.remoteStreams[evt.stream.id] = window.URL.createObjectURL(evt.stream);
    self.onCall = true;
    self.callStarted = Date.now();
    updateCallTimer();
  }

  socket.on('new-ice-candidate', function(data) {
    //console.log('new-ice-candidate', data);
    if (socket.self.id !== data.to) return;
    if (data.topic === self.topic.slug) {
      var localPeerConnection = initPeer(data.from);
      if (data.candidate) {
        localPeerConnection.addIceCandidate(
            new RTCIceCandidate(data.candidate)
        );
      }
    }

  });

  socket.on('video-hangup', function(data) {
    if (self.topic.slug !== data.topic) return;
    hangUp();
  });

  socket.on('video-init', function(data) {
    if (self.topic.slug !== data.topic) return;
    hangUp();
  });
/*
   function getVideoStream() {
    return new Promise(function(resolve, reject) {
      if (sharedLocalStream) {
        console.log('sharedLocalStream is defined');
        resolve(sharedLocalStream);
      } else {
        console.log('sharedLocalStream is null');
        navigator
            .mediaDevices
            .getUserMedia(constraints)
            .then(function(stream) {
              console.log('got local video', stream);
              sharedLocalStream = stream;
              localVideo = document.querySelector('#localVideo');
              localVideo.srcObject = stream;
              localVideo.volume = 0;
              resolve(sharedLocalStream);
            })
            .catch(reject);
      }
    });
  };*/

  function getVideoStream() {
    if (!sharedLocalStreamPromise) {
      sharedLocalStreamPromise = navigator
          .mediaDevices
          .getUserMedia(constraints)
          .catch(function(err) {
            // clear the promise so we don't cache a rejected promise
            sharedLocalStreamPromise = null;
            throw err;
          });
    }
    return sharedLocalStreamPromise;
  }

  function initPeer(id) {
    if (peers[id]) return peers[id];
    var pc = new RTCPeerConnection(servers);
    peers[id] = pc;
    //
    pc.onicecandidate = function(evt) {
      socket.emit('new-ice-candidate', {
        to: id,
        from: socket.self.id,
        topic: self.topic.slug,
        candidate: evt.candidate
      });
      //console.log('gotLocalIceCandidate', evt);
    };
    pc.onaddstream = gotRemoteStream;
    pc.oniceconnectionstatechange = function() {
      console.log('oniceconnectionstatechange', id, pc.iceConnectionState);
    };
    pc.onsignalingstatechange = function() {
      console.log('onsignalingstatechange', id, pc.signalingState);
    };
    pc.onicegatheringstatechange = function() {
      console.log('onicegatheringstatechange', id, pc.iceGatheringState);
    };
    return pc;
  }

  function displayLocalStream(stream) {
    sharedLocalStream = stream;
    localVideo = document.querySelector('#localVideo');
    localVideo.srcObject = stream;
    localVideo.volume = 0;
  }
  socket.on('video-offer', function(offer) {
    console.log('video-offer received', offer);
    if (self.topic.slug !== offer.topic) return;
    if (socket.self.id !== offer.to) return;
    var localPeerConnection = initPeer(offer.from);
    self.onCall = true;
    localPeerConnection
        .setRemoteDescription(
            new RTCSessionDescription(offer.sdp)
        )
        .then(function() {
          return getVideoStream();
        })
        .then(function(stream) {
          console.log('video-offer local video', stream);
          displayLocalStream(stream);
          return localPeerConnection.addStream(sharedLocalStream);
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
          socket.emit(
              'video-answer',
              {
                to: offer.from,
                from: socket.self.id,
                topic: self.topic.slug,
                sdp: localPeerConnection.localDescription
              }
          );
        })
        .catch(handleError);
  });

  socket.on('video-answer', function(answer) {
    console.log('video-answer received', answer);
    if (self.topic.slug !== answer.topic) return;
    if (socket.self.id !== answer.to) return;
    self.onCall = true;

    var localPeerConnection = initPeer(answer.from);

    localPeerConnection
        .setRemoteDescription(
            new RTCSessionDescription(answer.sdp)
        )
        .then(function() {
          l('video-answer remote description set');
        })
        .catch(handleError);
  });

  function makeOffer(id) {
    var localPeerConnection = initPeer(id);
    console.log('lpc', localPeerConnection);
    localPeerConnection.addStream(sharedLocalStream);
    localPeerConnection
        .createOffer(offerOptions)
        .then(function(offer) {
          l('createOffer negotiationneeded');
          return localPeerConnection.setLocalDescription(offer);
        })
        .then(function() {
          l('createOffer share localDescription');
          socket.emit(
              'video-offer',
              {
                to: id,
                from: socket.self.id,
                topic: self.topic.slug,
                sdp: localPeerConnection.localDescription
              });
        })
        .catch(handleError);
  }


  var handleError = console.log;

  socket.on('video-init-pc', function(roster) {
    'use strict';
    console.log('roster', roster, 'socket.id',  socket.self.id);
    getVideoStream()
        .then(function(localStream) {
          'use strict';
          displayLocalStream(localStream);
          console.log('localStream', localStream);
          var myPos = roster.indexOf(socket.self.id);
          console.log('myPos', myPos);
          if (myPos === -1) {
            sharedLocalStream.stop();
            return;
          }
          for (var id = 0; id < roster.length; id++) {
            console.log('walking', id);
            if (roster.hasOwnProperty(id) && id !== myPos && id > myPos) {
              console.log('makeOffer id', id);
              makeOffer(roster[id]);
            }
          }

        })
        .catch(handleError);
  });

  self.callIn = function() {
    hangUp();
    self.onCall = true;
    socket.emit('video-init', {topic: self.topic.slug});
    listenFullScreenState();
  };

  function enableFullScreen(el) {
    if (el.requestFullscreen) {
      el.requestFullscreen();
    } else if (el.mozRequestFullScreen) {
      el.mozRequestFullScreen();
    } else if (el.msRequestFullscreen) {
      el.msRequestFullscreen();
    } else if (el.webkitRequestFullScreen) {
      el.webkitRequestFullScreen();
    }
  }

  function disableFullScreen(el) {
    console.log(el);
    if (el.exitFullscreen) {
      el.exitFullscreen();
    } else if (el.mozCancelFullScreen) {
      el.mozCancelFullScreen();
    } else if (el.msExitFullscreen) {
      el.msExitFullscreen();
    } else if (el.webkitCancelFullScreen) {
      el.webkitCancelFullScreen();
    }
  }

  self.enableFullScreen = function() {
    if (self.fullScreenIsEnabled) {
      disableFullScreen(document);
    } else {
      enableFullScreen(document.getElementById('callComponent'));
    }
  };

  self.muteAudio = function() {
    'use strict';
    self.audioIsEnabled = ! self.audioIsEnabled;
    if (sharedLocalStream) {
      sharedLocalStream.getAudioTracks().forEach(function(track) {
        track.enabled = self.audioIsEnabled;
      });
    }
  };

  self.muteVideo = function() {
    'use strict';
    self.videoIsEnabled = ! self.videoIsEnabled;
    if (sharedLocalStream) {
      sharedLocalStream.getVideoTracks().forEach(function(track) {
        track.enabled = self.videoIsEnabled;
      });
    }
  };

  function hangUp() {
    self.onCall = false;

    if (remoteVideo && remoteVideo.srcObject) {
      remoteVideo.srcObject.getTracks().forEach(function(track) {
        track.stop();
      });
      remoteVideo.srcObject = null;
    }
    if (localVideo && localVideo.srcObject) {
      localVideo.srcObject.getTracks().forEach(function(track) {
        track.stop();
      });
      localVideo.srcObject = null;
    }
    if (sharedLocalStream) {
      sharedLocalStream.getTracks().forEach(function(track) {
        track.stop();
      });
      sharedLocalStream = null;
    }
    for (var key in peers) {
      if (peers.hasOwnProperty(key)) {
        peers[key].close();
        peers[key] = null;
        delete peers[key];
      }
    }
    self.remoteStreams = {};
    sharedLocalStreamPromise = null;
    if (self.fullScreenIsEnabled) {
      disableFullScreen(document);
    }
  }

  function listenFullScreenState() {
    document.addEventListener('fullscreenchange', function() {
      self.fullScreenIsEnabled = !! document.fullscreenElement;
      l('fullscreenchange');
    }, false);

    document.addEventListener('msfullscreenchange', function() {
      l('msfullscreenchange');
      self.fullScreenIsEnabled = !! document.msFullscreenElement;
    }, false);

    document.addEventListener('mozfullscreenchange', function() {
      l('mozfullscreenchange');
      self.fullScreenIsEnabled = !! document.mozFullScreen;
    }, false);

    document.addEventListener('webkitfullscreenchange', function() {
      l('webkitfullscreenchange');
      self.fullScreenIsEnabled = !! document.webkitIsFullScreen;
    }, false);
  }

  self.hangUp = function() {
    self.onCall = false;
    socket.emit('video-hangup', {
      topic: self.topic.slug,
      yes: true});
    hangUp();
  };
}

app.component('lrRtc', {
  templateUrl: '../../tpl/rtc.tpl',
  controller: wrtcController,
  bindings: {
    topic: '=',
    user: '='
  }
});
