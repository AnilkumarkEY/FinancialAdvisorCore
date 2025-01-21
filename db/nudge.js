const {
    client
} = require("../config/db");

const getNudgeEventDetails = async (agentCode, status, pageLimit, offset, catergory) => {
    try {
        // const query = `SELECT *, agent_json->>'agentcode' AS agent_code FROM core.nudge_transaction, jsonb_array_elements(nudge_ref_detail) AS agent_json WHERE CURRENT_DATE BETWEEN eff_from_date::date AND eff_to_date::date AND idmeta_nudge_status = $2 AND agent_json->>'agentcode' = $1 LIMIT $3 OFFSET $4`;
        const query = `
        SELECT 
	cnt.*
FROM core.nudge_transaction cnt JOIN core.nudge_master cnm ON cnm.idnudge_master = cnt.idnudge_master 
WHERE EXISTS (
    SELECT 1
    FROM jsonb_array_elements(cnt.nudge_ref_detail) AS agent_json
    WHERE agent_json->>'agentcode' = $1
) AND cnm.idmeta_subcategory = $5 AND CURRENT_DATE BETWEEN cnt.eff_from_date::date AND cnt.eff_to_date::date AND cnt.idmeta_nudge_status = $2 
LIMIT $3 OFFSET $4
        `
        const res = await client.query(query, [agentCode, status, pageLimit, offset, catergory]);
        return res.rows;
    } catch (error) {
        console.error("Error inserting data:", error);
        throw error;
    }
}

module.exports = {
    getNudgeEventDetails
}