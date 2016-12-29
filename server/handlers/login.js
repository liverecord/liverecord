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

function lrLogin(socket, handleError) {

    socket.on('login', function (loginData, loginCallback) {
        console.log(loginData);
        function respondAuthUser(user) {
            var webUser = pick(user, ['_id', 'name', 'email', 'picture', 'slug']);
            var jwtUser = pick(user, ['_id', 'email']);
            jwtUser['nt'] = md5(
                user.pw.hash.substr(17, 2).toLowerCase() +
                user.pw.salt.substr(7, 2).toUpperCase()
            );
            jwt.sign(jwtUser, process.env.npm_package_config_jwt_secret, {}, function(err, token) {
                if (err) {
                    loginCallback({
                        success: false,
                        error: 'jwt_cannot_be_created'
                    });
                    handleError(err);
                } else {
                    loginCallback({
                        success: true,
                        user: webUser,
                        token: token
                    });
                }
            });
        }
        if (loginData && loginData.email && loginData.password) {

            models.User.findOne({email: loginData.email}, function(err, user) {
                if (err) return handleError(err);
                if (user) {
                    pw.verify(JSON.stringify(user.pw), loginData.password, function (err, isValid) {
                        if (err) {
                            loginCallback({
                                success: false,
                                error: 'password_verification_failed'
                            });
                            handleError(err);
                        }
                        if (isValid) {
                            respondAuthUser(user);
                        } else {
                            loginCallback({
                                success: false,
                                error: 'password_mismatch'
                            });
                        }
                    });
                } else {

                    var eparts = loginData.email.split('@');
                    var name = eparts[0];
                    name = ucfirst(name);

                    var newUser = new models.User({
                        name: name,
                        email: loginData.email
                    });
                    pw.hash(loginData.password, function(err, pwHash) {
                        if (err) {
                            loginCallback({
                                success: false,
                                error: 'users_hash_cannot_be_created'
                            });
                            handleError(err);
                        } else {
                            newUser.picture = gravatar.url(newUser.email, {s: '100', r: 'g', d: 'retro'}, true);
                            newUser.pw = JSON.parse(pwHash);
                            console.log(pwHash);
                            newUser.save(function (err, savedUser) {
                                if (err) {
                                    loginCallback({
                                        success: false,
                                        error: 'user_cannot_be_saved'
                                    });
                                    handleError(err);
                                } else {
                                    respondAuthUser(savedUser);
                                }
                            });
                        }
                    });
                }
            });
        } else {
            loginCallback({
                success: false,
                error: 'password_verification_failed'
            });
        }
    });
}

module.exports = lrLogin;
