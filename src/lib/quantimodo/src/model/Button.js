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
    root.Quantimodo.Button = factory(root.Quantimodo.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The Button model module.
   * @module model/Button
   * @version 5.8.112511
   */

  /**
   * Constructs a new <code>Button</code>.
   * @alias module:model/Button
   * @class
   * @param link {String} Ex: https://local.quantimo.do
   * @param text {String} Ex: Connect
   */
  var exports = function(link, text) {
    var _this = this;












    _this['link'] = link;





    _this['text'] = text;


  };

  /**
   * Constructs a <code>Button</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/Button} obj Optional instance to populate.
   * @return {module:model/Button} The populated <code>Button</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('accessibilityText')) {
        obj['accessibilityText'] = ApiClient.convertToType(data['accessibilityText'], 'String');
      }
      if (data.hasOwnProperty('action')) {
        obj['action'] = ApiClient.convertToType(data['action'], Object);
      }
      if (data.hasOwnProperty('additionalInformation')) {
        obj['additionalInformation'] = ApiClient.convertToType(data['additionalInformation'], 'String');
      }
      if (data.hasOwnProperty('color')) {
        obj['color'] = ApiClient.convertToType(data['color'], 'String');
      }
      if (data.hasOwnProperty('confirmationText')) {
        obj['confirmationText'] = ApiClient.convertToType(data['confirmationText'], 'String');
      }
      if (data.hasOwnProperty('functionName')) {
        obj['functionName'] = ApiClient.convertToType(data['functionName'], 'String');
      }
      if (data.hasOwnProperty('parameters')) {
        obj['parameters'] = ApiClient.convertToType(data['parameters'], Object);
      }
      if (data.hasOwnProperty('html')) {
        obj['html'] = ApiClient.convertToType(data['html'], 'String');
      }
      if (data.hasOwnProperty('id')) {
        obj['id'] = ApiClient.convertToType(data['id'], 'String');
      }
      if (data.hasOwnProperty('image')) {
        obj['image'] = ApiClient.convertToType(data['image'], 'String');
      }
      if (data.hasOwnProperty('ionIcon')) {
        obj['ionIcon'] = ApiClient.convertToType(data['ionIcon'], 'String');
      }
      if (data.hasOwnProperty('link')) {
        obj['link'] = ApiClient.convertToType(data['link'], 'String');
      }
      if (data.hasOwnProperty('stateName')) {
        obj['stateName'] = ApiClient.convertToType(data['stateName'], 'String');
      }
      if (data.hasOwnProperty('stateParams')) {
        obj['stateParams'] = ApiClient.convertToType(data['stateParams'], Object);
      }
      if (data.hasOwnProperty('successToastText')) {
        obj['successToastText'] = ApiClient.convertToType(data['successToastText'], 'String');
      }
      if (data.hasOwnProperty('successAlertTitle')) {
        obj['successAlertTitle'] = ApiClient.convertToType(data['successAlertTitle'], 'String');
      }
      if (data.hasOwnProperty('successAlertBody')) {
        obj['successAlertBody'] = ApiClient.convertToType(data['successAlertBody'], 'String');
      }
      if (data.hasOwnProperty('text')) {
        obj['text'] = ApiClient.convertToType(data['text'], 'String');
      }
      if (data.hasOwnProperty('tooltip')) {
        obj['tooltip'] = ApiClient.convertToType(data['tooltip'], 'String');
      }
      if (data.hasOwnProperty('webhookUrl')) {
        obj['webhookUrl'] = ApiClient.convertToType(data['webhookUrl'], 'String');
      }
    }
    return obj;
  }

  /**
   * Ex: connect
   * @member {String} accessibilityText
   */
  exports.prototype['accessibilityText'] = undefined;
  /**
   * Action data
   * @member {Object} action
   */
  exports.prototype['action'] = undefined;
  /**
   * Ex: connect
   * @member {String} additionalInformation
   */
  exports.prototype['additionalInformation'] = undefined;
  /**
   * Ex: #f2f2f2
   * @member {String} color
   */
  exports.prototype['color'] = undefined;
  /**
   * Text to show user before executing functionName
   * @member {String} confirmationText
   */
  exports.prototype['confirmationText'] = undefined;
  /**
   * Name of function to call
   * @member {String} functionName
   */
  exports.prototype['functionName'] = undefined;
  /**
   * Data to provide to functionName or be copied to the card parameters when button is clicked and card is posted to the API
   * @member {Object} parameters
   */
  exports.prototype['parameters'] = undefined;
  /**
   * Ex: connect
   * @member {String} html
   */
  exports.prototype['html'] = undefined;
  /**
   * HTML element id
   * @member {String} id
   */
  exports.prototype['id'] = undefined;
  /**
   * Ex: https://image.jpg
   * @member {String} image
   */
  exports.prototype['image'] = undefined;
  /**
   * Ex: ion-refresh
   * @member {String} ionIcon
   */
  exports.prototype['ionIcon'] = undefined;
  /**
   * Ex: https://local.quantimo.do
   * @member {String} link
   */
  exports.prototype['link'] = undefined;
  /**
   * State to go to
   * @member {String} stateName
   */
  exports.prototype['stateName'] = undefined;
  /**
   * Data to provide to the state
   * @member {Object} stateParams
   */
  exports.prototype['stateParams'] = undefined;
  /**
   * Text to show user after executing functionName
   * @member {String} successToastText
   */
  exports.prototype['successToastText'] = undefined;
  /**
   * Text to show user after executing functionName
   * @member {String} successAlertTitle
   */
  exports.prototype['successAlertTitle'] = undefined;
  /**
   * Text to show user after executing functionName
   * @member {String} successAlertBody
   */
  exports.prototype['successAlertBody'] = undefined;
  /**
   * Ex: Connect
   * @member {String} text
   */
  exports.prototype['text'] = undefined;
  /**
   * Ex: This is a tooltip
   * @member {String} tooltip
   */
  exports.prototype['tooltip'] = undefined;
  /**
   * Post here on button click
   * @member {String} webhookUrl
   */
  exports.prototype['webhookUrl'] = undefined;



  return exports;
}));


