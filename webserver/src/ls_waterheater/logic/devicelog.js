'use strict';
/**
 * logic
 * @param  {} []
 * @return {}     []
 */
export default class extends think.logic.base {
  /**
   * index action logic
   * @return {} []
   */
  pushAction(){
      log.debug("checking...........");
      this.rules = {
          product_key: {
              required: true,
              regexp: /^54bda8c5942943e3934cffd410f25438$/
          }
      }
  }
}