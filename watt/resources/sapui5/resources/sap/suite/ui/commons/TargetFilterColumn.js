/*!
 * SAP UI development toolkit for HTML5 (SAPUI5) (c) Copyright 2009-2013 SAP AG. All rights reserved
 */
jQuery.sap.declare("sap.suite.ui.commons.TargetFilterColumn");jQuery.sap.require("sap.suite.ui.commons.library");jQuery.sap.require("sap.ui.core.Element");sap.ui.core.Element.extend("sap.suite.ui.commons.TargetFilterColumn",{metadata:{library:"sap.suite.ui.commons",properties:{"path":{type:"string",group:"Misc",defaultValue:null},"title":{type:"string",group:"Misc",defaultValue:null},"length":{type:"int",group:"Misc",defaultValue:10},"type":{type:"any",group:"Misc",defaultValue:null}}}});
sap.suite.ui.commons.TargetFilterColumn.prototype.init=function(){this.setType(new sap.ui.model.type.String());};
sap.suite.ui.commons.TargetFilterColumn.prototype.setType=function(t,s){if(!(t instanceof sap.ui.model.SimpleType)){jQuery.sap.log.error(t+" is not instance of sap.ui.model.SimpleType",this);}this.setProperty("type",t,s);};
