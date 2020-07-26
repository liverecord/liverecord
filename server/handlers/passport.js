const chalk = require('chalk');
const FacebookStrategy = require('passport-facebook');
const TwitterStrategy = require('passport-twitter');
const WindowsLiveStrategy = require('passport-windowslive');
const VKontakteStrategy = require('passport-vkontakte').Strategy;
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const httpUtil = require('../common/http');
const models = require('../schema');
const users = require('./users');
const statics = require('./static');
const lrLogin = require('./login');
const { coalesce } = require('object-path');
const errorHandler = require('./errors');



const {
  OAUTH_FACEBOOK_CLIENT_ID,
  OAUTH_FACEBOOK_CLIENT_SECRET,
  OAUTH_TWITTER_CLIENT_ID,
  OAUTH_TWITTER_CLIENT_SECRET,
  OAUTH_WINDOWSLIVE_CLIENT_ID,
  OAUTH_WINDOWSLIVE_CLIENT_SECRET,
  OAUTH_VKONTAKTE_CLIENT_ID,
  OAUTH_VKONTAKTE_CLIENT_SECRET,
  OAUTH_GITHUB_CLIENT_ID,
  OAUTH_GITHUB_CLIENT_SECRET,
  OAUTH_GOOGLE_CLIENT_ID,
  OAUTH_GOOGLE_CLIENT_SECRET,
} = process.env;

function initUser(accessToken, refreshToken, profile, cb) {
  'use strict';
  console.log(
      chalk.bgBlue.green('facebook'),
      accessToken, refreshToken, profile, cb);

  let cond = [
    {
      'socialNetworks.network': profile.provider,
      'socialNetworks._id': profile.id,
    },
  ];
  if (profile.emails.length > 0) {
    for (let k of profile.emails) {
      cond.push({email: k.value});
    }
  }


  let picture = coalesce('profile', 'photos.0.value', '');

  models.User.findOne({$or: cond}, {_id: 1, email: 1, slug: 1, pw: 1}).
      then((user) => {
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
                picture: picture,
                about: profile.about || '',
              },
              (signUpResult) => {
                if (signUpResult.success) {
                  models.User.findOne(
                      {_id: signUpResult.user._id},
                      {_id: 1, email: 1, slug: 1, pw: 1},
                  ).then((user) => {
                    if (user) {
                      cb(null, user);
                    } else {
                      cb(null, signUpResult.user);
                    }
                  }).catch(errorHandler);
                } else {
                  cb(signUpResult, null);
                }
              });
        }
      }).
      catch((reason) => {
        cb(reason, null);
      });
}

/*
 * Hook passport handlers
 * @param {object} passport Passport
 * @param {object} app Express app
 */
function setup(passport, app) {
  if (OAUTH_FACEBOOK_CLIENT_ID) {
    passport.use(new FacebookStrategy({
          clientID:
          OAUTH_FACEBOOK_CLIENT_ID,
          clientSecret:
          OAUTH_FACEBOOK_CLIENT_SECRET,
          callbackURL:
              httpUtil.url('/api/oauth/facebook/callback'),
          profileFields: [
            'id',
            'emails',
            'displayName',
            'gender',
            'photos',
            'profileUrl',
          ],
        },
        function(accessToken, refreshToken, profile, cb) {
          initUser(accessToken, refreshToken, profile, cb);
        },
    ));
    //
    app.use('/api/oauth/facebook',
        passport.authenticate(
            'facebook',
            {
              scope: ['email', 'public_profile'],
              successRedirect: '/',
            },
        ),
    );
  }

  if (OAUTH_TWITTER_CLIENT_ID) {
    passport.use(new TwitterStrategy({
          consumerKey:
          OAUTH_TWITTER_CLIENT_ID,
          consumerSecret:
          OAUTH_TWITTER_CLIENT_SECRET,
          callbackURL:
              httpUtil.url('/api/oauth/twitter/callback'),
          profileFields: [
            'id',
            'emails',
            'displayName',
            'gender',
            'photos',
            'profileUrl',
          ],
          userProfileURL:
              'https://api.twitter.com/1.1/account/verify_credentials.json?include_email=true',
        },
        function(accessToken, refreshToken, profile, cb) {
          profile.about = profile._json.description;
          initUser(accessToken, refreshToken, profile, cb);
        },
    ));
    //
    app.use('/api/oauth/twitter',
        passport.authenticate(
            'twitter',
            {failureRedirect: '/'},
        ),
    );
  }

  if (OAUTH_WINDOWSLIVE_CLIENT_ID) {
    passport.use(new WindowsLiveStrategy({
          clientID:
          OAUTH_WINDOWSLIVE_CLIENT_ID,
          clientSecret:
          OAUTH_WINDOWSLIVE_CLIENT_SECRET,
          callbackURL:
              httpUtil.url('/api/oauth/windowslive/callback'),
          profileFields: [
            'id',
            'emails',
            'displayName',
            'photos',
            'profileUrl',
          ],
        },
        function(accessToken, refreshToken, profile, cb) {
          initUser(accessToken, refreshToken, profile, cb);
        },
    ));
    //
    app.use('/api/oauth/windowslive',
        passport.authenticate(
            'windowslive',
            {
              scope: ['wl.emails', 'wl.signin', 'wl.basic'],
              failureRedirect: '/',
            },
        ),
    );
  }

  if (OAUTH_VKONTAKTE_CLIENT_ID) {
    passport.use(new VKontakteStrategy({
          clientID:
          OAUTH_VKONTAKTE_CLIENT_ID,
          clientSecret:
          OAUTH_VKONTAKTE_CLIENT_SECRET,
          callbackURL:
              httpUtil.url('/api/oauth/vkontakte/callback'),
          profileFields: [
            'id',
            'email',
            //'emails',
            'displayName',
            'gender',
            'photos',
            'profileUrl',
          ],
          scope: ['email'],
        },
        function(accessToken, refreshToken, params, profile, cb) {
          if (!profile.emails && params.email) {
            profile.emails = [
              {value: params.email},
            ];
          }
          initUser(accessToken, refreshToken, profile, cb);
        },
    ));
    //
    app.use('/api/oauth/vkontakte',
        passport.authenticate(
            'vkontakte',
            {
              scope: ['email'],
              failureRedirect: '/',
            },
        ),
    );
  }

  if (OAUTH_GOOGLE_CLIENT_ID) {
    passport.use(new GoogleStrategy({
          clientID:
          OAUTH_GOOGLE_CLIENT_ID,
          clientSecret:
          OAUTH_GOOGLE_CLIENT_SECRET,
          callbackURL:
              httpUtil.url('/api/oauth/google/callback'),
        },
        function(accessToken, refreshToken, profile, cb) {
          initUser(accessToken, refreshToken, profile, cb);
        },
    ));
    //
    app.use('/api/oauth/google',
        passport.authenticate(
            'google',
            {
              scope: [
                'profile email https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile',
              ],
              failureRedirect: '/',
            },
        ),
    );
  }

  if (OAUTH_GITHUB_CLIENT_ID) {
    passport.use(new GitHubStrategy({
          clientID:
          OAUTH_GITHUB_CLIENT_ID,
          clientSecret:
          OAUTH_GITHUB_CLIENT_SECRET,
          callbackURL:
              httpUtil.url('/api/oauth/github/callback'),
          profileFields: [
            'id',
            'emails',
            'displayName',
            'photos',
            'profileUrl',
          ],
        },
        function(accessToken, refreshToken, profile, cb) {
          initUser(accessToken, refreshToken, profile, cb);
        },
    ));
    //
    app.use('/api/oauth/github',
        passport.authenticate(
            'github',
            {
              scope: ['user:email'],
              failureRedirect: '/',
            },
        ),
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
      },
  );
}

module.exports = setup;
