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
    root.Quantimodo.StudyHtml = factory(root.Quantimodo.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The StudyHtml model module.
   * @module model/StudyHtml
   * @version 5.8.112511
   */

  /**
   * Constructs a new <code>StudyHtml</code>.
   * @alias module:model/StudyHtml
   * @class
   * @param chartHtml {String} Embeddable chart html
   * @param fullStudyHtml {String} Embeddable study text html including charts.  Modifiable css classes are study-title, study-section-header, study-section-body
   */
  var exports = function(chartHtml, fullStudyHtml) {
    var _this = this;

    _this['chartHtml'] = chartHtml;


    _this['fullStudyHtml'] = fullStudyHtml;










  };

  /**
   * Constructs a <code>StudyHtml</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/StudyHtml} obj Optional instance to populate.
   * @return {module:model/StudyHtml} The populated <code>StudyHtml</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('chartHtml')) {
        obj['chartHtml'] = ApiClient.convertToType(data['chartHtml'], 'String');
      }
      if (data.hasOwnProperty('downloadButtonsHtml')) {
        obj['downloadButtonsHtml'] = ApiClient.convertToType(data['downloadButtonsHtml'], 'String');
      }
      if (data.hasOwnProperty('fullPageWithHead')) {
        obj['fullPageWithHead'] = ApiClient.convertToType(data['fullPageWithHead'], 'String');
      }
      if (data.hasOwnProperty('fullStudyHtml')) {
        obj['fullStudyHtml'] = ApiClient.convertToType(data['fullStudyHtml'], 'String');
      }
      if (data.hasOwnProperty('fullStudyHtmlWithCssStyles')) {
        obj['fullStudyHtmlWithCssStyles'] = ApiClient.convertToType(data['fullStudyHtmlWithCssStyles'], 'String');
      }
      if (data.hasOwnProperty('participantInstructionsHtml')) {
        obj['participantInstructionsHtml'] = ApiClient.convertToType(data['participantInstructionsHtml'], 'String');
      }
      if (data.hasOwnProperty('statisticsTableHtml')) {
        obj['statisticsTableHtml'] = ApiClient.convertToType(data['statisticsTableHtml'], 'String');
      }
      if (data.hasOwnProperty('studyAbstractHtml')) {
        obj['studyAbstractHtml'] = ApiClient.convertToType(data['studyAbstractHtml'], 'String');
      }
      if (data.hasOwnProperty('studyHeaderHtml')) {
        obj['studyHeaderHtml'] = ApiClient.convertToType(data['studyHeaderHtml'], 'String');
      }
      if (data.hasOwnProperty('studyImageHtml')) {
        obj['studyImageHtml'] = ApiClient.convertToType(data['studyImageHtml'], 'String');
      }
      if (data.hasOwnProperty('studyMetaHtml')) {
        obj['studyMetaHtml'] = ApiClient.convertToType(data['studyMetaHtml'], 'String');
      }
      if (data.hasOwnProperty('studyTextHtml')) {
        obj['studyTextHtml'] = ApiClient.convertToType(data['studyTextHtml'], 'String');
      }
      if (data.hasOwnProperty('socialSharingButtonHtml')) {
        obj['socialSharingButtonHtml'] = ApiClient.convertToType(data['socialSharingButtonHtml'], 'String');
      }
      if (data.hasOwnProperty('studySummaryBoxHtml')) {
        obj['studySummaryBoxHtml'] = ApiClient.convertToType(data['studySummaryBoxHtml'], 'String');
      }
    }
    return obj;
  }

  /**
   * Embeddable chart html
   * @member {String} chartHtml
   */
  exports.prototype['chartHtml'] = undefined;
  /**
   * Play Store, App Store, Chrome Web Store
   * @member {String} downloadButtonsHtml
   */
  exports.prototype['downloadButtonsHtml'] = undefined;
  /**
   * Embeddable study including HTML head section charts.  Modifiable css classes are study-title, study-section-header, study-section-body
   * @member {String} fullPageWithHead
   */
  exports.prototype['fullPageWithHead'] = undefined;
  /**
   * Embeddable study text html including charts.  Modifiable css classes are study-title, study-section-header, study-section-body
   * @member {String} fullStudyHtml
   */
  exports.prototype['fullStudyHtml'] = undefined;
  /**
   * Embeddable study html including charts and css styling
   * @member {String} fullStudyHtmlWithCssStyles
   */
  exports.prototype['fullStudyHtmlWithCssStyles'] = undefined;
  /**
   * Instructions for study participation
   * @member {String} participantInstructionsHtml
   */
  exports.prototype['participantInstructionsHtml'] = undefined;
  /**
   * Embeddable table with statistics
   * @member {String} statisticsTableHtml
   */
  exports.prototype['statisticsTableHtml'] = undefined;
  /**
   * Text summary
   * @member {String} studyAbstractHtml
   */
  exports.prototype['studyAbstractHtml'] = undefined;
  /**
   * Title, study image, abstract with CSS styling
   * @member {String} studyHeaderHtml
   */
  exports.prototype['studyHeaderHtml'] = undefined;
  /**
   * PNG image
   * @member {String} studyImageHtml
   */
  exports.prototype['studyImageHtml'] = undefined;
  /**
   * Facebook, Twitter, Google+
   * @member {String} studyMetaHtml
   */
  exports.prototype['studyMetaHtml'] = undefined;
  /**
   * Formatted study text sections
   * @member {String} studyTextHtml
   */
  exports.prototype['studyTextHtml'] = undefined;
  /**
   * What do you expect?
   * @member {String} socialSharingButtonHtml
   */
  exports.prototype['socialSharingButtonHtml'] = undefined;
  /**
   * What do you expect?
   * @member {String} studySummaryBoxHtml
   */
  exports.prototype['studySummaryBoxHtml'] = undefined;



  return exports;
}));


