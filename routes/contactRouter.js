const { contactControllers } = require('../controllers');
const {authentication} = require('../middleware/authentication')
const {eventValidation} = require('../middleware/eventValidation')

async function contactRoutes(fastify, options) {
    // Define dashboard routes
    fastify.post('/contact/create-contact',{ preHandler: [authentication,eventValidation]}, contactControllers.addEntityContact);
    fastify.put('/contact/update-contact',{ preHandler: [authentication,eventValidation]}, contactControllers.updateEntityContact);
}

module.exports = contactRoutes;