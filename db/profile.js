const { client } = require("../config/db");

const getNomineeDetailsByIdentity = async (identity) => {
    try {
      const query = `
        select 
        p.identity_nominee as entity_nominee,
        cmt.meta_data_name as nominee_title,
        enm.fullname,
        cmr.meta_data_name as nominee_relationship,
        p.nominee_dob
        from core.partnernominee p 
        inner join core.entity enm on enm.identity = p.identity_nominee
        inner join core.cr_metadata cmr on cmr.idmetadata = p.idmetadata_nominee_priority 
        inner join core.cr_metadata cmt on cmt.idmetadata = p.idmetadata_title
        where identity_partner = $1;`;
      console.log(query);
  
      const res = await client.query(query, [identity]);
      return res.rows;
    } catch (err) {
      console.error("Error executing query", err.stack);
      throw err;
    }
  };


  module.exports = {
    getNomineeDetailsByIdentity
  };
  