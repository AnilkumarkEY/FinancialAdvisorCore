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
        identity: leadData.identity,
        createdby: request.isValid.identity,
      };
      let contact;
      if (leadData.mobileNumber.value) {
        const mobileData = {};
        mobileData.identity_contact = uniqueString();
        mobileData.countrycode = "IN";
        mobileData.dialingcode = "+91";
        mobileData.contact_value = leadData.mobileNumber.value;
        mobileData.idmeta_contact_type = leadData.mobileNumber.metaId;
        mobileData.identity = contactData.identity;
        mobileData.createdby = contactData.createdby;
        contact = await entityContact.performAction(id, mobileData);
      }
      if (leadData.email.value) {
        const emailData = {};
        emailData.identity_contact = uniqueString();
        emailData.contact_value = leadData.email.value;
        emailData.idmeta_contact_type = leadData.email.metaId;
        emailData.identity = contactData.identity;
        emailData.createdby = contactData.createdby;
        contact = await entityContact.performAction(id, emailData);
      }
      if (leadData.address.value.addressLine1) {
        const address = leadData.address.value;
        const addressData = {};
        addressData.identity_contact = uniqueString();
        addressData.idmeta_contact_type = leadData.address.metaId;
        addressData.address_line_1 = address.addressLine1;
        addressData.address_line_2 = address.addressLine2;
        addressData.pincode = address.zipCode;
        addressData.location_name = address.city;
        addressData.state = address.state;
        addressData.district = address.district;
        addressData.countryname = address.country;
        addressData.identity = contactData.identity;
        addressData.createdby = contactData.createdby;
        addressData.contact_value = `${address.addressLine1}, ${address.addressLine2}, ${address.city}, ${address.state}, ${address.district}, ${address.zipCode}, ${address.country}`;
        contact = await entityContact.performAction(id, addressData);
      }
      if (contact.length) {
        const dataForLead = {
          idlead: uniqueString(),
          idmeta_lead_type: leadData.leadType,
          identity_oppurtunity: leadData.identity,
          idmeta_lead_status: "721fe429ffcb4453ba09354ed4cef3fa",
          identity_subscriber: "86cc888b5e7a4ee49b5541242f8e228b",
          identity_assignee: contactData.createdby,
          identity_assisgned_to: contactData.createdby,
          identity_lead_createdby: contactData.createdby,
          idmeta_annual_income: leadData.annualIncome,
          createdby: contactData.createdby,
          idmeta_source_type: "8dba7a199d904c0699b0da6b5510d318",
        };
        const createdLead = await createLead(dataForLead);
        if (leadData.productIntrestedIn) {
          leadData.productIntrestedIn.forEach(async (productId) => {
            const prospectInterestData = {
              idprospect_interest: uniqueString(),
              idlead: dataForLead.idlead,
              idproduct_ref_id: productId,
              identity_lead_createdby: request.isValid.identity,
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
        .status(statusCodes.OK)
        .send(responseFormatter(statusCodes.OK, "No data found", []));
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
    const identity = await lead.getIdentity(request.body.idLead);
    if (identity.length) {
      const data = await entity.getEntityContactByIdentity(
        identity[0].identity_oppurtunity
      );
      if (data) {
        const filteredData = data.reduce((result, record) => {
          const filteredRecord = Object.fromEntries(
            Object.entries(record).filter(([_, value]) => value !== null)
          );
          result[record.contact_type] = filteredRecord;
          return result;
        }, {});
        if ("Primary Mobile Number" in filteredData) {
          let urlFields = filteredData["Primary Mobile Number"];
          urlFields["phoneUrl"] = `tel:+${urlFields.contact_value}`;
          urlFields["smsUrl"] = `sms:${urlFields.contact_value}?body=Hello`;
          urlFields["whatsappUrl"] = `https://wa.me/${urlFields.contact_value}`;
        }
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
            "No leads found with the given lead id",
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

exports.getLocality = async (request, reply) => {
  try {
    const { zipcode } = request.body;
    const zipcodes = await lead.getLocality(zipcode);
    if (zipcodes.length) {
      await event.insertEventTransaction(request.isValid);
      return reply
        .status(statusCodes.OK)
        .send(
          responseFormatter(
            statusCodes.OK,
            "Locality data fetched successfully",
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

exports.getLeadIncomes = async (request, reply) => {
  try {
    const incomeList = await lead.getLeadIncomes();
    if (incomeList.length) {
      await event.insertEventTransaction(request.isValid);
      return reply
        .status(statusCodes.OK)
        .send(
          responseFormatter(
            statusCodes.OK,
            "Incomes fetched successfully",
            incomeList
          )
        );
    } else {
      return reply
        .status(statusCodes.OK)
        .send(responseFormatter(statusCodes.OK, "No data found", []));
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
