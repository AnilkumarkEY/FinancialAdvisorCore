const COMMUNICATION_TYPE = {
    TICKER: 'COMMUNICATION_TYPE_TICKER',
    BANNER: 'COMMUNICATION_TYPE_BANNER'
}

const USER_TYPE = {
    LEADER  : 'Leader',
    ADVISOR : 'Advisor',
    EMPLOYEE: 'Employee'
}

const TABLE_NAME = {
    CONTENT_MANAGEMENT: {
        CONTENT         : 'content_item',
        CONTENT_CATEGORY: 'content_category',
        CONTENT_TYPE    : 'content_type',
        LAYOUT_GROUP    : 'layout_group',
        TARGET_SYSTEMS  : 'target_systems'
    }
};

const ENTITY_TYPE = {
    TARGET_SYSTEM              : 'TARGET_SYSTEM',
    COMMUNICATION_SYSTEM_LAYOUT: 'COMMUNICATION_SYSTEM_LAYOUT'
}

module.exports = {
    COMMUNICATION_TYPE,
    ENTITY_TYPE,
    TABLE_NAME,
    USER_TYPE,
}