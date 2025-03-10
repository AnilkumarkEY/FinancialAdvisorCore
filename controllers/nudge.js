const {
    getNudgeEventDetails
} = require("../db/nudge");
const {
    responseFormatter,
    statusCodes
} = require("../utils");

exports.getEvents = async (request, reply) => {
    try {
        const {
            agentCode,
            status,
            limit = 20,
            pageNo = 0,
            catergory
        } = request.body;

        if (!agentCode || !status || !catergory) {
            return reply
                .status(statusCodes.BAD_REQUEST)
                .send(
                    responseFormatter(
                        statusCodes.BAD_REQUEST,
                        "Agent code and status and category are required!",
                        []
                    )
                );
        }

        const pageLimit = Number(limit);
        const offset = pageLimit * Number(pageNo);
        const response = await getNudgeEventDetails(
            agentCode,
            status,
            pageLimit,
            offset,
            catergory
        );

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