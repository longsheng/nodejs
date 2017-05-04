'use strict';
/**
 * model
 */
export default class extends think.model.base {
    async getUserInfo(data) {
        log.debug("getUserInfo()");
        log.debug(data);
        return this.where({uuid:data}).select();
    }
    async regUser(data){
        log.debug("regUser()");
        log.debug(data);
        data.money=0;   //第三次验证，确保用户注册时金钱为0
        return this.add(data);
    }
}