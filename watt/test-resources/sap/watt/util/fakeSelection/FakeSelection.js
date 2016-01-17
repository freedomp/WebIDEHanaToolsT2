//TODO: Cleanup duplicate/copied code by inheriting from the original selection service

define([ "sap/watt/platform/plugin/selection/service/Selection", "sap/watt/common/error/AssertError" ], function(OriginalSelectionService, AssertError) {
	"use strict";

	return jQuery.extend(OriginalSelectionService.prototype, {

		_aSelection : [],

		_oSelectionOwner : null,

		setSelection : function(aSelection) {
			this._aSelection = aSelection;
			return this.context.event.fireChanged({
				selection : this._aSelection,
				owner : this._oSelectionOwner
			});
		},

		assertOwner : function(oSelectionOwner) {
			if (!this.isOwner(oSelectionOwner)) {
				throw new AssertError("Service is not selected");
			}
			return oSelectionOwner;
		},
		
		setSelectionOwner : function(oSelectionOwner) {
			this._oSelectionOwner = oSelectionOwner;
			return this.context.event.fireChanged({
				selection : this._aSelection,
				owner : this._oSelectionOwner
			});
		},
		
		setSelectionAndOwner : function(aSelection, oSelectionOwner) {
	    	this._aSelection = aSelection;
			this._oSelectionOwner = oSelectionOwner;
			return this.context.event.fireChanged({
				selection : this._aSelection,
				owner : this._oSelectionOwner
			});
		},

		getSelection : function() {
			return Q(this._aSelection);
		},

		isOwner : function(oService) {
			return oService === this._oSelectionOwner;
		},

		getOwner : function() {
			return this._oSelectionOwner;
		},

		setOwner : function (oSelectionOwner) {
			this._oSelectionOwner = oSelectionOwner;
		},

        assertNotEmpty : function() {
            if (this._aSelection.length === 0) {
                throw new AssertError("Selection is empty");
            }
            return Q(this._aSelection);
        }

    });
});