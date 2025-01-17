const { responseFormatter, statusCodes, uniqueString } = require("../utils");
const { entityContact } = require("../services");
const {
    getBannerAndTickersFromDb,
    getPrimaryEntityByTypeFromDB,
    getUserFromDb,
    getUserContactFromDb,
    getUserProfileFromDb
} = require("../db/communicationTb");
const { ENTITY_TYPE } = require('../config/constants');

const getBannerAndTickers = async (request, reply) => {
    try {
        const { userType } = request.body;
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

module.exports = {
    getBannerAndTickers,
    getPrimaryEntityByType,
    getUser,
    getUserAddress,
    getUserContact,
    getUserOfficialDetails,
}