const { client } = require("../config/db");
async function functionalitySearchKey() {
  try {
    const query = `select distinct keyword from core.search_keyword_manager skm `;
    const res = await client.query(query);
    return res.rows; // Return the result rows
  } catch (error) {
    console.error("Error executing query", error.stack);
    throw error; // Rethrow the error for handling in the controller
  }
}

async function functionalityMasterSearchGlobalSearch(userType, searchKeyword) {
  try {
    const query = `SELECT DISTINCT em.* FROM core.functionality_master em
      JOIN core.functionality_role_mapping_tb erm ON em.idfunctionality = erm.functionality_master_id
      JOIN core.functionality_keyword_mapping fkey ON em.idfunctionality = fkey.functionality_master_id
      JOIN core.search_keyword_manager srk ON srk.idsearch = fkey.keyword_manager_id
      JOIN core.usertype utm ON utm.idusertype = erm.user_type_master_id
      WHERE utm.description =  $1::text AND em.functionality_type_master = 'FUNCTIONALITY_GLOBAL_SEARCH'
      AND srk.keyword LIKE CONCAT('%', $2::text, '%')`;

    console.log("Executing query:", query);
    console.log("Parameters:", [userType, searchKeyword]);

    const res = await client.query(query, [userType, searchKeyword]);
    console.log("query: " + query)
    console.log("res.rows: " + res.rows)
    return res.rows; // Return the result rows
  } catch (error) {
    console.error("Error executing query", error.stack);
    throw error; // Rethrow the error for handling in the controller
  }
}

module.exports = {
  functionalitySearchKey,
  functionalityMasterSearchGlobalSearch
};