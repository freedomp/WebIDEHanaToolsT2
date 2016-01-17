define([ "sap/watt/common/plugin/platform/service/ui/AbstractPart", "sap/watt/lib/lodash/lodash"], function(AbstractPart, lodash) {
	"use strict";

	var _ = lodash;

	var FileSearchImpl = AbstractPart.extend("sap.watt.platform.plugin.filesearch.service.FileSearchImpl", {

		FILES_PER_LOADING : 10,
		MAX_COLUMNS_FOR_PREVIEW : 200,
		_oCriteria : null,
		_oView : null,
		_oController : null,
		_oFileService : null,
		
		// All search results returned from server
		_searchResults: [],
		_numSearchResultsFound: 0,

		configure : function(mConfig) {
			this._aStyles = mConfig.styles;
		},

		init : function() {
			this._oFileService = this.context.service.filesystem.documentProvider;
		},

		getContent : function() {
			var that = this;
			if (!that._oView) {
				that._oView = sap.ui.view({
					viewName : "sap.watt.platform.plugin.filesearch.view.FileSearch",
					type : sap.ui.core.mvc.ViewType.XML,
					viewData: {
						context: this.context
					}
				});
				that._oController = that._oView.getController();
				that._oController.setServices(that.context.service);
			}
			if (this._aStyles) {
				return this.context.service.resource.includeStyles(this._aStyles).then(function() {
					return that._oView;
				});
			}
			return this._oView;
		},

		getFocusElement : function() {
			if(this._oView) {
				return this._oView;
			}
			return this.getContent();
		},

		/** retrieves previos search results
		 */
		previous: function() {
		   if (this._searchResults.length === 0 || this._oCriteria.nStart === 0)
		   {
		        return [];   
		   }    
		   else
		   {
		       this._oCriteria.nStart = this._oCriteria.nStart - this.FILES_PER_LOADING;
		       return this._returnSearchResults(this._oCriteria.nStart);
		   }
		},

		/** perform searching and show result
		 * if oCriteria is undefined, then load more result based on last oCriteria
		 */
		search : function(oCriteria) {
			var oDeferred = Q.defer();
			var that = this;
			if (oCriteria === undefined) {
				// more result
				oCriteria = {
					"bContentSearch" : this._oCriteria.bContentSearch,
					"nStart" : this._oCriteria.nStart + this.FILES_PER_LOADING,
					"sFileType" : this._oCriteria.sFileType,
					"sFolderName" : this._oCriteria.sFolderName,
					"sSearchTerm" : this._oCriteria.sSearchTerm
				};
				
				if (oCriteria.nStart < this._searchResults.length)
				{
				    // return this 'more' search from _searchResults
				    this._oCriteria.nStart = this._oCriteria.nStart + this.FILES_PER_LOADING;
				    var next = this._returnSearchResults(this._oCriteria.nStart);
                    oDeferred.resolve(next);
                    return oDeferred.promise;
				}
			}
			
			oCriteria.nRows = this.FILES_PER_LOADING;
			var sSearchTerm = oCriteria.sSearchTerm;
			var bContentSearch = oCriteria.bContentSearch;
			if (!sSearchTerm.length > 0) {
				oDeferred.reject();
			} else {
				that._findFile(oCriteria).then(function(oResultsList) {
					that._oCriteria = oCriteria;
					if (oCriteria.nStart === 0 ) 
					{
						//new search, reset list
						that._searchResults = [];
					}
					that._numSearchResultsFound = oResultsList.numFound;
					var promises = [];
					for (var i = 0; i < oResultsList.aFileEntries.length; i++) {
						promises.push(that._updateSearchResultsForItem(oResultsList.aFileEntries[i], i, oCriteria));
                    }
                    
                    Q.allSettled(promises).then(function() {
    					oDeferred.resolve(that._returnSearchResults(oCriteria.nStart));
                    });
				}, function(oError){
					console.log("search: " + oError.message);
					sap.ui.commons.MessageBox.alert(oError.message,null, oError.name);
				}).done();
			}
			return oDeferred.promise;
		},
		_showMoreButton : function(bVisible) {
			if (this._oController) {
				this._oController.showMoreButton(bVisible);
			}
		},
		/**
		 * Update Server search results with the last search
		 */
		_updateSearchResultsForItem : function(aListItem, aListItemIdx, oCriteria) {
		    var oDeferred = Q.defer();
		    var that = this;
		    var sFullPath = aListItem.getEntity().getFullPath();
            var oItem = {
                sFullPath : sFullPath,
                sText : that._truncateFilename(sFullPath, 2),
                oFileDocument : aListItem,
                iMathes : -1
            };
			//update list
			that._searchResults[aListItemIdx + oCriteria.nStart] = oItem;
			
			if (oCriteria.bContentSearch){
	   	        this._buildResultItem(aListItem, oCriteria.sSearchTerm).then(function(aResultItems){
	   	        	oItem.items = aResultItems;
					oItem.iMathes = aResultItems.length;
	        		oDeferred.resolve();       
				});
			}
			else{
				oDeferred.resolve();
			}
			return oDeferred.promise;
		},
		
		_returnSearchResults : function(idx) {
			var returnedResults = [];
			var endindex = this._calcEndIndex(this._numSearchResultsFound, idx);
			var numItems = endindex - idx;
			 
			// TODO replace with .subArray library function...
            for (var i = 0; i < numItems; i++) {
                returnedResults[i] = this._searchResults[idx + i];
            }
           
            var ret =  
            {
        	    "aList" : returnedResults,
        		"sSearchTerm" : this._oCriteria.sSearchTerm,
        		"bContentSearch" : this._oCriteria.bContentSearch,
        		"numFound" : this._numSearchResultsFound,
        		"startindex" : idx + 1,
        		"endindex" : endindex
        	};
        	return ret;
		},
		_calcEndIndex : function(len, startIndex) {
    	    return 	(len < startIndex + this.FILES_PER_LOADING) ? len : startIndex + this.FILES_PER_LOADING;
		},
		
		
		/** Finds the files via the file service
		 * @param oInput the eearch criteria
		 * 		oInput.sSearchTerm the search term
		 * 		oInput.bContentSearch indicator whether the search should be on file content (true) or on file name (false)
		 *		oInput.sFolderName the folder name in which the search should be performed (if null, the search is done in the complete workspace)
		 *		oInput.sFileType specify the file name pattern(e.g *.js) to perform the search in (if null, the search is done in all files)
		 * @returns the deferred promise containing the array of matching file entries
		 */
		_findFile : function(oInput) {
			var that = this;

			return this.context.service.content.isDirty().then(function(bDirty) {
				if (bDirty) {
					sap.ui.commons.MessageBox.alert(that._getText("fileSearch_searchondirty"),
						undefined, that._getText("fileSearch_search"));
				}

				return that.context.service.progress.startTask(that._getText("fileSearch_search"), that._getText("fileSearch_searching"))
					.then(function (iProgressId) {
						return that._oFileService.search(oInput)
							.fail(function (oError) {
								console.log(oError);
								throw new Error(oError); 
							})
							.fin(function(){
								that.context.service.progress.stopTask(iProgressId).done();
							});
					});
			});
		},

		_getText : function(id) {
			var i18n = this.context.i18n;
			return i18n.getText("i18n", id);
		},

		replace : function(oFileDocument, sWith, nIndex) {
			var oDeferred = Q.defer();
			var sTerm = this._oCriteria.sSearchTerm;
			oFileDocument.getContent().then(function(sContent){
				var sResult = null;
				if(nIndex === undefined) {
				  // replace all
				  sResult = sContent.split(sTerm).join(sWith);
				} else {
					sResult = sContent.substr(0, nIndex) + sWith 
							+ sContent.substr(nIndex + sTerm.length);
				}
				if(sResult !== null) {
					oFileDocument.setContent(sResult).then(function(){
						oFileDocument.save().then(function(oResult){
							oDeferred.resolve(oResult);
						}).done();
					}).done();
				}

			}).done();
			return oDeferred.promise;
		},
		
		replaceAll : function(sReplaceWith) {
			var that = this;
			var oCriteria = this._oCriteria;
			var aPromises = [];
			if(oCriteria) {
				oCriteria.nStart = 0;
				oCriteria.nRows = 99999;
				this._findFile(oCriteria).then(function(aList) {
					for(var n = 0; n < aList.aFileEntries.length; n++) {
						aPromises.push(that.replace(aList.aFileEntries[n], sReplaceWith));
					}
					var sResultText = aPromises.length + " " + that._getText("fileSearch_replaceAll_result");
					var sReplaceAll = that._getText("fileSearch_replaceAll");
					var sProgress = that._getText("fileSearch_replaceprogress");
					var oDlg = new sap.ui.commons.Dialog({
						title : sReplaceAll,
						"modal" : true
					});
					oDlg.addContent(new sap.ui.commons.TextView({
						text : sProgress
					}));
					oDlg.open();
					Q.all(aPromises).then(function(aResults){
						oDlg.close();
						sap.ui.commons.MessageBox.alert(sResultText,function(){
							// clear result
							if (that._oController) {
								that._oController.clearResults();
							}
							// hide busy dialog
						},sReplaceAll);
					}).done();
				}, function(error){
					console.log("replaceAll: " + error.message);
				}).done();
			}
		},
		
		onDocumentSelected : function(oEvent) {
			var that = this;
			var oOwner = oEvent.params.owner;
			if (oOwner && oOwner.instanceOf("sap.watt.common.plugin.aceeditor.service.Editor")) {							
				if (that._oController){
					if (that._oController._oAceeditorService!=oOwner){ 
						that._oController._oAceeditorService=oOwner;	
						/* 
						//Todo: This should work after editor factory
						oOwner.getUI5Editor().then( function(oUI5Editor){
								if (oUI5Editor){																					
									that._oController.highlightTerm(oUI5Editor);
								}
						}).done();
						*/
					}					
					
					//Todo: this should be removed after editor factory?
					if (oEvent.params.selection[0] &&  oEvent.params.selection[0].document) {
						var oCurrentDocument =  oEvent.params.selection[0].document;
						if (that._oController._oDocument !== oCurrentDocument){
							that._oController._oDocument = oCurrentDocument;																	
							oOwner.getUI5Editor().then( function(oUI5Editor){
									if (oUI5Editor){																								
										that._oController.highlightTerm(oUI5Editor);
									}
							}).done();
						}
					}
				}
			} 
			if(this.isVisible() && oOwner.instanceOf("sap.watt.common.service.ui.Browser")) {
				var oDocument = oEvent.params.selection[0] ? oEvent.params.selection[0].document : undefined;
				if (oDocument) {
					that._oController.setCurrentFolder(oDocument);
				}
			}
		},
		
		onVisibleChanged : function(oEvent) {
			var selectionService = this.context.service.selection;
			var that = this;
			if(oEvent.params.visible) {
				selectionService.getSelection().then(function(aSelection) {
					if(aSelection.length > 0) {
						var oDocument = aSelection[0].document;
						if (oDocument && that._oController) {
							that._oController.setCurrentFolder(oDocument);
							that._oController.clearResults();
						}						
					}
				}).done();
			}
		},
		onSplitterPositionChanged : function(oEvent) {
			if(this.isVisible() && this._oView) {
				// re-render, to re-calculate the height of accordian
				this._oView.invalidate();
			}
		},

		_isDocumentInSearchResults: function(sDocumentFullPath) {
			return _.findIndex(this._searchResults[i], function(item){
				return item.sFullPath === sDocumentFullPath;
			}) !== -1;
		},

		onDocumentChanged: function(oEvent) {
			var sDocumentFullPath = oEvent.params.document ? oEvent.params.document.getEntity().getFullPath() : "";
			if (this.isVisible() && this._oController && this._isDocumentInSearchResults(sDocumentFullPath)) {
				if (oEvent.params.changeType === "content" && !oEvent.params.options.source) {
					// one by one replacing
					return Q();
				}
				this._oController.clearResults();
			}
			return Q();
		},

    	_buildResultItem : function(oFileDocument, sTerm) {
    		var aResults = [];
    		var nStart = -1;
    		var that = this;
    		return oFileDocument.exists().then(function(bExist) {
    			if(bExist) {
    				return oFileDocument.getContent().then(function(sContent) {
    					if (sContent && sTerm) {
    						var smallContent = sContent.toLowerCase();
    						var lines = sContent.split(/\r\n|\r|\n/);
    						var t = sTerm.toLowerCase();
    						for ( var n in lines) {
    							var index = lines[n].toLowerCase().indexOf(t, 0);
    							while (index >= 0) {
    								nStart = smallContent.indexOf(t, nStart + 1);
    								
    								var oFileSearchLine = {
    								    sReplace : that._getText("fileSearch_replace"),
    								    sText : lines[n],
    								    nLine : parseInt(n),
    								    iIndex : index,
    								    sPreview : "",
    								    cols : 0,
    								    rows : 1,
    								    nStart : nStart
    								};
    								
    								that._fillPreviewForSearch(oFileSearchLine, lines);
                            	    
    								aResults.push(oFileSearchLine);
    								index = lines[n].toLowerCase().indexOf(t, index + 1);
    							}
    						}
    						return Q(aResults);
    					}
    					else
    					{
    					    return Q(undefined);   
    					}
    				});
    			} else {
    				return Q(undefined);
    			}
    		}).fail(function(error)
    		{
    		    return Q(error);
    		});
    	},
    	
    	_fillPreviewForSearch : function(oNode, lines){
    	    for (var m = oNode.nLine - 3; m <= oNode.nLine + 3; m++) {
    			if (m >= 0 && lines[m]) {
    				var s = lines[m].replace(/ {1,}/g, " ").replace(/\t/g, " ");
    				if (s.length > oNode.cols) {
    					oNode.cols = s.length > this.MAX_COLUMNS_FOR_PREVIEW ? this.MAX_COLUMNS_FOR_PREVIEW : s.length;
    				}
    				oNode.sPreview += oNode.sPreview === "" ? s : "\n" + s;
    				oNode.rows++;
    			}
    		}
    	},
    	
    	_truncateFilename : function(sName, nLevel) {
    		var idx = sName.lastIndexOf("/");
    		for (var n = 0; n < nLevel; n++) {
    			idx = sName.lastIndexOf("/", idx - 1);
    		}
    		if (idx > 0) {
    			return "..." + sName.substr(idx);
    		}
    		return sName;
    	}
		
	});

	return FileSearchImpl;

});