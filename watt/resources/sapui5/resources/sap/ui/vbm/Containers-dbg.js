/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5) (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

// Provides control sap.ui.vbm.Containers.
sap.ui.define([
	'./VoAggregation', './library'
], function(VoAggregation, library) {
	"use strict";

	/**
	 * Constructor for a new Containers.
	 * 
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class Type specific Visual Object aggregation for <i>Container</i> instances.
	 * @extends sap.ui.vbm.VoAggregation
	 * @constructor
	 * @public
	 * @alias sap.ui.vbm.Containers
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var Containers = VoAggregation.extend("sap.ui.vbm.Containers", /** @lends sap.ui.vbm.Containers.prototype */
	{
		metadata: {

			library: "sap.ui.vbm",
			defaultAggregation: "items",
			aggregations: {

				/**
				 * Container object aggregation
				 */
				items: {
					type: "sap.ui.vbm.Container",
					multiple: true,
					singularName: "item"
				}
			},
			events: {

				/**
				 * The event is raised when there is a click action on a Container. This event is only fired if the container content is not handling
				 * the event it self.
				 */
				click: {},

				/**
				 * The event is raised when there is a right click or a tap and hold action on a Container. This event is only fired if the container
				 * content is not handling the event it self.
				 */
				contextMenu: {}
			}
		}
	});

	// /**
	// * This file defines behavior for the control,
	// */
	// sap.ui.vbm.Containers.prototype.init = function(){
	// // do something for initialization...
	// };

	// ...........................................................................//
	// model creators............................................................//

	Containers.prototype.getBindInfo = function() {
		var oBindInfo = VoAggregation.prototype.getBindInfo.apply(this, arguments);
		var oTemplateBindingInfo = this.getTemplateBindingInfo();

		// Note: Without Template no static properties -> all bound in the sense of VB JSON!
		oBindInfo.P = (oTemplateBindingInfo) ? oTemplateBindingInfo.hasOwnProperty("position") : true;
		oBindInfo.AL = (oTemplateBindingInfo) ? oTemplateBindingInfo.hasOwnProperty("alignment") : true;

		return oBindInfo;
	};

	Containers.prototype.getTemplateObject = function() {
		// get common template from base class (VoAggregation)
		var oTemp = VoAggregation.prototype.getTemplateObject.apply(this, arguments);

		var oBindInfo = this.mBindInfo = this.getBindInfo();
		var oVoTemplate = (oBindInfo.hasTemplate) ? this.getBindingInfo("items").template : null;

		oTemp["type"] = "{00100000-2012-0004-B001-2297943F0CE6}";
		oTemp["key.bind"] = oTemp.id + ".IK"; // IK is the key
		if (oBindInfo.P) {
			oTemp["pos.bind"] = oTemp.id + ".P";
		} else {
			oTemp.pos = oVoTemplate.getPosition(); // P is the position
		}
		if (oBindInfo.AL) {
			oTemp["alignment.bind"] = oTemp.id + ".AL";
		} else {
			oTemp.alignment = oVoTemplate.getAlignment(); // AL is the alignment
		}

		return oTemp;
	};

	Containers.prototype.getTypeObject = function() {
		var oType = VoAggregation.prototype.getTypeObject.apply(this, arguments);
		var oBindInfo = this.mBindInfo;

		// extend the object type.................................................//
		oType.A.push({
			"name": "IK", // key
			"alias": "IK",
			"type": "key"
		});
		if (oBindInfo.P) {
			oType.A.push({
				"changeable": "true",
				"name": "P", // position
				"alias": "P",
				"type": "vector"
			});
		}
		if (oBindInfo.AL) {
			oType.A.push({
				"name": "AL", // alignment
				"alias": "AL",
				"type": "string"
			});
		}
		return oType;
	};

	Containers.prototype.getActionArray = function() {
		var aActions = VoAggregation.prototype.getActionArray.apply(this, arguments);

		var id = this.getId();

		// check if the different vo events are registered..............................//
		if (this.mEventRegistry["click"] || this.isEventRegistered("click")) {
			aActions.push({
				"id": id + "1",
				"name": "click",
				"refScene": "MainScene",
				"refVO": id,
				"refEvent": "Click",
				"AddActionProperty": [
					{
						"name": "pos"
					}
				]
			});
		}
		if (this.mEventRegistry["contextMenu"] || this.isEventRegistered("contextMenu")) {
			aActions.push({
				"id": id + "2",
				"name": "contextMenu",
				"refScene": "MainScene",
				"refVO": id,
				"refEvent": "ContextMenu"
			});
		}

		return aActions;
	};

	// ...........................................................................//
	// helper functions..........................................................//

	Containers.prototype.handleEvent = function(event) {
		var s = event.Action.name;

		var funcname = "fire" + s[0].toUpperCase() + s.slice(1);

		// first we try to get the event on a Containers instance.................//
		var Container;
		if ((Container = this.findInstance(event.Action.instance))) {
			if (Container.mEventRegistry[s]) {
				Container[funcname]({
					data: event
				});
			}
		}
		this[funcname]({
			data: event
		});
	};

	Containers.prototype.handleOpenWindow = function(event) {
		// get the right container aggregation
		var cont = this.findInstance(event.mParameters.id);

		// get the control
		var oItem = cont.getItem();
		if (oItem) {
			// determine the id of the div to place the ui area
			var id = event.getParameter("contentarea").id;

			// propagate all models - even the named ones!
			cont.propagateModels(oItem);
			oItem.placeAt(id, "only");
			oItem.setBindingContext(cont.getBindingContext());
		}
	};

	Containers.prototype.handleCloseWindow = function(event) {
		// destroy container content -> nothing to do?
		// var id = event.getParameter("contentarea").id;
	};

	Containers.prototype.findInstance = function(key) {
		var aVO = this.getItems();
		if (!aVO) {
			return false;
		}

		for (var nJ = 0, len = aVO.length; nJ < len; ++nJ) {
			// get the control.....................................................//
			if (aVO[nJ].sId === key) {
				return aVO[nJ];
			}
		}

		return null;
	};

	return Containers;

});
