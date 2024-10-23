const { dashboardController } = require('../controllers');

async function dashboardRoutes(fastify, options) {
    // Define dashboard routes
    fastify.get('/dashboard/lead-type-overview', dashboardController.getLeadCountByType);
    fastify.get('/dashboard/lead-status-overview', dashboardController.getLeadStatusCount);
    fastify.post('/dashboard/lead-status-with-pagination', dashboardController.getLeadsByStatusWithPagination);
}

module.exports = dashboardRoutes;
