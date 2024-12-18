const {
    nudge
} = require("../controllers");
const {
    authentication,
    validation
} = require("../middleware");

async function nudgeRoutes(fastify, options) {
    fastify.post(
        "/get-dashboard-events", {
            preHandler: [authentication, validation]
        },
        nudge.getDashboardEvents
    );
}

module.exports = nudgeRoutes;