'use strict';
/**
 * model
 */
export default class extends think.model.base {
    async update_from_log_push(sql_data) {
        log.debug(sql_data);
        if (think.isEmpty(await this.where({DeviceID: sql_data.DeviceID}).find())) {
            log.debug("这台设备还没有被记录过状态，添加中...");
            let insertId = await this.add(sql_data);
        } else {
            log.debug("更新状态中...");
            let affectedRows = await this.where({DeviceID: sql_data.DeviceID}).update(sql_data);
            log.debug(affectedRows);
        }
    }

    async QueryDeviceStatusByDeviceID(DeviceID) {
        return this.where({DeviceID:DeviceID}).find();
    }
}