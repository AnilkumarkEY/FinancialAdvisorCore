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

    //Creating user in Azure AD
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

    //Creating data in Entity table
    const entityRes = await entityService.processEntityData(
      entityData,
      identity
    );

    //Creating data in Contact & Agent tables
    contactData.identity = entityRes[0].identity; //taking identity of newly created entity
    agentData.advisor_name = entityRes[0].fullname;
    const [contactRes, agentRes] = await Promise.all([
      entityContact.processEntityContactData(contactData, identity),
      agent.insertAgentData(agentData)
    ]);

    //Creating data in Profile & EntityAuthUrcData tables
    entityRes[0].profile_picture = entityData.profile_picture;
    entityRes[0].userRole = entityData.userRole;
    const [profileRes, entityAuthUrcRes] = await Promise.all([
      agent.insertProfileData(entityRes[0], agentRes[0], agentData),
      entityUserAuth.processEntityAuthUrcData(entityRes[0], entityData)
    ]);

    let authUser = [];
    //Creating data in userAuthData table
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
      authUser = await entity.insertUserAuth(userData);
    }

    if (
      entityRes.length > 0 &&
      agentRes.length > 0 &&
      profileRes.length > 0 &&
      entityAuthUrcRes.length > 0 &&
      authUser.length > 0 &&
      createUserInAzure
    ) {
      await mailService.sendMailTemporaryPassword(
        contactData.primary_email,
        process.env.TEMPPASSWORD
      );
      await event.insertEventTransaction(request.isValid);
      return reply
        .status(statusCodes.OK)
        .send(responseFormatter(statusCodes.OK, `Agent saved successfully with advisor code ${agentRes[0].advisor_code}`));
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

exports.updateAgent = async (request, reply) => {
  try {
    const { identity } = request.isValid;
    const { agentCode, profile_picture, userType, userRole, entityData, contactData, agentData } = request.body;
    const entityId = await admin.getEntityToUpdate(agentCode);
    const id = "fd789c2918db4db4852813cd147bacb0";

    entityData["identity"] = entityId[0]?.identity;
    entityData["fieldToMatch"] = "identity";

    const formattedAddress = [
      contactData.address_line_1,
      contactData.address_line_2,
      contactData.location_name,
      contactData.state,
      contactData.district,
      contactData.pincode,
      contactData.countryname,
    ].join(", ");

    contactData["idmeta_contact_type"] = "b8fbf7947f8b4505a91e662af6953a15";
    contactData["fieldToMatch"] = "idmeta_contact_type";
    contactData["contact_value"] = formattedAddress;
    contactData["identity"] = entityId[0]?.identity;

    agentData["advisor_code"] = agentCode;
    agentData["fieldToMatch"] = "advisor_code";

    const profileData = {
      identity: entityId[0]?.identity,
      business_code: agentCode,
      profile_fullname: agentData.advisor_name,
      designation_code: agentData.desgn_code,
      branch: agentData.branch_name,
      profile_picture: profile_picture,
      userRole: userRole,
      designation: agentData.desgn_desc,
      joiningdate: agentData.dateOf_joining,
      license_expiry_date: agentData.license_expiry,
      leader_code: agentData.l1_leader_code
    };
    const updateProfile = await admin.updateProfile(profileData);
    const entityRes = await entityService.performAction(id, entityData);
    const updateEntity = await entityContact.performAction(id, contactData);
    const agentRes = await admin.updateAgent(agentData);
    const userTypeUpdate = await entityUserAuth.updateEntityAuthUrcData(entityId[0], userType)

    if (entityRes && updateEntity && agentRes && updateProfile && userTypeUpdate) {
      await event.insertEventTransaction(request.isValid);
      return reply
        .status(statusCodes.OK)
        .send(responseFormatter(statusCodes.OK, "Agent Updated successfully"));
    } else {
      return reply
        .status(statusCodes.NO_CONTENT)
        .send(
          responseFormatter(statusCodes.NO_CONTENT, "Agent details not updated")
        );
    }
  } catch (error) {
    console.log(error);
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

exports.deleteAgent = async (request, reply) => {
  try {
    const { agentCode } = request.body;
    const isDeleted = await admin.deleteAgent(agentCode);
    if (isDeleted) {
      await event.insertEventTransaction(request.isValid);
      return reply
        .status(statusCodes.OK)
        .send(responseFormatter(statusCodes.OK, "Agent deleted successfully"));
    } else {
      return reply
        .status(statusCodes.OK)
        .send(
          responseFormatter(statusCodes.NO_CONTENT, "Agent details not deleted")
        );
    }
  } catch (error) {
    console.log(error);
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

exports.getDynamicForm = async (req, reply) => {
  try {
    const { feature } = req.query;
    const data = await admin.getDynamicForm(feature);
    console.log(data)

    if (data.length) {
      return reply
        .status(statusCodes.OK)
        .send(
          responseFormatter(
            statusCodes.OK,
            "Form data fetched successfully",
            data[0]
          )
        );
    } else {
      return reply
        .status(statusCodes.NO_CONTENT)
        .send(
          responseFormatter(
            statusCodes.NO_CONTENT,
            "No data available",
            null
          )
        );
    }
  } catch (error) {
    console.error("Error fetching form data:", error);
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

exports.insertDynmicForm = async (req, reply) => {
  try {
     const { feature, config } = req.body;

    if (!feature || !config) {
      return reply
        .status(statusCodes.BAD_REQUEST)
        .send(responseFormatter(statusCodes.BAD_REQUEST, "Feature and config are required", null));
    }

    const error = validateFormConfig(config);
    if (error) {
      return reply
        .status(statusCodes.BAD_REQUEST)
        .send(responseFormatter(statusCodes.BAD_REQUEST, error, null));
    }

    const data = await admin.insertDynamicForm(feature, config);
    if (data) {
      return reply
      .status(statusCodes.CREATED)
      .send(responseFormatter(statusCodes.CREATED, "Form created successfully", data));
    } else {
      return reply
        .status(statusCodes.NO_CONTENT)
        .send(
          responseFormatter(
            statusCodes.NO_CONTENT,
            "No data available",
            null
          )
        );
    }
  } catch (error) {
    console.error("Error insert form data:", error);
    if (error.code === "23505") { // unique_violation
      return reply
        .status(statusCodes.BAD_REQUEST)
        .send(responseFormatter(statusCodes.BAD_REQUEST, "Feature already exists", null));
    }
    return reply
      .status(statusCodes.INTERNAL_SERVER_ERROR)
      .send(responseFormatter(statusCodes.INTERNAL_SERVER_ERROR, error.message, null));
  }
};

exports.updateDynamicForm = async (req, reply) => {
  try {
    const { feature } = req.query;
    const { config } = req.body;

    if (!config) {
      return reply
        .status(statusCodes.BAD_REQUEST)
        .send(responseFormatter(statusCodes.BAD_REQUEST, "Config is required", null));
    }

    const error = validateFormConfig(config);
    if (error) {
      return reply
        .status(statusCodes.BAD_REQUEST)
        .send(responseFormatter(statusCodes.BAD_REQUEST, error, null));
    }

    const data = await admin.updateDynamicForm(feature, config);
    if (data.length === 0) {
      return reply
        .status(statusCodes.NOT_FOUND)
        .send(responseFormatter(statusCodes.NOT_FOUND, "Form not found", null));
    }
    return reply.status(statusCodes.OK).send(responseFormatter(statusCodes.OK, "Form updated successfully", data));
  } catch (error) {
    console.error("Error updating form data:", error);
    return reply
      .status(statusCodes.INTERNAL_SERVER_ERROR)
      .send(responseFormatter(statusCodes.INTERNAL_SERVER_ERROR, error.message, null));
  }
};

function validateFormConfig(config) {
  if (!config.pages || !Array.isArray(config.pages)) {
    return "Config must have a 'pages' array";
  }

  for (let page of config.pages) {
    if (!page.page_id || !page.title || typeof page.order !== "number") {
      return "Each page must have 'page_id', 'title', and numeric 'order'";
    }

    if (!page.fields || !Array.isArray(page.fields)) {
      return `Page ${page.page_id} must have 'fields' array`;
    }

    for (let field of page.fields) {
      if (!field.key || !field.label || !field.type) {
        return `Field in page ${page.page_id} must have 'key', 'label', and 'type'`;
      }

      if (field.regex) {
        try {
          new RegExp(field.regex);
        } catch (err) {
          return `Invalid regex for field ${field.key} in page ${page.page_id}`;
        }
      }
    }
  }

  return null; // no errors
}
