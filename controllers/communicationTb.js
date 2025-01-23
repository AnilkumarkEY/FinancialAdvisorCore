const { responseFormatter, statusCodes, uniqueString } = require("../utils");
const { azureBlob } = require("../services");
const {
    getBannerAndTickersFromDb,
    getPrimaryEntityByTypeFromDB,
    getUserFromDb,
    getUserContactFromDb,
    getUserProfileFromDb,
    deleteCommunicationExpiryByCommunicationId,
    deleteCommuncationRoleMappingByCommunicationId,
    getAllRoleMastes,
    getCommunicationCategoryWithoutMasterFromDb,
    getAllCommunicationCategoryFromDb,
    getCommunicationCategoryByCode,
    getAllUserTypesFromDb,
    getApplicationById,
    getUserTypeByAppId,
    addUserTypeApplicationMapping,
    updateUserTypeApplicationMapping,
    deleteUserTypeByApplicationId,
    addCommunicationExpiry,
    addCommunicationRoleMapping,
    getContentById,
    updateContentInDb,
    getCommunicationCategoryById,
    getTargetById
} = require("../db/communicationTb");
const { ENTITY_TYPE, USER_TYPE } = require('../config/constants');

const getBannerAndTickers = async (request, reply) => {
    try {
        const { userType } = request.query;
        if (!userType) {
            return reply
                .status(statusCodes.BAD_REQUEST)
                .send(responseFormatter(statusCodes.BAD_REQUEST, "Invalid User Type", null));
        }
        const bannerAndTickers = await getBannerAndTickersFromDb(userType);
        return reply
            .status(statusCodes.OK)
            .send(responseFormatter(statusCodes.OK, "All Tickers and Banners", bannerAndTickers));
    } catch (error) {
        return reply
            .status(statusCodes.INTERNAL_SERVER_ERROR)
            .send(responseFormatter(statusCodes.INTERNAL_SERVER_ERROR, "Internal server error occurred", { error: error.message }));
    }
};

const getPrimaryEntityByType = async (request, reply) => {
    try {
        const { entityType } = request.query;
        const allEntityTypes = [ENTITY_TYPE.TARGET_SYSTEM, ENTITY_TYPE.COMMUNICATION_SYSTEM_LAYOUT];
        if (allEntityTypes.includes(entityType)) {
            const result = await getPrimaryEntityByTypeFromDB(entityType);
            return reply
                .status(statusCodes.OK)
                .send(responseFormatter(statusCodes.OK, "All Primary Enitity by Type", result));
        } else {
            return reply
                .status(statusCodes.BAD_REQUEST)
                .send(responseFormatter(statusCodes.BAD_REQUEST, "Invalid entity type", null));
        }
    } catch (error) {
        return reply
            .status(statusCodes.INTERNAL_SERVER_ERROR)
            .send(responseFormatter(statusCodes.INTERNAL_SERVER_ERROR, "Internal server error occurred", { error: error.message }));
    }
}

const getUser = async (request, reply) => {
    try {
        const { userId } = request.query;
        if (userId) {
            const result = await getUserFromDb(userId);
            if (result) {
                return reply
                    .status(statusCodes.OK)
                    .send(responseFormatter(statusCodes.OK, "User details", result));
            }
        } else {
            return reply
                .status(statusCodes.BAD_REQUEST)
                .send(responseFormatter(statusCodes.BAD_REQUEST, "Invalid UserId ", null));
        }
    } catch (error) {
        return reply
            .status(statusCodes.INTERNAL_SERVER_ERROR)
            .send(responseFormatter(statusCodes.INTERNAL_SERVER_ERROR, "Internal server error occurred", { error: error.message }));
    }
}

const getUserOfficialDetails = async (request, reply) => {
    try {
        const { userId } = request.query;
        if (userId) {
            const result = await getUserProfileFromDb(userId);
            return reply
                .status(statusCodes.OK)
                .send(responseFormatter(statusCodes.OK, "User official details", result));
        } else {
            return reply
                .status(statusCodes.BAD_REQUEST)
                .send(responseFormatter(statusCodes.BAD_REQUEST, "Invalid UserId ", null));
        }
    } catch (error) {
        return reply
            .status(statusCodes.INTERNAL_SERVER_ERROR)
            .send(responseFormatter(statusCodes.INTERNAL_SERVER_ERROR, "Internal server error occurred", { error: error.message }));
    }
}

const getUserContact = async (request, reply) => {
    try {
        const { userId } = request.query;
        if (userId) {
            const result = await getUserContactFromDb(userId);
            return reply
                .status(statusCodes.OK)
                .send(responseFormatter(statusCodes.OK, "User Contact", result));
        } else {
            return reply
                .status(statusCodes.BAD_REQUEST)
                .send(responseFormatter(statusCodes.BAD_REQUEST, "Invalid UserId ", null));
        }
    } catch (error) {
        return reply
            .status(statusCodes.INTERNAL_SERVER_ERROR)
            .send(responseFormatter(statusCodes.INTERNAL_SERVER_ERROR, "Internal server error occurred", { error: error.message }));
    }
}

const getUserAddress = async (request, reply) => {
    try {
        const { userId } = request.query;
        if (userId) {
            const result = await getUserContactFromDb(userId);
            return reply
                .status(statusCodes.OK)
                .send(responseFormatter(statusCodes.OK, "User Address", result));
        } else {
            return reply
                .status(statusCodes.BAD_REQUEST)
                .send(responseFormatter(statusCodes.BAD_REQUEST, "Invalid UserId ", null));
        }
    } catch (error) {
        return reply
            .status(statusCodes.INTERNAL_SERVER_ERROR)
            .send(responseFormatter(statusCodes.INTERNAL_SERVER_ERROR, "Internal server error occurred", { error: error.message }));
    }
}

const getBlobUrl = async (request, reply) => {
    try {
        const { blobPath } = request.query;
        if (blobPath) {
            const sasToken = await azureBlob.getSasToken();
            const finalUrl = blobPath + '?' + sasToken;
            return reply
                .status(statusCodes.OK)
                .send(responseFormatter(statusCodes.OK, "Signed Token", finalUrl));
        }
        return reply
            .status(statusCodes.BAD_REQUEST)
            .send(responseFormatter(statusCodes.BAD_REQUEST, "Invalid url ", null));
    } catch (error) {
        return reply
            .status(statusCodes.INTERNAL_SERVER_ERROR)
            .send(responseFormatter(statusCodes.INTERNAL_SERVER_ERROR, "Internal server error occurred", { error: error.message }));
    }
}

const updateContent = async (request, reply) => {
    try {
        const { communicationId, category_id, target_id, role_list } = request.body;
        let { user_type_list } = request.body;
        const requestObject = request.body;
        if (communicationId) {

            const content = await getContentById(communicationId);
            if (content) {
                const category = await getCommunicationCategoryById(category_id);
                console.log("category", category_id,category)
                if (!category) {
                    return reply
                        .status(statusCodes.BAD_REQUEST)
                        .send(responseFormatter(statusCodes.BAD_REQUEST, "Invalid category Id", null));
                }
                const target = await getTargetById(target_id);
                if (!target) {
                    return reply
                        .status(statusCodes.BAD_REQUEST)
                        .send(responseFormatter(statusCodes.BAD_REQUEST, "Invalid TargetId", null));
                }
                const updateRequest = {
                    target_id    : target_id,
                    category     : category_id,
                    category_code: category.code
                };
                await deleteCommunicationExpiryByCommunicationId(communicationId);
                await deleteCommuncationRoleMappingByCommunicationId(communicationId);
                const allUserType = await getAllUserTypesFromDb();

                const communicationExpiry = [];
                for (const expiry of requestObject.expiries) {
                       expiry.id                          = uniqueString();
                       expiry.communicationId             = requestObject.communicationId;
                    if (!expiry.fromDate) expiry.fromDate = new Date();
                    if (!expiry.toDate) expiry.toDate     = new Date('2199-01-01T10:30:00Z');
                    communicationExpiry.push(expiry);
                    await addCommunicationExpiry(expiry);  // need to fix this
                }
                if (user_type_list) {
                    if (!user_type_list.length) {
                        user_type_list = allUserType.map(userType => userType.idusertype);
                    }
                    for (const userType of user_type_list) {
                        await addCommunicationRoleMapping(uniqueString(), communicationId, userType);
                    }
                }
                if (role_list) {
                    for (const roleId of role_list) {
                        await addCommunicationRoleMapping(roleId, communicationId, null);
                    }
                }
                const knownKeys = ['title', 'description', 'category', 'category_code', 'content_url', 'content_type', 'target_id', 'target_master', 'layout_group_name_id'];

                knownKeys.forEach(key => {
                    if (requestObject.hasOwnProperty(key)) updateRequest[key] = requestObject[key];
                });
                const updatedContent = await updateContentInDb(communicationId, updateRequest);
                return reply
                    .status(statusCodes.OK)
                    .send(responseFormatter(statusCodes.OK, "Communication Updated", { ...content, ...updateRequest }));
            }
        }
        return reply
            .status(statusCodes.BAD_REQUEST)
            .send(responseFormatter(statusCodes.BAD_REQUEST, "Invalid Content Id", null));
    } catch (error) {
        console.error(error);
        return reply
            .status(statusCodes.INTERNAL_SERVER_ERROR)
            .send(responseFormatter(statusCodes.INTERNAL_SERVER_ERROR, "Internal server error occurred", { error: error.message }));
    }
}

const getCommunicationCategoryWithoutMaster = async (request, reply) => {
    try {
        const result = await getCommunicationCategoryWithoutMasterFromDb();
        return reply
            .status(statusCodes.OK)
            .send(responseFormatter(statusCodes.OK, "User Communication Category", result));

    } catch (error) {
        return reply
            .status(statusCodes.INTERNAL_SERVER_ERROR)
            .send(responseFormatter(statusCodes.INTERNAL_SERVER_ERROR, "Internal server error occurred", { error: error.message }));
    }
}

const getAllCommunicationCategory = async (request, reply) => {
    try {
        const result = await getAllCommunicationCategoryFromDb();
        return reply
            .status(statusCodes.OK)
            .send(responseFormatter(statusCodes.OK, "User Communication Category", result));

    } catch (error) {
        return reply
            .status(statusCodes.INTERNAL_SERVER_ERROR)
            .send(responseFormatter(statusCodes.INTERNAL_SERVER_ERROR, "Internal server error occurred", { error: error.message }));
    }
}

const getAllCommunicationCategoryByCode = async (request, reply) => {
    try {
        const { categoryCode } = request.query;
        if (categoryCode) {
            const result = await getCommunicationCategoryByCode(categoryCode);
            return reply
                .status(statusCodes.OK)
                .send(responseFormatter(statusCodes.OK, "User Communication Category", result));
        } else {
            return reply
                .status(statusCodes.BAD_REQUEST)
                .send(responseFormatter(statusCodes.BAD_REQUEST, "Invalid Code", null));
        }
    } catch (error) {
        return reply
            .status(statusCodes.INTERNAL_SERVER_ERROR)
            .send(responseFormatter(statusCodes.INTERNAL_SERVER_ERROR, "Internal server error occurred", { error: error.message }));
    }
}

const getAllRoleMasters = async (request, reply) => {
    try {
        const result = await getAllRoleMastes();
        return reply
            .status(statusCodes.OK)
            .send(responseFormatter(statusCodes.OK, "All User Roles", result));

    } catch (error) {
        return reply
            .status(statusCodes.INTERNAL_SERVER_ERROR)
            .send(responseFormatter(statusCodes.INTERNAL_SERVER_ERROR, "Internal server error occurred", { error: error.message }));
    }
}

const getAllUserTypes = async (request, reply) => {
    try {
        const result = await getAllUserTypesFromDb();
        return reply
            .status(statusCodes.OK)
            .send(responseFormatter(statusCodes.OK, "All User Types", result));

    } catch (error) {
        return reply
            .status(statusCodes.INTERNAL_SERVER_ERROR)
            .send(responseFormatter(statusCodes.INTERNAL_SERVER_ERROR, "Internal server error occurred", { error: error.message }));
    }
}

const getApplicationMasterById = async (request, reply) => {
    try {
        const { applicationMasterId } = request.query;
        if (applicationMasterId) {
            const application = await getApplicationById(applicationMasterId);
            if (application) {
                const userType = await getUserTypeByAppId(applicationMasterId);
                if (userType.length) application.userTypeList = userMaster;
            }
            return reply
                .status(statusCodes.OK)
                .send(responseFormatter(statusCodes.OK, "Application Master", application));
        } else {
            return reply
                .status(statusCodes.BAD_REQUEST)
                .send(responseFormatter(statusCodes.BAD_REQUEST, "Invalid Request", null));
        }

    } catch (error) {
        return reply
            .status(statusCodes.INTERNAL_SERVER_ERROR)
            .send(responseFormatter(statusCodes.INTERNAL_SERVER_ERROR, "Internal server error occurred", { error: error.message }));
    }
}

const updateApplicationMaster = async (request, reply) => {
    try {
        const { applicationId, userTypesToDelete, userTypesToAdd, updateRequest } = request.body;
        if (applicationId) {
            const application = await getApplicationMasterById(applicationId);
            if (application) {
                if (userTypesToDelete && userTypesToDelete.length) {
                    const deletedUserTypes = await deleteUserTypeByApplicationId(applicationId, userTypesToDelete);
                }
                if (userTypesToAdd && userTypesToAdd.length) {
                    for (const userType of userTypesToAdd) {
                        const addedUserTypeMapping = await addUserTypeApplicationMapping(userType);
                    }
                }
                const result = await updateUserTypeApplicationMapping(applicationId, updateRequest);
                return reply
                    .status(statusCodes.OK)
                    .send(responseFormatter(statusCodes.OK, "Application Master", result));
            }
            return reply
                .status(statusCodes.BAD_REQUEST)
                .send(responseFormatter(statusCodes.BAD_REQUEST, "Invalid Request", null));
        } else {
            return reply
                .status(statusCodes.BAD_REQUEST)
                .send(responseFormatter(statusCodes.BAD_REQUEST, "Invalid Request", { error: error.message }));
        }

    } catch (error) {
        return reply
            .status(statusCodes.INTERNAL_SERVER_ERROR)
            .send(responseFormatter(statusCodes.INTERNAL_SERVER_ERROR, "Internal server error occurred", { error: error.message }));
    }
}

const getContentData = async (request, reply) => {
    try {

        const allCommunicationCategories = await getCommunicationCategoryWithoutMasterFromDb();
        const allRoles = await getAllRoleMastes();
        const allUserTypes = await getAllUserTypesFromDb();
        const finalResult = {
            category: allCommunicationCategories,
            roles: allRoles,
            userTypes: allUserTypes
        };
        return reply
            .status(statusCodes.OK)
            .send(responseFormatter(statusCodes.OK, "Bootstrap data", finalResult));
    } catch (error) {
        return reply
            .status(statusCodes.INTERNAL_SERVER_ERROR)
            .send(responseFormatter(statusCodes.INTERNAL_SERVER_ERROR, "Internal server error occurred", { error: error.message }));
    }
}


module.exports = {
    getApplicationMasterById,
    getAllUserTypes,
    getAllRoleMasters,
    getAllCommunicationCategoryByCode,
    getCommunicationCategoryWithoutMaster,
    getAllCommunicationCategory,
    getBannerAndTickers,
    getBlobUrl,
    getPrimaryEntityByType,
    getUser,
    getUserAddress,
    getUserContact,
    getUserOfficialDetails,
    updateApplicationMaster,
    updateContent,
    getContentData
}