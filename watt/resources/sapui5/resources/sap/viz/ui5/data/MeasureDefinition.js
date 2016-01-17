/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2015 SAP SE. All rights reserved
 */
sap.ui.define(['sap/ui/core/Element','sap/viz/library'],function(E,l){"use strict";var M=E.extend("sap.viz.ui5.data.MeasureDefinition",{metadata:{library:"sap.viz",properties:{group:{type:"int",group:"Misc",defaultValue:1},value:{type:"any",group:"Data",defaultValue:null},name:{type:"string",group:"Misc",defaultValue:null},identity:{type:"string",group:"Misc",defaultValue:null},format:{type:"any",group:"Misc",defaultValue:null}}}});M.prototype._getAdapter=function(){var t=this,b=this.getBindingInfo("value"),v,p,T,f;if(!b){v=this.getValue();return function(){return v;};}if(b.parts.length>1){throw new Error("MeasureDefinition doesn't support calculated bindings yet");}p=b.parts[0].path;T=b.parts[0].type;f=b.formatter;if(!(T||f)){return function(c){return c.getProperty(p);}}return function(c){var v=c.getProperty(p);if(T){v=T.formatValue(v,"string");}if(f){v=f.call(t,v,c);}return v;};};return M;});
