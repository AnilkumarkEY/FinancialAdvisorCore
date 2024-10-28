const { client } = require("../config/db");

async function getTemplate(templateId) {
  try {
    const query = `
        select * from core.comm_template ct where idtemplate = $1;
      `;
    const res = await client.query(query, [templateId]);
    return res.rows;
  } catch (error) {
    console.error("Error executing query", error.stack);
    throw error;
  }
}

async function createCommLogs(logData) {
  try {
    const allowedSourceQuery = `
    Select idevent_def_allowed_source from core.event_def_allowed_source where idevent_defination = $1
    `;
    const allowedSourceResult = await client.query(allowedSourceQuery, [
      logData.idevent_def_allowed_source,
    ]);
    const entityUrcAuthQuery = `Select identity_urc_auth from core.entity_urc_auth where idurc = $1`;
    const entityUrcAuthResult = await client.query(entityUrcAuthQuery, [
      logData.identity_urc_auth,
    ]);

    const query = `
      INSERT INTO core.communication_log (
        idcommunication_log,
        idtemplate,
        idmetadata_com_mode,
        idevent_def_allowed_source,
        identity,
        identity_urc_auth,
        event_ref_key,
        receiver,
        sender,
        receiver_mode_detail,
        message_text,
        message_subject,
        message_delivery_status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13);
    `;

    // Extract the values in the same order as the columns
    const values = [
      logData.idcommunication_log,
      logData.idtemplate,
      logData.idmetadata_com_mode,
      allowedSourceResult.rows[0].idevent_def_allowed_source,
      logData.identity,
      entityUrcAuthResult.rows[0].identity_urc_auth,
      logData.event_ref_key,
      logData.receiver,
      logData.sender,
      logData.receiver_mode_detail,
      logData.message_text,
      logData.message_subject,
      logData.message_delivery_status,
    ];
    const res = await client.query(query, values);
    return res.rows;
  } catch (error) {
    console.error("Error executing query", error.stack);
    throw error;
  }
}

module.exports = {
  getTemplate,
  createCommLogs,
};
