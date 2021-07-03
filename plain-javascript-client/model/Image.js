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
    root.Quantimodo.Image = factory(root.Quantimodo.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The Image model module.
   * @module model/Image
   * @version 5.8.112511
   */

  /**
   * Constructs a new <code>Image</code>.
   * @alias module:model/Image
   * @class
   * @param height {String} Ex: 240
   * @param imageUrl {String} Ex: https://www.filepicker.io/api/file/TjmeNWS5Q2SFmtJlUGLf
   * @param width {String} Ex: 224
   */
  var exports = function(height, imageUrl, width) {
    var _this = this;

    _this['height'] = height;
    _this['imageUrl'] = imageUrl;
    _this['width'] = width;
  };

  /**
   * Constructs a <code>Image</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/Image} obj Optional instance to populate.
   * @return {module:model/Image} The populated <code>Image</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('height')) {
        obj['height'] = ApiClient.convertToType(data['height'], 'String');
      }
      if (data.hasOwnProperty('imageUrl')) {
        obj['imageUrl'] = ApiClient.convertToType(data['imageUrl'], 'String');
      }
      if (data.hasOwnProperty('width')) {
        obj['width'] = ApiClient.convertToType(data['width'], 'String');
      }
    }
    return obj;
  }

  /**
   * Ex: 240
   * @member {String} height
   */
  exports.prototype['height'] = undefined;
  /**
   * Ex: https://www.filepicker.io/api/file/TjmeNWS5Q2SFmtJlUGLf
   * @member {String} imageUrl
   */
  exports.prototype['imageUrl'] = undefined;
  /**
   * Ex: 224
   * @member {String} width
   */
  exports.prototype['width'] = undefined;



  return exports;
}));


