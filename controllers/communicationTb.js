const { responseFormatter, statusCodes, uniqueString } = require("../utils");
const { entityContact } = require("../services");
const { communicationTb } = require("../db");

const getBannerAndTickers = async (request, reply) => {
    try {
        const { userType } = request.body;
        if (!userType) {
            return reply
                .status(statusCodes.BAD_REQUEST)
                .send(responseFormatter(statusCodes.BAD_REQUEST, "Invalid User Type",  null));
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
}

module.exports = {
    getBannerAndTickers
}