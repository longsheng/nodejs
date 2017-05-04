/**
 * this file will be loaded before server started
 * you can define global functions used in controllers, models, templates
 */

/**
 * use global.xxx to define global functions
 *
 * global.fn1 = function(){
 *     
 * }
 */

var log4js = require('log4js');
log4js.configure({
    appenders: [
        {
            type: 'console',
            layout: {
                type: 'pattern',
                pattern: "%m"
            }
        },
        {
            type: 'dateFile',
            filename: 'logs/log4js',
            pattern: "_yyyy-MM-dd",
            maxLogSize: 1024,
            alwaysIncludePattern: true,
            backups: 4,
            category: 'logger',
            layout: {
                type: 'pattern',
                pattern: "%m"
            }
        }
    ],
    replaceConsole: true
});
global.log = log4js.getLogger('logger');