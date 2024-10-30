const { responseFormatter, statusCodes, uniqueString } = require("../utils");
const { event, entity, lead } = require("../db");
const {
  createLead,
  getProductIntrested,
  getLeadList,
  createproduct,
  getProducts,
} = require("../module/lead");
const { entityService, entityContact } = require("../services");

exports.createLead = async (request, reply) => {
  try {
    const leadData = request.body;
    const id = "2c6348cacf9a404b89667136562d3ee6";
    leadData.identity = uniqueString();
    leadData.isValid = request.isValid;
    leadData.firstname = leadData.fullName.split(" ")[0];
    leadData.lastname = leadData.fullName.split(" ")[1];
    const entity = await entityService.performAction(id, leadData);
    if (entity.length) {
      const contactData = {
        countrycode: "IN",
        dialingcode: "+91",
        location_name: request.body?.locationName,
        state: leadData.state,
        address_line_1: leadData.addressLine1,
        address_line_2: leadData.addressLine2,
        pincode: leadData.zipCode,
        identity: leadData.identity,
        createdby: request.isValid.identity,
      };
      let contact;
      if (leadData.mobileNumber.value) {
        contactData.identity_contact = uniqueString();
        contactData.contact_value = leadData.mobileNumber.value;
        contactData.idmeta_contact_type = leadData.mobileNumber.metaId;
        contact = await entityContact.performAction(id, contactData);
      }
      if (leadData.email.value) {
        contactData.identity_contact = uniqueString();
        contactData.contact_value = leadData.email.value;
        contactData.idmeta_contact_type = leadData.email.metaId;
        contact = await entityContact.performAction(id, contactData);
      }
      if (contact.length) {
        const dataForLead = {
          idlead: uniqueString(),
          idmeta_lead_type: lead.idmeta_data_entitytype,
          identity_oppurtunity: lead.identity,
          idmeta_lead_status: "721fe429ffcb4453ba09354ed4cef3fa",
          identity_subscriber: "86cc888b5e7a4ee49b5541242f8e228b",
          identity_assignee: lead.identity,
          identity_assisgned_to: lead.identity,
          identity_lead_createdby: lead.identity,
          idmeta_source_type: "8dba7a199d904c0699b0da6b5510d318",
        };
        const createdLead = await createLead(dataForLead);
        if (lead.productIntrestedIn) {
          lead.productIntrestedIn.forEach(async (productId) => {
            const prospectInterestData = {
              idprospect_interest: uniqueString(),
              idlead: dataForLead.idlead,
              idproduct_ref_id: productId,
              identity_lead_createdby: lead.identity,
              createdby: request.isValid.identity,
            };
            await createproduct(prospectInterestData);
          });
        }
        if (createdLead.length) {
          await event.insertEventTransaction(request.isValid);
          for (const tag of leadData.tags) {
            tag.idopp_tag = uniqueString();
            tag.referenceId = dataForLead.idlead;
            await lead.addOppTag(tag);
          }
          return reply
            .status(statusCodes.CREATED)
            .send(
              responseFormatter(
                statusCodes.CREATED,
                "Lead created successfully",
                dataForLead.idlead
              )
            );
        } else {
          return reply
            .status(statusCodes.OK)
            .send(
              responseFormatter(
                statusCodes.INTERNAL_SERVER_ERROR,
                "Error while creating entity contact"
              )
            );
        }
      } else {
        return reply
          .status(statusCodes.OK)
          .send(
            responseFormatter(
              statusCodes.INTERNAL_SERVER_ERROR,
              "Error while creating entity contact"
            )
          );
      }
    } else {
      return reply
        .status(statusCodes.OK)
        .send(
          responseFormatter(
            statusCodes.INTERNAL_SERVER_ERROR,
            "Error while creating entity"
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
    const data = await getProducts(request.body);
    if (data.data.length) {
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

exports.getLeadContactList = async (request, reply) => {
  try {
    // const leadId = request.params.leadId;
    const identity = request.isValid.identity;
    const data = await entity.getEntityContactByIdentity(identity);
    if (data) {
      const filteredData = data.map((record) => {
        // Filter out any null values
        return Object.fromEntries(
          Object.entries(record).filter(([_, value]) => value !== null)
        );
      });
      await event.insertEventTransaction(request.isValid);
      return reply
        .status(statusCodes.OK)
        .send(
          responseFormatter(
            statusCodes.OK,
            "fetching lead contact records successfully",
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
exports.getLeadTags = async (request, reply) => {
  try {
    const leadTags = await lead.getLeadTags();
    if (leadTags.length) {
      await event.insertEventTransaction(request.isValid);
      return reply
        .status(statusCodes.OK)
        .send(
          responseFormatter(
            statusCodes.OK,
            "Lead Tags fetch successfully",
            leadTags
          )
        );
    } else {
      return reply
        .status(statusCodes.OK)
        .send(responseFormatter(statusCodes.OK, "No data found", {}));
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

exports.getLeadZipcode = async (request, reply) => {
  try {
    const { zipcode } = request.body;
    const zipcodes = await lead.getLeadZipcode(zipcode);
    if (zipcodes.length) {
      await event.insertEventTransaction(request.isValid);
      return reply
        .status(statusCodes.OK)
        .send(
          responseFormatter(
            statusCodes.OK,
            "Lead ZipCodes fetched successfully",
            zipcodes
          )
        );
    } else {
      return reply
        .status(statusCodes.OK)
        .send(responseFormatter(statusCodes.OK, "No data found", {}));
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

exports.getLeadTagsById = async (request, reply) => {
  try {
    const { idlead } = request.body;
    const leadTags = await lead.getLeadTagsById(idlead);
    if (leadTags.length) {
      await event.insertEventTransaction(request.isValid);
      return reply
        .status(statusCodes.OK)
        .send(
          responseFormatter(
            statusCodes.OK,
            "Lead tags fetched successfully",
            leadTags
          )
        );
    } else {
      return reply
        .status(statusCodes.OK)
        .send(responseFormatter(statusCodes.OK, "No data found", {}));
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

exports.getLeadById = async (request, reply) => {
  try {
    const { idlead } = request.body;
    const leadData = await lead.getLeadById(idlead);
    if (leadData.length) {
      await event.insertEventTransaction(request.isValid);
      return reply
        .status(statusCodes.OK)
        .send(
          responseFormatter(
            statusCodes.OK,
            "Lead fetched successfully",
            leadData
          )
        );
    } else {
      return reply
        .status(statusCodes.OK)
        .send(responseFormatter(statusCodes.OK, "No data found", {}));
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
