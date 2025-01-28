const { client } = require("../config/db");
const { USER_TYPE } = require("../config/constants");


const category = {
    
}

const getBannerAndTickersFromDb = async (userType) => {
    try {
        const currentDate = new Date();
        const query = `SELECT comm.*
            FROM core.communication_tb comm
            JOIN core.cr_metadata cm
            ON comm.target_id = cm.idmetadata
            WHERE EXISTS (
                SELECT *
                FROM core.communication_expiry cexp
                WHERE cexp.communication_id = comm.idcommrole
                AND cexp.from_date <= $1
                AND cexp.to_date >= $1
            )
            AND EXISTS (
                SELECT *
                FROM core.communication_role_mapping ctrm
                JOIN core.usertype utm
               ON utm.idusertype = ctrm.user_type_id
                WHERE
                ctrm.communication_id = comm.idcommrole and
                utm.description = $2
            );
 `;
        const result = await client.query(query, [currentDate, userType]);
        return result.rows;
    } catch (error) {
        throw error;
    }
}

const getPrimaryEntityByTypeFromDB = async (entityType) => {
    try {
        const query = `SELECT cm2.*
                        FROM core.cr_metadata cm2
                        WHERE cm2.idmetamaster = (
                        SELECT cm.idmetamaster
                        FROM core.cr_metamaster cm
                        WHERE cm.meta_master_name = $1
                        LIMIT 1
                    );`
        const result = await client.query(query, [entityType]);
        return result.rows;
    } catch (error) {
        throw error;
    }
}

const getUserFromDb = async (userId) => {
    try {
        const query = `SELECT * FROM core.entity e 
        WHERE e.identity = $1 `;
        const result = await client.query(query, [userId]);
        return result.rows[0];
    } catch (error) {
        throw error;
    }
}

const getUserContactFromDb = async (userId) => {
    try {
        const query = `SELECT * FROM core.entity_contact ec
        WHERE ec.identity = $1 
        AND ec.activeflag=1`;
        const result = await client.query(query, [userId]);
        return result.rows[0];
    } catch (error) {
        throw error;
    }
}

const getUserProfileFromDb = async (userId) => {
    try {
        const query = `SELECT * FROM core.profile p 
        WHERE p.identity = $1 
        AND p.activeflag=1`;
        const result = await client.query(query, [userId]);
        return result.rows;
    } catch (error) {
        throw error;
    }
}

const deleteCommuncationRoleMappingByCommunicationId = async (commId) => {
    try {
        const query = `DELETE FROM core.communication_role_mapping
         WHERE communication_id  = $1`;
        const result = await client.query(query, [commId]);
        return result.rows;
    } catch (error) {
        throw error
    }
}

const addCommunicationRoleMapping = async (communicationRoleId, communicationId, userTypeId) => {
    try {
        const query = `
        INSERT INTO core.communication_role_mapping
        (idcommrole, communication_id, user_type_id)
        VALUES($1, $2, $3)`;
        const result = await client.query(query, [communicationRoleId, communicationId, userTypeId]);
        return result.rows;
    } catch (error) {
        throw error
    }
}

const getCommunicationCategoryWithoutMasterFromDb = async () => {
    try {
        const query = `
            Select * 
            FROM core.communication_category 
            WHERE master IS NULL
        `;
        const result = await client.query(query);
        return result.rows;
    } catch (error) {
        throw error
    }
}

const getAllCommunicationCategoryFromDb = async () => {
    try {
        const query = `
            SELECT * 
            FROM core.communication_category
        `;
        const result = await client.query(query);
        return result.rows;
    } catch (error) {
        throw error
    }
}

const getCommunicationCategoryByCode = async (categoryCode) => {
    try {
        const query = `
            SELECT * 
            FROM core.communication_category  
            WHERE category_code = $1
        `;
        const result = await client.query(query, [categoryCode]);
        return result.rows;
    } catch (error) {
        throw error
    }
}

const getCommunicationCategoryById = async (categoryId) => {
    try {
        const query = `
            SELECT * 
            FROM core.communication_category  
            WHERE id = $1
        `;
        const result = await client.query(query, [categoryId]);
        return result.rows[0];
    } catch (error) {
        throw error
    }
}

const getAllRoleMastes = async () => {
    try {
        const query = `
            SELECT * 
            FROM core.role
        `;
        const result = await client.query(query);
        return result.rows;
    } catch (error) {
        throw error
    }
}

const getAllUserTypesFromDb = async () => {
    try {
        const query = `
            SELECT * 
            FROM core.userType
        `;
        const result = await client.query(query);
        return result.rows;
    } catch (error) {
        throw error
    }
}

const getApplicationById = async (applicationId) => {
    try {
        const query = `
            SELECT * 
            FROM core.application_master_tb
            WHERE id = $1
        `;
        const result = await client.query(query, [applicationId]);
        return result.rows;
    } catch (error) {
        throw error
    }
}

const getUserTypeByAppId = async (applicationId) => {
    try {
        const query = `
            SELECT * 
            FROM core.userType
            WHERE app_id = $1
        `;
        const result = await client.query(query, [applicationId]);
        return result.rows;
    } catch (error) {
        throw error
    }
}

const deleteUserTypeByApplicationId = async (applicationId, userTypeList) => {
    try {
        const query = `
            DELETE FROM core.application_role_mapping arm
            WHERE arm.application_id = $1
            AND EXISTS (SELECT utm FROM core.userType utm WHERE arm.user_type_id = utm.id AND utm.description in $2)
        `;
        const result = await client.query(query, [applicationId, userTypeList]);
        return result.rows;
    } catch (error) {
        throw error
    }
};

const addUserTypeApplicationMapping = async (id,applicationId, userTypeList) => {
    try {
        const query = `
            INSERT INTO core.application_role_mapping 
            (id, application_id,user_type_id)
             VALUES ($1, $2,(SELECT idusertype FROM core.usertype ut WHERE ut.description = $3 ))
        `;
        result = await client.query(query, [id,applicationId, userTypeList]);

        return result.rows;
    } catch (error) {
        throw error
    }
};

const updateUserTypeApplicationMapping = async (applicationId, updateFields) => {
    try {
        const setQuery = Object.keys(updateFields)
             .map((key, index) => `"${key}" = $${index + 2}`) // $2, $3, etc.
            .join(', ');
        const values = [applicationId, ...Object.values(updateFields)];
        const query = `
            UPDATE core.application_master_tb
            SET ${setQuery}
            WHERE id = $1
            RETURNING *;
        `;
        const result = await client.query(query, values);
        return result.rows;
    } catch (error) {
        console.error("Error in updateUserTypeApplicationMapping:", error);
        throw error;
    }
};

const deleteCommunicationExpiryByCommunicationId = async (communcationId) => {
    try {
        const query = `
           DELETE FROM core.communication_expiry 
           WHERE communication_id = $1
        `;
        const result = await client.query(query, [communcationId]);
        return result.rows;
    } catch (error) {
        throw error
    }
}

const addCommunicationExpiry = async ({id, communicationId, fromDate, toDate}) => {
    try {
        const query = `INSERT INTO core.communication_expiry
                        (id, communication_id, from_date, to_date)
                        VALUES($1, $2, $3, $4);
        `;
        const result = await client.query(query, [id, communicationId, fromDate, toDate]);
        return result.rows;
    } catch (error) {
        throw error
    }
}

const addRoleToDb = async (roleId, communicationId,) => {
    try {
        const query = `INSERT INTO core.communication_expiry
                        (id, communication_id, from_date, to_date)
                        VALUES($1, $2, $3, $4);
        `;
        const result = await client.query(query, [id, communicationId, fromDate, toDate]);
        return result.rows;
    } catch (error) {
        throw error
    }
}

const getContentById = async (contentId) => {
    try {
        const query = `
            SELECT * 
            FROM core.communication_tb
            WHERE idcommrole = $1
        `;
        const result = await client.query(query, [contentId]);
        return result.rows[0];
    } catch (error) {
        throw error
    }
};

const updateContentInDb = async (communicationId, requestObject) => {
    try {
        const setSql = Object.keys(requestObject)
            .map((key, index) => `"${key}" = $${index + 2}`)
            .join(', ');
        const query = `
            UPDATE core.communication_tb
            SET ${setSql} 
            WHERE idcommrole = $1
            RETURNING *;
        `;
        const result = await client.query(query, [communicationId, ...Object.values(requestObject)]);
        return result;
    } catch (error) {
        throw error
    }
};

const getTargetById = async (targetId) => {
    try {
        const query = `
        SELECT cr_metadata.*
        FROM core.cr_metadata
        JOIN core.cr_metamaster ON core.cr_metadata.idmetamaster = core.cr_metamaster.idmetamaster
        WHERE core.cr_metadata.idmetadata = $1
        `;
        const result = await client.query(query, [targetId]);
        return result.rows[0];
    } catch (error) {
        throw error
    }
};


const createContentInDb = async (createObject) => {
    try {
        const columns = Object.keys(createObject).map(key => `"${key}"`).join(', ');
        const placeholders = Object.keys(createObject).map((_, index) => `$${index + 1}`).join(', '); 
        
        const query = `
            INSERT INTO core.communication_tb (${columns})
            VALUES (${placeholders})
            RETURNING *;
        `;
        const values = Object.values(createObject);
        const result = await client.query(query, values);
        return result.rows[0];
    } catch (error) {
        throw error
    }
};


const fetchPaginatedContent = async (limit, offset, order) => {
    try {
        const query = `
        SELECT
            ct.*,
            cc.id, cc.category_name, cc.category_code,
            JSON_AGG(DISTINCT JSONB_BUILD_OBJECT('idrole', ro.idrole, 'description', ro.description, 'code', ro.code)) FILTER (WHERE ro.idrole IS NOT NULL) AS role_lists,
            JSON_AGG(DISTINCT JSONB_BUILD_OBJECT('idusertype', ut.idusertype, 'description', ut.description)) FILTER (WHERE ut.idusertype IS NOT NULL) AS user_types,
            JSON_AGG(DISTINCT JSONB_BUILD_OBJECT('from_date', ce.from_date, 'to_date', ce.to_date)) AS expiries
        FROM core.communication_tb ct
        JOIN core.communication_category cc ON ct.category = cc.id
        LEFT JOIN core.communication_role_mapping crm ON ct.idcommrole = crm.communication_id
        LEFT JOIN core.userType ut ON crm.user_type_id = ut.idusertype
        LEFT JOIN core.role ro ON ro.idrole = crm.idcommrole
        LEFT JOIN core.communication_expiry ce ON ct.idcommrole = ce.communication_id
        GROUP BY
            ct.idcommrole, cc.id, ct.category
        ORDER BY 
            ct.created_date ${order}
        LIMIT $1
        OFFSET $2
        `;
        console.log("limit, offset, order", limit, offset, order)
        const result = await client.query(query, [limit, offset]);
        return result;
    } catch (error) {
        throw error
    }
};


module.exports = {
    fetchPaginatedContent,
    addCommunicationRoleMapping,
    addUserTypeApplicationMapping,
    createContentInDb,
    getApplicationById,
    getUserTypeByAppId,
    deleteCommunicationExpiryByCommunicationId,
    deleteCommuncationRoleMappingByCommunicationId,
    deleteUserTypeByApplicationId,
    getAllCommunicationCategoryFromDb,
    getAllRoleMastes,
    getAllUserTypesFromDb,
    getCommunicationCategoryByCode,
    getBannerAndTickersFromDb,
    getCommunicationCategoryWithoutMasterFromDb,
    getCommunicationCategoryById,
    getPrimaryEntityByTypeFromDB,
    getUserFromDb,
    getContentById,
    getTargetById,
    getUserContactFromDb,
    getUserProfileFromDb,
    updateUserTypeApplicationMapping,
    updateContentInDb,
    addCommunicationExpiry
}
