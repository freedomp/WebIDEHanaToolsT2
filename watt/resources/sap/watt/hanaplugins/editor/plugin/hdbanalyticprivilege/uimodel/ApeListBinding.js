/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define( function() {
	jQuery.sap.require("sap.ui.model.ChangeReason");
	jQuery.sap.require("sap.ui.model.ClientListBinding");
    var ChangeReason = sap.ui.model.ChangeReason;
    var ClientListBinding = sap.ui.model.ClientListBinding;
    var ApeListBinding = ClientListBinding.extend("sap.watt.hanaplugins.editor.plugin.hdbanalyticprivilege.uimodel.ApeListBinding");
    ApeListBinding.prototype.getContexts = function(iStartIndex, iLength) {
	this.iLastStartIndex = iStartIndex;
	this.iLastLength = iLength;

	if (!iStartIndex) {
	    iStartIndex = 0;
	}
	if (!iLength) {
	    iLength = Math.min(this.iLength, this.oModel.iSizeLimit);
	}

	var aContexts = this._getContexts(iStartIndex, iLength), oContextData = {};

	if (this.bUseExtendedChangeDetection) {

	    for (var i = 0; i < aContexts.length; i++) {
		oContextData[aContexts[i].getPath()] = aContexts[i].getObject();
	    }

	    // Check diff
	    if (this.aLastContexts && iStartIndex < this.iLastEndIndex) {
		var that = this;
		var aDiff = jQuery.sap.arrayDiff(this.aLastContexts, aContexts, function(oOldContext, oNewContext) {
		    return jQuery.sap.equal(oOldContext && that.oLastContextData
			    && that.oLastContextData[oOldContext.getPath()], oNewContext && oContextData
			    && oContextData[oNewContext.getPath()]);
		});
		aContexts.diff = aDiff;
	    }

	    this.iLastEndIndex = iStartIndex + iLength;
	    this.aLastContexts = aContexts.slice(0);
	    this.oLastContextData = jQuery.extend(true, {}, oContextData);
	}

	return aContexts;
    };

    ApeListBinding.prototype.update = function() {
	var oList = this.oModel._getObject(this.sPath, this.oContext);
	if (oList && jQuery.isArray(oList)) {
	    if (this.bUseExtendedChangeDetection) {
		this.oList = jQuery.extend(true, [], oList);
	    } else {
		this.oList = oList.slice(0);
	    }
	    this.updateIndices();
	    this.applyFilter();
	    this.applySort();
	    this.iLength = this._getLength();
	} else {
	    this.oList = [];
	    this.aIndices = [];
	    this.iLength = 0;
	}
    };

    ApeListBinding.prototype.checkUpdate = function(bForceupdate) {
	this.update();
	this._fireChange({
	    reason : ChangeReason.Change
	});
    };    
    
    
    return ApeListBinding;

});
