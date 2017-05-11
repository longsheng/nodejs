'use strict';

export default {
    SQL_ERR: [10001, 'SQL语句执行出错'], //key 必须为大写字符或者下划线才有效
    USER_NOT_FOUND: [10002, '用户没有找到'],
    USER_REG_FAIL: [10003, '用户注册失败'],
    CREATE_INFO_FAIL: [10004, '游戏开局失败'],
    GET_INFO_LIST_ERROR:[1006,'获取牌局列表失败']
};