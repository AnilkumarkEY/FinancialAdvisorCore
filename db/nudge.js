const {
    client
} = require("../config/db");

const getNudgeEventDetails = async (agentCode, status, pageLimit, offset) => {
    try {
        const query = `SELECT *, agent_json->>'agentcode' AS agent_code FROM core.nudge_transaction, jsonb_array_elements(nudge_ref_detail) AS agent_json WHERE CURRENT_DATE BETWEEN eff_from_date::date AND eff_to_date::date AND idmeta_nudge_status = $2 AND agent_json->>'agentcode' = $1 LIMIT $3 OFFSET $4`;
        const res = await client.query(query, [agentCode, status, pageLimit, offset]);
        return res.rows;
    } catch (error) {
        console.error("Error inserting data:", error);
        throw error;
    }
}

module.exports = {
    getNudgeEventDetails
}