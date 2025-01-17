const {
    createContent,
    deleteContent,
    getAllContent,
    getAllContentCategories,
    getAllContentType,
    getAllLayoutGroups,
    getAllTargetSystems,
    getContentById,
    updateContent
} = require("../controllers/contentManagement");
const { authentication, validation } = require("../middleware");

const contentManagementRoutes = async (fastify, options) => {
    const defaultPreHandler = { preHandler: [authentication, validation] };

    fastify.get("/content", defaultPreHandler, getAllContent);
    fastify.get("/content/:id", defaultPreHandler, getContentById);
    fastify.post("/content", defaultPreHandler, createContent);
    fastify.put("/content/:id", defaultPreHandler, updateContent);
    fastify.delete("/content/:id", defaultPreHandler, deleteContent);

    fastify.get("/categories", defaultPreHandler, getAllContentCategories);
    fastify.get("/contentType", defaultPreHandler, getAllContentType);
    fastify.get("/layoutGroups", defaultPreHandler, getAllLayoutGroups);
    fastify.get("/targetSystems", defaultPreHandler, getAllTargetSystems);
}

module.exports = contentManagementRoutes;
