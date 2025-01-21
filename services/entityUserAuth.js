const entityValues = require("../config/entityValues");
const { entity, admin } = require("../db");
const { uniqueString } = require("../utils");

// Example usage
const performAction = (id, data) => {
  const service = entityValues.entityServices[id];
  if (!service) {
    throw new Error("Invalid action ID");
  }

  switch (service.action) {
    case "Create":
      return createEntityUserAuth(data); // Implement createEntity function
    case "Edit":
      return updateEntityUserAuth(data); // Implement updateEntity function
    default:
      throw new Error("Invalid action");
  }
};

// Dummy functions to represent service actions
const createEntityUserAuth = async (data) => {
  try {
    let insertEntity = await entity.insertEntityUrcAuth(data);
    return insertEntity;
  } catch (error) {
    throw new Error(error);
  }
};

const updateEntityUserAuth = async (data) => {
  try {
    let query = `UPDATE core.entity_urc_auth SET `;
    let updateEntity = await entity.updateEntity(query, data);
    console.log("Updating entity with data:", updateEntity);
    return updateEntity;
  } catch (error) {
    throw new Error(error);
  }
};

const processEntityAuthUrcData = async(entityRes, entityData) => {
  try {
    const id = '2c6348cacf9a404b89667136562d3ee6';
    const idurc = await admin.getIdUrcFromUserType(entityData.user_type);
    const insertData = {
      identity_urc_auth: uniqueString(),
      identity: entityRes.identity,
      idurc,
      idcontract: '2d2bba2213ad4e18ba76995396a6d910' //hardcoding for time-being
    }
    const authUrcRes = await performAction(id ,insertData);
    return authUrcRes;
  } catch (error) {
    throw new Error(error);
  }
}

module.exports = {
  performAction,
  processEntityAuthUrcData
};
