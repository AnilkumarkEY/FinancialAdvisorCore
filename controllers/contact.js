const { responseFormatter, statusCodes, uniqueString } = require("../utils");
const { entityContact } = require("../services");
const { lead, event } = require("../db");


exports.addEntityContact = async (request, reply) => {
  try {
    const requestData = request.body;
    const identity = await lead.getIdentity(request.body.leadId);
    let uId = uniqueString();

    // Pre-defined ID for the action
    const id = "2c6348cacf9a404b89667136562d3ee6";
    const entity_json = {
      identity_contact: uId,
      address_line_1: requestData.addressLine1,
      address_line_2: requestData.addressLine2,
      idmeta_contact_type: requestData.idmetaContactType,
      contact_value: requestData.contactValue,
      countrycode: requestData.countryCode,
      dialingcode: requestData.dialingCode,
      location_name: requestData.locationName,
      state: requestData.state,
      pincode: requestData.pincode,
      identity: identity[0].identity_oppurtunity,
      countryname: requestData.countryname,
      district: requestData.district,
      createdby: request.isValid.identity,
    };
    // Performing the action to save the contact
    const insertEntity = await entityContact.performAction(id, entity_json);

    // If the insertion is successful, return a success response
    if (insertEntity) {
      await event.insertEventTransaction(request.isValid);
      return reply
        .status(statusCodes.CREATED) // Using the CREATED status code
        .send(
          responseFormatter(
            statusCodes.CREATED,
            "Entity contact inserted successfully"
          )
        );
    } else {
      // Handle the case where insertion is not successful
      return reply
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .send(
          responseFormatter(
            statusCodes.INTERNAL_SERVER_ERROR,
            "Failed to insert contact entity",
            { entity: insertEntity }
          )
        );
    }
  } catch (error) {
    console.error("Error adding entity contact:", error);

    // Formatting and sending the error response in case of an exception
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

exports.updateEntityContact = async (request, reply) => {
  try {
    // Extracting data from the request body
    const requestData = request.body;

    // Generating a unique ID for the contact
    let uId = uniqueString();

    // Pre-defined ID for the action (as per your example)
    const id = "fd789c2918db4db4852813cd147bacb0";

    // Creating the entity JSON object to be inserted
    const entity_json = {
      identity_contact: requestData.idContact,
      address_line_1: requestData.addressLine1,
      address_line_2: requestData.addressLine2,
      idmeta_contact_type: requestData.idmetaContactType,
      contact_value: requestData.contactValue,
      countrycode: requestData.countryCode,
      dialingcode: requestData.dialingCode,
      location_name: requestData.locationName,
      state: requestData.state,
      pincode: requestData.pincode,
      countryname: requestData.countryname,
      district: requestData.district,
      fieldToMatch: "identity_contact",
    };

    // Performing the action to save the contact
    const updateEntity = await entityContact.performAction(id, entity_json);

    console.log("UpdateEntity with data:", updateEntity);

    // If the insertion is successful, return a success response
    if (updateEntity) {
      await event.insertEventTransaction(request.isValid);
      return reply
        .status(statusCodes.CREATED) // Using the CREATED status code
        .send(
          responseFormatter(
            statusCodes.CREATED,
            "Entity contact updated successfully"
          )
        );
    } else {
      // Handle the case where insertion is not successful
      return reply
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .send(
          responseFormatter(
            statusCodes.INTERNAL_SERVER_ERROR,
            "Failed to update contact entity",
            { entity: updateEntity }
          )
        );
    }
  } catch (error) {
    console.error("Error updating entity contact:", error);

    // Formatting and sending the error response in case of an exception
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
