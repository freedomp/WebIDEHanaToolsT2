define(["sap/watt/lib/lodash/lodash"], function (_) { 
	"use strict";
	
	return {
    	_maxFileSizeInBytesPromise : undefined,
    	_oModel : null,
    	_oRepositoryBrowserControl : null,
    	_oFileUploader : null,
    	_oImportDialog : null,
    	_oProjectToRefresh : null,
    	_nQuantityOfCreatedFolders : 0,
    	
    	configure : function(mConfig) {
    	    if (mConfig && mConfig.styles) {
    	        this.context.service.resource.includeStyles(mConfig.styles).done();
    	    }
            
    	    this._maxFileSizeInBytesPromise = this.context.service.system.getQuota();
    	},
    	
    	_getMaxFileSizeBytes : function() {
			return this._maxFileSizeInBytesPromise.then(function(quota) {
		        if (quota && quota.defaultMaxEntitySize) {
	                return quota.defaultMaxEntitySize; 
	    	    }
		    });
		},
    	
    	onDestinationPathLiveChange : function(oEvent) {
    		var sDestinationPath = oEvent.mParameters.liveValue.trim();
    		this._oModel.setProperty("/importDestinationPath", sDestinationPath);
    		this._changeOkButtonState(sDestinationPath);
    	},
    	
    	_initFileUploader : function() {
    		var oGrid = this._oImportDialog.getContent()[0];
    		this._oFileUploader = oGrid.getContent()[1];
    		var nMaxFileSize = this._oModel.getProperty("/maxFileSize");
    		if (nMaxFileSize > 0) {
    		    this._oFileUploader.setMaximumFileSize(nMaxFileSize);
    		}
    		this._oFileUploader.attachFileSizeExceed(this._onFileSizeExceed, this);
    	},

        _onFileSizeExceed : function(oEvent) {
            this._oFileUploader.clear();
            var nMaxFileSize = this._oModel.getProperty("/maxFileSize");
            if (nMaxFileSize === 0) {
                nMaxFileSize = this._oFileUploader.getMaximumFileSize();
            }
            var sFileName = oEvent.mParameters.fileName;
            var nFileSize = Math.floor(oEvent.mParameters.fileSize);
            this._setErrorStyleClassAndTooltip(this._oFileUploader, "file_size_exceed", [nMaxFileSize, sFileName, nFileSize]);    
        },
        
    	_getImportToTextField : function() {
    		var oGrid = this._oImportDialog.getContent()[0];
    		var oImportToTextField = oGrid.getContent()[3];
    		return oImportToTextField;
    	},
	
    	_isDestinationPathValid : function(sDestinationPath) {
    		var oImportToTextField = this._getImportToTextField();
    		if (sDestinationPath === "/" || sDestinationPath === "") {
    			return this._setErrorStyleClassAndTooltip(oImportToTextField, "import_to_empty");
    		}
    		
    		if (sDestinationPath.indexOf("//") !== -1 || sDestinationPath.indexOf("\\") !== -1) {
    			return this._setErrorStyleClassAndTooltip(oImportToTextField, "import_to_invalid");
    		}
    		
    		if (sDestinationPath.lastIndexOf("/") === sDestinationPath.length - 1) {
    			return this._setErrorStyleClassAndTooltip(oImportToTextField, "import_to_invalid");
    		}
    		
    		var i = 0;
    		if (sDestinationPath.indexOf("/") === 0) {
    			i = 1;
    		}
    		
    		var aPathParts = sDestinationPath.split("/");
    		for (; i < aPathParts.length; i++) {
    			var sPathPart = aPathParts[i];
    			if (!this._checkPathPartAllowed(sPathPart)) {
    				return this._setErrorStyleClassAndTooltip(oImportToTextField, "import_to_invalid");
    			}
    		}
    		
    		return this._setConfirmedStyleClassAndTooltip(oImportToTextField, oImportToTextField.getValue());
    	},
	
    	_checkPathPartAllowed : function(sPathPart) {
    		//Corresponds to allowed characters for UI5 Repositories
    		//Last character must not be a "."
    		var rAllowedFileFolderNames = /^[a-zA-Z0-9\.\-_@]*[a-zA-Z0-9\-_@]+$/;
    		var aMatch = rAllowedFileFolderNames.exec(sPathPart); //regex returns null in case of no match
    		return !!aMatch;
    	},
    	
    	onExtractArchiveChange : function() {
    		this._changeOkButtonState();
    	},
    	
    	_isFileValid : function(oFile) {
    		if (!oFile) {
    			return this._setErrorStyleClassAndTooltip(this._oFileUploader, "file_empty_name");
    		} 
    		
    		var bExtractZipToFolder = this._oModel.getProperty("/extractArchiveChecked");
    		if (!this._isZipFile(oFile) || !bExtractZipToFolder) {
    			if (!this._checkPathPartAllowed(oFile.name)) {
		    		return this._setErrorStyleClassAndTooltip(this._oFileUploader, "file_invalid_name");
		    	}
    		} 
    		
    		return this._setConfirmedStyleClassAndTooltip(this._oFileUploader, this._oFileUploader.oFilePath.getValue());
    	},
    	
    	_setErrorStyleClassAndTooltip : function(oControl, sTooltipKey, aParameters) {
    	    aParameters = (aParameters ? aParameters : []);
    	    
    		oControl.setTooltip(this.context.i18n.getText(sTooltipKey, aParameters));
    		oControl.removeStyleClass("inputConfirmed");
    		oControl.addStyleClass("inputError");
    		return false;
    	},
    
    	_setConfirmedStyleClassAndTooltip : function(oControl, sTooltip) {
    		oControl.setTooltip(sTooltip);
    		oControl.removeStyleClass("inputError");
    		oControl.addStyleClass("inputConfirmed");
    		return true;
    	},
	
    	onBrowse : function(oEvent) {
    		var oFile = null;
    		var sDestinationPath = null;
    		
    		var aFiles = oEvent.oSource.oFileUpload.files;
    		if (aFiles.length === 0) {
    			this._oModel.setProperty("/fileToImport", null);
    		} else if (aFiles.length === 1) {
    			oFile = aFiles[0];
    			this._oModel.setProperty("/fileToImport", oFile);
    			this._oModel.setProperty("/extractArchiveVisible", false);
    			if (this._isZipFile(oFile)) {
    			    this._oModel.setProperty("/extractArchiveVisible", true);
    				var sFileNameWithoutSuffix = oFile.name.substring(0, oFile.name.length - 4);
    				sDestinationPath = this._oModel.getProperty("/importDestinationPath");
    				if (sDestinationPath === "/") {
    					sDestinationPath = sDestinationPath + sFileNameWithoutSuffix;
    					this._oModel.setProperty("/importDestinationPath", sDestinationPath);
    				} else if (!_.endsWith(sDestinationPath.toLowerCase(), "/" + sFileNameWithoutSuffix.toLowerCase())) {
    					sDestinationPath = sDestinationPath + "/" + sFileNameWithoutSuffix;
    					this._oModel.setProperty("/importDestinationPath", sDestinationPath);
    				}
    			} 
    		}	
    
    		this._changeOkButtonState(sDestinationPath, oFile);
    	},
	
    	_getRepositoryBrowserControl : function() {
    		if (this._oRepositoryBrowserControl) {
    			return Q(this._oRepositoryBrowserControl);
    		}
    		
    		var that = this;
    		return this.context.service.repositoryBrowserFactory.create(null, {filters: ["......."]}).then(function(oRepositoryBrowserInstance) {
    			return oRepositoryBrowserInstance.getContent().then(function(oRepositoryBrowserControl) {
    				oRepositoryBrowserControl.setHeight("200px");
    				oRepositoryBrowserControl.setWidth("100%");
    				oRepositoryBrowserControl.setLayoutData(new sap.ui.layout.GridData({
    					span: "L12 M12 S12"
    				}));
    				//Handle select
    				if (oRepositoryBrowserControl && oRepositoryBrowserControl.getContent().length > 0) {
    					oRepositoryBrowserControl.getContent()[0].attachSelect(that.onRepositorySelectFile, that);
    				}
    			
    				that._oRepositoryBrowserControl = oRepositoryBrowserControl;
    				return that._oRepositoryBrowserControl;
    			});
    		});
    	},
	
    	onWorkspace : function(oEvent) {
    		var sCurrentButtonText = oEvent.oSource.getText();
    		
    		var sHideButtonText = this.context.i18n.getText("importFileDialog_hideworkspace");
    		var sShowButtonText = this.context.i18n.getText("importFileDialog_showworkspace");
    		var that = this;
    		
    		var oImportDialogGrid = oEvent.oSource.oParent;
    		
    		if (sCurrentButtonText === sHideButtonText) {
    			oImportDialogGrid.removeContent(this._oRepositoryBrowserControl);
    			this._oModel.setProperty("/workspaceButtonText", sShowButtonText);
    		} else {
    			this._getRepositoryBrowserControl().then(function(oRepositoryBrowserControl) {
    				oImportDialogGrid.addContent(oRepositoryBrowserControl);
    				that._oModel.setProperty("/workspaceButtonText", sHideButtonText);	
    			}).done();
    		}
    	},
	
    	_changeOkButtonState : function(sDestinationPath, oFile) {
    		if (!sDestinationPath || sDestinationPath === "") {
    			sDestinationPath = this._oModel.getProperty("/importDestinationPath");
    		}
    		
    		if (!oFile) {
    			oFile = this._oModel.getProperty("/fileToImport");
    		}
    		
    		var bDestinationValid = this._isDestinationPathValid(sDestinationPath, oFile);
    		var bFileValid = this._isFileValid(oFile);
    		
    		if (bDestinationValid && bFileValid) {
    			this._oModel.setProperty("/okEnabled", true);
    		} else {
    			this._oModel.setProperty("/okEnabled", false);
    		}
    	},
	
    	onRepositorySelectFile: function(oEvent) {
    		var that = this;
    		
    		if (!oEvent || !oEvent.getParameter) {
    			return;
    		}
    
    		//check how many were selected
    		var aSelectedNode = oEvent.getParameter("node");
    		if (!aSelectedNode) {
    			return;
    		}
    		
    		var keyString = aSelectedNode.mProperties.tag;
    		
    		this.context.service.document.getDocumentByKeyString(keyString).then(function(oDocument) {
    			if (oDocument) {
    				that._oModel.setProperty("/selectedDocument", oDocument);
    				var sDestinationPath = oDocument.getEntity().getFullPath();
    				
    				if (sDestinationPath === "") {
    					sDestinationPath = "/";
    				} 
    				that._oModel.setProperty("/importDestinationPath", sDestinationPath);
    				
    				that._changeOkButtonState(sDestinationPath);
    			}
    		}).done();
    	},
	
    	_getDestinationFolder : function() {
    		var that = this;
    		var sDestinationPath = this._oModel.getProperty("/importDestinationPath");
    		
    		if (_.startsWith(sDestinationPath, "/")) {
    		    sDestinationPath = sDestinationPath.substr(1);
    		}
    		
    		if (_.endsWith(sDestinationPath, "/")) {
    			sDestinationPath = sDestinationPath.substring(0, sDestinationPath.length - 1);
    		}
    		
    		var aFolderNames = sDestinationPath.split("/");
    		
    		return this.context.service.filesystem.documentProvider.getRoot().then(function(oRoot) {
    			return that._createDestinationFolder(oRoot, 0, aFolderNames);
    		});
    	},
    	
    	_createDestinationFolder : function(oParentDocument, i, aFolderNames) {
    		var that = this;
    		var sFolderName = aFolderNames[i];
    		
    		return this._getFolderByName(oParentDocument, sFolderName).then(function(oDocument) {
    			if (i < aFolderNames.length - 1) {
    				return that._createDestinationFolder(oDocument, ++i, aFolderNames);
    			} 
    			
    			return oDocument;
    		});
    	},
    	
    	_getFolderByName : function(oParentDocument, sFolderName) {
    		var that = this;
    		var sDocumentPath = oParentDocument.getEntity().getFullPath() + "/" + sFolderName;
    		return this.context.service.document.getDocumentByPath(sDocumentPath).then(function(oDocument) {
    			if (oDocument) {
    				return oDocument;
    			} 
    			
    			return oParentDocument.createFolder(sFolderName).then(function(oCreatedFolderDocument) {
    				that._nQuantityOfCreatedFolders++;
    				if (that._nQuantityOfCreatedFolders === 1 && oCreatedFolderDocument.getEntity().isProject()) {
    					that._oProjectToRefresh = oCreatedFolderDocument;
    				}
    				return oCreatedFolderDocument;
    			});
    		});
    	},
	
    	onOk : function() {
    		var that = this;
    		var oFile = this._oFileUploader.oFileUpload.files[0];
    		
    		this._oImportDialog.close();
    		this.context.service.progress.startTask("import", "Import started.").then(function (iProgressId) {
    			that._showInfoMessage("importSent", "import_started");
    			
        		return that._getDestinationFolder().then(function(oDestinationFolder) {
        			return that._executeImport(oDestinationFolder, oFile).then(function() {
        				if (that._nQuantityOfCreatedFolders > 1 && that._oProjectToRefresh) {
        					return that._oProjectToRefresh.refresh().then(function() {
        						that._showInfoMessage("importCompletedSuccessfully", "import_finished");
        					});
        				}
        				that._showInfoMessage("importCompletedSuccessfully", "import_finished");
        			});
        		}).fin(function() {
        			that._nQuantityOfCreatedFolders = 0;
        			that._oProjectToRefresh = null;
                    return that.context.service.progress.stopTask(iProgressId);
                });
    		}).fail(function (reason) {
    			var message = that.context.i18n.getText("import_failed", [reason]);
    			that.context.service.usernotification.alert(message).done();
    			that.context.service.log.error("import", message, ["user"]).done();
    		}).done();
    	},
    	
    	_showInfoMessage : function(sConsoleKey, sLiteNotificationKey) {
    		this.context.service.log.info("import", this.context.i18n.getText("i18n", sConsoleKey), ["user"]).done();
    		this.context.service.usernotification.liteInfo(this.context.i18n.getText("i18n", sLiteNotificationKey)).done();
    	},
    	
    	_executeImport : function(oDestinationDocument, oFile) {
    		if (this._isZipFile(oFile)) { // zip file
    			var bExtractZipToFolder = this._oModel.getProperty("/extractArchiveChecked");
    			if (bExtractZipToFolder) {
    			    return this._executeZipFileImport(oDestinationDocument, oFile);
    			} else {
    			   return this._executeFileImport(oDestinationDocument, oFile, false); 
    			}
    		}
    		
    		return this._executeFileImport(oDestinationDocument, oFile, true);
    	},
	
    	_executeFileImport : function(oDestinationDocument, oFile, bOpen) {
    		var that = this;
    		bOpen = (bOpen === true);
    			
    		return oDestinationDocument.objectExists(oFile.name).then(function(bExists) {
    			if (bExists) { // the imported file exists in the destination folder	
    				var sFileOverwriteMessage = that.context.i18n.getText("import_file_overwrite");
    				
    				return that.context.service.usernotification.confirm(sFileOverwriteMessage).then(function(oReturn) {
    					if (oReturn.bResult) { // user decides to overwrite the existing file
    						return that._importFileAndFireEvent(oDestinationDocument, oFile, bOpen);
    					}
    					
    					that._oImportDialog.open();
    				});
    			} 
    
    			return that._importFileAndFireEvent(oDestinationDocument, oFile, bOpen);
    		});
    	},
    	
    	_importFileAndFireEvent : function(oDestinationDocument, oFile, bOpen) {
    		this._fireClose("ExecuteImport"); // must not be translated
    		return this._importFile(oDestinationDocument, oFile, bOpen);
    	},

    	_executeZipFileImport : function(oDestinationDocument, oFile) {
    		var that = this;
    
    		return oDestinationDocument.getCurrentMetadata().then(function(aRawData) {
    			if (aRawData.length !== 0) { // there are children in the destination folder
    				var sFilesOverwriteMessage = that.context.i18n.getText("import_files_overwrite", [oDestinationDocument.getEntity().getName()]);
    				return that.context.service.usernotification.confirm(sFilesOverwriteMessage).then(function(oReturn) {
    					if (oReturn.bResult) { // user decides to overwrite existing file/s
    						return that._importZipFileAndFireEvent(oDestinationDocument, oFile);
    					} 
    					
    					that._oImportDialog.open();
    				});
    			}
    			
    			return that._importZipFileAndFireEvent(oDestinationDocument, oFile);
    		});
    	},
    	
	   	_importZipFileAndFireEvent : function(oDestinationDocument, oFile) {
    		var that = this;
    		
    		this._fireClose("ExecuteImport"); // must not be translated
    		return this._importZipFile(oDestinationDocument, oFile).then(function() {
    			// select and expand the destination folder
    			return that.context.service.repositorybrowser.setSelection(oDestinationDocument, true, true);
    		});
	   	},
	
    	_isZipFile : function(oFile) {
    		if (oFile) {
    			var fileName = oFile.name.toLowerCase();
    			return _.endsWith(fileName, ".zip");
    		}
    		
    		return false;
    	},
    	
    	onClose : function(oEvent) {
    	    var sActionName = oEvent.mParameters.actionName;
    	    if (sActionName) {
    	        // fire action name event to listerners
    	        this._oImportDialog.fireEvent("service.import.ImportDialog", {actionName : sActionName});
    	        // invalidate repository browser control
    		    this._oRepositoryBrowserControl = null;
    	    }
    	},
    	
    	_fireClose : function(sActionName) {
    		this._oImportDialog.fireClosed({actionName : sActionName});
    		if (this._oImportDialog.isOpen()) {
    			this._oImportDialog.close();
    		}
    	},
	
    	onCancel : function() {
    	    this._fireClose("CancelImport");
    	},
    	
        _importFile : function(oFolderDocument, oFile, bOpen) {
    		var that = this;
    		
    		return oFolderDocument.importFile(oFile).then(function(oDocument) {
                var aPromises = [];
                
                if (bOpen === true) {
                    aPromises.push(that.context.service.document.open(oDocument));
                }
                
                aPromises.push(that.context.service.repositorybrowser.setSelection(oDocument, true));
                aPromises.push(that.context.service.document.notifyExternalChange(oDocument, "import"));
    		    
                return Q.all(aPromises);
    		});
    	},
	
    	_importZipFile : function(oDestinationDocument, oFile) {
    		var that = this;
    		this.context.service.usagemonitoring.startPerf("importExport", "importZip").done();
            return oDestinationDocument.importZip(oFile, true).then(function() {
                return that.context.service.document.notifyExternalChange(oDestinationDocument, "import").then(function() {
                    that.context.service.usagemonitoring.report("importExport", "importZip", oFile.size).done();
                });
	    	});
    	},
    	
    	_getSelectedFolder : function(oSelectedDocument) {
    	    if (oSelectedDocument) {
    	        if (oSelectedDocument.getEntity().isFile()) {
    	            return oSelectedDocument.getParent();
    	        }
    	    }
    	    
    	    return Q(oSelectedDocument);
    	},
	
    	_createDataModel : function(oSelectedDocument) {
    		var that = this;
    		var oModel = new sap.ui.model.json.JSONModel();
    		
    		var oData = {};
    		oData.fileNameToImport = "";
    		oData.importDestinationPath = "";
    		oData.fileUploaderTooltip = "";
    		oData.fileToImport = null;
    		oData.extractArchiveVisible = false;
    		oData.extractArchiveChecked = true;
    		return this._getMaxFileSizeBytes().then(function(_nMaxFileSizeInBytes) {
	    		oData.maxFileSize = Math.floor(_nMaxFileSizeInBytes / (1024 * 1024));
	    		oData.workspaceButtonText = that.context.i18n.getText("importFileDialog_showworkspace");
	    		oData.okEnabled = false;
	    	    // set initial import folder
	    	    return that._getSelectedFolder(oSelectedDocument).then(function(oFolderDocument) {
	    	        if (oFolderDocument) {
	    	            oData.selectedDocument = oFolderDocument;
	    	            oData.importDestinationPath = oFolderDocument.getEntity().getFullPath();
	    		        if (oData.importDestinationPath === "") {
	    			        oData.importDestinationPath = "/";
	    	            }
	    	        }
	    	        
	    	        // set model data
	    	        oModel.setData(oData);
	    		    return oModel; 
	    	    });
    		});
    	},
	
    	openImportUI : function(oSelectedDocument) {
    	    var that = this;
    	    var oDeferred = Q.defer();
    	    
    	    // create data model
    	    this._createDataModel(oSelectedDocument).then(function(oDataModel) {
        	    // create xml fragment with dialog control
        	    var oImportDialogFragment = sap.ui.xmlfragment("sap.watt.platform.plugin.importExport.fragment.ImportDialog", that);
        	    // get dialog control from the fragment
        		that._oImportDialog = sap.ui.getCore().byId(oImportDialogFragment.getId());
        		// set dialog i18n model
        		that.context.i18n.applyTo(that._oImportDialog);
                // attach onClose event
                that._oImportDialog.attachClosed(that.onClose, that);
        	    // set controller data model
         		that._oModel = oDataModel;
        		// set dialog data model
        		that._oImportDialog.setModel(oDataModel);
        		// attach final event
        		that._oImportDialog.attachEvent("service.import.ImportDialog", function(oEvent) {
        		    oDeferred.resolve(oEvent.mParameters.actionName);
        		});
        		// initialize FileUploader
    	        that._initFileUploader();
        		// open the dialog
        		that._oImportDialog.open();
    	    }).done();
    	    //TODO remove selection from repository browse
    	    return oDeferred.promise;
    	}
	};
});