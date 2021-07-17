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
    define(['ApiClient', 'model/MeasurementItem'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('./MeasurementItem'));
  } else {
    // Browser globals (root is window)
    if (!root.Quantimodo) {
      root.Quantimodo = {};
    }
    root.Quantimodo.MeasurementSet = factory(root.Quantimodo.ApiClient, root.Quantimodo.MeasurementItem);
  }
}(this, function(ApiClient, MeasurementItem) {
  'use strict';




  /**
   * The MeasurementSet model module.
   * @module model/MeasurementSet
   * @version 5.8.112511
   */

  /**
   * Constructs a new <code>MeasurementSet</code>.
   * @alias module:model/MeasurementSet
   * @class
   * @param measurementItems {Array.<module:model/MeasurementItem>} Array of timestamps, values, and optional notes
   * @param sourceName {String} Name of the application or device used to record the measurement values
   * @param unitAbbreviatedName {String} Unit of measurement
   * @param variableName {String} ORIGINAL name of the variable for which we are creating the measurement records
   */
  var exports = function(measurementItems, sourceName, unitAbbreviatedName, variableName) {
    var _this = this;


    _this['measurementItems'] = measurementItems;
    _this['sourceName'] = sourceName;
    _this['unitAbbreviatedName'] = unitAbbreviatedName;

    _this['variableName'] = variableName;

  };

  /**
   * Constructs a <code>MeasurementSet</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/MeasurementSet} obj Optional instance to populate.
   * @return {module:model/MeasurementSet} The populated <code>MeasurementSet</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('combinationOperation')) {
        obj['combinationOperation'] = ApiClient.convertToType(data['combinationOperation'], 'String');
      }
      if (data.hasOwnProperty('measurementItems')) {
        obj['measurementItems'] = ApiClient.convertToType(data['measurementItems'], [MeasurementItem]);
      }
      if (data.hasOwnProperty('sourceName')) {
        obj['sourceName'] = ApiClient.convertToType(data['sourceName'], 'String');
      }
      if (data.hasOwnProperty('unitAbbreviatedName')) {
        obj['unitAbbreviatedName'] = ApiClient.convertToType(data['unitAbbreviatedName'], 'String');
      }
      if (data.hasOwnProperty('variableCategoryName')) {
        obj['variableCategoryName'] = ApiClient.convertToType(data['variableCategoryName'], 'String');
      }
      if (data.hasOwnProperty('variableName')) {
        obj['variableName'] = ApiClient.convertToType(data['variableName'], 'String');
      }
      if (data.hasOwnProperty('upc')) {
        obj['upc'] = ApiClient.convertToType(data['upc'], 'String');
      }
    }
    return obj;
  }

  /**
   * Way to aggregate measurements over time. SUM should be used for things like minutes of exercise.  If you use MEAN for exercise, then a person might exercise more minutes in one day but add separate measurements that were smaller.  So when we are doing correlational analysis, we would think that the person exercised less that day even though they exercised more.  Conversely, we must use MEAN for things such as ratings which cannot be SUMMED.
   * @member {module:model/MeasurementSet.CombinationOperationEnum} combinationOperation
   */
  exports.prototype['combinationOperation'] = undefined;
  /**
   * Array of timestamps, values, and optional notes
   * @member {Array.<module:model/MeasurementItem>} measurementItems
   */
  exports.prototype['measurementItems'] = undefined;
  /**
   * Name of the application or device used to record the measurement values
   * @member {String} sourceName
   */
  exports.prototype['sourceName'] = undefined;
  /**
   * Unit of measurement
   * @member {String} unitAbbreviatedName
   */
  exports.prototype['unitAbbreviatedName'] = undefined;
  /**
   * Ex: Emotions, Treatments, Symptoms...
   * @member {module:model/MeasurementSet.VariableCategoryNameEnum} variableCategoryName
   */
  exports.prototype['variableCategoryName'] = undefined;
  /**
   * ORIGINAL name of the variable for which we are creating the measurement records
   * @member {String} variableName
   */
  exports.prototype['variableName'] = undefined;
  /**
   * UPC or other barcode scan result
   * @member {String} upc
   */
  exports.prototype['upc'] = undefined;


  /**
   * Allowed values for the <code>combinationOperation</code> property.
   * @enum {String}
   * @readonly
   */
  exports.CombinationOperationEnum = {
    /**
     * value: "MEAN"
     * @const
     */
    "MEAN": "MEAN",
    /**
     * value: "SUM"
     * @const
     */
    "SUM": "SUM"  };

  /**
   * Allowed values for the <code>variableCategoryName</code> property.
   * @enum {String}
   * @readonly
   */
  exports.VariableCategoryNameEnum = {
    /**
     * value: "Activity"
     * @const
     */
    "Activity": "Activity",
    /**
     * value: "Books"
     * @const
     */
    "Books": "Books",
    /**
     * value: "Causes of Illness"
     * @const
     */
    "Causes of Illness": "Causes of Illness",
    /**
     * value: "Cognitive Performance"
     * @const
     */
    "Cognitive Performance": "Cognitive Performance",
    /**
     * value: "Conditions"
     * @const
     */
    "Conditions": "Conditions",
    /**
     * value: "Emotions"
     * @const
     */
    "Emotions": "Emotions",
    /**
     * value: "Environment"
     * @const
     */
    "Environment": "Environment",
    /**
     * value: "Foods"
     * @const
     */
    "Foods": "Foods",
    /**
     * value: "Goals"
     * @const
     */
    "Goals": "Goals",
    /**
     * value: "Locations"
     * @const
     */
    "Locations": "Locations",
    /**
     * value: "Miscellaneous"
     * @const
     */
    "Miscellaneous": "Miscellaneous",
    /**
     * value: "Movies and TV"
     * @const
     */
    "Movies and TV": "Movies and TV",
    /**
     * value: "Music"
     * @const
     */
    "Music": "Music",
    /**
     * value: "Nutrients"
     * @const
     */
    "Nutrients": "Nutrients",
    /**
     * value: "Payments"
     * @const
     */
    "Payments": "Payments",
    /**
     * value: "Physical Activities"
     * @const
     */
    "Physical Activities": "Physical Activities",
    /**
     * value: "Physique"
     * @const
     */
    "Physique": "Physique",
    /**
     * value: "Sleep"
     * @const
     */
    "Sleep": "Sleep",
    /**
     * value: "Social Interactions"
     * @const
     */
    "Social Interactions": "Social Interactions",
    /**
     * value: "Software"
     * @const
     */
    "Software": "Software",
    /**
     * value: "Symptoms"
     * @const
     */
    "Symptoms": "Symptoms",
    /**
     * value: "Treatments"
     * @const
     */
    "Treatments": "Treatments",
    /**
     * value: "Vital Signs"
     * @const
     */
    "Vital Signs": "Vital Signs"  };


  return exports;
}));


