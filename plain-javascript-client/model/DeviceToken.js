/**
 * quantimodo
 * We make it easy to retrieve and analyze normalized user data from a wide array of devices and applications. Check out our [docs and sdk's](https://github.com/QuantiModo/docs) or [contact us](https://help.quantimo.do).
 *
 * OpenAPI spec version: 5.8.112511
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.4.8
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.Quantimodo) {
      root.Quantimodo = {};
    }
    root.Quantimodo.DeviceToken = factory(root.Quantimodo.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The DeviceToken model module.
   * @module model/DeviceToken
   * @version 5.8.112511
   */

  /**
   * Constructs a new <code>DeviceToken</code>.
   * @alias module:model/DeviceToken
   * @class
   * @param platform {String} ios, android, or web
   * @param deviceToken {String} The device token
   */
  var exports = function(platform, deviceToken) {
    var _this = this;


    _this['platform'] = platform;
    _this['deviceToken'] = deviceToken;
  };

  /**
   * Constructs a <code>DeviceToken</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/DeviceToken} obj Optional instance to populate.
   * @return {module:model/DeviceToken} The populated <code>DeviceToken</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('clientId')) {
        obj['clientId'] = ApiClient.convertToType(data['clientId'], 'String');
      }
      if (data.hasOwnProperty('platform')) {
        obj['platform'] = ApiClient.convertToType(data['platform'], 'String');
      }
      if (data.hasOwnProperty('deviceToken')) {
        obj['deviceToken'] = ApiClient.convertToType(data['deviceToken'], 'String');
      }
    }
    return obj;
  }

  /**
   * Client id
   * @member {String} clientId
   */
  exports.prototype['clientId'] = undefined;
  /**
   * ios, android, or web
   * @member {String} platform
   */
  exports.prototype['platform'] = undefined;
  /**
   * The device token
   * @member {String} deviceToken
   */
  exports.prototype['deviceToken'] = undefined;



  return exports;
}));


