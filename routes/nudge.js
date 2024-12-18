const {
    nudge
} = require("../controllers");
const {
    authentication,
    validation
} = require("../middleware");

async function nudgeRoutes(fastify, options) {
    fastify.post(
        "/get-events", {
            preHandler: [authentication, validation]
        },
        nudge.getEvents
    );
}

module.exports = nudgeRoutes;