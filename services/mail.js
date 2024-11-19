const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
const { communication } = require("../db");
const { uniqueString } = require("../utils");
dotenv.config();

async function sendMail(recieverEmail, otp, identity) {
  try {
    const templateForOtp = await communication.getTemplate(
      process.env.OTPTEMPLATEIDEMAIL
    );
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: 587,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });
    // Email options
    const mailOptions = {
      from: templateForOtp[0].emailg_sender_email_id, // Sender address (must be verified in SES)
      to: recieverEmail, // List of recipients
      subject: templateForOtp[0].message_subject, // Subject line
      // text: templateForOtp[0].message, // Plain text body
      html: templateForOtp[0].message
        .replace("&lt;&lt;User&gt;&gt;", recieverEmail)
        .replace("&nbsp;&lt;&lt;123456&gt;&gt;", otp), // HTML body (optional)
    };

    // Return a promise
    return new Promise((resolve, reject) => {
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          return reject("Error sending email: " + error);
        }
        const logDataForEmail = {
          idcommunication_log: uniqueString(),
          idtemplate: templateForOtp[0].idtemplate,
          idmetadata_com_mode: templateForOtp[0].idmetadata_com_mode,
          idevent_def_allowed_source: identity.idevent_defination,
          identity: identity.identity,
          identity_urc_auth: identity.idurc,
          event_ref_key: identity.idevent_transaction,
          receiver: templateForOtp[0].receiver,
          sender: templateForOtp[0].sender,
          receiver_mode_detail: null,
          message_text: templateForOtp[0].message,
          message_subject: templateForOtp[0].message_subject,
          message_delivery_status: info.response,
        };
        communication.createCommLogs(logDataForEmail);
        console.log("Email sent successfully:", info.response);
        resolve(info.response); // Resolve with the info object
      });
    });
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
}


async function sendMailForgotPassword(recieverEmail, otp) {
  try {
    const templateForOtp = await communication.getTemplate(
      process.env.OTPTEMPLATEIDEMAIL
    );
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: 587,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });
    // Email options
    const mailOptions = {
      from: templateForOtp[0].emailg_sender_email_id, // Sender address (must be verified in SES)
      to: recieverEmail, // List of recipients
      subject: templateForOtp[0].message_subject, // Subject line
      // text: templateForOtp[0].message, // Plain text body
      html: templateForOtp[0].message
        .replace("&lt;&lt;User&gt;&gt;", recieverEmail)
        .replace("&nbsp;&lt;&lt;123456&gt;&gt;", otp), // HTML body (optional)
    };

    // Return a promise
    return new Promise((resolve, reject) => {
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          return reject("Error sending email: " + error);
        }
        resolve(info.response); // Resolve with the info object
      });
    });
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
}

module.exports = {
  sendMail,
  sendMailForgotPassword
};
