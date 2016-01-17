/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2015 SAP SE. All rights reserved
 */

// Provides control sap.viz.ui5.controls.common.feeds.AnalysisObject.
sap.ui.define(['sap/ui/core/Element','sap/viz/library'],
	function(Element, library) {
	"use strict";

	/**
	 * Constructor for a new ui5/controls/common/feeds/AnalysisObject.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given 
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * AnalysisObject Class
	 * @extends sap.ui.core.Element
	 *
	 * @constructor
	 * @public
	 * @since 1.21.0
	 * @name sap.viz.ui5.controls.common.feeds.AnalysisObject
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var AnalysisObject = Element.extend("sap.viz.ui5.controls.common.feeds.AnalysisObject", /** @lends sap.viz.ui5.controls.common.feeds.AnalysisObject.prototype */ { metadata : {

		library : "sap.viz",
		properties : {

			/**
			 * Uid of analysis object
			 */
			uid : {type : "string", group : "Misc", defaultValue : null},

			/**
			 * Name of an analysis object.
			 */
			name : {type : "string", group : "Misc", defaultValue : null},

			/**
			 * Type of an analysis object. Enumeration: Measure, Dimension
			 */
			type : {type : "string", group : "Misc", defaultValue : null},

			/**
			 * Data type of an analysis object. Enumeration: string, number, date
			 */
			dataType : {type : "string", group : "Misc", defaultValue : null}
		}
	}});

	///**
	// * This file defines behavior for the control,
	// */
	AnalysisObject.prototype._toInnerFmt = function(generator) {
		var uid = this.getProperty('uid');
		var name = this.getProperty('name');
		var type = this.getProperty('type');
		var dataType = this.getProperty('dataType');
		if (uid && type) {
			return new generator(uid, name, type, dataType);
		}
	};

	AnalysisObject.toVizControlsFmt = function(analysisObjects) {
		return Array.prototype.map.call(analysisObjects, function(analysisObject) {
			return analysisObject._toInnerFmt(function(id, name, type, dataType) {
				type = type ? type.toLowerCase() : type;
				dataType = dataType ? dataType.toLowerCase() : dataType;
				return new sap.viz.controls.common.feeds.AnalysisObject(id, name, type, dataType);
			});
		});
	};

	AnalysisObject.fromVizControlsFmt = function(instances) {
		return Array.prototype.map.call(instances, function(instance) {
			return new AnalysisObject({
				'uid': instance.id(),
				'name': instance.name(),
				'type': instance.type(),
				'dataType' : instance.dataType()
			});
		});
	};

	AnalysisObject.toLightWeightFmt = function(analysisObjects) {
		return Array.prototype.map.call(analysisObjects, function(analysisObject) {
			return analysisObject._toInnerFmt(function(id, name, type, dataType) {
				dataType = _lwDataTypeMapping[dataType] || dataType;
				type = _lwTypeMapping[type] || type;
				if (dataType || dataType.length) {
					return {
						'id' : id,
						'type' : type,
						'dataType' : dataType
					};
				} else {
					return {
						'id' : id,
						'type' : type
					};
				}
			});
		});
	};

	AnalysisObject.fromLightWeightFmt = function(analysisObjectsLightWeightFmt) {
		return Array.prototype.map.call(analysisObjectsLightWeightFmt, function(instance) {
			return new AnalysisObject({
				'uid': instance.id,
				'name': instance.id,
				'type': instance.type,
				'dataType' : _invertLwDataTypeMapping[instance.dataType] || instance.dataType
			});
		});
	};
	var _invert = function(object) {
		var result = {};
		for (var key in object) {
			var value = object[key];
			result[value] = key;
		}
		return result;
	}; 

	var _lwDataTypeMapping = {
		'string' : 'String',
		'number' : 'Number',
		'date' : 'Date'
	};
	var _lwTypeMapping = {
		'measure' : 'Measure',
		'dimension' : 'Dimension'
	};
	var _invertLwDataTypeMapping = _invert(_lwDataTypeMapping);


	return AnalysisObject;

});
