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
        let M_chaper_items = this.model('chaper_items', 'mysql2');
        log.debug(get);
        let ret = await M_chaper_items.createItems(get);
        log.debug(ret);
        if (ret.length == 0) {
            //**#####
            this.fail('CREATE_ITEMS_FAIL');
        } else {
            this.success(ret);
        }
    }

    async getItemsByChaperIdAction() {
        let get = this.get();
        let M_chaper_items = this.model('chaper_items', 'mysql2');
        if (get.chaper_id == undefined || get.chaper_id < 1) {
            this.fail('用户的编号没有传入，或者不正确');
            return;
        }
        let ret = await  M_chaper_items.getItemsByChaperId(get.chaper_id);
        log.debug(ret);
        if (ret.length == 0) {
            //**#####
            this.fail('没有找到这个用户创建的牌局');
        } else {
            this.success(ret);
        }
    }

}