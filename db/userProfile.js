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
  } catch (err) {
    console.error("Error executing query", err.stack);
    throw err; // Rethrow the error for handling in the controller
  }
}

async function checkActiveFlag(oid) {
  try {
    const query = `
        SELECT 
            e.activeflag
        FROM 
            core.entity e 
        JOIN 
            core.user_auth_data u ON u.identity = e.identity
        WHERE 
            u.oid = $1;
      `;
    const res = await client.query(query, [oid]);
    return res.rows;
  } catch (error) {
    console.error("Error executing query", error.stack);
    throw error; // Rethrow the error for handling in the controller
  }
}

async function insertSessionData(oid, idsession, tokenExpiryTime) {
  // Convert the Unix timestamp to a PostgreSQL timestamp
  const sessionExpiryDate = new Date(tokenExpiryTime * 1000).toISOString();

  const query = `
    UPDATE core.user_auth_data
    SET idsession = $1, sessionexpirytime = $2
    WHERE oid = $3
    `;

  try {
    const result = await client.query(query, [
      idsession,
      sessionExpiryDate,
      oid,
    ]);
    console.log("Update successful:", result);
    return result;
  } catch (error) {
    console.error("Error inserting data:", error);
    throw error; // Rethrow the error for further handling if needed
  }
}

async function checkValidRoute(oid, eventDefination) {
  try {
    const query = `
        select uad."identity",eua.idurc,vedcc.idevent_defination,vedcc.is_matching 
        from core.user_auth_data uad 
        inner join core.entity_urc_auth eua on eua.identity = uad."identity"
        inner join core.vw_event_def_category_check vedcc on vedcc.idurc = eua.idurc 
        where "oid" = $1 and idevent_defination = $2
        `;
    const res = await client.query(query, [oid, eventDefination]);
    return res.rows;
  } catch (error) {
    console.error("Error executing query", err.stack);
    throw err; // Rethrow the error for handling in the controller
  }
}

const insertEventTransaction = async (data) => {
  const { identity, idurc, idevent_defination, idevent_transaction } = data;
  const allowedSourceQuery = `
  Select idevent_def_allowed_source from core.event_def_allowed_source where idevent_defination = $1
  `;
  const entityUrcAuthQuery = `Select identity_urc_auth from core.entity_urc_auth where idurc = $1`;
  const query = `
      INSERT INTO core.event_transaction (idevent_transaction, idevent_def_allowed_source, 
      identity, identity_urc_auth, event_start_time, event_endtime)
      VALUES ($1, $2, $3, $4, NOW(), NOW());
    `;

  try {
    const entityUrcAuthResult = await client.query(entityUrcAuthQuery, [idurc]);
    const allowedSourceResult = await client.query(allowedSourceQuery, [
      idevent_defination,
    ]);

    console.log(allowedSourceResult.rows, entityUrcAuthResult.rows);
    idevent_def_allowed_source =
      allowedSourceResult.rows[0].idevent_def_allowed_source;
    identity_urc_auth = entityUrcAuthResult.rows[0].identity_urc_auth;
    const result = await client.query(query, [
      idevent_transaction,
      idevent_def_allowed_source,
      identity,
      identity_urc_auth,
    ]);
    console.log("Insert successful:", result);
  } catch (error) {
    console.error("Error inserting data:", error);
  }
};

const insertEntity = async (entityData) => {
  const pool = await client.connect();  // Get a client from the pool
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

        const values = [
          entityData.fullname || null,
          entityData.lastname || null,
          entityData.sortorder || null,
          entityData.idmeta_data_entitytype || null,
          entityData.inactivedate || null,
          entityData.activeflag !== undefined ? entityData.activeflag : null,
          entityData.createdby || null,
          entityData.firstname || null,
          entityData.modifiedby || null,
          entityData.middlename || null,
          entityData.eff_from_date || null,
          entityData.dob || null,
          entityData.eff_to_date || null,
          entityData.identity || null,
          entityData.idmeta_data_gender || null,
        ];

  try {
    const res = await pool.query(query, values);
    console.log("Insert successful:", res);
    return res.rows;
  } catch (error) {
    console.error("Error inserting data:", error);
  } finally {
    // await client.end();
    pool.release();
  }
};

const updateEntity = async (querys, entityData) => {
  // Start building the query
  let query = querys;
  const values = [];
  let setClauses = [];
  let index = 1;

  // Loop through the entityData to build the dynamic update set clauses
  for (const key in entityData) {
    if (key !== "identity" && entityData[key] !== undefined) {
      setClauses.push(`${key} = $${index}`);
      values.push(entityData[key] || null);
      index++;
    }
  }

  // If there are no fields to update, return an early response
  if (setClauses.length === 0) {
    console.log("No fields to update.");
    return;
  }

  // Join the set clauses into the query
  query += setClauses.join(", ");
  query += ` WHERE identity = $${index}`;
  values.push(entityData.identity); // Add the identity for the WHERE clause

  try {
    const res = await client.query(query, values);
    console.log("Update successful:", res);
  } catch (error) {
    console.error("Error updating data:", error);
  } finally {
    await client.end();
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
  } finally {
    await client.end();
  }
};

const insertEntityContact = async (entityContactData) => {
  const pool = await client.connect();  // Get a client from the pool
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
        created_date
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
      RETURNING *;
`;

  const values = [
    entityContactData.eff_to_date || null,
    entityContactData.activeflag !== undefined
      ? entityContactData.activeflag
      : null,
    entityContactData.identity_contact || null,
    entityContactData.countrycode || null,
    entityContactData.dialingcode || null,
    entityContactData.location_name || null,
    entityContactData.modified_date || null,
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
  ];
  console.log("Insert successful:", values);
  try {
    const res = await pool.query(query, values);
    console.log("Insert successful:", res);
    return res.rows;
  } catch (error) {
    console.error("Error inserting data:", error);
  } finally {
    // await client.end();
    pool.release();
  }
};

module.exports = {
  getUsers,
  checkActiveFlag,
  insertSessionData,
  checkValidRoute,
  insertEventTransaction,
  insertEntity,
  updateEntity,
  insertEntityUrcAuth,
  insertEntityContact,
};
