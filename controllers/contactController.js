const { userProfile } = require("../db");

const addEntityContact = async (data) => {
    try {
        let insertEntity = await userProfile.insertEntityContact(data);
        console.log("inserted entity with data:", insertEntity);
        return insertEntity;
    } catch (error) {
        throw new Error(error);
    }
};


const updateEntityContact = async (data) => {
    try {
      let query = `UPDATE core.entity_contact SET `;
      let updateEntity = await userProfile.updateEntity(query, data);
      console.log("Updating entity with data:", updateEntity);
    } catch (error) {
      throw new Error(error);
    }
  };


module.exports = {
    addEntityContact,
    updateEntityContact
}