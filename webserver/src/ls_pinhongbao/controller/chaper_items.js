'use strict';

import Base from './base.js';

export default class extends Base {
    /**
     * index action
     * @return {Promise} []
     */
    indexAction() {
        //auto render template file index_index.html
        this.aaa = JSON.stringify({"错误": "您的请求无效！"});
        return this.display();
    }

    async createItemsAction() {
        //auto render template file index_index.html
        let get = this.get();
        let logmodel = this.model('chaper_items', 'mysql2');
        log.debug(get);
        let ret = await logmodel.createItems(get);
        log.debug(ret);
        if (ret.length == 0) {
            //**##
            this.fail('USER_NOT_FOUND');
        } else {
            this.success(ret);
        }
    }
}