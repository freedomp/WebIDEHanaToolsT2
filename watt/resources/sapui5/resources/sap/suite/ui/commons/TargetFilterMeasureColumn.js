/*!
 * SAP UI development toolkit for HTML5 (SAPUI5) (c) Copyright 2009-2013 SAP AG. All rights reserved
 */
jQuery.sap.declare("sap.suite.ui.commons.TargetFilterMeasureColumn");jQuery.sap.require("sap.suite.ui.commons.library");jQuery.sap.require("sap.ui.core.Element");sap.ui.core.Element.extend("sap.suite.ui.commons.TargetFilterMeasureColumn",{metadata:{library:"sap.suite.ui.commons",properties:{"path":{type:"string",group:"Misc",defaultValue:null},"type":{type:"any",group:"Misc",defaultValue:null}}}});
sap.suite.ui.commons.TargetFilterMeasureColumn.prototype.init=function(){this.setType(new sap.ui.model.type.Integer({groupingEnabled:true}));};
sap.suite.ui.commons.TargetFilterMeasureColumn.prototype.setType=function(t,s){if(!(t instanceof sap.ui.model.SimpleType)){jQuery.sap.log.error(t+" is not instance of sap.ui.model.SimpleType",this);}this.setProperty("type",t,s);};
