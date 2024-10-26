const { client } = require("../config/db");
async function getUsers() {
  try {
    const query = `
        SELECT
          e."identity" AS entity_ref,
          uad."oid" AS e_object,
          e.firstname,
          e.middlename,
          e.lastname,
          e.fullname,
          e.dob,
          uad.reg_mobile_number,
          uad.upn_iam AS upn,
          uad.reg_email AS reg_email_id
        FROM core.user_auth_data uad
        INNER JOIN core.entity e ON e."identity" = uad."identity"
      `;
    const res = await client.query(query);
    return res.rows; // Return the result rows
  } catch (error) {
    console.error("Error executing query", error.stack);
    throw error; // Rethrow the error for handling in the controller
  }
}

async function getUserDataForOtp(identity, agent_code) {
  try {
    const query = `
        SELECT uad.reg_mobile_number, uad.reg_email
        FROM core.user_auth_data uad 
        JOIN core.profile p ON uad.identity = p.identity
        WHERE p.business_code = $1  
        AND uad.identity = $2;
        `;
    const res = await client.query(query, [identity, agent_code]);
    return res.rows;
  } catch (error) {
    console.error("Error executing query", error.stack);
    throw error; // Rethrow the error for handling in the controller
  }
}

async function checkValidUser(userName) {
  try {
    const query = `
        SELECT EXISTS (
            SELECT 1 FROM core.user_auth_data uad WHERE upn_iam = $1
        ) AS user_exists
        `;
    const res = await client.query(query, [userName]);
    return res.rows;
  } catch (error) {
    console.error("Error executing query", error.stack);
    throw error; // Rethrow the error for handling in the controller
  }
}
module.exports = {
  getUsers,
  getUserDataForOtp,
  checkValidUser
};
