const { leadControllers } = require('../controllers');
const {eventValidation} = require("../middleware/eventValidation");
const {authentication} = require("../middleware/authentication")

async function leadRoutes(fastify, options) {
    // Define dashboard routes
    fastify.post('/lead/create-lead',{ preHandler: [authentication,eventValidation]}, leadControllers.createLead);
    fastify.get('/lead/product-intrested/:leadId',{ preHandler: [authentication,eventValidation]}, leadControllers.prodcutIntrested);
    fastify.get('/lead/get-lead-list/:leadId',{ preHandler: [authentication,eventValidation]}, leadControllers.getLeadList);
    fastify.get('/lead/get-all-products',{ preHandler: [authentication,eventValidation]}, leadControllers.getProducts);
}

module.exports = leadRoutes;
