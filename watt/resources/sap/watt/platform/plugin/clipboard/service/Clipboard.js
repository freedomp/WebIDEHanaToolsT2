define([ "sap/watt/common/error/AssertError" ], function(AssertError) {
	"use strict";
	return {

		_oClipboardEntry : {
			entities : null, // an array of entities
			source : null
		},

		addEntity : function(oEntities, oSource) {
			if (oEntities === undefined) {
				throw new Error("Error in Clipboard Service usage. Entity may neither be null nor undefined.");
			}

			this._oClipboardEntry.entities = oEntities;
			this._oClipboardEntry.source = oSource || undefined;
		},

		removeEntity : function() {
			this._oClipboardEntry = {
                entities : null,
				source : null
			};
		},

		onDocumentDeleted : function(oEvent) {
			var oDocumentEntity = oEvent.params.document.getEntity();
            var oEntities = this._oClipboardEntry.entities;
            if (oEntities){
				for ( var i = 0; i < oEntities.length; i++) {
					if (oEntities[i].document.getEntity() == oDocumentEntity) {
						this.removeEntity();
						return;
					}
				}
			}
		},

		getEntity : function() {
			return this._oClipboardEntry.entities;
		},

		getSource : function() {
			return this._oClipboardEntry.source;
		},

		getClipboardEntry : function() {
			return this._oClipboardEntry;
		},

		assertEntityNotEmpty : function() {
			if (!this.getEntity()) {
				throw new AssertError("Entity is empty");
			}
			return this.getEntity();
		},

		assertSourceNotEmpty : function() {
			if (!this.getSource()) {
				throw new AssertError("Source is empty");
			}
			return this.getSource();
		}
	};
});