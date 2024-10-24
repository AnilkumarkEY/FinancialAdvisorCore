const { client } = require("../config/db");

async function createProduct(dataArray) {
  try {
    const fields = [
      "idprospect_interest",
      "idlead",
      "idproduct_ref_id",
      "identity_lead_createdby",
      "sortorder",
      "eff_from_date",
      "eff_to_date",
      "activeflag",
      "createdby",
      "created_date",
      "modifiedby",
      "modified_date",
    ];

    const columns = fields.join(", ");

    const values = dataArray
      .map((data) => {
        const rowValues = fields.map((field) =>
          data[field] !== undefined ? `'${data[field]}'` : "null"
        );
        return `(${rowValues.join(", ")})`;
      })
      .join(", ");

    const query = `
    INSERT INTO oppurtunity.prospect_interest (${columns})
    VALUES ${values} RETURNING *;
  `;
    const res = await client.query(query);
    return res.rows; // Return the result rows
  } catch (err) {
    console.error("Error executing query", err.stack);
    throw err; // Rethrow the error for handling in the controller
  }
}

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

async function getProspectInterest(idlead) {
  try {
    const prospectInterestQuery = `
    select * from oppurtunity.prospect_interest where idlead = '${idlead}'
  `;
    const prospectInterestRes = await client.query(prospectInterestQuery);
    const prospectInterestData = prospectInterestRes.rows;
    if (prospectInterestData.length === 0) {
      throw new Error("No records found in prospect_interest");
    }
    const idproductRefIds = prospectInterestData.map(
      (record) => record.idproduct_ref_id
    );
    // Fetch records from core.product for each idproduct
    const productDataPromises = idproductRefIds.map((idproductRefId) =>
      getProduct(idproductRefId)
    );
    const productDataArray = await Promise.all(productDataPromises);
    return productDataArray.flat(); // Return the result rows
  } catch (err) {
    console.error("Error executing query", err.stack);
    throw err; // Rethrow the error for handling in the controller
  }
}

module.exports = {
  createProduct,
  getProduct,
  getAllProducts,
  getProspectInterest,
};
