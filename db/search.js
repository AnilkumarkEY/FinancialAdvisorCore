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

async function getTopCategoriesList(userType) {
  try {
    const query = `Select distinct em.* from  core.functionality_master em 
    JOIN core.functionality_role_mapping_tb erm on em.idfunctionality = erm.functionality_master_id 
    JOIN core.usertype utm on utm.idusertype = erm.user_type_master_id 
    where utm.description = $1 and em.functionality_type_master = 'FUNCTIONALITY_GLOBAL_SEARCH' and erm.default_functionality = true`;
    const res = await client.query(query, [userType]);
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
    const res = await client.query(query, [userType, searchKeyword]);
    return res.rows; // Return the result rows
  } catch (error) {
    console.error("Error executing query", error.stack);
    throw error; // Rethrow the error for handling in the controller
  }
}

async function getFavouriteEventByUser(userType) {
  try {
    const query = `Select DISTINCT em.idfunctionality,em.name,em.functionality_code,em.icon_Url,
      em.functionality_class_type,em.functionality_class_type,erm.default_functionality,erm.display_order from core.functionality_master em 
      JOIN core.functionality_role_mapping_tb erm on em.idfunctionality = erm.functionality_master_id
      JOIN core.usertype utm on utm.idusertype = erm.user_type_master_id
      where utm.description =  $1::text`;
    // AND em.functionality_type_master is null`;

    const res = await client.query(query, [userType]);

    return res.rows; // Return the result rows
  } catch (error) {
    console.error("Error executing query", error.stack);
    throw error; // Rethrow the error for handling in the controller
  }
}

async function getAllFavouriteByntId(ntId) {
  try {
    const query = `select * from core.favourite_functionality_master_manage ffmm where ffmm.nt_id =  $1`;

    const res = await client.query(query, [ntId]);

    return res.rows; // Return the result rows
  } catch (error) {
    console.error("Error executing query", error.stack);
    throw error; // Rethrow the error for handling in the controller
  }
}

async function addfav(target) {
  try {
    const query = `INSERT INTO core.favourite_functionality_master_manage
(idfavoritefunc, display_order, functionality_master_id, nt_id) VALUES($1, $2, $3, $4);`;


    const values = [
      target.idfavoritefunc,
      target.display_order,
      target.functionality_master_id,
      target.nt_id
    ];
    const res = await client.query(query, values);
    return res.rows;
  } catch (error) {
    console.error("Error executing query", error.stack);
    throw error;
  }
}

async function deletefav(target) {
  try {
    const query = `DELETE FROM core.favourite_functionality_master_manage WHERE idfavoritefunc=$1;`;
    const values = [
      target.idfavoritefunc
    ];
    const res = await client.query(query, values);
    return res.rows;
  } catch (error) {
    console.error("Error executing query", error.stack);
    throw error;
  }
}
module.exports = {
  functionalitySearchKey,
  functionalityMasterSearchGlobalSearch,
  getFavouriteEventByUser,
  getAllFavouriteByntId,
  addfav,
  deletefav,
  getTopCategoriesList
};
