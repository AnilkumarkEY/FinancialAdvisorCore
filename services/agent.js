const { admin } = require("../db");
const { uniqueString } = require("../utils");

const insertAgentData = async(data) => {
    try {
        const advisor_code = Math.floor(1000000 + Math.random() * 9000000);
        data.advisor_code = advisor_code;
        data.nstatus = '5';
        data.id = Math.floor(1000000 + Math.random() * 9000000);
        const agentRes = await admin.insertAgent(data);
        return agentRes;
    } catch (error) {
        console.log("Error:", error);
        return error;
    }
}

const insertProfileData = async (entityRes, agentRes, agentReqData) => {
    try {
        const insertData = {
            profile_picture: entityRes.profile_picture,
            idprofile: uniqueString(),
            identity: entityRes.identity,
            business_code: agentRes.advisor_code,
            profile_fullname: entityRes.fullname,
            designation_code: agentRes.desgn_code,
            designation: agentRes.desgn_desc,
            irda_number: null,
            joiningdate: agentReqData.dateOf_joining,
            license_expiry_date: agentReqData.license_expiry,
            branch: agentRes.branch_name,
            leader_code: agentRes.l1_leader_code,
            userRole: agentRes.userRole
        }
        const profileRes = await admin.insertProfile(insertData);
        return profileRes;
    } catch (error) {
        console.log("Error:", error);
        return error;
    }
}

module.exports = {
    insertAgentData,
    insertProfileData
}