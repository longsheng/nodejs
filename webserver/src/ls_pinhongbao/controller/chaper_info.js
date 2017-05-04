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

    async createInfoAction() {
        let get = this.get();
        let M_chaper_info = this.model('chaper_info', 'mysql2');
        let data={};
        data.chapter_per_money=get.permoney;
        data.create_userid=get.uuid;
        data.full_count=get.pernumber;
        data.name=get.name;
        let ret = await M_chaper_info.createInfo(data);
        if (ret.length === 0) {
            this.fail('CREATE_INFO_FAIL');
        } else {
            log.debug("创建开局信息成功。");
            log.debug("需要把自己加入参与信息列表");
            let M_user_info = this.model('user_info', 'mysql2');
            let ret2 = await M_user_info.getUserInfo(data.create_userid);
            console.log(ret2.length);
            let data1={};
            data1.chaper_id=ret;
            data1.player_id=ret2[0].id;
            log.debug("牌局编号:"+data1.chaper_id+"参与用户id："+data1.player_id);
            let M_chaper_items = this.model('chaper_items','mysql2');
            ret = await M_chaper_items.add(data1);
            this.success(ret);
        }
    }
}