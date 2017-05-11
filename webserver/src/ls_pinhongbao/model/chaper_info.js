'use strict';
/**
 * model
 */
export default class extends think.model.base {

    async createInfo(data) {
        log.debug("M->createInfo()");
        return this.add(data);
    }

    async getInfoList(user_id) {
        let addwhere ={};
        if (user_id){
            addwhere={'user_info.id': user_id};
        }
        let ret = this.join({
            table: 'user_info',
            join: 'inner',
            on: ['create_userid', 'id']
        }).where(
            addwhere
        ).field(
            'chaper_info.id,' +
            'chaper_info.name,' +
            'chaper_info.full_count,' +
            'chaper_info.chapter_per_money,' +
            'chaper_info.create_userid,' +
            'chaper_info.create_time,' +
            'chaper_info.now_count,' +
            'chaper_info.chapter_status,' +
            'user_info.mobile'
        ).order('chaper_info.create_time DESC'
        ).select();
        return ret;

    }
}