const { client } = require("../config/db");
const { USER_TYPE } = require("../config/constants");

const getBannerAndTickersFromDb = async (userType) => {
    try {
        const currentDate = new Date().toISOString();
        const query = `SELECT comm.*
            FROM core.communication_tb comm
            JOIN core.primary_entity_code_master_tb pcm 
            ON comm.communication_type_id = pcm.primary_entity_master_id
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
                JOIN core.userType utm 
                ON utm.idusertype = ctrm.user_type_id
                WHERE ctrm.communication_id = comm.idcommrole
                AND utm.idusertype = $2
            );`;
        const result = await client.query(query, [currentDate, userType]);
        console.log("Update successful:", result);
        return result.rows;
    } catch (error) {
        throw error;
    }
}

module.exports = {
    getBannerAndTickersFromDb
}