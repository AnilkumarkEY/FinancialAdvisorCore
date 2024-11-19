const { responseFormatter, statusCodes } = require("../utils");
const { event, entity, profile, otp, user} = require("../db");
const { insertSrTransaction } = require("../services/sr_transaction");
const { resetchangeUserPassword, getUserByEmail } = require("../services/azureOps");
const { otpService } = require("../services");
const moment = require("moment/moment");

exports.getContactList = async (request, reply) => {
  try {
    const identity = request.isValid.identity;
    if (identity.length) {
      const data = await entity.getEntityContactByIdentity(identity);
      if (data) {
        const filteredData = data.reduce((result, record) => {
          const filteredRecord = Object.fromEntries(
            Object.entries(record).filter(([_, value]) => value !== null)
          );
          result[record.contact_type] = filteredRecord;
          return result;
        }, {});
        await event.insertEventTransaction(request.isValid);
        return reply
          .status(statusCodes.OK)
          .send(
            responseFormatter(
              statusCodes.OK,
              "Contact records fetched successfully",
              filteredData
            )
          );
      } else {
        return reply
          .status(statusCodes.INTERNAL_SERVER_ERROR)
          .send(
            responseFormatter(
              statusCodes.INTERNAL_SERVER_ERROR,
              "An unexpected error occurred",
              data
            )
          );
      }
    } else {
      return reply
        .status(statusCodes.OK)
        .send(
          responseFormatter(
            statusCodes.OK,
            "No contact found",
            data
          )
        );
    }
  } catch (error) {
    console.error(error);
    return reply
      .status(statusCodes.INTERNAL_SERVER_ERROR)
      .send(
        responseFormatter(
          statusCodes.INTERNAL_SERVER_ERROR,
          "An unexpected error occurred"
        )
      );
  }
};

exports.getNomineeDetails = async (request, reply) => {
    try {
      const identity = request.isValid.identity;
      let data = await profile.getNomineeDetailsByIdentity(identity);
      if (data.length) {
        data.map(item => item.nominee_dob = moment(item.nominee_dob).format("DD/MM/YYYY"));
        await event.insertEventTransaction(request.isValid);
        return reply
          .status(statusCodes.OK)
          .send(
            responseFormatter(
              statusCodes.OK,
              "Nominee details fetched successfully",
              data
            )
          );
      } else {
        return reply
          .status(statusCodes.INTERNAL_SERVER_ERROR)
          .send(
            responseFormatter(
              statusCodes.INTERNAL_SERVER_ERROR,
              "An unexpected error occurred",
              data
            )
          );
      }
    } catch (error) {
      console.error(error);
      return reply
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .send(
          responseFormatter(
            statusCodes.INTERNAL_SERVER_ERROR,
            "An unexpected error occurred"
          )
        );
    }
};

exports.updateContact = async (request, reply) => {
  try {
    const { idmeta_contact_type, newValues } = request.body.sr_meta_value;
    const identity = request.isValid.identity;
    const primaryPhoneMeta = 'eef8f47d787041b59afd37937deed705';
    const primaryEmailMeta = '4678e1bb1f2d414393a85dfbe0c85fff';
    const adressMeta = 'b8fbf7947f8b4505a91e662af6953a15';

    await insertSrTransaction(request.body, identity); //updating sr transaction

    let updateContact;
    if(idmeta_contact_type === adressMeta){
      updateContact = await profile.updateContactAddress(newValues, idmeta_contact_type, identity); //Updating Address into entity-contact table
    } else {
      updateContact = await profile.updateContact(newValues, idmeta_contact_type, identity); //Updating Phone/Email into entity-contact table
    }
    

    // Checking if updating entry is primary phone/email then updating into user_auth_data
    if(idmeta_contact_type === primaryPhoneMeta){
      await profile.updateContactInUserAuth({
        contactType: primaryPhoneMeta, 
        newValues, 
        identity
      })
    }

    if(idmeta_contact_type === primaryEmailMeta){
      await profile.updateContactInUserAuth({
        contactType: primaryEmailMeta, 
        newValues, 
        identity
      })
    }

    if (updateContact.length > 0) {
      await event.insertEventTransaction(request.isValid);
      return reply
        .status(statusCodes.OK)
        .send(
          responseFormatter(
            statusCodes.OK,
            "Contact updated successfully"
          )
        );
    } else {
      return reply
        .status(statusCodes.NO_CONTENT)
        .send(
          responseFormatter(
            statusCodes.NO_CONTENT,
            "Contact not updated"
          )
        );
    }
  } catch (error) {
    return reply
      .status(statusCodes.INTERNAL_SERVER_ERROR)
      .send(
        responseFormatter(
          statusCodes.INTERNAL_SERVER_ERROR,
          "Internal server error occurred",
          { error: error.message }
        )
      );
  }
}

exports.getMetaData = async (request, reply) => {
  try {
    const { metaMaster } = request.query;
    const metaData = await profile.getMetaData(metaMaster); // Getting meta data from DB & maping keys    

    if (metaData.length > 0) {
      await event.insertEventTransaction(request.isValid);
      return reply
        .status(statusCodes.OK)
        .send(
          responseFormatter(
            statusCodes.OK,
            "Meta Data retrieved successfully",
            metaData
          )
        );
    } else {
      return reply
        .status(statusCodes.NO_CONTENT)
        .send(
          responseFormatter(
            statusCodes.NO_CONTENT,
            "Data not found"
          )
        );
    }
  } catch (error) {
    return reply
      .status(statusCodes.INTERNAL_SERVER_ERROR)
      .send(
        responseFormatter(
          statusCodes.INTERNAL_SERVER_ERROR,
          "Internal server error occurred",
          { error: error.message }
        )
      );
  }
}

exports.updateNomineeDetails = async (request, reply) => {
  try {
    const { identity_nominee, newValues } = request.body.sr_meta_value;
    const identity = request.isValid.identity;

    await insertSrTransaction(request.body, identity); //updating sr transaction

    const fullnameArray = newValues.fullname.split(' ');
    const name = {
      firstname: fullnameArray[0],
      middlename: fullnameArray.length > 2 ? fullnameArray[1] : undefined,
      lastname: fullnameArray.length > 1 ? fullnameArray[fullnameArray.length - 1] : undefined
    };
    newValues.name = name;

    const updateEntity = await profile.updateEntity(newValues, identity_nominee); 

    const updateNominee = await profile.updateNomineeDetails(newValues, identity_nominee, identity);

    if (updateEntity.length > 0 && updateNominee.length > 0) {
      await event.insertEventTransaction(request.isValid);
      return reply
        .status(statusCodes.OK)
        .send(
          responseFormatter(
            statusCodes.OK,
            "Data updated successfully"
          )
        );
    } else {
      return reply
        .status(statusCodes.NO_CONTENT)
        .send(
          responseFormatter(
            statusCodes.NO_CONTENT,
            "Unable to update data"
          )
        );
    }
  } catch (error) {
    return reply
      .status(statusCodes.INTERNAL_SERVER_ERROR)
      .send(
        responseFormatter(
          statusCodes.INTERNAL_SERVER_ERROR,
          "Internal server error occurred",
          { error: error.message }
        )
      );
  }
}

exports.getSrSubCategory = async (request, reply) => {
  try {
    const { categoryMaster } = request.query;
    const subcategoryData = await profile.getSrSubCategory(categoryMaster); // Getting meta data from DB & maping keys    

    if (subcategoryData.length > 0) {
      await event.insertEventTransaction(request.isValid);
      return reply
        .status(statusCodes.OK)
        .send(
          responseFormatter(
            statusCodes.OK,
            "SubCategory Data retrieved successfully",
            subcategoryData
          )
        );
    } else {
      return reply
        .status(statusCodes.NO_CONTENT)
        .send(
          responseFormatter(
            statusCodes.NO_CONTENT,
            "Data not found"
          )
        );
    }
  } catch (error) {
    return reply
      .status(statusCodes.INTERNAL_SERVER_ERROR)
      .send(
        responseFormatter(
          statusCodes.INTERNAL_SERVER_ERROR,
          "Internal server error occurred",
          { error: error.message }
        )
      );
  }
}

exports.getProfileOfficialDetails = async (request, reply) => {
  try {
    const {identity} = request.isValid;
    const res = await profile.getProfileOfficialDetails(identity);

    if (res.length > 0) {
      await event.insertEventTransaction(request.isValid);
      return reply
        .status(statusCodes.OK)
        .send(
          responseFormatter(
            statusCodes.OK,
            "Profile retrieved successfully",
            res
          )
        );
    } else {
      return reply
        .status(statusCodes.NO_CONTENT)
        .send(
          responseFormatter(
            statusCodes.NO_CONTENT,
            "Data not found"
          )
        );
    }
  } catch (error) {
    return reply
      .status(statusCodes.INTERNAL_SERVER_ERROR)
      .send(
        responseFormatter(
          statusCodes.INTERNAL_SERVER_ERROR,
          "Internal server error occurred",
          { error: error.message }
        )
      );
  }
}

exports.azureCheckUser = async (request, reply) => {
  try {
    const { userEmail, identity, agent_code } = request.body;
    const res = await getUserByEmail(userEmail);
    if (res.status === 'ok') {
      // Find user based on agent code
      const userData = await user.getUserDataForOtp(
        identity,
        agent_code
      );

      if(userData.length){
        const sentOtp = await otpService.sendOTPForgotPassword(userData[0]);
        if (sentOtp) {
          const addOtpToVerify = await otp.insertOtp(
            identity,
            sentOtp
          );
          if (addOtpToVerify) {
            return reply
              .status(statusCodes.OK)
              .send(responseFormatter(statusCodes.OK, "OTP sent successfully", res.res.value));
          } else {
            return reply
              .status(statusCodes.OK)
              .send(responseFormatter(statusCodes.OK, "OTP not sent", res.res.value));
          }
        } else {
          return reply
            .status(statusCodes.OK)
            .send(responseFormatter(statusCodes.NOT_FOUND, "OTP not sent"));
        }
      }
    } else {
      return reply
        .status(statusCodes.NOT_FOUND)
        .send(responseFormatter(statusCodes.NOT_FOUND, "User not found"));
    }
  } catch (error) {
    return reply
      .status(statusCodes.INTERNAL_SERVER_ERROR)
      .send(
        responseFormatter(
          statusCodes.INTERNAL_SERVER_ERROR,
          "Internal server error occurred",
          { error: error.message }
        )
      );
  }
}

exports.verifyOtpForgotPassword = async (request, reply) => {
  try {
    const { otpToVerify, identity } = request.body;
    const isValidOtp = await otp.verifyOtp(
      otpToVerify,
      identity
    );
    if (isValidOtp) {
      return reply
        .status(statusCodes.OK)
        .send(
          responseFormatter(statusCodes.OK, "Provided OTP is correct", true)
        );
    } else {
      return reply
        .status(statusCodes.OK)
        .send(
          responseFormatter(
            statusCodes.BAD_REQUEST,
            "Provided OTP is incorrect"
          )
        );
    }
  } catch (error) {
    console.error(error);
    return reply
      .status(statusCodes.INTERNAL_SERVER_ERROR)
      .send(
        responseFormatter(
          statusCodes.INTERNAL_SERVER_ERROR,
          "An unexpected error occurred"
        )
      );
  }
};

exports.resetPassword = async (request, reply) => {
  try {
    const { userId, newPassword } = request.body;

    const changePassword = await resetchangeUserPassword(userId, newPassword);
    if (changePassword.status === 'ok') {
      return reply
        .status(statusCodes.OK)
        .send(
          responseFormatter(statusCodes.OK, "Password changed successfully")
        );
    } else {
      return reply
        .status(statusCodes.BAD_REQUEST)
        .send(
          responseFormatter(
            statusCodes.BAD_REQUEST,
            changePassword.error
          )
        );
    }
  } catch (error) {
    console.error(error);
    return reply
      .status(statusCodes.INTERNAL_SERVER_ERROR)
      .send(
        responseFormatter(
          statusCodes.INTERNAL_SERVER_ERROR,
          "An unexpected error occurred"
        )
      );
  }
};
