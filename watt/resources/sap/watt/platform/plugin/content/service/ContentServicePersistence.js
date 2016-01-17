define(["sap/watt/common/error/AssertError" ], function(AssertError) {
	"use strict";

		return {
	
			_CHANGED_THRESHOLD_IN_MS : 2000,
			_VERSION : "1",
			_aTabs : [],
			_oActiveTab : null,
			_scheduled : false,
			_sNode : "sap.watt.common.content.service.ContentServicePersistence",
			
			configure: function(mConfig) {
				var that = this;
				return this._load();
			},
			
			_load : function() {
				var that=this;
				
				
				// here we need no done, because we return the promise
				return this.context.service.preferences.get(this._sNode).then(function(result) {
					if (result && result.version == that._VERSION) {
	
							if ($.isArray(result.tabs)) {
								that._aTabs = result.tabs;
								
								// because of migration bugs duplicates could exist								
								that._removeDuplicates();
								
								// check if active tab still exits in the tab list
								// because this is not explicitly handled every time when
								// removing an entry from the tab list
								
								// do not set {} instead of null!! otherwise getDocumentFromKeystring
								// will fail!
								if(result.activetab) {
									if(that._exists(result.activetab.keystring, result.activetab.editor) === -1) {
										that._oActiveTab = null;
										// persist changes
										that._scheduleSave();
									} else {
										that._oActiveTab = result.activetab;
									}
								} else {
									// nothing to save because already null
									that._oActiveTab = null;
								}	

							} else {
								that.clear();
							}
						}
					}).fail(function(oError) { 
						that.context.service.log.error("Content Persistence", oError.message, ["system"]).done();
				});
	
			},
			
			_removeDuplicates : function() {
				// due to a bug it could happen that there are duplicates stored
				// those files are then also tried to be opened twice
				// so we remove them and save the new correct values afterwards
				var bFoundDuplicates = false;
				
				for ( var i = 0; i < this._aTabs.length; i++) {

					// from this starting point check if there are 
					// duplicates in the remaining array
					for ( var j = i+1; j < this._aTabs.length; j++) {
						if (this._aTabs[i].keystring  === this._aTabs[j].keystring && 
							this._aTabs[i].editor === this._aTabs[j].editor) {
								this._aTabs.splice(j,1);
								bFoundDuplicates = true;
						}
					}
				}
				
				if(bFoundDuplicates) {
					this._scheduleSave();
				}
				
			},
					
			_exists : function(sKeyString, sEditor){
				for (var i = 0; i < this._aTabs.length; i++) {
					if (sKeyString === this._aTabs[i].keystring && sEditor === this._aTabs[i].editor) {
						return i;
					}
				}
				return -1;
			},
			
			add: function(oEntity, iIndex) {
				var that = this;
				
				if ( (typeof oEntity.keyString !== "string") || 
					 (typeof oEntity.editor !== "string") ) {
					throw new AssertError("Just string values to be added to persistence in content service persistence.");
				} 
				
				var oData = {
					keystring : oEntity.keyString,
					editor : oEntity.editor
				};
				if (that._exists(oEntity.keyString, oEntity.editor) === -1) {
					if (iIndex && iIndex < that._aTabs.length) {
						that._aTabs.splice(iIndex, 0, oData);
					} else {
						that._aTabs.push(oData);
					}
					that._scheduleSave();
				}
			},
			
			getTabs : function() {
				// do NOT return original array reference,
				// otherwise you could manipulate private data
				var aTabs = [];
				if(jQuery.isArray(this._aTabs)) {
					aTabs = this._aTabs.slice(0);
				}
				return aTabs;
			},
			
			getActiveTab : function() {
				return this._oActiveTab;
			},
	
			setActiveTab : function(oEntity) {
				if(oEntity) {
					this._oActiveTab = { 
							editor : oEntity.editor, 
							keystring : oEntity.keyString
					};
				}
				this._scheduleSave();
			},
			
			remove: function(oEntity) {
				var that = this;
	
				var iIdx = that._exists(oEntity.keyString, oEntity.editor);
				if (iIdx !== -1) {
					// console.log("Removing: ", oEntity.keyString, oEntity.editor);
					this._aTabs.splice(iIdx,1);
				}
				this._scheduleSave();
			},
			
			clear: function() {
				// remove all tabs and active tab
				this._aTabs = [];
				this._oActiveTab = null;
				this._save();
			},
			
			_scheduleSave : function(){
				var that = this;
				
				if(!this._scheduled){
					setTimeout(function() {
						that._scheduled = false;					
						that._save();
					},this._CHANGED_THRESHOLD_IN_MS);	
					
					this._scheduled = true;
				}
			},
			
			_save: function() {		
				var oData = {};
				oData.version = this._VERSION;
				oData.tabs = this._aTabs;
				oData.activetab = this._oActiveTab;

				//console.log("SAVING");
				this.context.service.preferences.set(oData, this._sNode).fail(function(oError) {
					console.error("content persistence: settings could not be written! " + oError);
				});
			}		
		};
});