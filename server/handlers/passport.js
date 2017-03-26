const chalk = require('chalk');
const FacebookStrategy = require('passport-facebook');
const TwitterStrategy = require('passport-twitter');
const httpUtil = require('../common/http');
const models = require('../schema');
const users = require('./users');
const statics = require('./static');
const lrLogin = require('./login');
const pick = require('object.pick');

function initUser(accessToken, refreshToken, profile, cb) {
  'use strict';
  console.log(
      chalk.bgBlue.green('facebook'),
      accessToken, refreshToken, profile, cb);

  let cond = [
    {
      'socialNetworks.network': profile.provider,
      'socialNetworks._id': profile.id,
    }
  ];
  if (profile.emails.length > 0) {
    for (let k of profile.emails) {
      cond.push({email: k.value});
    }
  }

  models
      .User
      .findOne({$or: cond}, {_id: 1, email: 1, slug: 1, pw: 1})
      .then(function(user) {
        if (user) {
          cb(null, user);
        } else {
          lrLogin.signUp({
            email: profile.emails[0].value || '',
            password: 'p' + Math.random() + accessToken,
            name: profile.displayName || '',
            link: profile.profileUrl || '',
            network: profile.provider || '',
            socialNetwork: {
              _id: profile.id || '',
              network: profile.provider || '',
              link: profile.profileUrl || '',
            },
            picture: profile.photos[0].value || '',
            about: profile.about || ''
          }, function(signUpResult) {
            if (signUpResult.success) {
              models
                  .User
                  .findOne(
                      {_id: signUpResult.user._id},
                      {_id: 1, email: 1, slug: 1, pw: 1}
                  )
                  .then(function(user) {
                    if (user) {
                      cb(null, user);
                    } else {
                      cb(null, signUpResult.user);
                    }
                  });
            } else {
              cb(signUpResult, null);
            }
          });
        }
      })
      .catch(function(reason) {
        cb(reason, null);
      });
  //cb('reason', null);
}

/*
 * Hook passport handlers
 * @param {object} passport Passport
 * @param {object} app Express app
 */
function setup(passport, app) {
  if (process.env.npm_package_config_oauth_facebook_client_id) {
    passport.use(new FacebookStrategy({
          clientID:
              process.env.npm_package_config_oauth_facebook_client_id,
          clientSecret:
              process.env.npm_package_config_oauth_facebook_client_secret,
          callbackURL:
              httpUtil.url('/api/oauth/facebook/callback'),
          profileFields: [
            'id',
            'emails',
            'displayName',
            'gender',
            'photos',
            'profileUrl'
          ]
        },
        function(accessToken, refreshToken, profile, cb) {
          initUser(accessToken, refreshToken, profile, cb);
        }
    ));
    //
    app.use('/api/oauth/facebook',
        passport.authenticate(
            'facebook',
            { scope: ['email', 'public_profile'] }
        )
    );
  }

  if (process.env.npm_package_config_oauth_twitter_client_id) {
    passport.use(new TwitterStrategy({
          consumerKey:
              process.env.npm_package_config_oauth_twitter_client_id,
          consumerSecret:
              process.env.npm_package_config_oauth_twitter_client_secret,
          callbackURL:
              httpUtil.url('/api/oauth/twitter/callback'),
          profileFields: [
            'id',
            'emails',
            'displayName',
            'gender',
            'photos',
            'profileUrl'
          ],
          userProfileURL:
              'https://api.twitter.com/1.1/account/verify_credentials.json?include_email=true'
        },
        function(accessToken, refreshToken, profile, cb) {
          profile.about = profile._json.description;
          initUser(accessToken, refreshToken, profile, cb);
        }
    ));
    //
    app.use('/api/oauth/twitter',
        passport.authenticate(
            'twitter',
            {failureRedirect: '/'}
        )
    );
  }

  // generate and send JWT for this user
  app.use(
      '/api/jwt',
      function(req, res, next) {
        if (req.isAuthenticated()) { return next(); } else {
          statics.sendJsonResponse(res, {error: 'unauthenticated'}, 401);
        }
      },
      function(req, res) {
        'use strict';
        switch (req.method) {
          case 'GET':
            users.getJwtToken(req.user, function(err, token) {
              if (err) {
                statics.sendJsonResponse(res, {error: 'jwt_error'}, 503);
              } else {
                statics.sendJsonResponse(res, {jwt: token}, 200);
              }
            });
            break;
          case 'DELETE':
            req.session.destroy();
            statics.sendJsonResponse(res, {success: true}, 200);
            break;
          default:
            statics.sendJsonResponse(res, {error: 'method_not_allowed'}, 405);

        }
      }
  );
}

module.exports = setup;
