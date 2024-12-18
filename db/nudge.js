const { client } = require("../config/db");

const getDashboardNudgeDetails = async (agentCode) => {
    try {
        const query = `SELECT *  FROM core.nudge_master`;
        const res = await client.query(query);
        return res.rows;
    } catch (error) {
        console.error("Error inserting data:", error);
        throw error;
    }
}

module.exports = {
    getDashboardNudgeDetails
}