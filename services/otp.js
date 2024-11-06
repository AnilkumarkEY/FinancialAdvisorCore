const crypto = require("crypto");
const axios = require("axios");
const dotenv = require("dotenv");
const { sendMail } = require("./mail");
const { communication } = require("../db");
const { uniqueString } = require("../utils");
dotenv.config();

function generateOTP(length = 6) {
  const otp = crypto
    .randomInt(0, Math.pow(10, length))
    .toString()
    .padStart(length, "0");
  return otp;
}

async function sendOTP(userData, identity) {
  const templateForOtp = await communication.getTemplate(
    process.env.OTPTEMPLATEIDSMS
  );
  const otp = generateOTP();
  const phoneNumber = userData.reg_mobile_number;
  const email = userData.reg_email;
  const apiKey = process.env.API_KEY_FOR_OTP; // Your API key
  const message = templateForOtp[0].message.replace("<<OTP>>", otp);
  const sender = templateForOtp[0].smsg_sendid;
  const templateId = templateForOtp[0].smsg_tempid;

  const url = `https://alerts.solutionsinfini.com/api/v4/?api_key=${apiKey}&method=sms&message=${encodeURIComponent(
    message
  )}&to=${phoneNumber}&sender=${sender}&templateid_text=${templateId}`;

  try {
    const instance = axios.create({
      httpsAgent: new require("https").Agent({
        rejectUnauthorized: false, // Disable SSL certificate verification
      }),
    });
    const response = await instance.get(url);
    const mailResponse = await sendMail(email, otp, identity);
    console.log(response.data, mailResponse?.includes("Ok"));
    if (
      response.data &&
      response.data.status === "OK" &&
      mailResponse?.includes("Ok")
    ) {
      const logDataForSms = {
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
        message_delivery_status: response.data.data[0].status,
      };
      await communication.createCommLogs(logDataForSms);
      console.log("OTP sent successfully:", response.data);
      return otp; // OTP sent successfully
    } else {
      console.error("Error sending OTP:", response.data);
      return false; // OTP sending failed
    }
  } catch (error) {
    console.error("Error:", error);
    return false; // Handle errors gracefully
  }
}

module.exports = {
  sendOTP,
};
