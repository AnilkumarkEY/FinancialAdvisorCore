const userRoutes = require('./user');
const dashboardRoutes = require('./dashboard');
const leadRoutes = require('./leadRouter');
const contactRoutes = require('./contactRouter')

async function routes(fastify, options) {
    // Register user and dashboard routes
    fastify.register(userRoutes);
    fastify.register(dashboardRoutes);
    fastify.register(leadRoutes);
    fastify.register(contactRoutes)
}

module.exports = routes;
