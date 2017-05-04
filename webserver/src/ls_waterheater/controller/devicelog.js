'use strict';

import Base from './base.js';
var moment = require('moment');

export default class extends Base {
    /**
     * index action
     * @return {Promise} []
     */
    indexAction() {
        //auto render template file index_index.html
        this.aaa = JSON.stringify({aaa: 33, "bbb": 'ccc', 'ddd': 'fff'});
        return this.display();
    }

    ParsePushData(jsondata) {
        let data = {};
        let timestamp = moment().format('YYYY-MM-DD h:mm:ss');
        data.DeviceID = jsondata.data.substr(3,10);
        data.did = jsondata.did;
        data.mac = jsondata.mac;
        data.LogTime = timestamp;
        data.ShuiBeng = parseInt(jsondata.data.substr(13, 1));
        data.DianHuo = parseInt(jsondata.data.substr(14, 1));
        data.GuanHuiFa = parseInt(jsondata.data.substr(15, 1));
        data.FengShan = parseInt(jsondata.data.substr(16, 1));
        data.JinShui = parseInt(jsondata.data.substr(17, 4));
        data.ChuShui1 = parseInt(jsondata.data.substr(21, 4));
        data.ChuShui2 = parseInt(jsondata.data.substr(25, 4));
        data.PaiYan1 = parseInt(jsondata.data.substr(29, 4));
        data.PaiYan2 = parseInt(jsondata.data.substr(33, 4));
        data.GuanHui = parseInt(jsondata.data.substr(37, 4));
        data.HuanJing = parseInt(jsondata.data.substr(41, 4));
        return data;
    }

    async pushAction() {
        this.jsondata = this.get();
        let event_no = parseInt(this.jsondata.data.substr(0, 2));
        log.debug(event_no);
        // this.fail(1000, '只是测试一下错误是什么样子的');
        let logmodel = this.model('devicelog');
        let statusmodel = this.model('devicestatus');
        let sql_data = this.ParsePushData(this.jsondata);
        try {
            let insertId = await logmodel.add(sql_data);
            log.debug(insertId);
            statusmodel.update_from_log_push(sql_data);
            this.success();
        } catch (err) {
            log.debug("出错了1.....");
            log.debug(err);
            this.fail('SQL_ERR');
        }

    }
}