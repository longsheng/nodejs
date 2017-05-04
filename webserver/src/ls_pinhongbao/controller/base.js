'use strict';

export default class extends think.controller.base {
  /**
   * some base method in here
   */
  * __before(){
      this.header('Access-Control-Allow-Origin', this.header('origin') || '*');
      this.header('Access-Control-Allow-Headers', 'x-requested-with');
      this.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS,PUT,DELETE");
      this.header('Access-Control-Allow-Credentials', 'true');
      }
}