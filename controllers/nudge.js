const { getDashboardNudgeDetails } = require("../db/nudge");
const {
    responseFormatter,
    statusCodes
} = require("../utils");

exports.getDashboardEvents = async (request, reply) => {
    try {
        const response = await getDashboardNudgeDetails(0); 
        return reply
            .status(statusCodes.OK)
            .send(
                responseFormatter(
                    statusCodes.OK,
                    "Nudge Events Fetched successfully!",
                    response
                )
            );
    } catch (error) {
        return reply
            .status(statusCodes.INTERNAL_SERVER_ERROR)
            .send(
                responseFormatter(
                    statusCodes.INTERNAL_SERVER_ERROR,
                    "Internal server error occurred", {
                        error: error.message
                    }
                )
            );
    }
}