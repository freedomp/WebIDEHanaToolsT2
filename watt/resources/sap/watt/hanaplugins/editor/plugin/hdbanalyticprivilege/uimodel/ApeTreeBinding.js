/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define(	function( ) {
		    "use strict";
            jQuery.sap.require("sap.ui.model.ClientTreeBinding");
            var ClientTreeBinding = sap.ui.model.ClientTreeBinding;
		    var ApeTreeBinding = ClientTreeBinding
			    .extend("sap.watt.hanaplugins.editor.plugin.hdbanalyticprivilege.uimodel.ApeTreeBinding");

		    ApeTreeBinding.prototype.getNodeContexts = function(oContext) {

			var sContextPath = oContext.getPath();
			if (!jQuery.sap.endsWith(sContextPath, "/")) {
			    sContextPath = sContextPath + "/";
			}
			if (!jQuery.sap.startsWith(sContextPath, "/")) {
			    sContextPath = "/" + sContextPath;
			}

			var aContexts = [], that = this, oNode = this.oModel._getObject(sContextPath), oChild, aArrayNames = this.mParameters
				&& this.mParameters.arrayNames, aChildArray;

			if (oNode) {
			    if (aArrayNames && jQuery.isArray(aArrayNames)) {
				jQuery.each(aArrayNames, function(iIndex, sArrayName) {
				    aChildArray = oNode[sArrayName];
				    if (aChildArray) {
					jQuery.each(aChildArray, function(sSubName, oSubChild) {
					    that._saveSubContext(oSubChild, aContexts, sContextPath, sArrayName + "/"
						    + sSubName);
					})
				    }
				});
			    } else {
				jQuery.sap.each(oNode, function(sName, oChild) {
				    if (jQuery.isArray(oChild)) {
					jQuery.each(oChild, function(sSubName, oSubChild) {
					    that._saveSubContext(oSubChild, aContexts, sContextPath, sName + "/"
						    + sSubName);
					})
				    } else if (oChild && typeof oChild == "object") {
					that._saveSubContext(oChild, aContexts, sContextPath, sName);
				    }
				});
			    }
			}
			return aContexts;
		    };

		    ApeTreeBinding.prototype._saveSubContext = function(oNode, aContexts, sContextPath, sName) {
			if (typeof oNode == "object") {
			    var oNodeContext = this.oModel.getContext(sContextPath + sName);
			    // check if there is a filter on this level applied
			    if (this.aFilters && !this.bIsFiltering) {
				if (jQuery.inArray(oNodeContext, this.filterInfo.aFilteredContexts) != -1) {
				    aContexts.push(oNodeContext);
				}
			    } else {
				aContexts.push(oNodeContext);
			    }
			}
		    };

		    return ApeTreeBinding;

		});
