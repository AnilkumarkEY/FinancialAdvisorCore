const { createLeadDb, getProduct } = require("../db");
exports.createLeadModule = async (lead) => {
  try {
    const data = createLeadDb.createLeadDb(lead);
    return data;
  } catch (error) {
    return error;
  }
};

exports.createproductModule = async (productIntrstedIn) => {
  try {
    const data = createLeadDb.createProduct(productIntrstedIn);
    return data;
  } catch (error) {
    return error;
  }
};

exports.getProductIntrested = async (leadId) => {
  try {
    const data = await getProduct.prospectInterest(leadId);
    return data;
  } catch (error) {
    return error;
  }
};

exports.getLeadList = async (leadId) => {
  try {
    let obj = { contact: "", lead: "" };
    const data = await getProduct.getLead(leadId);
    if (data.length > 0) {
      let id = data[0].identity_urc_auth;
      obj.contact = await getProduct.getContact(id);
    }
    obj.lead = data;
    return obj;
  } catch (error) {
    return error;
  }
};

exports.getProducts=async () => {
  try {
    const data = await getProduct.getAllProducts();
    return data;
  } catch (error) {
    return error;
  }
};
