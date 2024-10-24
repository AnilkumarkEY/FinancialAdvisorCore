const entityValues = require("../config/entityValues");
const { entity } = require("../db");

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
    console.log("inserted entity with data:", insertEntity);
    return insertEntity;
  } catch (error) {
    throw new Error(error);
  }
};

const updateEntityContact = async (data) => {
  try {
    let query = `UPDATE core.entity_contact SET `;
    let updateEntity = await entity.updateEntity(query, data);
    console.log("Updating entity with data:", updateEntity);
  } catch (error) {
    throw new Error(error);
  }
};

module.exports = {
  performAction,
};
