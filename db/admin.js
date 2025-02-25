const { client } = require("../config/db");

const insertAgent = async (data) => {
  try {
    const query = `
            INSERT INTO agentservicing.agent_directory (
            nstatus,
            advisor_code,
            advisor_name,
            desgn_code,
            desgn_desc,
            branch_code,
            branch_name,
            dt_leader_code,
            dt_leader_name,
            dt_leader_desg_desc,
            dt_leader_designation,
            dt_leader_branch,
            dt_leader_branch_name,
            l1_leader_code,
            l1_leader_name,
            l1_leader_desg_desc,
            l1_leader_designation,
            l1_leader_branch,
            l1_leader_branch_name,
            l2_leader_code,
            l2_leader_name,
            l2_leader_desg_desc,
            l2_leader_designation,
            l2_leader_branch,
            l2_leader_branch_name,
            bam_ntid,
            bam_code,
            bam_emp_cd,
            bam_name,
            bam_designation,
            bam_desg_desc,
            bam_branch,
            bam_branch_name,
            bm_ntid,
            bm_code,
            bm_emp_cd,
            bm_name,
            bm_designation,
            bm_desg_desc,
            bm_branch,
            bm_branch_name,
            ch_ntid,
            ch_code,
            ch_emp_cd,
            ch_name,
            ch_designation,
            ch_desg_desc,
            ch_branch,
            ch_branch_name,
            adoa_nonsourcing_ntid,
            adoa_nonsourcing_code,
            adoa_nonsourcing_emp_cd,
            adoa_nonsourcing_name,
            adoa_nonsourcing_designation,
            adoa_nonsourcing_desg_desc,
            adoa_nonsourcing_branch,
            adoa_nonsourcing_branch_name,
            adoa_ntid,
            adoa_code,
            adoa_emp_cd,
            adoa_name,
            adoa_designation,
            adoa_desg_desc,
            adoa_branch_code,
            adoa_branch_name,
            doa_ntid,
            doa_code,
            doa_emp_cd,
            doa_name,
            doa_designation,
            doa_desg_desc,
            doa_branch,
            doa_branch_name,
            cao_ntid,
            cao_code,
            cao_emp_cd,
            cao_name,
            cao_designation,
            cao_desg_desc,
            cao_branch_code,
            cao_branch_name,
            id
            ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
            $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
            $21, $22, $23, $24, $25, $26, $27, $28, $29, $30,
            $31, $32, $33, $34, $35, $36, $37, $38, $39, $40,
            $41, $42, $43, $44, $45, $46, $47, $48, $49, $50,
            $51, $52, $53, $54, $55, $56, $57, $58, $59, $60,
            $61, $62, $63, $64, $65, $66, $67, $68, $69, $70,
            $71, $72, $73, $74, $75, $76, $77, $78, $79, $80,
            $81, $82
            )
            RETURNING *;
        `;
    const values = [
      data.nstatus || null,
      data.advisor_code || null,
      data.advisor_name || null,
      data.desgn_code || null,
      data.desgn_desc || null,
      data.branch_code || null,
      data.branch_name || null,
      data.dt_leader_code || null,
      data.dt_leader_name || null,
      data.dt_leader_desg_desc || null,
      data.dt_leader_designation || null,
      data.dt_leader_branch || null,
      data.dt_leader_branch_name || null,
      data.l1_leader_code || null,
      data.l1_leader_name || null,
      data.l1_leader_desg_desc || null,
      data.l1_leader_designation || null,
      data.l1_leader_branch || null,
      data.l1_leader_branch_name || null,
      data.l2_leader_code || null,
      data.l2_leader_name || null,
      data.l2_leader_desg_desc || null,
      data.l2_leader_designation || null,
      data.l2_leader_branch || null,
      data.l2_leader_branch_name || null,
      data.bam_ntid || null,
      data.bam_code || null,
      data.bam_emp_cd || null,
      data.bam_name || null,
      data.bam_designation || null,
      data.bam_desg_desc || null,
      data.bam_branch || null,
      data.bam_branch_name || null,
      data.bm_ntid || null,
      data.bm_code || null,
      data.bm_emp_cd || null,
      data.bm_name || null,
      data.bm_designation || null,
      data.bm_desg_desc || null,
      data.bm_branch || null,
      data.bm_branch_name || null,
      data.ch_ntid || null,
      data.ch_code || null,
      data.ch_emp_cd || null,
      data.ch_name || null,
      data.ch_designation || null,
      data.ch_desg_desc || null,
      data.ch_branch || null,
      data.ch_branch_name || null,
      data.adoa_nonsourcing_ntid || null,
      data.adoa_nonsourcing_code || null,
      data.adoa_nonsourcing_emp_cd || null,
      data.adoa_nonsourcing_name || null,
      data.adoa_nonsourcing_designation || null,
      data.adoa_nonsourcing_desg_desc || null,
      data.adoa_nonsourcing_branch || null,
      data.adoa_nonsourcing_branch_name || null,
      data.adoa_ntid || null,
      data.adoa_code || null,
      data.adoa_emp_cd || null,
      data.adoa_name || null,
      data.adoa_designation || null,
      data.adoa_desg_desc || null,
      data.adoa_branch_code || null,
      data.adoa_branch_name || null,
      data.doa_ntid || null,
      data.doa_code || null,
      data.doa_emp_cd || null,
      data.doa_name || null,
      data.doa_designation || null,
      data.doa_desg_desc || null,
      data.doa_branch || null,
      data.doa_branch_name || null,
      data.cao_ntid || null,
      data.cao_code || null,
      data.cao_emp_cd || null,
      data.cao_name || null,
      data.cao_designation || null,
      data.cao_desg_desc || null,
      data.cao_branch_code || null,
      data.cao_branch_name || null,
      data.id || null,
    ];
    const res = await client.query(query, values);
    return res.rows;
  } catch (error) {
    console.error("Error inserting agent data:", error);
    throw error;
  }
};

const insertProfile = async (data) => {
  try {
    const query = `
            INSERT INTO core.profile (
            idprofile,
            identity,
            business_code,
            profile_fullname,
            designation_code,
            designation,
            irda_number,
            joiningdate,
            license_expiry_date,
            branch,
            sortorder,
            eff_from_date,
            eff_to_date,
            createdby,
            created_date,
            modified_date,
            modifiedby,
            identity_subscriber,
            identity_subscriber_urc,
            leader_code,
            inactivedate,
            activeflag,
            profile_picture,
            role
            )
            VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
            $11, $12, $13, $14, NOW(), $15, $16, $17, $18, $19,
            $20, $21, $22, $23
            )
            RETURNING *;
        `;

    const values = [
      data.idprofile || null,
      data.identity || null,
      data.business_code || null,
      data.profile_fullname || null,
      data.designation_code || null,
      data.designation || null,
      data.irda_number || null,
      data.joiningdate || null,
      data.license_expiry_date || null,
      data.branch || null,
      data.sortorder || null,
      data.eff_from_date || null,
      data.eff_to_date || null,
      data.createdby || null,
      // data.created_date || null,
      data.modified_date || null,
      data.modifiedby || null,
      data.identity_subscriber || null,
      data.identity_subscriber_urc || null,
      data.leader_code || null,
      data.inactivedate || null,
      1,
      data.profile_picture || null,
      data.userRole || null
    ];
    const res = await client.query(query, values);
    return res.rows;
  } catch (error) {
    console.error("Error inserting profile data:", error);
    throw error;
  }
};

const getIdUrcFromUserType = async (idUserType) => {
  try {
    const query = `
            SELECT 
            urc.idurc 
            FROM core.usertype u 
            INNER JOIN core.user_role_category urc 
            ON u.idusertype = urc.idusertype 
            WHERE u.idusertype = $1
        `;

    const res = await client.query(query, [idUserType]);
    return res.rows[0].idurc;
  } catch (error) {
    console.error("Error getting idUrc data:", error);
    throw error;
  }
};

async function getAllUsers(pagination) {
  try {
    const { pageNumber, pageCount } = pagination;
    const offset = (pageNumber - 1) * pageCount;

    const query = `
        WITH profile_data AS (
          SELECT 
              p.profile_picture,
              p.identity AS user_id,                     
              p.profile_fullname AS name,               
              p.branch AS branch,                        
              p.designation AS designation,              
              p.business_code as business_code,
              p.created_date,
              CASE 
                  WHEN p.activeflag = 1 THEN 'Active' 
                  ELSE 'Inactive' 
              END AS status                               
          FROM 
              core.profile p
        ),
        contact_data AS (
          SELECT 
              ec."identity" AS user_identity,             
              ec.contact_value AS email                   
          FROM 
              core.entity_contact ec
          WHERE 
              ec.idmeta_contact_type = '4678e1bb1f2d414393a85dfbe0c85fff' 
        )
        SELECT 
            pd.profile_picture,
            pd.user_id,                                  
            pd.name,                                     
            pd.business_code,
            pd.designation,                              
            cd.email,                                    
            pd.branch,                                   
            pd.status,                                   
            TRUE AS action_view                            
        FROM 
            profile_data pd
        LEFT JOIN 
            contact_data cd
        ON 
            pd.user_id = cd.user_identity                
        ORDER BY 
            pd.created_date DESC NULLS LAST                               
        LIMIT $1 OFFSET $2
      `;

    const countQuery = `
        WITH profile_data AS (
          SELECT p.identity AS user_id FROM core.profile p WHERE 
          p.activeflag = 1
        )
        SELECT COUNT(*) AS totalCount FROM profile_data
      `;

    // Execute total count query
    const countRes = await client.query(countQuery);
    const totalCount = parseInt(countRes.rows[0].totalcount, 10);
    const totalPages = Math.ceil(totalCount / pageCount);

    // Execute paginated query
    const values = [pageCount, offset];
    const res = await client.query(query, values);

    return {
      totalCount,
      totalPages,
      data: res.rows,
    };
  } catch (err) {
    console.error("Error executing query", err.stack);
    throw err; // Rethrow for controller error handling
  }
}

async function getEntityToUpdate(agentCode) {
  try {
    const query = `
    SELECT 
    p."identity" AS identity, 
    ec.identity_contact 
    FROM 
    core.profile p
    INNER JOIN 
    core.entity_contact ec 
    ON p."identity" = ec."identity"
    WHERE 
    p.business_code = $1
    -- AND ec.idmeta_contact_type = 'b8fbf7947f8b4505a91e662af6953a15';
    `;
    const res = await client.query(query, [agentCode]);
    return res.rows;
  } catch (error) {
    console.error("Error executing query", error.stack);
    throw error; // Rethrow for controller error handling
  }
}

async function updateAgent(agentData) {
  // Start building the query
  let query = `UPDATE agentservicing.agent_directory SET `;
  const values = [];
  let setClauses = [];
  let index = 1;

  // Destructure fieldToMatch from agentData and delete it
  const { fieldToMatch } = agentData;
  delete agentData.fieldToMatch;

  // Loop through agentData to build the dynamic update set clauses
  for (const key in agentData) {
    // Exclude identity_contact from the SET clause
    if (key !== fieldToMatch && agentData[key] !== undefined) {
      setClauses.push(`${key} = $${index}`);
      values.push(agentData[key] || null);
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
  values.push(agentData[fieldToMatch]); // Add fieldToMatch value for the WHERE clause

  console.log(query, values);

  try {
    const res = await client.query(query, values);
    console.log("Update successful:", res);
    return res.rowCount;
  } catch (error) {
    console.error("Error updating data:", error);
  }
}

async function deleteAgent(agentCode) {
  try {
    const queryProfile = `
    UPDATE core.profile
    SET activeflag = 0
    WHERE business_code = $1`;
    const resProfile = await client.query(queryProfile, [agentCode]);
    const isProfileUpdated = resProfile.rowCount;

    const queryEntity = `
    UPDATE core.entity e
    SET activeflag = 0
    WHERE e."identity" = (SELECT "identity" FROM core.profile WHERE business_code = $1)
    AND activeflag = 1;
    `;
    const resEntity = await client.query(queryEntity, [agentCode]);
    const isEntityUpdated = resEntity.rowCount;

    const queryEntityContact = `
    UPDATE core.entity_contact ec
    SET activeflag = 0
    WHERE ec."identity" = (SELECT "identity" FROM core.profile WHERE business_code = $1)
    AND activeflag = 1;
    `;
    const resEntityContact = await client.query(queryEntityContact, [
      agentCode,
    ]);
    const isEntityContactUpdated = resEntityContact.rowCount;

    const queryUserAuth = `
    UPDATE core.user_auth_data uad
    SET activeflag = 0
    WHERE uad."identity" = (SELECT "identity" FROM core.profile WHERE business_code = $1)
    AND activeflag = 1;
    `;
    const resUserAuth = await client.query(queryUserAuth, [agentCode]);
    const isUserAuthUpdated = resUserAuth.rowCount;
    if (isProfileUpdated && isEntityUpdated && isEntityContactUpdated) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error("Error updating data:", error);
  }
}

async function updateProfile(profileData) {
  try {
    const query = `
    UPDATE core.profile SET profile_fullname = $3, designation_code = $4, branch = $5, profile_picture = $6, role = $7
    WHERE identity = $1 and business_code = $2
    `;
    const values = [
      profileData.identity,
      profileData.business_code,
      profileData.profile_fullname,
      profileData.designation_code,
      profileData.branch,
      profileData.profile_picture,
      profileData.userRole
    ];
    const res = await client.query(query, values);
    console.log("Update successful:", res);
    return res.rowCount;
  } catch (error) {
    console.error("Error executing query", error.stack);
    throw error; // Rethrow for controller error handling
  }
}

module.exports = {
  insertAgent,
  insertProfile,
  getIdUrcFromUserType,
  getAllUsers,
  getEntityToUpdate,
  updateAgent,
  deleteAgent,
  updateProfile,
};
