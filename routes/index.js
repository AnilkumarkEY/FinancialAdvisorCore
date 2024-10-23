const userRoutes = require('./user');
const dashboardRoutes = require('./dashboard');
const leadRoutes = require('./leadRouter');

async function routes(fastify, options) {
    // Register user and dashboard routes
    fastify.register(userRoutes);
    fastify.register(dashboardRoutes);
    fastify.register(leadRoutes);
}

module.exports = routes;
