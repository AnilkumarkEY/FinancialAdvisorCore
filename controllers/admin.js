const { responseFormatter, statusCodes } = require("../utils");
const { admin, event } = require("../db");
const { entityService, entityContact, agent, entityUserAuth } = require("../services");

exports.createAgent = async (request, reply) => {
    try {
        const { identity } = request.isValid;
        const { entityData, contactData, agentData } = request.body;
        const entityRes = await entityService.processEntityData(entityData, identity);
        contactData.identity = entityRes[0].identity; //taking identity of newly created entity
        agentData.advisor_name = entityRes[0].fullname;
        const [contactRes, agentRes] = await Promise.all([
            entityContact.processEntityContactData(contactData, identity),
            agent.insertAgentData(agentData)
        ]);
        const [profileRes, entityAuthUrcRes] = await Promise.all([
            agent.insertProfileData(entityRes[0], agentRes[0], agentData),
            entityUserAuth.processEntityAuthUrcData(entityRes[0], entityData)
        ]);

        console.log(entityRes.length 
            , agentRes.length 
            , profileRes.length
            , entityAuthUrcRes.length, 'ashgdakshgdaks')
        if (entityRes.length > 0 
            && agentRes.length > 0 
            && profileRes.length > 0
            && entityAuthUrcRes.length > 0
        ) {
            await event.insertEventTransaction(request.isValid);
            return reply
                .status(statusCodes.OK)
                .send(
                    responseFormatter(
                        statusCodes.OK,
                        "Agent saved successfully"
                    )
                );
        } else {
            return reply
                .status(statusCodes.NO_CONTENT)
                .send(
                    responseFormatter(
                        statusCodes.NO_CONTENT,
                        "Agent details not updated"
                    )
                );
        }
    } catch (error) {
        return reply
            .status(statusCodes.INTERNAL_SERVER_ERROR)
            .send(
                responseFormatter(
                    statusCodes.INTERNAL_SERVER_ERROR,
                    "Internal server error occurred",
                    { error: error.message }
                )
            );
    }
}