const { search } = require("../controllers");
const { authentication, validation } = require("../middleware");

async function searchRoutes(fastify, options) {
  fastify.post(
    "/global-search",
    { preHandler: [authentication, validation] },
    search.globalsearch
  );
}

module.exports = searchRoutes;