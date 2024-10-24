const { client } = require("../config/db");
async function createLead(data) {
  try {
    const query = `
      INSERT INTO oppurtunity.lead (
      idlead, 
      idmeta_lead_type, 
      identity_oppurtunity, 
      idmeta_lead_status, 
      identity_subscriber, 
      identity_subscriber_urc, 
      identity_assignee, 
      identity_assisgned_to, 
      identity_lead_createdby, 
      idmeta_source_type, 
      source_ref_key, 
      sortorder, 
      eff_from_date, 
      eff_to_date, 
      activeflag, 
      createdby, 
      created_date, 
      modifiedby, 
      modified_date
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19
    )  RETURNING *;
  `;
    const values = [
      data.idlead || null,
      data.idmeta_lead_type || null,
      data.identity_oppurtunity || null,
      data.idmeta_lead_status || null,
      data.identity_subscriber || null,
      data.identity_subscriber_urc || null,
      data.identity_assignee || null,
      data.identity_assisgned_to || null,
      data.identity_lead_createdby || null,
      data.idmeta_source_type || null,
      data.source_ref_key || null,
      data.sortorder || null,
      data.eff_from_date || null,
      data.eff_to_date || null,
      data.activeflag !== undefined ? data.activeflag : null,
      data.createdby || null,
      data.created_date || null,
      data.modifiedby || null,
      data.modified_date || null,
    ];
    const res = await client.query(query, values);
    return res.rows; // Return the result rows
  } catch (err) {
    console.error("Error executing query", err.stack);
    throw err; // Rethrow the error for handling in the controller
  }
}

async function getLead(idlead) {
  try {
    const query = `
    select
     e.fullname,
     l.idlead,
     ec.contact_value as mobile,
     l.idmeta_lead_type,
     eua.identity_urc_auth
     from oppurtunity."lead" l 
    inner join core.entity e on e."identity" = l.identity_lead_createdby 
    inner join core.entity_urc_auth eua on eua."identity" = e."identity" 
    left join core.entity_contact ec on ec.identity_urc_auth = eua.identity_urc_auth 
    where l.idlead = '${idlead}'
    `;
    const res = await client.query(query);
    return res.rows; // Return the result rows
  } catch (err) {
    console.error("Error executing query", err.stack);
    throw err; // Rethrow the error for handling in the controller
  }
}

module.exports = {
  createLead,
  getLead,
};