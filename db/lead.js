const { client } = require("../config/db");
const { uniqueString } = require("../utils");
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

async function getLeadTags() {
  try {
    const query = `
      select 
      idmetadata as tagmetadata,
      meta_data_name as tagname
      from oppurtunity.op_metadata om 
      where 
      idmetamaster = 'd7e962cce2db4dbdaafaaafd91f1fe16' -- hardcode
      and sub_meta_detail -> 'tagfilter' ->> 'value' = '21f7a30d537546c38c51ee5f6124e815' -- hardcode
    `;
    const res = await client.query(query);
    return res.rows;
  } catch (error) {
    console.error("Error executing query", error.stack);
    throw error;
  }
}

async function getLocality(zipcode) {
  try {
    const query = `
    select 
      d.id_district,
      d.description as district,
      s.id_state,
      s.description as state,
      c.idcountry,
      c.countryname as countryname,
      c.dialingcode,
      l2.longitude,
      l2.latitude 
      from core.locality l 
      inner join core.pincode_master p on p.id_pincode = l.id_pincode 
      inner join core.district d on d.id_district = l.id_district
      inner join core.state s on s.id_state = d.id_state 
      inner join core.country c on c.idcountry = c.idcountry
      inner join core.locality l2 on l2.id_pincode =  p.id_pincode
      where p.pincode = $1
      group by d.id_district,
      d.description,
      s.id_state,
      s.description,
      c.idcountry,
      c.countryname,
      c.dialingcode,
      l2.longitude,
      l2.latitude; 
    `;
    const res = await client.query(query, [zipcode]);
    return res.rows;
  } catch (error) {
    console.error("Error executing query", error.stack);
    throw error;
  }
}

async function getLeadTagsById(idlead) {
  try {
    const query = `
      select idmeta_tag_type,tag,activeflag from oppurtunity.opp_tag ot
      where tag_reference_id = $1
    `;
    const res = await client.query(query, [idlead]);
    return res.rows;
  } catch (error) {
    console.error("Error executing query", error.stack);
    throw error;
  }
}

async function getLeadById(idlead) {
  try {
    const query = `
      select
      l.idlead,
      e.fullname,
      l.idmeta_lead_status,
      om1.meta_data_name as leadstatus,
      l.idmeta_lead_type,
      om2.meta_data_name as leadtype,
      l.idmeta_source_type,
      om.meta_data_name as source
      from oppurtunity."lead" l
      inner join core.entity e on e."identity" = l.identity_oppurtunity 
      inner join oppurtunity.op_metadata om on om.idmetadata = l.idmeta_source_type 
      inner join oppurtunity.op_metadata om1 on om1.idmetadata  = l.idmeta_lead_status 
      inner join oppurtunity.op_metadata om2 on om2.idmetadata = l.idmeta_lead_type 
      where l.idlead = $1
    `;
    const res = await client.query(query, [idlead]);
    return res.rows;
  } catch (error) {
    console.error("Error executing query", error.stack);
    throw error;
  }
}

async function getOppTag(oppTag) {
  try {
    const query = `
      SELECT om.meta_data_name, om.idmetadata 
      FROM oppurtunity.op_metadata om 
      WHERE om.idmetadata::uuid = ANY($1::uuid[]);
    `;
    const res = await client.query(query, [oppTag]);
    return res.rows;
  } catch (error) {
    console.error("Error executing query", error.stack);
    throw error;
  }
}

async function addOppTag(oppTag) {
  try {
    const query = `
      INSERT INTO oppurtunity.opp_tag (
      idopp_tag, 
      idmeta_tag_type, 
      tag_reference_id, 
      tag,
      activeflag
      ) VALUES (
       $1, $2, $3, $4, $5
      );
    `;
    const values = [
      oppTag.idopp_tag,
      oppTag.tagmetadata,
      oppTag.referenceId,
      oppTag.tagname,
      oppTag.activeFlag,
    ];
    const res = await client.query(query, values);
    console.log("Inserted OPPTAG", res.rows);
  } catch (error) {
    console.error("Error inserting tags", error.stack);
    throw error;
  }
}

async function getIdentity(idLead) {
  try {
    const query = `
    select l.identity_oppurtunity from oppurtunity."lead" l where idlead = $1
    `;
    const res = await client.query(query, [idLead]);
    return res.rows;
  } catch (error) {
    console.error("Error inserting tags", error.stack);
    throw error;
  }
}

module.exports = {
  createLead,
  getLead,
  getLeadTags,
  getLocality,
  getLeadTagsById,
  getLeadById,
  getOppTag,
  addOppTag,
  getIdentity,
};
