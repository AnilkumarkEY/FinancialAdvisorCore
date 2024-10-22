const entityValues = require("../config/entityValues");
const { userProfile } = require("../db");

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
        let insertEntity = await userProfile.insertEntityContact(data);
        console.log("inserted entity with data:", insertEntity);
    } catch (error) {
        throw new Error(error);
    }
};

const updateEntityContact = async (data) => {
  let query = `UPDATE core.entity_contact SET `;
  let updateEntity = await userProfile.updateEntity(query,data);
  console.log("Updating entity with data:", updateEntity);
};

module.exports = {
    performAction
}