const { client } = require("../config/db");

async function insertOtp(identity, otp) {
  try {
    const query = `
      UPDATE core.user_auth_data
      SET otp = $2,
      otp_expiry = (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata') + INTERVAL '5 minutes'
      WHERE identity = $1;
    `;
    const res = await client.query(query, [identity, otp]);
    return res.rows; // Return the result rows
  } catch (error) {
    console.error("Error executing query", error.stack);
    throw error; // Rethrow the error for handling in the controller
  }
}

async function verifyOtp(otp, identity) {
  try {
    const query = `
      SELECT 
      CASE 
          WHEN EXISTS (
              SELECT 1 
              FROM core.user_auth_data 
              WHERE identity = $2 
                AND otp = $1
                AND otp_expiry > CURRENT_TIMESTAMP
          ) THEN TRUE
          ELSE FALSE 
      END AS is_valid;
    `;
    const res = await client.query(query, [otp, identity]);
    return res.rows[0].is_valid;
  } catch (error) {
    console.error("Error executing query", error.stack);
    throw error;
  }
}

module.exports = {
  insertOtp,
  verifyOtp,
};
