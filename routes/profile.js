const { profile } = require("../controllers");
const { lead } = require("../controllers");
const { authentication, validation } = require("../middleware");

async function profileRoutes(fastify, options) {
    fastify.get(
        "/get-entity-contact-list",
        { preHandler: [authentication, validation] },
        profile.getContactList
    );
    fastify.get(
        "/get-nominee-details",
        { preHandler: [authentication, validation] },
        profile.getNomineeDetails
    );
    fastify.put(
        "/update-contact",
        { preHandler: [authentication, validation] },
        profile.updateContact
    );
    fastify.get(
        "/get-core-meta-data",
        { preHandler: [authentication, validation] },
        profile.getMetaData
    );
    fastify.put(
        "/update-nominee-details",
        { preHandler: [authentication, validation] },
        profile.updateNomineeDetails
    );
  }
  
  module.exports = profileRoutes;