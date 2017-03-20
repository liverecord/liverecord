/**
 * Created by zoonman on 11/19/16.
 */

const xtend = require('xtend');
const nodemailer = require('nodemailer');

function mailer(options, callback) {
  // create reusable transporter object using the default SMTP transport
  var transporter = nodemailer.createTransport(
      process.env.npm_package_config_email_transport //'smtps://user%40gmail.com:pass@smtp.gmail.com'
  );
  // setup e-mail data with unicode symbols
  var mailOptions = {
    from: process.env.npm_package_config_email_sender,
    to: process.env.npm_package_config_email_sender,
    subject: 'Тема',
    text: 'Текст',
    html: '<p>Текст</p>'
  };

  mailOptions = xtend(mailOptions, options);

  // send mail with defined transport object
  transporter.sendMail(mailOptions, callback);
}

module.exports = mailer;
