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
}