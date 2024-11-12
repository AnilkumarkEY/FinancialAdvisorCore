const { client } = require("../config/db");

const getNomineeDetailsByIdentity = async (identity) => {
    try {
      const query = `
        SELECT 
        p.identity_nominee as entity_nominee,
        cmt.idmetadata as nominee_title_meta,
        cmt.meta_data_name as nominee_title,
        enm.fullname,
        cmr.idmetadata as nominee_relationship_meta,
        cmr.meta_data_name as nominee_relationship,
        p.nominee_dob
        FROM core.partnernominee p 
        INNER JOIN core.entity enm on enm.identity = p.identity_nominee
        INNER JOIN core.cr_metadata cmr on cmr.idmetadata = p.idmetadata_nominee_relationship 
        INNER JOIN core.cr_metadata cmt on cmt.idmetadata = p.idmetadata_title
        WHERE identity_partner = $1;`;
  
      const res = await client.query(query, [identity]);
      return res.rows;
    } catch (err) {
      console.error("Error: ", error)
      throw error;
    }
  };

const insertSrTransaction = async (values) => {
  try{
    const query = `
    INSERT INTO agentservicing.sr_transaction 
    (
    idsr_transaction,
    idsrcategory,
    idsr_subcategory, 
    identity_sr_createdby, 
    sr_meta_value,
    idmeta_sr_status,
    sr_initiated_time,
    sr_closed_time
    ) VALUES 
    ($1, $2, $3, $4, $5, $6, NOW(), NOW())
    RETURNING *`;
    const transactionValues = [
      values.idsr_transaction,
      values.idsrcategory,
      values.idsr_subcategory, 
      values.identity, 
      values.sr_meta_value,
      values.idmeta_sr_status
    ]
    const res = await client.query(query, transactionValues);
    return res.rows;
  } catch(error){
    console.error("Error: ", error)
    throw error;
  }
}

const updateContact = async (values, idmeta_contact_type, identity) => {
  try{
    const query = `
    UPDATE core.entity_contact
    SET contact_value = $1 
    WHERE idmeta_contact_type = $2 AND
    identity = $3
    RETURNING *`;

    const updateValues = [
      values.contact_value,
      idmeta_contact_type,
      identity
    ]

    const res = await client.query(query, updateValues);
    return res.rows;
  } catch(error){
    console.error("Error: ", error)
    throw error;
  }
}

const updateContactAddress = async (values, idmeta_contact_type, identity) => {
  try{
    const query = `
    UPDATE core.entity_contact
    SET address_line_1 = $1, address_line_2 = $2, location_name = $3, state = $4, pincode = $5
    WHERE idmeta_contact_type = $6 AND
    identity = $7
    RETURNING *`;

    const updateValues = [
      values.address_line_1,
      values.address_line_2,
      values.location_name,
      values.state,
      values.pincode,
      idmeta_contact_type,
      identity
    ]

    const res = await client.query(query, updateValues);
    return res.rows;
  } catch(error){
    console.error("Error: ", error)
    throw error;
  }
}

const updateContactInUserAuth = async (values) => {
  try {
    let query = `UPDATE core.user_auth_data SET `;
    if(values.contactType === 'eef8f47d787041b59afd37937deed705'){
      query += 'reg_mobile_number = $1';
    } else if(values.contactType === '4678e1bb1f2d414393a85dfbe0c85fff'){
      query += 'reg_email = $1';
    }
    query += ` WHERE identity = $2`;

    const updateValues = [
      values.newValues.contact_value,
      values.identity
    ];

    const res = await client.query(query, updateValues);
    return res.rows;
  } catch (error) {
    console.error("Error: ", error)
    throw error;
  }
}

const getMetaData = async (metaMaster) => {
  try {
    const query = 
    `SELECT md.idmetadata, md.meta_data_name
    FROM core.cr_metadata md
    WHERE md.idmetamaster = $1`;

    const res = await client.query(query, [metaMaster]);
    return res.rows;
  } catch (error) {
    console.error("Error: ", error)
    throw error;
  }
}

const updateEntity = async (values, identity_nominee) => {
  try {
    let query = 
    `UPDATE core.entity SET
    firstname = $1,
    lastname = $2,
    fullname = $3,
    idmeta_title = $4,
    middlename = $5
    WHERE identity = $6
    RETURNING *`;

    const updatedValues = [
      values.name.firstname,
      values.name.lastname,
      values.fullname,
      values.title,
      values.name.middlename || null,
      identity_nominee
    ]

    const res = await client.query(query, updatedValues);
    return res.rows;
  } catch (error) {
    console.error("Error: ", error)
    throw error;
  }
}

const updateNomineeDetails = async (values, identity_nominee, identity) => {
  try {
    const query = 
    `UPDATE core.partnernominee SET
    nominee_dob = $1,
    idmetadata_nominee_relationship = $2,
    idmetadata_title = $3
    WHERE identity_nominee = $4 AND identity_partner = $5
    RETURNING *`;

    const updatedValues = [
      values.dob,
      values.relationship,
      values.title,
      identity_nominee,
      identity
    ]

    const res = await client.query(query, updatedValues);
    return res.rows;
  } catch (error) {
    console.error("Error: ", error)
    throw error;
  }
}

const getSrSubCategory = async (metaMaster) => {
  try {
    const query = 
    `SELECT 
    idsr_subcategory, 
    sub_category_name 
    FROM agentservicing.sr_subcategory ss 
    WHERE idsrcategory = $1`;

    const res = await client.query(query, [metaMaster]);
    return res.rows;
  } catch (error) {
    console.error("Error: ", error)
    throw error;
  }
}

const getProfileOfficialDetails = async(identity) => {
  try {
    const query = 
    `SELECT 
    business_code AS agent_code,
    profile_fullname AS fullname,
    designation ,
    irda_number ,
    joiningdate ,
    license_expiry_date ,
    CASE 
      WHEN activeflag = 1 THEN 'Active'
      WHEN activeflag = 0 THEN 'Inactive'
    END AS agent_status,
    leader_code,
    branch 
    FROM core.profile
    WHERE identity = $1`;

    const res = await client.query(query, [identity]);
    return res.rows;
  } catch (error) {
    throw error;
  }
}

  module.exports = {
    getNomineeDetailsByIdentity,
    insertSrTransaction,
    updateContact,
    updateContactAddress,
    updateContactInUserAuth,
    getMetaData,
    updateEntity,
    updateNomineeDetails,
    getSrSubCategory,
    getProfileOfficialDetails
  };
  