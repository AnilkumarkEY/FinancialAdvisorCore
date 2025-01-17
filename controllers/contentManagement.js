const { responseFormatter, statusCodes, uniqueString } = require("../utils");
const { entityContact } = require("../services");
const { createContent, deleteContent, getContent, getContentById, updateContent } = require("../db/contentManagement");

const getAllContent = async (request, reply) => {
    try {
        const { page = 1, limit = 10, createdBy } = req.query;
        const offset = (page - 1) * limit;

        const result = await getContent(limit, offset, createdBy);
        return reply
            .status(statusCodes.OK)
            .send(responseFormatter(statusCodes.OK, "All Tickers and Banners", {
                page: parseInt(page),
                limit: parseInt(limit),
                total: result.rowCount,
                data: result.rows
            }));
    } catch (error) {
        return reply
            .status(statusCodes.INTERNAL_SERVER_ERROR)
            .send(responseFormatter(statusCodes.INTERNAL_SERVER_ERROR, "Internal server error occurred", { error: error.message }));
    }
};

const getContentById = async (request, reply) => {
    try {
        const { id } = request.param;
        if (!id) {
            return reply
                .status(statusCodes.BAD_REQUEST)
                .send(responseFormatter(statusCodes.BAD_REQUEST, "Invalid id", null));
        }
        const result = await getContentById(id);
        return reply
            .status(statusCodes.OK)
            .send(responseFormatter(statusCodes.OK, "Content Detail", result.rows[0]));
    } catch (error) {
        return reply
            .status(statusCodes.INTERNAL_SERVER_ERROR)
            .send(responseFormatter(statusCodes.INTERNAL_SERVER_ERROR, "Internal server error occurred", { error: error.message }));
    }
};

const createContent = async (request, reply) => {
    try {
        const { requestObject } = request.body;
        // if (!userType) {
        //     return reply
        //         .status(statusCodes.BAD_REQUEST)
        //         .send(responseFormatter(statusCodes.BAD_REQUEST, "Invalid User Type", null));
        // }
        const result = await createContent(requestObject);
        return reply
            .status(statusCodes.OK)
            .send(responseFormatter(statusCodes.OK, "Content Created", result));
    } catch (error) {
        return reply
            .status(statusCodes.INTERNAL_SERVER_ERROR)
            .send(responseFormatter(statusCodes.INTERNAL_SERVER_ERROR, "Internal server error occurred", { error: error.message }));
    }
};

const updateContent = async (request, reply) => {
    try {
        const { id } = request.params;
        if (!id) {
            return reply.status(statusCodes.BAD_REQUEST).send(responseFormatter(statusCodes.BAD_REQUEST, "Invalid id", null));
        }
        const updatedContent = await updateContent(id);
        if (!updateContent) {
            return reply.status(statusCodes.BAD_REQUEST).send(responseFormatter(statusCodes.BAD_REQUEST, "Invalid id", null));
        }
        return reply.status(statusCodes.OK).send(responseFormatter(statusCodes.OK, "Content successfully updated", updatedContent));
    } catch (error) {
        return reply
            .status(statusCodes.INTERNAL_SERVER_ERROR)
            .send(responseFormatter(statusCodes.INTERNAL_SERVER_ERROR, "Internal server error occurred", { error: error.message }));
    }
};

const deleteContent = async (request, reply) => {
    try {
        const { id } = request.params;
        if (!id) {
            return reply.status(statusCodes.BAD_REQUEST).send(responseFormatter(statusCodes.BAD_REQUEST, "Invalid Id", null));
        }
        const deletedContent = await deleteContent(id);
        return reply.status(statusCodes.OK).send(responseFormatter(statusCodes.OK, "Content successully delete", deletedContent));
    } catch (error) {
        return reply
            .status(statusCodes.INTERNAL_SERVER_ERROR)
            .send(responseFormatter(statusCodes.INTERNAL_SERVER_ERROR, "Internal server error occurred", { error: error.message }));
    }
};

const getAllContentCategories = async (request, reply) => {
    try {
        const { userType } = request.body;
        if (!userType) {
            return reply
                .status(statusCodes.BAD_REQUEST)
                .send(responseFormatter(statusCodes.BAD_REQUEST, "Invalid User Type", null));
        }
        const bannerAndTickers = await communicationTb.getBannerAndTickersFromDb(userType);
        return reply
            .status(statusCodes.OK)
            .send(responseFormatter(statusCodes.OK, "All Tickers and Banners", bannerAndTickers));
    } catch (error) {
        return reply
            .status(statusCodes.INTERNAL_SERVER_ERROR)
            .send(responseFormatter(statusCodes.INTERNAL_SERVER_ERROR, "Internal server error occurred", { error: error.message }));
    }
};

const getAllContentType = async (request, reply) => {
    try {
        const { userType } = request.body;
        if (!userType) {
            return reply
                .status(statusCodes.BAD_REQUEST)
                .send(responseFormatter(statusCodes.BAD_REQUEST, "Invalid User Type", null));
        }
        const bannerAndTickers = await communicationTb.getBannerAndTickersFromDb(userType);
        return reply
            .status(statusCodes.OK)
            .send(responseFormatter(statusCodes.OK, "All Tickers and Banners", bannerAndTickers));
    } catch (error) {
        return reply
            .status(statusCodes.INTERNAL_SERVER_ERROR)
            .send(responseFormatter(statusCodes.INTERNAL_SERVER_ERROR, "Internal server error occurred", { error: error.message }));
    }
};

const getAllLayoutGroups = async (request, reply) => {
    try {
        const { userType } = request.body;
        if (!userType) {
            return reply
                .status(statusCodes.BAD_REQUEST)
                .send(responseFormatter(statusCodes.BAD_REQUEST, "Invalid User Type", null));
        }
        const bannerAndTickers = await communicationTb.getBannerAndTickersFromDb(userType);
        return reply
            .status(statusCodes.OK)
            .send(responseFormatter(statusCodes.OK, "All Tickers and Banners", bannerAndTickers));
    } catch (error) {
        return reply
            .status(statusCodes.INTERNAL_SERVER_ERROR)
            .send(responseFormatter(statusCodes.INTERNAL_SERVER_ERROR, "Internal server error occurred", { error: error.message }));
    }
};

const getAllTargetSystems = async (request, reply) => {
    try {
        const { userType } = request.body;
        if (!userType) {
            return reply
                .status(statusCodes.BAD_REQUEST)
                .send(responseFormatter(statusCodes.BAD_REQUEST, "Invalid User Type", null));
        }
        const bannerAndTickers = await communicationTb.getBannerAndTickersFromDb(userType);
        return reply
            .status(statusCodes.OK)
            .send(responseFormatter(statusCodes.OK, "All Tickers and Banners", bannerAndTickers));
    } catch (error) {
        return reply
            .status(statusCodes.INTERNAL_SERVER_ERROR)
            .send(responseFormatter(statusCodes.INTERNAL_SERVER_ERROR, "Internal server error occurred", { error: error.message }));
    }
};

module.exports = {
    createContent,
    deleteContent,
    getAllContent,
    getAllContentCategories,
    getAllContentType,
    getAllTargetSystems,
    getAllLayoutGroups,
    getContentById,
    updateContent
}