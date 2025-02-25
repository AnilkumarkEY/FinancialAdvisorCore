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
      return createEntity(data); // Implement createEntity function
    case "Edit":
      return updateEntity(data); // Implement updateEntity function
    default:
      throw new Error("Invalid action");
  }
};

// Dummy functions to represent service actions
const createEntity = async (data) => {
  try {
    let insertEntity = await entity.insertEntity(data);
    return insertEntity;
  } catch (error) {
    throw new Error(error);
  }
};

const updateEntity = async (data) => {
  try {
    let query = `UPDATE core.entity SET `;
    let updateEntity = await entity.updateEntity(query, data);
    return updateEntity;
  } catch (error) {
    throw new Error(error);
  }
};


const processEntityData = async (data, identity) => {
  try {
    const id = "2c6348cacf9a404b89667136562d3ee6";
    data.identity = uniqueString();
    data.isValid = {
      identity
    };
    if(data.middlename){
      data.fullName = `${data.firstname} ${data.middlename} ${data.lastname}`;
    } else {
      data.fullName = `${data.firstname} ${data.lastname}`;
    }
    const entity = await performAction(id, data);
    return entity;
  } catch (error) {
    throw new Error(error);
  }
}

module.exports = {
  performAction,
  processEntityData
};
