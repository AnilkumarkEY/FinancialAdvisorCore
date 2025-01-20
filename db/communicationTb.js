const { client } = require("../config/db");
const { USER_TYPE } = require("../config/constants");

const getBannerAndTickersFromDb = async (userType) => {
    try {
        const currentDate = new Date();
        const query = `SELECT comm.*
            FROM core.communication_tb comm
            JOIN core.cr_metadata cm
            ON comm.target_id = cm.idmetamaster
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
        console.log("Update successful:", result);
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

const deleteExpiryByCommId = async (commId) => {
    try {
        const query = `DELETE FROM CommunicationExpiry comm 
        WHERE comm.communicationId = $1`;
        
        const result = await client.query(query, [commId]);
        return result.rows;
    } catch (error) {
        throw error
    }
}

const deleteRoleByCommId = async (commId) => {
    try {
        const query = `DELETE FROM CommunicationRoleMapping role
         WHERE role.communicationId  = $1`;
        const result = await client.query(query, [commId]);
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

const getApplicationMasterByIdFromDb = async (appilcationId) => {
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


module.exports = {
    deleteExpiryByCommId,
    deleteRoleByCommId,
    getApplicationMasterByIdFromDb,
    getAllCommunicationCategoryFromDb,
    getAllRoleMastes,
    getAllUserTypesFromDb,
    getCommunicationCategoryByCode,
    getBannerAndTickersFromDb,
    getCommunicationCategoryWithoutMasterFromDb,
    getPrimaryEntityByTypeFromDB,
    getUserFromDb,
    getUserContactFromDb,
    getUserProfileFromDb
}