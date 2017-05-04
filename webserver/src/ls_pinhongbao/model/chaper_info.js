'use strict';
/**
 * model
 */
export default class extends think.model.base {

    async createInfo(data){
        log.debug("M->createInfo()");
        return this.add(data);
    }
}