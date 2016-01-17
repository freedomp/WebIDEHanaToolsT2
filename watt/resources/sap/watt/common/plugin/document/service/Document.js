define([], function() {
    
	"use strict";
	
	return {
		/**
		 * @memberOf sap.watt.common.plugin.document.service.Document
		 */
		_mDocumentProvider : {},
		_mDocuments : {},

		configure : function(mConfig) {
			var that = this;
			jQuery.each(mConfig.providers, function(iIndex, mProvider) {
				that._mDocumentProvider[mProvider.type] = mProvider;
			});
		},
		
        getDocument : function(mEntity, bNoCreate) {
			var sKeyString = mEntity.getKeyString();
			//Lookup existing
			var oInstance = this._mDocuments[sKeyString];
			if (oInstance) {
				return oInstance.then(function(oDocument) {
					var mBackendData = oDocument.getEntity().getBackendData();
					mBackendData = jQuery.extend({}, mBackendData, mEntity.getBackendData());
					oDocument.getEntity().setBackendData(mBackendData);
					return oDocument;
				});
			}
			if (bNoCreate) {
				return null;
			}
			var that = this;
			var oDocumentProvider = this.getDocumentProvider(mEntity.getType());

			var oResult = oDocumentProvider.createDocumentInternally(mEntity, this.context.event);

			that._mDocuments[sKeyString] = oResult;
			return oResult;
		},
		
		getContainedDocuments : function(oDocument, bOnlyDirectChildren) {
			bOnlyDirectChildren = (bOnlyDirectChildren === true);
			
			var mProms = [];
			var mResult = [];
			var oEntity = oDocument.getEntity();
			var sParentDocumentFullPath = oEntity.getFullPath() + "/";
			// in order to return only relevant documents parent DAO name is retrieved
			// fix for a bug: 1482000376
			var sParentDocumentDAO = oEntity.getDAO();
			var aKeys = Object.keys(this._mDocuments);
			for (var i = 0; i < aKeys.length; i++) {
				var sKey = aKeys[i]; 
				var oDocumentProm = this._mDocuments[sKey];
				if (oDocumentProm) {
					this._getContainedDocument(sParentDocumentFullPath, mProms, oDocumentProm, mResult, bOnlyDirectChildren, sParentDocumentDAO);
				}
			}
			
			return Q.all(mProms).then(function() {
				return mResult;
			});
		},

		_getContainedDocument : function(sParentDocumentFullPath, mProms, oDocumentProm, mResult, bOnlyDirectChildren, sParentDocumentDAO) {
			mProms.push(oDocumentProm.then(function(oDocument2) {
				var oEntity = oDocument2.getEntity();
				var oDocumentFullPath = oEntity.getFullPath();
				var sDocumentDAO = oEntity.getDAO();
				
        		if (sDocumentDAO === sParentDocumentDAO && oDocumentFullPath.indexOf(sParentDocumentFullPath) === 0) {
        			if (bOnlyDirectChildren) {
        				if (oDocumentFullPath.replace(sParentDocumentFullPath).indexOf("/") === -1) {
        					mResult.push(oDocument2);
        				}
        			} else {
        	    		mResult.push(oDocument2);
        			}
		    	}	
		    }));
		},

		onChanged : function() {
			//TODO think about thread safety
		},
		
		onDeleted : function(oEvent) {
			var oDocument = oEvent.params.document;
			var oEntity = oDocument.getEntity();
			var sParentDocumentFullPath = oEntity.getFullPath() + "/";
			var sParentDocumentDAO = oEntity.getDAO();
			var sOldKeyString = oEntity.getKeyString();
			delete this._mDocuments[sOldKeyString];

			//Clean up document buffer and remove all contained documents
			var mProms = [this.context.service.contentManager.deleteContentData(oDocument)];
			var aKeys = Object.keys(this._mDocuments);
			for (var i = 0; i < aKeys.length; i++) {
				var sKey = aKeys[i]; 
				var oDocumentProm = this._mDocuments[sKey];
				this._deleteDocumentPromise(sParentDocumentFullPath, mProms, oDocumentProm, sKey, sParentDocumentDAO);
			}
			
			return Q.all(mProms);
		},

		_deleteDocumentPromise : function(sParentDocumentFullPath, mProms, oDocumentProm, sKey, sParentDocumentDAO) {
			var that = this;
			mProms.push(oDocumentProm.then(function(oDocument2) {
				var oEntity = oDocument2.getEntity();
				var oDocumentFullPath = oEntity.getFullPath();
				var sDocumentDAO = oEntity.getDAO();
        		if (sDocumentDAO === sParentDocumentDAO && oDocumentFullPath.indexOf(sParentDocumentFullPath) === 0) {
					delete that._mDocuments[sKey];
					// update cached content size
					return that.context.service.contentManager.deleteContentData(oDocument2);
				}
		    }));
		},

		createNew : function() {
			//TODO
			throw new Error("Not implemented");
		},

		getDocumentProvider : function(sType) {
			if (!this._mDocumentProvider[sType]) {
				throw new Error("Missing Type adapter for " + sType);
			}
			return this._mDocumentProvider[sType].documentProvider;
		},

		open : function(oDocument) {
			return this.context.event.fireRequestOpen({
				document : oDocument
			});
		},

		getDocumentByKeyString : function(keyString, bDoNotCreate) {
			bDoNotCreate = (bDoNotCreate === true);
			var oDocument = this._mDocuments[keyString];
			if (oDocument) {
				return oDocument;
			}
			
			if (bDoNotCreate) {
				return null;	
			}
			
			//By convention the key string has to start with type + ":"
			var sType = keyString.split(":")[0];
			
			var oDocumentProvider = this.getDocumentProvider(sType);
			return oDocumentProvider.getDocumentByKeyString(keyString);
		},
		
		getDocumentByPath : function(path) {
			var oDocumentProvider = this.getDocumentProvider("file");
			return oDocumentProvider.getDocument(path);
		},

		getExtDocument : function(docInfoObj) {
			var oDocumentProvider = this.getDocumentProvider("file");
			return oDocumentProvider.createExtDocumentInternally(docInfoObj, this.context.event).then(function(oDocument) {
				oDocument._bExtDoc = true;
				return oDocument;
			});
		},
		
		notifyExternalChange : function(oDocument, sOperation) {
		    var oParams = {document : oDocument};
		    if (sOperation) {
		        oParams.operation = sOperation;
		    }
			return this.context.event.fireExternalChanged(oParams);
		}
	};
});