const { responseFormatter, statusCodes, uniqueString } = require("../utils");
const { event, entity, lead, profile} = require("../db");
const { entityService, entityContact } = require("../services");

exports.getNomineeDetails = async (request, reply) => {
    try {
      const identity = request.isValid.identity;
      const data = await profile.getNomineeDetailsByIdentity(identity);
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
              "Nominee details fetched successfully",
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

exports.updateContact = async (request, reply) => {
  try {
    const { idsrcategory, idsr_subcategory, identity_sr_createdby, sr_meta_value } = request.body;
    const identity = request.isValid.identity;
    const primaryPhoneMeta = 'eef8f47d787041b59afd37937deed705';
    const primaryEmailMeta = '4678e1bb1f2d414393a85dfbe0c85fff';
    const approvedSrStatus = 'd0cc0947a9f34d099e66048dc64c1740';
    const adressMeta = 'b8fbf7947f8b4505a91e662af6953a15';

    const transaction = {
      idsr_transaction: uniqueString(), //create unique id for transaction
      idsrcategory,
      idsr_subcategory, 
      identity_sr_createdby, 
      sr_meta_value,
      idmeta_sr_status: approvedSrStatus //Phone and email updates auto-approves
    }

    await profile.insertSrTransaction(transaction); // Insert entry into sr transactions

    let updateContact;
    if(sr_meta_value.idmeta_contact_type === adressMeta){
      updateContact = await profile.updateContactAddress({sr_meta_value, identity}); //Updating Address into entity-contact table
    } else {
      updateContact = await profile.updateContact({sr_meta_value, identity}); //Updating Phone/Email into entity-contact table
    }
    

    // Checking if updating entry is primary phone/email then updating into user_auth_data
    if(sr_meta_value.idmeta_contact_type === primaryPhoneMeta){
      await profile.updateContactInUserAuth({
        contactType: primaryPhoneMeta, 
        sr_meta_value, 
        identity
      })
    }

    if(sr_meta_value.idmeta_contact_type === primaryEmailMeta){
      await profile.updateContactInUserAuth({
        contactType: primaryEmailMeta, 
        sr_meta_value, 
        identity
      })
    }

    if (updateContact.length > 0) {
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
    const genderMetaMaster = '606882f143f44ca187f6793f09aa4417';
    const contactMetaMaster = 'a2959212630e45c2ac7bc76be50c4768';
    const metaData = await profile.getMetaData({genderMetaMaster, contactMetaMaster}); // Getting meta data from DB

    // Filtering & reducing the result set on basis of type
    const genderMeta = metaData.reduce((acc, item) => {
      if (item.idmetamaster === genderMetaMaster) {
        acc.push({
          idmetadata: item.idmetadata,
          meta_data_name: item.meta_data_name
        });
      }
      return acc;
    }, []);

    // Filtering & reducing the result set on basis of type
    const contactMeta = metaData.reduce((acc, item) => {
      if (item.idmetamaster === contactMetaMaster) {
        acc.push({
          idmetadata: item.idmetadata,
          meta_data_name: item.meta_data_name
        });
      }
      return acc;
    }, []);

    if (metaData.length > 0) {
      return reply
        .status(statusCodes.OK)
        .send(
          responseFormatter(
            statusCodes.OK,
            "Meta Data retrieved successfully",
            {
              genderMeta,
              contactMeta
            }
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