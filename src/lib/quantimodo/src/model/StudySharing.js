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
    root.Quantimodo.StudySharing = factory(root.Quantimodo.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The StudySharing model module.
   * @module model/StudySharing
   * @version 5.8.112511
   */

  /**
   * Constructs a new <code>StudySharing</code>.
   * @alias module:model/StudySharing
   * @class
   * @param shareUserMeasurements {Boolean} Would you like to make this study publicly visible?
   * @param sharingDescription {String} Ex: N1 Study: Sleep Quality Predicts Higher Overall Mood
   * @param sharingTitle {String} Ex: N1 Study: Sleep Quality Predicts Higher Overall Mood
   */
  var exports = function(shareUserMeasurements, sharingDescription, sharingTitle) {
    var _this = this;

    _this['shareUserMeasurements'] = shareUserMeasurements;
    _this['sharingDescription'] = sharingDescription;
    _this['sharingTitle'] = sharingTitle;
  };

  /**
   * Constructs a <code>StudySharing</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/StudySharing} obj Optional instance to populate.
   * @return {module:model/StudySharing} The populated <code>StudySharing</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('shareUserMeasurements')) {
        obj['shareUserMeasurements'] = ApiClient.convertToType(data['shareUserMeasurements'], 'Boolean');
      }
      if (data.hasOwnProperty('sharingDescription')) {
        obj['sharingDescription'] = ApiClient.convertToType(data['sharingDescription'], 'String');
      }
      if (data.hasOwnProperty('sharingTitle')) {
        obj['sharingTitle'] = ApiClient.convertToType(data['sharingTitle'], 'String');
      }
    }
    return obj;
  }

  /**
   * Would you like to make this study publicly visible?
   * @member {Boolean} shareUserMeasurements
   */
  exports.prototype['shareUserMeasurements'] = undefined;
  /**
   * Ex: N1 Study: Sleep Quality Predicts Higher Overall Mood
   * @member {String} sharingDescription
   */
  exports.prototype['sharingDescription'] = undefined;
  /**
   * Ex: N1 Study: Sleep Quality Predicts Higher Overall Mood
   * @member {String} sharingTitle
   */
  exports.prototype['sharingTitle'] = undefined;



  return exports;
}));


