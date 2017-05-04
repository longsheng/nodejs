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

    async getUserInfoAction() {
        let get = this.get();
        let logmodel = this.model('user_info', 'mysql2');
        let ret = await logmodel.getUserInfo(get.uuid);
        log.debug(ret);
        if (ret.length == 0) {
            this.fail('USER_NOT_FOUND');
        } else {
            this.success(ret);
        }
    }

    async regUserAction(data) {
        let get = this.get()
        let model_user_info = this.model('user_info', 'mysql2');
        log.debug(get);
        get.money = 0;   //第二次验证，确保用户注册时金钱为0
        log.debug(get);
        let ret = await model_user_info.regUser(get);
        if (ret.length == 0) {
            this.fail('USER_REG_FAIL');
        } else {
            this.success(ret);
        }
    }
}