const { search } = require("../controllers");
const { authentication, validation } = require("../middleware");

async function searchRoutes(fastify, options) {
  fastify.post(
    "/global-search",
    { preHandler: [authentication, validation] },
    search.globalsearch
  );

  fastify.post(
    "/top-categories-global-search",
    { preHandler: [authentication, validation] },
    search.topcategories
  );

  fastify.post(
    "/get-favourite",
    { preHandler: [authentication, validation] },
    search.getfavourite
  );

  fastify.post(
    "/add-favourite",
    { preHandler: [authentication, validation] },
    search.addfavourite
  );
}

module.exports = searchRoutes;
