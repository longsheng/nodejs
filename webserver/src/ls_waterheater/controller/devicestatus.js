'use strict';

import Base from './base.js';

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

    async querydeviceStatusAction() {
        let get = this.get();
        log.debug(get.DeviceID);
        let model = this.model('devicestatus');
        let data = await model.QueryDeviceStatusByDeviceID(get.DeviceID);
        log.debug(data);
        this.success(data);

    }
}