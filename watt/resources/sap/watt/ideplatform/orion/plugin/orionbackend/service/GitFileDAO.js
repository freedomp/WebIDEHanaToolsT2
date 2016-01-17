define(["sap.watt.common.filesystem/document/FileFolderEntity", "../util/DiffParser"], function(FileFolderEntity, oParser) {
	return {

		_sDaoName: "gitFileDao",
		_mConflictsDoc: [], 

		getDocument: function(sPath, sDAO, sVersion) {
			if (sDAO !== this._sDaoName) {
				throw new Error("Wrong dao passed " + sDAO);
			}

			var aPath = sPath.split("::");
			var oEntity;

			if (aPath.length === 2 && aPath[1] === "file") {
				oEntity = new FileFolderEntity("file", aPath[0], null, sDAO, sVersion);
			} else {
				oEntity = new FileFolderEntity("folder", sPath, null, sDAO, sVersion);
			}

			return this.context.service.document.getDocument(oEntity).then(function(oDocument) {
				return oDocument;
			});

		},

		getVersion: function(oDocument, sVersion, sDAO) {
			if (sDAO !== this._sDaoName) {
				throw new Error("Wrong dao passed " + sDAO);
			}
			if (oDocument.getType() !== "file") {
				return oDocument;
			}

			var that = this;
			var oEntity = new FileFolderEntity("file", oDocument.getEntity().getFullPath(), null, sDAO, sVersion);
			return this.context.service.document.getDocument(oEntity).then(function(oNewDocument) {
				if (sVersion.indexOf("CONFLICT") !== -1) {
					//update the workspacedocument only after the save, so the workspacedocument wont be updated 
					var oBackendData = oNewDocument.getEntity().getBackendData() || {};
					oBackendData.workspacedocument = oDocument;
					oNewDocument.getEntity().setBackendData(oBackendData);

					//save it on the map so it will be deleted in the refresh
					var sCloneLocation = oDocument.getEntity().getBackendData().git.CloneLocation;
					if (!that._mConflictsDoc[sCloneLocation]) {
						that._mConflictsDoc[sCloneLocation] = {};
					}
					that._mConflictsDoc[sCloneLocation][oNewDocument.getKeyString()] = oNewDocument;
				}
				return oNewDocument;

			});

		},

		load: function(oDocument) {
			if (oDocument.getType() !== "file") {
				throw new Error("Unsupported operation. Can't load " + oDocument.getType());
			}

			var sVersion = oDocument.getEntity().getVersionId();
			if (sVersion.indexOf("CONFLICT") !== -1) {
				//MERGE 
				return oDocument.getEntity().getBackendData().workspacedocument.getContent().then(function(sContent) {
					var sNewContent = "";
					if (sVersion.indexOf("NEW") !== -1) {
						sNewContent = oParser.parse(sContent, false);
					} else if (sVersion.indexOf("OLD") !== -1) {
						sNewContent = oParser.parse(sContent, true);
					}

					return {
						mContent: sNewContent,
						sETag: ""
					};
				});
			}
			//COMPARE
			return {
				mContent: "",
				sETag: ""
			};
		},

		objectExists: function(oParentFolderDocument, sRelativePath) {
			return true;
		},

		save: function(oDocument) {
			if (oDocument.getType() !== "file") {
				throw new Error("Unsupported operation. Can't load " + oDocument.getType());
			}

			var sVersion = oDocument.getEntity().getVersionId();
			var oWorkspaceDocument = oDocument.getEntity().getBackendData().workspacedocument;
			if (sVersion.indexOf("CONFLICT_NEW") !== -1 && oWorkspaceDocument) {
				return oDocument.getContent().then(function(sNewContent) {
					return oWorkspaceDocument.setContent(sNewContent).then(function() {
						return oWorkspaceDocument.save();
					});
				});
			}

			return "";
		},

		readFileMetadata: function(oDocument) {
			return {
				sETag: ""
			};
		},

		refresh: function(oEvent) {
			var sCloneLocation = oEvent.params.CloneLocation;
			if (this._mConflictsDoc[sCloneLocation]) {

				for (var sFileKey in this._mConflictsDoc[sCloneLocation]) {
					if (this._mConflictsDoc[sCloneLocation].hasOwnProperty(sFileKey)) {
						this._mConflictsDoc[sCloneLocation][sFileKey]._notifyAboutDeletion(null, this._mConflictsDoc[sCloneLocation][sFileKey]);
					}
				}
				this._mConflictsDoc[sCloneLocation] = null;
			}
		},

		updateWorkspace: function(oEvent) {
			var that = this;
			var oService = this.context.service;
			return oService.git.getRepositoryDetails(oEvent.params).then(
				function(oRepositoryDetails) {
					return oService.filesystem.documentProvider.getDocument(
						URI('/' + oRepositoryDetails.Name).toString()).then(function(oFileDocument) {
							return that.context.event.fireExternalChanged({oDocument:oFileDocument});
						});
				});
		}

	};
});
