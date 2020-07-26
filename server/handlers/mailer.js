/**
 * Created by zoonman on 11/19/16.
 */

const xtend = require('xtend');
const nodemailer = require('nodemailer');

function mailer(options, callback) {
  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport(
      process.env.EMAIL_TRANSPORT //'smtps://user%40gmail.com:pass@smtp.gmail.com'
  );
  // setup e-mail data with unicode symbols
  let mailOptions = {
    from: process.env.EMAIL_SENDER,
    to: process.env.EMAIL_SENDER,
    subject: 'Тема',
    text: 'Текст',
    html: '<p>Текст</p>'
  };

  mailOptions = xtend(mailOptions, options);

  // send mail with defined transport object
  transporter.sendMail(mailOptions, callback);
}

module.exports = mailer;
