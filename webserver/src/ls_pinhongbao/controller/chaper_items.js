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

    async createItemsAction() {  //Todo:此函数需要提升安全级别，因为直接可以传递用户收益。
        //auto render template file index_index.html
        let get = this.get();
        log.debug(get);
        //todo:发起红包要先检查用户的余额是否够用
        let ret = await this.model('chaper_items').createItems(get);
        log.debug(ret);
        if (ret.length == 0) {
            //**#####
            this.fail('创建牌局出错');
        } else {
            this.success(ret);
        }
    }

    async getItemsByChaperIdAction() {
        let get = this.get();
        let M_chaper_items = this.model('chaper_items');
        if (get.chaper_id == undefined || get.chaper_id < 1) {
            this.fail('用户的编号没有传入，或者不正确');
            return;
        }
        let ret = await  M_chaper_items.getItemsByChaperId(get.chaper_id);
        log.debug(ret);
        if (ret.length == 0) {
            //**#####
            this.fail('没有找到这个编号的牌局');
        } else {
            this.success(ret);
        }
    }

    async joinGameAction() {
        let get = this.get();
        log.debug(get);
        //获取牌局信息，取得本场金额
        let ret = await this.model('chaper_info').where({'id': get.chaper_id}).select();
        if (ret.length == 0) this.fail("牌局信息无法找到");
        let chapter_per_money = ret[0].chapter_per_money;
        let now_count = ret[0].now_count;
        let full_count = ret[0].full_count;
        let chaper_status = ret[0].chaper_status;
        //判断是否还未满人
        if (now_count >= full_count) {
            this.fail("此局人数已经满了，你怎么还能加进来呀");
        }
        //取得用户信息，计算用户余额
        ret = await this.model('user_info').where({'id': get.player_id}).select();
        if (ret.length == 0) this.fail("用户信息没有找到");
        let money = ret[0].money;
        log.debug("本场金额:", chapter_per_money, "用户余额：", money);
        if (money < chapter_per_money) {
            this.fail("您的账户余额不够呀");
        }
        //加入牌局表
        //todo:这里需要做互斥，防止最后一个用户加入时的同时操作
        ret = await this.model('chaper_items').thenAdd({
                'chaper_id': get.chaper_id,
                'player_id': get.player_id
            }, {
                'chaper_id': get.chaper_id,
                'player_id': get.player_id
            },
        );
        console.log(ret);
        if (ret.length == 0) this.fail("加入牌局出错，请联络管理员。");
        if (ret.type == 'exist') {
            this.fail("你已经加入过了呀");
        }
        if (ret.type == 'add') {
            //成功后扣除用户余额
            ret = await this.model('user_info').where({'id': get.player_id}).increment('money', 0 - chapter_per_money);
            log.debug(ret);
            if(ret.length==0) this.fail("金额已扣，加入出错，请联络管理员");
            ret = await this.model('chaper_info').where({'id':get.chaper_id}).increment('now_count',1);
            //检查是否是最后一个加入的
            if (full_count - now_count == 1) {
                //最后一个人加入后
                //呼叫开奖系统，进行开奖
                //todo:开奖系统实现
            }
            if (ret.length == 0) {
                this.fail("加入出错，请联络管理员");
            } else {
                this.success("加入成功");
            }
        }
    }
}