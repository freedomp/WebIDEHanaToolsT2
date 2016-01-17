define(function() {
    
	"use strict";
	
	return {
		_bHidden : true,
		_sUnhideParameter : null,
		_UNHIDE_ALL : "all",
		_UNHIDE_DEFAULT : "default",
		_sNode : "sap.watt.platform.filefilter.FileFilterHide",
		_oFilters : {"" : {alwaysHidden : false, defaultHidden : false}}, // root folder always shown
		_oProjectTypeToRegExpMap : {},
		_UNHIDE_PARAM_NAME : "sap-ide-unhide", 
		_oProjectToProjectTypesMap : {},

		init : function() {
			// set unhide parameter if defined
			var sUnhideParameter = jQuery.sap.getUriParameters().get(this._UNHIDE_PARAM_NAME);
			if (sUnhideParameter) {
				sUnhideParameter = sUnhideParameter.toLowerCase();
				if (sUnhideParameter === this._UNHIDE_ALL || sUnhideParameter === this._UNHIDE_DEFAULT) {
					this._sUnhideParameter = sUnhideParameter;
				}	
			}
		},
		
		configure : function() {
			var that = this;
			
			return this._initRegExp().then(function() {
				// get latest hide/unhide state from the user preferences
				return Q.spread([that.context.service.preferences.get(that._sNode), that._initProjectToProjectTypes()], function(result) {
					// if the lates state was unhide --> all default hidden documents will be unhidden
					if (result && result.hidden === false) {
						return that.unhideDocuments();
					}
				});
			});
		},
		
		_setProjectProjectTypes : function(oProjectDocument) {
			var that = this;

			return this.context.service.filefilter.getProjectTypeService().then(function(oProjectTypeService) {
				return oProjectTypeService.getProjectTypes(oProjectDocument).then(function(aProjectTypes) {
					that._oProjectToProjectTypesMap[oProjectDocument.getEntity().getFullPath()] = aProjectTypes;
				});
			});
		},
		
		_initProjectToProjectTypes : function() {
			var that = this;
			var aPromises = [];
			
			return this.context.service.filesystem.documentProvider.getRoot().then(function(oRootDocument) {
				return oRootDocument.getFolderContent().then(function(aProjectDocuments) {
					for (var p = 0; p < aProjectDocuments.length; p++) {
						var oProjectDocument = aProjectDocuments[p];
						aPromises.push(that._setProjectProjectTypes(oProjectDocument));
					}
					
					return Q.all(aPromises);
				});	
			});	
		},
		
		_initRegExp : function() {
			var that = this;
			// get plugins hidden configurations from filefilter service
			return this.context.service.filefilter.getHiddenConfiguration().then(function(oHiddenConfiguration) {
				// get always hidden regexps by project type
				var aAlwaysHidden = oHiddenConfiguration.alwaysHidden;
				that._createProjectTypeToRegExpMap(aAlwaysHidden, "alwaysHidden");
				// get default hidden regexps by project type
				var aDefaultHidden = oHiddenConfiguration.defaultHidden;
				that._createProjectTypeToRegExpMap(aDefaultHidden, "defaultHidden");
			});
		},
		
		_createProjectTypeToRegExpMap : function(aHidden, sHiddenType) {
			if (aHidden.length > 0) {
				var oHiddenMap = {};
			
				for (var i = 0; i < aHidden.length; i++) {
					var oHidden = aHidden[i];
					var aProjectTypes = oHidden.projectTypes || ["other"];
					for (var pt = 0; pt < aProjectTypes.length; pt++) {
						var sProjectType = aProjectTypes[pt];
						
						var aRegExps = oHidden.regExps;
						for (var re = 0; re < aRegExps.length; re++) {
							var sRegExp = aRegExps[re];
							try {
								RegExp(sRegExp); // test if valid
								var sProjectTypeRegExp = oHiddenMap[sProjectType];
								if (sProjectTypeRegExp) {
									sProjectTypeRegExp = sProjectTypeRegExp.concat("|").concat(sRegExp);
									oHiddenMap[sProjectType] = sProjectTypeRegExp;
								} else {
									oHiddenMap[sProjectType] = sRegExp;
								}
							} catch (oError) {
								this.context.service.log.warn("_filefilter.hide", oError.message, ["user"]).done();
							}
						}
					}
				}
				
				aProjectTypes = Object.keys(oHiddenMap);
				for (pt = 0; pt < aProjectTypes.length; pt++) {
					sProjectType = aProjectTypes[pt];
					sRegExp = oHiddenMap[sProjectType];
					oHiddenMap[sProjectType] = new RegExp(sRegExp);
				}
				this._oProjectTypeToRegExpMap[sHiddenType] = oHiddenMap;
			}
		},
		
		onUpdateProjectTypes : function(oEvent) {
			var oProjectDocument = oEvent.params.projectDocument;
			this._updateProjectFiltersAndDocuments(oProjectDocument).done();
		},
		
		_isPathHidden : function(sPath) {
			var oFilter = this._getFilter(sPath);
			
			if (oFilter.alwaysHidden) {
				return true;// alwyas hidden files must be hidden 
			} 
			
			if (this._sUnhideParameter === this._UNHIDE_DEFAULT || !this.getHiddenState()) {
				// default hidden files are not hidden or 
				// default hidden files are shown , false means that default files are shown
				return false; 
			}
			// in this case defaultHidden property of the fileter is returned. It may be true or false			
			return oFilter.defaultHidden;
		},
		
		isHidden : function(aFullPathes) {
			var that = this;
			var oResult = {};
			// initially set all files/folders to be not hidden
			for (var i = 0; i < aFullPathes.length; i++) {
				var sFullPath = aFullPathes[i];
				oResult[sFullPath] = false;
			}
			// in case unhide parameter is "all", set all files/folders to be not hidden	
			if (this._sUnhideParameter === this._UNHIDE_ALL) {
				return oResult;
			}
			
			for (var p = 0; p < aFullPathes.length; p++) {
				var sPath = aFullPathes[p];
				oResult[sPath] = that._isPathHidden(sPath);
			}
			
			return oResult;
		},
		
		_changeDocumentHiddenProperty : function(oDocument, bHidden) {
			var sPath = oDocument.getEntity().getFullPath();
			var oFilter = this._getFilter(sPath);
			if (oFilter && oFilter.defaultHidden) {
				return oDocument.setHidden(bHidden);
			}
		},
		
		_updateFolderDocuments : function(oFolderDocument) {
			var that = this;
			
			return this.context.service.document.getContainedDocuments(oFolderDocument).then(function(aDocuments) {
				var aPaths = [];
				var aPromises = [];
				// get folder path
				aPaths.push(oFolderDocument.getEntity().getFullPath());
				// get folder children paths
				for (var d = 0; d < aDocuments.length; d++) {
					var oDocument = aDocuments[d];
					aPaths.push(oDocument.getEntity().getFullPath());
				}
				
				var aHiddenResults = that.isHidden(aPaths);
				for (d = 0; d < aDocuments.length; d++) {
					oDocument = aDocuments[d];
					var bHidden = aHiddenResults[d];
					aPromises.push(oDocument.setHidden(bHidden));
				}
				
				return Q.all(aPromises);
			});
		},
		
		_handleDocuments : function(bHidden) {
			var that = this;
			
			return this.context.service.document.getDocumentByPath("").then(function(oRootDocument) {
				return that.context.service.document.getContainedDocuments(oRootDocument).then(function(aDocuments) {
					var aPromises = [];
					
					for (var d = 0; d < aDocuments.length; d++) {
						var oDocument = aDocuments[d];
						aPromises.push(that._changeDocumentHiddenProperty(oDocument, bHidden));
					}
					
					return Q.all(aPromises).then(function() {
						that._bHidden = bHidden;
					});
				});
			});
		},
		
		_getProjectPath : function(sPath) {
			var nIndexOfSlash = sPath.indexOf("/", 1);
			if (nIndexOfSlash === -1) {
				return sPath;
			} 
			
			return sPath.substr(0, nIndexOfSlash);
		},
		
		_getProjectTypes : function(sPath) {
			var sProjectPath = this._getProjectPath(sPath);
			return this._oProjectToProjectTypesMap[sProjectPath];
		},
		
		_addFilter : function(sPath) {
			var that = this;
			var oFilter = {};
			
			var oAlwaysHiddenMap = that._oProjectTypeToRegExpMap.alwaysHidden;
			var oDefaultHiddenMap = that._oProjectTypeToRegExpMap.defaultHidden;
			var oAlwaysHiddenOtherTypeRegExp = (oAlwaysHiddenMap && oAlwaysHiddenMap.other) ? oAlwaysHiddenMap.other : null;
			var oDefaultHiddenOtherTypeRegExp = (oDefaultHiddenMap && oDefaultHiddenMap.other) ? oDefaultHiddenMap.other : null;
			// all types is always hidden
			oFilter.alwaysHidden = oAlwaysHiddenOtherTypeRegExp && oAlwaysHiddenOtherTypeRegExp.test(sPath);
			// all types is default hidden
			oFilter.defaultHidden = oDefaultHiddenOtherTypeRegExp && oDefaultHiddenOtherTypeRegExp.test(sPath);
			// if always hidden for all types
			if (oFilter.alwaysHidden) {
				this._oFilters[sPath] = oFilter;
				return oFilter;
			}
			
			var aProjectTypes = this._getProjectTypes(sPath);
			// calculate always hidden for cirtain project type
			oFilter.alwaysHidden = that._calculateHidden(aProjectTypes, oAlwaysHiddenMap, sPath);
			if (oFilter.alwaysHidden) {
				that._oFilters[sPath] = oFilter;
				return oFilter;
			}
			// if default hidden for all project types
			if (oFilter.defaultHidden) {
				that._oFilters[sPath] = oFilter;
				return oFilter;
			}
			// calculate default hidden for cirtain project type
			oFilter.defaultHidden = that._calculateHidden(aProjectTypes, oDefaultHiddenMap, sPath);
			
			that._oFilters[sPath] = oFilter;
			return oFilter;
		},
		
		_calculateHidden : function(aProjectTypes, oHiddenMap, sPath) {
			aProjectTypes = aProjectTypes || [];
			for (var i = 0; i < aProjectTypes.length; i++) {
				var sProjectType = aProjectTypes[i].id;
				var oHiddenRegExp = oHiddenMap[sProjectType];
				var bHidden = oHiddenRegExp && oHiddenRegExp.test(sPath);
				if (bHidden) {
					return true;	
				}
			}
			
			return false;
		},
		
		_getFilter : function(sPath) {
			if (this._oFilters[sPath]) {
				return this._oFilters[sPath];
			}
			
			return this._addFilter(sPath);
		},
		
		_updateProjectFiltersAndDocuments : function(oProjectDocument) {
			var that = this;
			// save project types for a project
			return this._setProjectProjectTypes(oProjectDocument).then(function() {
				// create/update filters for the project children
				return that._updateFolderFilters(oProjectDocument).then(function() {
					// update hidden property of the project existing document 
					return that._updateFolderDocuments(oProjectDocument);
				});
			});
		},
		
		addFilters : function(oEvent) {
			var that = this;
			
			var oDocument = oEvent.params.document;
			var oEntity = oDocument.getEntity();
			if (oEntity.isProject()) {
				this._updateProjectFiltersAndDocuments(oDocument).done();
			} else if (oEntity.isFile()) {
				// add/update filter of the file document
				that._updateFileFilter(oEntity);
			} else { // folder
				// add/update filters of a folder childrens
				that._updateFolderFilters(oDocument).then(function() {
					return that._updateFolderDocuments(oDocument);
				}).done();	
			}
		},
		
		_updateFileFilter : function(oFileDocumentEntity) {
			var sPath = oFileDocumentEntity.getFullPath();
			// add or update the sPath filter
			return this._addFilter(sPath);
		},
		
		_updateFolderFilters : function(oFolderDocument) {
			var that = this;
			
			if (oFolderDocument.getCurrentMetadata) { // for tests
				return oFolderDocument.getCurrentMetadata(true).then(function(aMetadata) {
					for (var i = 0; i < aMetadata.length; i++) {
						var oMetadata = aMetadata[i];
						that._addFilter(oMetadata.path);
					}
				});	
			}
			
			return Q();
		},
		
		// delete a filter by path
		_deleteFilter : function(sPath) {
			delete this._oFilters[sPath];
		},
		
		// deletes filters of deleted documents
		deleteFilters : function(oEvent) {
			var oDocument = oEvent.params.document;
			// delete filter of a document defined in event
			var oEntity = oDocument.getEntity();
			this._deleteFilter(oEntity.getFullPath());
			// if the document is a folder delete filters of all its children
			if (oEntity.isFolder()) {
				var sFolderFullPath = oEntity.getFullPath() + "/";
				var aPaths = Object.keys(this._oFilters);
				for (var i = 0; i < aPaths.length; i++) {
					var sPath = aPaths[i];
					if (sPath.indexOf(sFolderFullPath) === 0) {
						this._deleteFilter(sPath);
					}
				}
			}
		},
		
		// save hidden state in user preferences
		_saveHidden : function(bHidden) {
			var oData = {};
			oData.hidden = bHidden;
			return this.context.service.preferences.set(oData, this._sNode);
		},
		
		_executeDocumentsChange : function(bHidden) {
			return Q.all([this.context.service.filefilter.context.event.fireHiddenChanged({hidden : bHidden}), this._handleDocuments(bHidden), this._saveHidden(bHidden)]);
		},
		
		hideDocuments : function() {
			return this._executeDocumentsChange(true);
		},
		
		unhideDocuments : function() {
			return this._executeDocumentsChange(false);
		},
		
		getHiddenState : function() {
			return this._bHidden;
		},
		
		supportParameterExists : function() {
			return this._sUnhideParameter !== null;
		}
	};
});