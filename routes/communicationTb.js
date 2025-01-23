const { getBannerAndTickers, getPrimaryEntityByType,
    getUser, getUserAddress, getUserContact, getUserOfficialDetails,
    getBlobUrl, updateContent, getAllCommunicationCategory,
    getAllCommunicationCategoryByCode, getAllRoleMasters,
    getAllUserTypes,
    getCommunicationCategoryWithoutMaster,
    getApplicationMasterById,
    updateApplicationMaster,
    getContentData,
    createContent,
    fetchContent
} = require("../controllers/communicationTb");
const { authentication, validation } = require("../middleware");

const communicationTbRoutes = async (fastify, options) => {
    const prehandler = { preHandler: [authentication, validation] };

    fastify.get("/banners-tickers", prehandler, getBannerAndTickers);
    fastify.get("/user-admin", prehandler, getUser);
    fastify.get("/user-address-details-admin", prehandler, getUserAddress);
    fastify.get("/user-contact-admin", prehandler, getUserContact);
    fastify.get("/user-official-details-admin", prehandler, getUserOfficialDetails);
    fastify.get("/primary-entity-master/by-type", prehandler, getPrimaryEntityByType);
    fastify.get("/blob/url-path", prehandler, getBlobUrl);
    fastify.get('/communication-category', prehandler, getCommunicationCategoryWithoutMaster);
    fastify.get('/communication-category/all', prehandler, getAllCommunicationCategory);
    fastify.get('/communication-category/tree', prehandler, getAllCommunicationCategoryByCode);
    fastify.get('/role-masters', prehandler, getAllRoleMasters);
    fastify.get('/user-type-masters', prehandler, getAllUserTypes);
    fastify.get('/application-master/by-id', prehandler, getApplicationMasterById);

    fastify.post('/application-master/patch', prehandler, updateApplicationMaster);
<<<<<<< HEAD
    fastify.post("/update", prehandler, updateContent);    
    fastify.post("/create", prehandler, createContent);  
    fastify.get("/listing", prehandler, fetchContent);
=======
    fastify.post("/update", prehandler, updateContent);
>>>>>>> 6885097333b80e4a5776e3e31d34846d4d41e411
    
    fastify.get("/getContentData", prehandler, getContentData);

}

module.exports = communicationTbRoutes;
