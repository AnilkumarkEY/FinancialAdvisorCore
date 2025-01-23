const { USER_TYPE } = require('../config/constants');

const saveAllByType = async (requestObject) => {
    try {
        const communicationList = [];
        let userTypes = [];

        if (!requestObject.userTypeList || requestObject.userTypeList.length === 0) {
            userTypes = [USER_TYPE.LEADER, USER_TYPE.ADVISOR, USER_TYPE.EMPLOYEE];
        } else {
            userTypes = requestObject.userTypeList;
        }
        for (const userType of userTypes) {
            const userMaster = await userTypeMasterRepository.findByUserTypeCode(userType);
            const communicationRoleMapping = {
                userTypeId: userMaster.id,
                communicationId: requestObject.communicationId
            };
            communicationList.push(communicationRoleMapping);
        }
        return communicationList;
    } catch (error) {
        throw error;
    }
}

module.exports = {
    saveAllByType,
}