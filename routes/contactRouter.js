const { contactControllers } = require('../controllers');
const {authentication} = require('../middleware/authentication')

async function contactRoutes(fastify, options) {
    // Define dashboard routes
    fastify.get('/contact/add-contact',{ preHandler: [authentication,eventValidation]}, contactControllers.addEntityContact);
    fastify.put('/contact/update-contact',{ preHandler: [authentication,eventValidation]}, contactControllers.updateEntityContact);
}

module.exports = contactRoutes;