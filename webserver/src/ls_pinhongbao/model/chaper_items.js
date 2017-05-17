'use strict';
/**
 * model
 */
export default class extends think.model.base {

    async createItems(data){
        log.debug("createItems()");
        log.debug(data);
        return this.add(data);
    }
    async getItemsByChaperId(chaper_id){
        log.debug("getItemsByChaperId()");
        log.debug(chaper_id);
        return this.join({
            table: 'user_info',
            join: 'inner',
            on: ['player_id', 'id']
        }).field(['user_info.mobile']).where({'chaper_id':chaper_id}).select();
    }
}