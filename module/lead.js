const { lead, product, entity } = require("../db");
exports.createLead = async (leadData) => {
  try {
    const data = await lead.createLead(leadData);
    return data;
  } catch (error) {
    return error;
  }
};

exports.createproduct = async (productIntrstedIn) => {
  try {
    const data = product.createProduct(productIntrstedIn);
    return data;
  } catch (error) {
    return error;
  }
};

exports.getProductIntrested = async (leadId) => {
  try {
    const data = await product.getProspectInterest(leadId);
    return data;
  } catch (error) {
    return error;
  }
};

exports.getLeadList = async (leadId) => {
  try {
    let obj = { contact: "", lead: "" };
    const data = await lead.getLead(leadId);
    if (data.length > 0) {
      let id = data[0].identity_urc_auth;
      obj.contact = await entity.getEntityContact(id);
    }
    obj.lead = data;
    return obj;
  } catch (error) {
    return error;
  }
};

exports.getProducts = async () => {
  try {
    const data = await product.getAllProducts();
    return data;
  } catch (error) {
    return error;
  }
};
