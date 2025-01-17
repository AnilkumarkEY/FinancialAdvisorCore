const { getBannerAndTickers, getPrimaryEntityByType,
    getUser, getUserAddress, getUserContact, getUserOfficialDetails
} = require("../controllers/communicationTb");
const { authentication, validation } = require("../middleware");

const communicationTbRoutes = async (fastify, options) => {
    const prehandler = { preHandler: [authentication, validation] };

    fastify.post("/banners-tickers", prehandler, getBannerAndTickers);
    fastify.get("/user-admin", prehandler, getUser);
    fastify.get("/user-address-details-admin", prehandler, getUserAddress);
    fastify.get("/user-contact-admin", prehandler, getUserContact);
    fastify.get("/user-official-details-admin", prehandler, getUserOfficialDetails);
    fastify.get("/primary-entity-master/by-type", prehandler, getPrimaryEntityByType);

}

module.exports = communicationTbRoutes;
