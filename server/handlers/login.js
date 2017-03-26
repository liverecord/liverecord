/**
 * Created by zoonman on 11/19/16.
 */

const models = require('../schema');
const pick = require('object.pick');
const pw = require('credential')();
const jwt = require('jsonwebtoken');
const gravatar = require('gravatar');
const ucfirst = require('ucfirst');
const md5 = require('md5');
const errorHandler = require('./errors');
const users = require('./users');

function respondAuthUser(user, loginCallback) {
  let webUser = pick(
      user,
      [
        '_id',
        'name',
        'email',
        'picture',
        'slug',
        'online',
        'rank',
        'about',
        'roles'
      ]);
  users.getJwtToken(user, function(err, token) {
    if (err) {
      loginCallback({
            success: false,
            error: 'jwt_cannot_be_created'
          }
      );
      errorHandler(err);
    } else {
      loginCallback({
            success: true,
            user: webUser,
            //deviceId: jwtUser['di'],
            token: token
          }
      );
    }
  });
}

function lrSignUp(signUpData, doneCallback) {
  // sign up
  models.User.count().then(function(number) {
    let roles = [];
    if (number > 0) {
      // this is not a first user
    } else {
      // this is first one
      roles = ['admin', 'moderator'];
    }
    let name = '';
    if (signUpData.name) {
      name = signUpData.name.trim();
    } else {
      let eParts = signUpData.email.split('@');
      name = eParts[0];
      name = name.replace(/\W+/g, ' ').replace(/\s+/g, ' ');
    }
    name = ucfirst(name);
    let futureUserData = {
      name: name,
      roles: roles,
      email: signUpData.email,
      settings: {
        notifications: {
          email: true
        }
      }
    };
    if (signUpData.picture) {
      futureUserData.picture = signUpData.picture;
    } else {
      futureUserData.picture = gravatar.url(
          futureUserData.email,
          {s: '100', r: 'g', d: 'retro'},
          true);
    }
    if (signUpData.gender) {
      futureUserData.gender = signUpData.gender;
    }
    if (signUpData.about) {
      futureUserData.about = signUpData.about;
    }
    if (signUpData.username) {
      futureUserData.slug = signUpData.username;
    }
    if (signUpData.socialNetwork) {
      futureUserData.socialNetworks = [signUpData.socialNetwork];
    }
    let newUser = new models.User(futureUserData);
    pw.hash(signUpData.password, function(err, pwHash) {
      if (err) {
        doneCallback({
              success: false,
              error: 'users_hash_cannot_be_created'
            }
        );
        errorHandler(err);
      } else {
        newUser.pw = JSON.parse(pwHash);
        console.log(pwHash);
        newUser.save(function(err, savedUser) {
              if (err) {
                doneCallback({
                      success: false,
                      error: 'user_cannot_be_saved'
                    }
                );
                errorHandler(err);
              } else {
                respondAuthUser(savedUser, doneCallback);
              }
            }
        );
      }
    });
  }).catch(function(reason) {
    return errorHandler(reason);
  });
}

function lrLogin(loginData, loginCallback) {
  if (loginData && loginData.email && loginData.password) {

    models.User.findOne({email: loginData.email}, function(err, user) {
      if (err) {
        return errorHandler(err);
      }
      if (user) {
        pw.verify(JSON.stringify(user.pw),
            loginData.password,
            function(err, isValid) {
              if (err) {
                loginCallback({
                      success: false,
                      error: 'password_verification_failed'
                    }
                );
                errorHandler(err);
              }
              if (isValid) {
                respondAuthUser(user, loginCallback);
              } else {
                loginCallback({
                      success: false,
                      error: 'password_mismatch'
                    }
                );
              }
            }
        );
      } else {
        lrSignUp(loginData, loginCallback);
      }
    });
  } else {
    loginCallback({
          success: false,
          error: 'password_verification_failed'
        }
    );
  }
}

function lrLoginSocketHandler(socket) {
  socket.on('login', function(loginData, loginCallback) {
    console.log(loginData);
    lrLogin(loginData, loginCallback);
  });
}

module.exports.socketHandler = lrLoginSocketHandler;
module.exports.signIn = lrLogin;
module.exports.signUp = lrSignUp;
module.exports.respondAuthUser = respondAuthUser;
