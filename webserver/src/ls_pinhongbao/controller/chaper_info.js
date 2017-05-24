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

    /**
     * 创建一句新游戏
     * @returns {Promise.<void>}
     */
    async createInfoAction() {
        let get = this.get();
        let data={};
        data.chapter_per_money=get.permoney;
        data.create_userid=get.create_userid;
        data.full_count=get.pernumber;
        data.name=get.name;
        let ret = await this.model('chaper_info').createInfo(data);
        if (ret.length === 0) {
            this.fail('创建开局信息失败');
        } else {
            log.debug("创建开局信息成功。");
            log.debug("需要把自己加入参与信息列表");
            let M_user_info = this.model('user_info');
            let data1={};
            data1.chaper_id=ret;
            data1.player_id=data.create_userid;
            ret = await this.model('chaper_items').add(data1);
            this.success(ret);
        }
    }
    async getInfoListAction(){
        let get = this.get();
        log.debug(get);
        let logmodel = this.model('chaper_info');
        let ret = await logmodel.getInfoList();
        log.debug(ret.length);
        if(ret.length < 1){
            this.fail('获取牌局列表出错');
        }else {
            this.success(ret);
        }
    }
}