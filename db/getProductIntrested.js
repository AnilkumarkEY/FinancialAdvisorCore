const {client} = require("../config/db")


async function getProduct(idproduct_ref_id) {
  try {
    const query = `
      select * from core.vw_product_metadata where idproduct = '${idproduct_ref_id}'`;
    const res = await client.query(query);
    return res.rows; // Return the result rows
  } catch (err) {
    console.error("Error executing query", err.stack);
    throw err; // Rethrow the error for handling in the controller
  }
}

async function getAllProducts() {
  try {
    const query = `
      select * from core.vw_product_metadata`;
    const res = await client.query(query);
    return res.rows; // Return the result rows
  } catch (err) {
    console.error("Error executing query", err.stack);
    throw err; // Rethrow the error for handling in the controller
  }
}

async function prospectInterest(idlead) {
  try {
    const prospectInterestQuery = `
    select * from oppurtunity.prospect_interest where idlead = '${idlead}'
  `;
    const prospectInterestRes = await client.query(prospectInterestQuery);
    const prospectInterestData = prospectInterestRes.rows;
    if (prospectInterestData.length === 0) {
      throw new Error('No records found in prospect_interest');
    }
    const idproductRefIds = prospectInterestData.map(record => record.idproduct_ref_id);
// Fetch records from core.product for each idproduct
const productDataPromises = idproductRefIds.map(idproductRefId => getProduct(idproductRefId));
const productDataArray = await Promise.all(productDataPromises);
    return productDataArray.flat(); // Return the result rows
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
    where l.identity_lead_createdby = '${idlead}'
    `;
    const res = await client.query(query);
    return res.rows; // Return the result rows
  } catch (err) {
    console.error("Error executing query", err.stack);
    throw err; // Rethrow the error for handling in the controller
  }
}

async function getContact(idlead) {
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


module.exports = {
  prospectInterest,
  getLead,
  getContact,
  getAllProducts
}