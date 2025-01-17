const { client }    = require("../config/db");
const { USER_TYPE, TABLE_NAME } = require("../config/constants");

const getContent = async (page, limit, createdBy) => {
    try {
        const paginatedDate = await getPaginatedData({page, limit, createdBy}, TABLE_NAME.CONTENT_MANAGEMENT.CONTENT )
        return paginatedDate;
    } catch (error) {
        throw error;
    }
}

const getContentById = async (contentId) => {
    try {
        const query = `
                    SELECT * FROM content_management.content_items
                    WHERE id = $1
    `;
        const result = await db.query(query, [contentId]);
        return result.rows[0];
    } catch (error) {
        throw error;
    }
}

const createContent = async (requestObject) => {
    try {
        const { title, description, categoryId, targetSystemId, layoutGroupId, contentTypeId, startDate, endDate } = requestObject;
        const query                                                                                                = `
        INSERT INTO content_management.content_items (title, description, category_id, target_system_id, layout_group_id, content_type_id, start_date, end_date, created_by, is_active)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
    `;
        const result = await db.query(query, [title, description, categoryId, targetSystemId, layoutGroupId, contentTypeId, startDate, endDate]);
        return result.rows[0];
    } catch (error) {
        throw error;
    }
}

const updateContent = async (contentId, requestObject) => {
    try {
        const { title, description, categoryId, targetSystemId, layoutGroupId, contentTypeId, startDate, endDate } = requestObject;

        const query = `
        UPDATE content_management.content_items
        SET   title = $1, description = $2, category_id = $3, target_system_id = $4, layout_group_id = $5, content_type_id = $6, start_date = $7, end_date = $8, is_active = $9
        WHERE id    = $10
        RETURNING *
    `;

        const result = await db.query(query, [title, description, categoryId, targetSystemId, layoutGroupId, contentTypeId, startDate, endDate, contentId]);
        return result.rows[0];
    } catch (error) {
        throw error;
    }
}

const deleteContent = async (contentId) => {
    try {
        const query = `UPDATE content_management.content_items
        SET   is_active = false
        WHERE id        = $1
        RETURNING *
    `;
        return await db.query(query, [contentId]);
    } catch (error) {
        throw error;
    }
}

const getCategories = async () => {
    try {
        const paginatedCategories =  await getPaginatedData({page, limit}, TABLE_NAME.CONTENT_MANAGEMENT.CONTENT_CATEGORY )
        return paginatedCategories;
    } catch (error) {
        throw error;
    }
}

const getTargetSystems = async () => {
    try {
        const paginatedCategories =  await getPaginatedData({page, limit}, TABLE_NAME.CONTENT_MANAGEMENT.TARGET_SYSTEMS )
        return paginatedCategories;
    } catch (error) {
        throw error;
    }
}

const getLayoutGroups = async () => {
    try {
        const paginatedCategories =  await getPaginatedData({page, limit}, TABLE_NAME.CONTENT_MANAGEMENT.LAYOUT_GROUP )
        return paginatedCategories;
    } catch (error) {
        throw error;
    }
}

const getContentType = async () => {
    try {
        const paginatedCategories =  await getPaginatedData({page, limit}, TABLE_NAME.CONTENT_MANAGEMENT.CONTENT_TYPE )
        return paginatedCategories;
    } catch (error) {
        throw error;
    }
}

module.exports = {
    createContent,
    deleteContent,
    getContent,
    getContentById,
    updateContent,
    getContentType,
    getLayoutGroups,
    getTargetSystems,
    getCategories
}

const getPaginatedData = async (requestObject, tableName) => {
    try {
        const { page = 1, limit = 10, orderBy = 'created_at', orderDir = 'DESC', createdBy = '' } = requestObject;
        const offset                                                              = (page - 1) * limit;

        const validOrderColumns = ['created_at', 'id', 'name'];
        const validOrderDir     = ['ASC', 'DESC'];
        const orderColumn       = validOrderColumns.includes(orderBy) ? orderBy : 'created_at';
        const orderDirection    = validOrderDir.includes(orderDir.toUpperCase()) ? orderDir.toUpperCase() : 'DESC';

        const query = `
        SELECT * FROM content_management.${tableName}
        WHERE created_by = $1
        ORDER BY ${orderColumn} ${orderDirection}
        LIMIT $2 OFFSET $3
    `;
        const results = await db.query(query, [createdBy, parseInt(limit), offset]);
        return {
            page    : parseInt(page),
            limit   : parseInt(limit),
            orderBy : orderColumn,
            orderDir: orderDirection,
            total   : results.rowCount,
            data    : results.rows
        };
    } catch (error) {
        throw error;
    }
}