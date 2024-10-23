const responseFormatter = require("../utils/responseFormatter");
const STATUS_CODES = require("../utils/statusCodes");
const {userProfile} = require("../db")
const {
  createLeadModule,
  getProductIntrested,
  getLeadList,
  createproductModule,
  getProducts
} = require("../module/leadModule");
const saveEntity = require("../services/entity");
const saveContact = require("../services/entityContact");
const generateUniqueString = require("../utils/generateUniqueString");

exports.createLead = async (request, reply) => {
  try {
    let uId = generateUniqueString();
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
      return reply.status(400).send({
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
    const entity = await saveEntity.performAction(id, entity_json);
    // first entity creation
    // entity id from entity:  second entity contract store
    let data = {};
    if (entity.length > 0) {
      const contsact_json = {
        identity_contact: entity[0]?.identity,
        idmeta_contact_type: "eef8f47d787041b59afd37937deed705",
        contact_value: mobileNumber,
        countrycode: "IN",
        dialingcode: "+91",
        address_line_1: addressLine1,
        address_line_2: addressLine2,
        location_name: zipCode,
        state: state,
        pincode: Number(zipCode)
      };
      const entity_contact = await saveContact.performAction(id, contsact_json);
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
        const leadRes = await createLeadModule(data);
        if (leadRes.length > 0) {
          const nProductIntrstedIn = productIntrstedIn.map((val) => {
            return {
              idproduct_ref_id: val,
              idprospect_interest: generateUniqueString(),
              idlead: leadRes[0]?.idlead,
              identity_lead_createdby: leadRes[0]?.identity_lead_createdby,
            };
          });
          const productRes = await createproductModule(nProductIntrstedIn);
          if (productRes.length > 0) {
            await userProfile.insertEventTransaction(request.isValid);
            return reply
              .status(STATUS_CODES.CREATED)
              .send(
                responseFormatter(
                  STATUS_CODES.CREATED,
                  "Lead entity inserted successfully",
                  { lead: leadRes, product: productRes }
                )
              );
          } else {
            return reply
              .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
              .send(
                responseFormatter(
                  STATUS_CODES.INTERNAL_SERVER_ERROR,
                  "some issue",
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
      .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
      .send(
        responseFormatter(
          STATUS_CODES.INTERNAL_SERVER_ERROR,
          "An unexpected error occurred"
        )
      );
  }
};

exports.prodcutIntrested = async (request, reply) => {
  try {
    const leadId = request.params.leadId;
    const data = await getProductIntrested(leadId);
    if (data.length > 0) {
      await userProfile.insertEventTransaction(request.isValid);
      return reply
        .status(STATUS_CODES.OK)
        .send(
          responseFormatter(
            STATUS_CODES.OK,
            "prodcutIntrested data fetch successfully",
            data
          )
        );
    } else {
      return reply
        .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
        .send(
          responseFormatter(
            STATUS_CODES.INTERNAL_SERVER_ERROR,
            "some issue",
            data
          )
        );
    }
  } catch (error) {
    console.error(error);
    return reply
      .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
      .send(
        responseFormatter(
          STATUS_CODES.INTERNAL_SERVER_ERROR,
          "An unexpected error occurred"
        )
      );
  }
};

exports.getLeadList = async (request, reply) => {
  try {
    const leadId = request.params.leadId;
    const data = await getLeadList(leadId);
    if (data) {
      await userProfile.insertEventTransaction(request.isValid);
      return reply
        .status(STATUS_CODES.OK)
        .send(
          responseFormatter(
            STATUS_CODES.OK,
            "Lead entity inserted successfully",
            data
          )
        );
    } else {
      return reply
        .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
        .send(
          responseFormatter(
            STATUS_CODES.INTERNAL_SERVER_ERROR,
            "some issue",
            data
          )
        );
    }
  } catch (error) {
    console.error(error);
    return reply
      .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
      .send(
        responseFormatter(
          STATUS_CODES.INTERNAL_SERVER_ERROR,
          "An unexpected error occurred"
        )
      );
  }
};


exports.getProducts = async (request, reply) => {
  try {
   const data = await getProducts();
    if (data.length>0) {
      await userProfile.insertEventTransaction(request.isValid);
      return reply
        .status(STATUS_CODES.OK)
        .send(
          responseFormatter(
            STATUS_CODES.OK,
            "product data fetch successfully",
            data
          )
        );
    } else {
      return reply
        .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
        .send(
          responseFormatter(
            STATUS_CODES.INTERNAL_SERVER_ERROR,
            "some issue",
            data
          )
        );
    }
  } catch (error) {
    console.error(error);
    return reply
      .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
      .send(
        responseFormatter(
          STATUS_CODES.INTERNAL_SERVER_ERROR,
          "An unexpected error occurred"
        )
      );
  }
};
