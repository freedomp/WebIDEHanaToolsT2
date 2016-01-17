define([ ], function() {
	"use strict";
	return {

		_CHANGED_THRESHOLD_IN_MS : 2000,
		_VERSION : 1,
		_mNodes : {},
		_sSelected : "",
		_sStoredSelected : "",
		_bLinked : false,
		_scheduled : false,
		_sNode : "sap.watt.common.repositorybrowser.service.RepositoryBrowserPersistence",
		
		configure: function() {
			return this._load();
		},
		_load : function() {
			var that=this;
			return this.context.service.preferences.get(this._sNode).then(function(result) {
				if(result && result.version == that._VERSION) {
					that._mNodes = {};
					var aProms = [];
					for(var key in result.nodes){
						aProms.push(that.context.service.document.getDocumentByKeyString(result.nodes[key]).then(function(oDocument){
							if (oDocument){
								// Note the keystring from persistence could have changed, entity is repsonsible to parse compatible but we must recalculate it
								that._mNodes[oDocument.getEntity().getKeyString()] = oDocument;
							}else{
								that._changed();
							}
						}));
					}
					
					that._sStoredSelected = null;
					that._sSelected = null;
					if (result.selected){
						aProms.push(that.context.service.document.getDocumentByKeyString(result.selected).then(function(oDocument){
							if (oDocument){
								that._sStoredSelected = oDocument;
								that._sSelected = oDocument;
							}else{
								that._changed();
							}
						}));
					}
					
					that._bLinked = result.linked;
					return Q.all(aProms).then(function(){
						// If the parent of the selected is not expanded, forget it
						if (that._sStoredSelected && !that._sStoredSelected.getEntity().isRoot()) {
							return that._sStoredSelected.getParent().then(function(oParent){
								if(!oParent) {
									return;
								}
								if (!that._mNodes[oParent.getEntity().getKeyString()]){
									that._sStoredSelected = null;
									that._sSelected = null;
								}
							});
						}
					});
				}

			}).fail(function(oError) { 
				that.context.service.log.error("Workspace Persistence", oError.message, ["system"]).done();
			});
		},
				
		add: function(oDocument) {
			if (oDocument && oDocument.getEntity().getType() === "folder") {
				if (!this._mNodes[oDocument.getEntity().getKeyString()]){
					this._mNodes[oDocument.getEntity().getKeyString()] = oDocument;
					this._changed();
				}
			}
		},
		
		getNodes : function() {
			return this._mNodes;
		},

		getStoredSelected : function() {
			return this._sStoredSelected;
		},
		
		getSelected : function() {
			return this._sSelected;
		},
		
		
		getLinked : function() {
			return this._bLinked;
		},
		
		onSelectionChanged: function(oDocument) {
			this._sSelected = oDocument;
			this._changed();
		},
		
		onLinkChanged: function(oEntity) {
			// store the state of the link with repository browser
			this._bLinked = oEntity.linked;
			this._changed();
		},

		remove: function(oDocument) {
			delete this._mNodes[oDocument.getEntity().getKeyString()];
			
			for(var sKey in this._mNodes) {
				var oDoc = this._mNodes[sKey];
				if (oDocument.getEntity().contains(oDoc.getEntity())){
					delete this._mNodes[sKey];
				}
			}			
			this._changed();
		},
		
		_changed : function(){
			var that = this;
			
			if(!this._scheduled){
				setTimeout(function() {
					that._scheduled = false;					
					that.save();
				},this._CHANGED_THRESHOLD_IN_MS);	
				
				this._scheduled = true;
			}
		},
		
		save: function() {		
			var oData = {};
			oData.version = this._VERSION;
			oData.nodes = Object.keys(this._mNodes);
			oData.selected = this._sSelected && this._sSelected.length === 1 ? this._sSelected[0].document.getEntity().getKeyString() : null;//TODO which document should be saved?
			oData.linked = this._bLinked;

			this.context.service.preferences.set(oData, this._sNode).fail(function(oError) {
				console.error("repositorybrowser persistence: settings could not be written! " + oError);
			}).done();
		}		
	};
});