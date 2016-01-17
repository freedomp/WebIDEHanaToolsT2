/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2015 SAP SE. All rights reserved
 */
sap.ui.define(['jquery.sap.global','sap/ui/comp/library','sap/ui/core/Control'],function(q,l,C){"use strict";var F=C.extend("sap.ui.comp.smartform.flexibility.FieldList",{metadata:{library:"sap.ui.comp",aggregations:{nodes:{type:"sap.ui.comp.smartform.flexibility.FieldListNode",multiple:true,singularName:"node"}},events:{selectionChanged:{},labelChanged:{},nodeHidden:{}}}});F.prototype.init=function(){this._oSelectedNode=null;};F.prototype.getSelectedNode=function(){return this._oSelectedNode;};F.prototype._registerNodeSelectionChangedEvent=function(n){if(n){n.attachSelected(this._handleSelectionChanged.bind(this));}};F.prototype._registerNodeLabelChangedEvent=function(n){if(n){n.attachLabelChanged(this._handleLabelChanged.bind(this));}};F.prototype._registerNodeHiddenEvent=function(n){if(n){n.attachNodeHidden(this._handleNodeHidden.bind(this));}};F.prototype._deregisterNodeSelectionChangedEvent=function(n){if(n){n.detachSelected(this._handleSelectionChanged.bind(this));}};F.prototype._deregisterNodeLabelChangedEvent=function(n){if(n){n.detachLabelChanged(this._handleLabelChanged.bind(this));}};F.prototype._deregisterNodeHiddenEvent=function(n){if(n){n.detachNodeHidden(this._handleNodeHidden.bind(this));}};F.prototype._handleSelectionChanged=function(e){var n;n=e.getParameter("target");if(n){this.fireSelectionChanged({node:n});}};F.prototype._handleLabelChanged=function(e){var n;n=e.getParameter("target");if(n){this.fireLabelChanged({node:n});}};F.prototype._handleNodeHidden=function(e){var n;n=e.getParameter("target");if(n){this.fireNodeHidden({node:n});}};F.prototype._setSelectedNode=function(n){if(!n){return;}if(this._oSelectedNode){this._oSelectedNode.setIsSelected(false);}this._oSelectedNode=n;this._oSelectedNode.setIsSelected(true);};F.prototype.addNode=function(n){this.addAggregation("nodes",n,true);this._registerNodeSelectionChangedEvent(n);this._registerNodeLabelChangedEvent(n);this._registerNodeHiddenEvent(n);return this;};F.prototype.destroyNodes=function(n){var N,a,i;N=this.getNodes();a=N.length;for(i=0;i<a;i++){this._deregisterNodeSelectionChangedEvent(N[i]);this._deregisterNodeLabelChangedEvent(N[i]);this._deregisterNodeHiddenEvent(N[i]);}this.destroyAggregation("nodes");return this;};F.prototype.removeNode=function(n){this.removeAggregation("nodes",n);if(typeof n==='number'){n=this.getNodes([n]);}this._deregisterNodeSelectionChangedEvent(n);this._deregisterNodeLabelChangedEvent(n);this._deregisterNodeHiddenEvent(n);return this;};return F;},true);