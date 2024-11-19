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
    fastify.get(
        "/get-sr-subcategory",
        { preHandler: [authentication, validation] },
        profile.getSrSubCategory
    );
    fastify.get(
        "/get-profile-official-details",
        { preHandler: [authentication, validation] },
        profile.getProfileOfficialDetails
    );
    fastify.post(
        "/azure-check-user",
        profile.azureCheckUser
    );
    fastify.post(
        "/verify-otp-forgot-password",
        profile.verifyOtpForgotPassword
    );
    fastify.patch(
        "/reset-password",
        profile.resetPassword
    );
  }
  
  module.exports = profileRoutes;