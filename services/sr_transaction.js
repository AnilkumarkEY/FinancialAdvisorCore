const {profile} = require("../db");
const { uniqueString } = require("../utils");


exports.insertSrTransaction = async (requestBody, identity) => {
    const {idsrcategory, idsr_subcategory, sr_meta_value} = requestBody;
    const approvedSrStatus = 'd0cc0947a9f34d099e66048dc64c1740';
    const transaction = {
        idsr_transaction: uniqueString(), //create unique id for transaction
        idsrcategory,
        idsr_subcategory, 
        identity, 
        sr_meta_value,
        idmeta_sr_status: approvedSrStatus //Phone and email updates auto-approves
      }
  
      await profile.insertSrTransaction(transaction); // Insert entry into sr transactions
}