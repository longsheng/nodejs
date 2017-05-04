'use strict';
/**
 * db config
 * @type {Object}
 */
export default {
    type: 'mysql',
    adapter: {
        mysql: {
            host: '127.0.0.1',
            port: '3306',
            database: 'ls_waterheater',
            user: 'root',
            password: 'x5',
            prefix: '',
            encoding: 'utf8'
        },
        mysql2: {
            type: 'mysql', //这里需要将 type 重新设置为 mysql
            host: '127.0.0.1',
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