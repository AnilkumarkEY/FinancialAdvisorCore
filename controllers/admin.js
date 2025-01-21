const { responseFormatter, statusCodes, uniqueString } = require("../utils");
const { admin, event, entity } = require("../db");
const {
  entityService,
  entityContact,
  agent,
  entityUserAuth,
  mailService,
} = require("../services");
const { createUser } = require("../services/azureOps");
const dotenv = require("dotenv");
dotenv.config();

exports.createAgent = async (request, reply) => {
  try {
    const { identity } = request.isValid;
    const { entityData, contactData, agentData } = request.body;
    const entityRes = await entityService.processEntityData(
      entityData,
      identity
    );
    contactData.identity = entityRes[0].identity; //taking identity of newly created entity
    agentData.advisor_name = entityRes[0].fullname;
    const [contactRes, agentRes] = await Promise.all([
      entityContact.processEntityContactData(contactData, identity),
      agent.insertAgentData(agentData),
    ]);
    const [profileRes, entityAuthUrcRes] = await Promise.all([
      agent.insertProfileData(entityRes[0], agentRes[0], agentData),
      entityUserAuth.processEntityAuthUrcData(entityRes[0], entityData),
    ]);

    const azureUserData = {
      givenName: entityData.firstname,
      surname: entityData.lastname,
      mobilePhone: contactData.primary_phone,
      jobTitle: agentData.desgn_desc,
      displayName: contactData.primary_email.split("@")[0],
      mailNickname: contactData.primary_email.split("@")[0],
      mail: contactData.primary_email,
      userPrincipalName:
        contactData.primary_email.split("@")[0] +
        "@malhotraabhishek114gmail.onmicrosoft.com",
      password: process.env.TEMPPASSWORD,
      officeLocation:
        contactData.address_line_1 + " " + contactData.address_line_2,
      streetAddress: contactData.location_name,
      city: contactData.city,
      state: contactData.state,
      postalCode: contactData.pincode,
      country: contactData.country,
    };

    const createUserInAzure = await createUser(azureUserData);
    if (createUserInAzure) {
      const userData = {
        iduser_auth_data: uniqueString(),
        identity: entityRes[0].identity,
        reg_mobile_number: contactData.primary_phone,
        upn_iam:
          contactData.primary_email.split("@")[0] +
          "@malhotraabhishek114gmail.onmicrosoft.com",
        oid: createUserInAzure.id,
        reg_email: contactData.primary_email,
        createdby: identity,
      };
      await entity.insertUserAuth(userData);
    }

    if (
      entityRes.length > 0 &&
      agentRes.length > 0 &&
      profileRes.length > 0 &&
      entityAuthUrcRes.length > 0
    ) {
      await mailService.sendMailTemporaryPassword(
        contactData.primary_email,
        process.env.TEMPPASSWORD
      );
      await event.insertEventTransaction(request.isValid);
      return reply
        .status(statusCodes.OK)
        .send(responseFormatter(statusCodes.OK, "Agent saved successfully"));
    } else {
      return reply
        .status(statusCodes.NO_CONTENT)
        .send(
          responseFormatter(statusCodes.NO_CONTENT, "Agent details not updated")
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
};

exports.getUserList = async (request, reply) => {
  try {
    const pagination = {
      pageNumber: request.body.pageNumber || 1,
      pageCount: request.body.pageCount || 10,
    };

    const data = await admin.getAllUsers(pagination);

    if (data.data.length) {
      return reply
        .status(statusCodes.OK)
        .send(
          responseFormatter(
            statusCodes.OK,
            "User data fetched successfully",
            data
          )
        );
    } else {
      return reply
        .status(statusCodes.NO_CONTENT)
        .send(
          responseFormatter(
            statusCodes.NO_CONTENT,
            "No user data available",
            data
          )
        );
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
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
