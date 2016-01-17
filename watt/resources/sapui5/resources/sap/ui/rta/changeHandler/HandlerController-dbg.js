/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2015 SAP SE. All rights reserved
 */

sap.ui.define([	"jquery.sap.global", 
				"sap/ui/rta/changeHandler/Move", 
				"sap/ui/rta/changeHandler/Property", 
				"sap/ui/rta/changeHandler/AddControl", 
				"sap/ui/fl/registry/ChangeRegistry", 
				"sap/ui/fl/registry/SimpleChanges"], 
function(		jQuery, 
				Move, 
				Property, 
				AddControl, 
				ChangeRegistry, 
				simpleChanges) {
	"use strict";

	simpleChanges.move = {
		changeType: "move",
		changeHandler: Move
	};

	simpleChanges.property = {
		changeType: "property",
		changeHandler: Property
	};
	
	simpleChanges.addControl = {
			changeType: "addControl",
			changeHandler: AddControl
	};

	var oChangeRegistry = ChangeRegistry.getInstance();
	var aSupportedSimpleChanges = [ 
				                    simpleChanges.move, 
				                    simpleChanges.property, 
				                    simpleChanges.addControl, 
				                    simpleChanges.hideControl, 
				                    simpleChanges.unhideControl
			                      ];
	
	oChangeRegistry.registerControlsForChanges({
	   "sap.m.Button" : aSupportedSimpleChanges,
	   "sap.m.ObjectStatus" : aSupportedSimpleChanges,
	   "sap.m.ObjectHeader" : aSupportedSimpleChanges,
	   "sap.m.ObjectAttribute" : aSupportedSimpleChanges
	});
	
});
