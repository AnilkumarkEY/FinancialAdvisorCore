const entityValues = require("../config/entityValues");
const { entity } = require("../db");
const { uniqueString } = require("../utils");

// Example usage
const performAction = (id, data) => {
  const service = entityValues.entityServices[id];
  if (!service) {
    throw new Error("Invalid action ID");
  }

  switch (service.action) {
    case "Create":
      return createEntityContact(data); // Implement createEntity function
    case "Edit":
      return updateEntityContact(data); // Implement updateEntity function
    default:
      throw new Error("Invalid action");
  }
};

// Dummy functions to represent service actions
const createEntityContact = async (data) => {
  try {
    let insertEntity = await entity.insertEntityContact(data);
    return insertEntity;
  } catch (error) {
    throw new Error(error);
  }
};

const updateEntityContact = async (data) => {
  try {
    let query = `UPDATE core.entity_contact SET `;
    let updateEntity = await entity.updateEntity(query, data);
    return updateEntity
  } catch (error) {
    throw new Error(error);
  }
};

const processEntityContactData = async (data, identity) => {
  try {
    const id = "2c6348cacf9a404b89667136562d3ee6";

    // saving phone data
    const mobileData = {};
    mobileData.identity_contact = uniqueString();
    mobileData.countrycode = "IN";
    mobileData.dialingcode = "+91";
    mobileData.contact_value = data.primary_phone;
    mobileData.idmeta_contact_type = 'eef8f47d787041b59afd37937deed705';
    mobileData.identity = data.identity; //new entity identity
    mobileData.createdby = identity; //created by identity/logged in identity
    const phoneRes = await performAction(id, mobileData);

    //saving email data
    const emailData = {};
    emailData.identity_contact = uniqueString();
    emailData.contact_value = data.primary_email;
    emailData.idmeta_contact_type = '4678e1bb1f2d414393a85dfbe0c85fff';
    emailData.identity = data.identity; //new entity identity
    emailData.createdby = identity; //created by identity/logged in identity
    const emailRes = await performAction(id, emailData);

    // saving address
    const addressData = {};
    addressData.identity_contact = uniqueString();
    addressData.idmeta_contact_type = 'b8fbf7947f8b4505a91e662af6953a15';
    addressData.address_line_1 = data.address_line_1;
    addressData.address_line_2 = data.address_line_2;
    addressData.pincode = data.pincode;
    addressData.location_name = data.location_name;
    addressData.state = data.state;
    addressData.district = data.district;
    addressData.countryname = data.country;
    addressData.identity = data.identity; //new entity identity
    addressData.createdby = identity; //created by identity/logged in identity
    addressData.contact_value = `${data.address_line_1}, ${data.address_line_2}, ${data.location_name}, ${data.state}, ${data.district}, ${data.pincode}, ${data.country}`;
    const addRes = await performAction(id, addressData);
    return {
      phoneRes,
      emailRes,
      addRes
    };
  } catch (error) {
    throw new Error(error);
  }
}

module.exports = {
  performAction,
  processEntityContactData
};
