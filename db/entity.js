const { client } = require("../config/db");

const insertEntity = async (entityData) => {
  const query = `
            INSERT INTO core.entity (
              fullname,
              lastname,
              sortorder,
              idmeta_data_entitytype,
              inactivedate,
              activeflag,
              createdby,
              created_date,
              firstname,
              modifiedby,
              middlename,
              eff_from_date,
              dob,
              eff_to_date,
              identity,
              idmeta_data_gender
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), $8, $9, $10, $11, $12, $13, $14, $15)
            RETURNING *;
          `;
  console.log(entityData, "aaaaaaaaaaaaaaaaaaaaa");

  const values = [
    entityData.fullName || null,
    entityData.lastname || null,
    entityData.sortorder || null,
    entityData.metaEntityType || null,
    entityData.inactivedate || null,
    entityData.activeflag !== undefined ? entityData.activeflag : null,
    entityData.isValid.identity || null,
    entityData.firstname || null,
    entityData.modifiedby || null,
    entityData.middlename || null,
    entityData.eff_from_date || null,
    entityData.dob || null,
    entityData.eff_to_date || null,
    entityData.identity || null,
    entityData.gender || null,
  ];
  try {
    const res = await client.query(query, values);
    console.log("Insert successful:", res);
    return res.rows;
  } catch (error) {
    console.error("Error inserting data:", error);
  }
};

const updateEntity = async (query, entityData) => {
  // Start building the query
  const values = [];
  let setClauses = [];
  let index = 1;

  // Destructure fieldToMatch from entityData and delete it
  const { fieldToMatch } = entityData;
  delete entityData.fieldToMatch;

  // Loop through entityData to build the dynamic update set clauses
  for (const key in entityData) {
    // Exclude identity_contact from the SET clause
    if (key !== fieldToMatch && entityData[key] !== undefined) {
      setClauses.push(`${key} = $${index}`);
      values.push(entityData[key] || null);
      index++;
    }
  }

  // If there are no fields to update, return early
  if (setClauses.length === 0) {
    console.log("No fields to update.");
    return;
  }

  // Join the set clauses into the query
  query += setClauses.join(", ");
  query += ` WHERE ${fieldToMatch} = $${index}`;
  values.push(entityData[fieldToMatch]); // Add fieldToMatch value for the WHERE clause

  console.log(query, values);

  try {
    const res = await client.query(query, values);
    console.log("Update successful:", res);
    return res.rowCount;
  } catch (error) {
    console.error("Error updating data:", error);
  }
};

const insertEntityUrcAuth = async (entityUrcAuthData) => {
  const query = `
        INSERT INTO core.entity_urc_auth (
          created_date,
          idcontract,
          activeflag,
          issubsidary,
          description,
          identity_urc_auth,
          sortorder,
          modified_date,
          identity,
          modifiedby,
          inactivedate,
          eff_from_date,
          eff_to_date,
          entity_urc_auth,
          createdby,
          idurc
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), $8, $9, $10, $11, $12, $13, $14, $15)
      `;

  const values = [
    entityUrcAuthData.created_date || null,
    entityUrcAuthData.idcontract || null,
    entityUrcAuthData.activeflag !== undefined
      ? entityUrcAuthData.activeflag
      : null,
    entityUrcAuthData.issubsidary || null,
    entityUrcAuthData.description || null,
    entityUrcAuthData.identity_urc_auth || null,
    entityUrcAuthData.sortorder || null,
    entityUrcAuthData.identity || null,
    entityUrcAuthData.modifiedby || null,
    entityUrcAuthData.inactivedate || null,
    entityUrcAuthData.eff_from_date || null,
    entityUrcAuthData.eff_to_date || null,
    entityUrcAuthData.entity_urc_auth || null,
    entityUrcAuthData.createdby || null,
    entityUrcAuthData.idurc || null,
  ];

  try {
    const res = await client.query(query, values);
    console.log("Insert successful:", res);
  } catch (error) {
    console.error("Error inserting data:", error);
  }
};

const insertEntityContact = async (entityContactData) => {
  const query = `
  INSERT INTO core.entity_contact (
    eff_to_date,
    activeflag,
    identity_contact,
    countrycode,
    dialingcode,
    location_name,
    createdby,
    modified_date,
    sortorder,
    contact_value,
    state,
    identity_urc_auth,
    address_line_1,
    inactivedate,
    address_line_2,
    modifiedby,
    identity_subscription,
    idmeta_contact_type,
    eff_from_date,
    pincode,
    created_date,
    identity
  ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), 
  $8, $9, $10, $11, $12, $13, $14, $15, $16,
  $17, $18, $19, $20, $21)
  RETURNING *;
`;

  const values = [
    entityContactData.eff_to_date || null,
    entityContactData.activeflag || null,
    entityContactData.identity_contact || null,
    entityContactData.countrycode || null,
    entityContactData.dialingcode || null,
    entityContactData.location_name || null,
    entityContactData.createdby || null,
    entityContactData.sortorder || null,
    entityContactData.contact_value || null,
    entityContactData.state || null,
    entityContactData.identity_urc_auth || null,
    entityContactData.address_line_1 || null,
    entityContactData.inactivedate || null,
    entityContactData.address_line_2 || null,
    entityContactData.modifiedby || null,
    entityContactData.identity_subscription || null,
    entityContactData.idmeta_contact_type || null,
    entityContactData.eff_from_date || null,
    entityContactData.pincode || null,
    entityContactData.created_date || null,
    entityContactData.identity || null,
  ];
  console.log("Values:", values);
  try {
    const res = await client.query(query, values);
    console.log("Insert successful:", res.rows);
    return res.rows;
  } catch (error) {
    console.error("Error inserting data:", error);
  }
};

async function getEntityContact(idlead) {
  try {
    const query = `
     select * from core.entity_contact ec where identity_urc_auth = '${idlead}'
      `;
    const res = await client.query(query);
    return res.rows; // Return the result rows
  } catch (err) {
    console.error("Error executing query", err.stack);
    throw err; // Rethrow the error for handling in the controller
  }
}

const getEntityContactByIdentity = async (identity) => {
  try {
    const query = `
      SELECT 
      ec.identity_contact,
      cm.meta_data_name AS contact_type,
      ec.contact_value,
      ec.countrycode,
      cn.countryname,
      ec.dialingcode,
      ec.address_line_1,
      ec.address_line_2,
      ec.location_name,
      ec.state,
      ec.pincode,
      ec.district,
      ec.eff_from_date
      FROM core.entity_contact ec
      INNER JOIN core.cr_metadata cm ON cm.idmetadata = ec.idmeta_contact_type
      LEFT JOIN core.country cn ON ec.countrycode = cn.countrycode
      WHERE ec.identity = $1;
    `;
    console.log(query);
    const res = await client.query(query, [identity]);
    return res.rows;
  } catch (err) {
    console.error("Error executing query", err.stack);
    throw err;
  }
};

module.exports = {
  insertEntity,
  updateEntity,
  insertEntityUrcAuth,
  insertEntityContact,
  getEntityContact,
  getEntityContactByIdentity,
};
