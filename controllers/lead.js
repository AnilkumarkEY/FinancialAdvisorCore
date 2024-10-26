const {responseFormatter, statusCodes, uniqueString} = require("../utils");
const { event } = require("../db");
const {
  createLead,
  getProductIntrested,
  getLeadList,
  createproduct,
  getProducts,
} = require("../module/lead");
const {entityService, entityContact} = require("../services");

exports.createLead = async (request, reply) => {
  try {
    let uId = uniqueString();
    const {
      fullName,
      gender,
      mobileNumber,
      leadType,
      email,
      productIntrstedIn,
      addressLine1,
      addressLine2,
      zipCode,
      city,
      state,
      isNRI,
      isHNI,
    } = request.body;
    // List of mandatory fields
    const mandatoryFields = [
      "fullName",
      "gender",
      "mobileNumber",
      "leadType",
      "city",
      "state",
      "isNRI",
      "isHNI",
    ];
    const missingFields = mandatoryFields.filter(
      (field) => !request.body[field]
    );
    // validation check.
    if (missingFields.length > 0) {
      return reply.status(statusCodes.BAD_REQUEST).send({
        error: "Validation failed",
        missingFields: missingFields,
      });
    }
    const id = "2c6348cacf9a404b89667136562d3ee6";
    const entity_json = {
      identity: uId,
      idmeta_data_gender: "986bd1568afb42cca258cf17a68d60f4",
      fullname: fullName,
      gender: gender,
      firstname: "gvjhvj",
      mobileNumber: mobileNumber,
      leadType: leadType,
      email: email,
      productIntrstedIn: productIntrstedIn,
      addressLine1: addressLine1,
      addressLine2: addressLine2,
      zipCode: zipCode,
      city: city,
      state: state,
      isNRI: isNRI,
      isHNI: isHNI,
    };
    const entity = await entityService.performAction(id, entity_json);
    if (entity.length > 0) {
      const contact_json = {
        identity_contact: entity[0]?.identity,
        idmeta_contact_type: "eef8f47d787041b59afd37937deed705",
        contact_value: mobileNumber,
        countrycode: "IN",
        dialingcode: "+91",
        address_line_1: addressLine1,
        address_line_2: addressLine2,
        location_name: zipCode,
        state: state,
        pincode: Number(zipCode),
      };
      const entity_contact = await entityContact.performAction(id, contact_json);
      if (entity_contact.length > 0) {
        const data = {
          idlead: uId,
          idmeta_lead_type: leadType,
          idmeta_lead_status: "721fe429ffcb4453ba09354ed4cef3fa",
          identity_subscriber: "86cc888b5e7a4ee49b5541242f8e228b",
          identity_subcriber_urc: "86cc888b5e7a4ee49b5541242f8e228b",
          identity_assignee: entity_contact[0].identity_contact,
          identity_assigned_to: entity_contact[0].identity_contact,
          identity_lead_createdby: entity_contact[0].identity_contact,
          idmeta_source_type: "8dba7a199d904c0699b0da6b5510d318", // from frontend
        };
        const leadRes = await createLead(data);
        if (leadRes.length > 0) {
          const nProductIntrstedIn = productIntrstedIn.map((val) => {
            return {
              idproduct_ref_id: val,
              idprospect_interest: uniqueString(),
              idlead: leadRes[0]?.idlead,
              identity_lead_createdby: leadRes[0]?.identity_lead_createdby,
            };
          });
          const productRes = await createproduct(nProductIntrstedIn);
          if (productRes.length > 0) {
            await event.insertEventTransaction(request.isValid);
            return reply
              .status(statusCodes.CREATED)
              .send(
                responseFormatter(
                  statusCodes.CREATED,
                  "Lead entity inserted successfully",
                  { lead: leadRes, product: productRes }
                )
              );
          } else {
            console.log("ssssssssssssssssssssssssssssssssssssssssssssss");
            
            return reply
              .status(statusCodes.INTERNAL_SERVER_ERROR)
              .send(
                responseFormatter(
                  statusCodes.INTERNAL_SERVER_ERROR,
                  "An unexpected error occurred",
                  { lead: leadRes, product: productRes }
                )
              );
          }
        }
      }
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

exports.prodcutIntrested = async (request, reply) => {
  try {
    // const leadId = request.params.leadId;
    const { leadId } = request.query;
    const data = await getProductIntrested(leadId);
    if (data.length > 0) {
      await event.insertEventTransaction(request.isValid);
      return reply
        .status(statusCodes.OK)
        .send(
          responseFormatter(
            statusCodes.OK,
            "prodcutIntrested data fetch successfully",
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

exports.getLeadList = async (request, reply) => {
  try {
    // const leadId = request.params.leadId;
    const { idlead } = request.query;
    const data = await getLeadList(idlead);
    if (data) {
      await event.insertEventTransaction(request.isValid);
      return reply
        .status(statusCodes.OK)
        .send(
          responseFormatter(
            statusCodes.OK,
            "fetching lead records successfully",
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

exports.getProducts = async (request, reply) => {
  try {
    const data = await getProducts();
    if (data.length > 0) {
      await event.insertEventTransaction(request.isValid);
      return reply
        .status(statusCodes.OK)
        .send(
          responseFormatter(
            statusCodes.OK,
            "product data fetch successfully",
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
