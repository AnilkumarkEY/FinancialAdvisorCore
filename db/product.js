const { client } = require("../config/db");

async function createProduct(prospectInterestData) {
  const query = `
      INSERT INTO oppurtunity.prospect_interest (
        idprospect_interest,
        idlead,
        idproduct_ref_id,
        identity_lead_createdby,
        sortorder,
        eff_from_date,
        eff_to_date,
        createdby,
        modifiedby,
        modified_date
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, NOW()
      )
      RETURNING *;
    `;

  const values = [
    prospectInterestData.idprospect_interest,
    prospectInterestData.idlead,
    prospectInterestData.idproduct_ref_id,
    prospectInterestData.identity_lead_createdby,
    prospectInterestData.sortorder,
    prospectInterestData.eff_from_date,
    prospectInterestData.eff_to_date,
    prospectInterestData.createdby,
    prospectInterestData.modifiedby,
  ];

  try {
    const res = await client.query(query, values);
    console.log("Insert successful:", res.rows);
    return res.rows;
  } catch (error) {
    console.error("Error inserting data:", error);
    throw error;
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

async function getAllProducts(pagination) {
  try {
    const { pageNumber, pageCount } = pagination;
    const offset = (pageNumber - 1) * pageCount;
    const query = `
      select * from core.vw_product_metadata
      ORDER BY idproduct
      LIMIT $1 OFFSET $2
    `;
    const countQuery = `
      SELECT COUNT(*) AS totalCount 
      FROM core.vw_product_metadata
    `;
    const countRes = await client.query(countQuery);
    const totalCount = parseInt(countRes.rows[0].totalcount, 10);
    const totalPages = Math.ceil(totalCount / pageCount);
    const values = [pageCount, offset];
    const res = await client.query(query, values);
    return {
      totalCount,
      totalPages,
      data: res.rows, // Return the result rows
    };
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
