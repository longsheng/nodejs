'use strict';
/**
 * db config
 * @type {Object}
 */
export default {
    type: 'mysql',
    adapter: {
        mysql: {
            type: 'mysql', //这里需要将 type 重新设置为 mysql
            host: '139.129.53.128',
            port: '3306',
            database: 'ls_pinhongbao',
            user: 'root',
            password: 'x5',
            prefix: '',
            encoding: 'utf8'
        },
        mongo: {}
    }
};