/*!
 * Copyright (c) 2009-2014 SAP SE, All Rights Reserved
 */
jQuery.sap.declare("sap.ushell.ui.launchpad.Panel");jQuery.sap.require("sap.ushell.library");jQuery.sap.require("sap.m.Panel");sap.m.Panel.extend("sap.ushell.ui.launchpad.Panel",{metadata:{library:"sap.ushell",properties:{"translucent":{type:"boolean",group:"Misc",defaultValue:false}},aggregations:{"headerContent":{type:"sap.ui.core.Control",multiple:true,singularName:"headerContent"},"headerBar":{type:"sap.m.Bar",multiple:false}}}});jQuery.sap.require("sap.ushell.override");sap.ushell.ui.launchpad.Panel.prototype.updateAggregation=sap.ushell.override.updateAggregation;
