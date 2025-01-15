const { communicationTB }            = require("../controllers");
const { authentication, validation } = require("../middleware");

const communicationTbRoutes = async (fastify, options) => {
    fastify.post(
        "/banners-tickers",
        { preHandler: [authentication, validation] },
        communicationTB.getBannerAndTickers
    );
}

module.exports = communicationTbRoutes;
