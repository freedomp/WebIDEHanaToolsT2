define(["sap/watt/common/plugin/filesystem/document/FileFolderEntity", "sap/watt/lib/jszip/jszip-shim", "sap/watt/lib/lodash/lodash"], function (FileFolderEntity, JSZip, _) {

	return {

		/**
		 * @memberOf sap.watt.ideplatform.orion.orionbackend.service.OrionFileDAO
		 */

		ERROR_FILE_ALREADY_EXISTS: "File already exists",
		ERROR_FOLDER_ALREADY_EXISTS: "Folder already exists",
		ERROR_DEST_NOT_ALLOWED: "The destination cannot be a descendent of the source location",

		init: function () {
			//nothing to do yet
		},

		_content: {
			"": {
				type: "folder",
				content: {}
			}
		},

		_eTag: 0,

		_expandFolder: function (oFolder, oParent) {
			var oResult = {
				type: "folder",
				content: oFolder,
				parent: oParent
			};

			for (var s in oFolder) {
				var oEntry = oFolder[s];
				if ($.isPlainObject(oEntry)) {
					oFolder[s] = this._expandFolder(oEntry, oResult);
				} else {
					oFolder[s] = this._expandFile(oEntry, oResult);
				}
			}
			return oResult;

		},

		_expandFile: function (oFile, oParent) {
			return {
				type: "file",
				content: oFile,
				eTag: this._eTag++,
				parent: oParent
			};
		},

		setContent: function (oContent) {
			return this.getRoot()
				.then(function (root) {
					// set the new content to the DAO
					this._content[""] = this._expandFolder(oContent);
					// fill the cache
					return root.refresh();
				}.bind(this));
		},

		getRoot: function () {
			var oEntity = new FileFolderEntity("folder", "", "");
			oEntity.setBackendData(this._content);
			return this.context.service.document.getDocument(oEntity);
		},

		createFile : function(oParentDocument, sName, bForce) {
			sName = sName.trim();

			var that = this;

			var oData = this._getDocumentData(oParentDocument.getEntity().getFullPath());
			if (!oData || (oData && oData.type !== "folder")) {
				throw new Error("Invalid call");
			}
			if (!bForce && oData.content[sName]) {
				throw new Error(that.ERROR_FILE_ALREADY_EXISTS);
			}

			var oEntity = new FileFolderEntity("file", sName, oParentDocument);
			oEntity.setBackendData(oData.content[sName] = this._expandFile("", oParentDocument));
			return this.context.service.document.getDocument(oEntity);
		},

		createFolder: function (oParentFolderDocument, sFolderName, bForce) {
			sFolderName = sFolderName.trim();

			var oData = this._getDocumentData(oParentFolderDocument.getEntity().getFullPath());
			if (oData.type !== "folder") {
				throw new Error("Invalid call");
			}
			if (!bForce && oData.content[sFolderName]) {
				throw new Error(this.ERROR_FILE_ALREADY_EXISTS);
			}

			var oEntity = new FileFolderEntity("folder", sFolderName, oParentFolderDocument);
			oEntity.setBackendData(oData.content[sFolderName] = this._expandFolder([], oParentFolderDocument));
			return this.context.service.document.getDocument(oEntity);
		},


		createProject: function (oParentDocument, oProjectData) {
			var that = this;
			return this.getRoot().then(function (oRoot) {
				return that.createFolder(oRoot, oProjectData.name);
			});
		},

		copyObject: function (oSourceDocument, oTargetFolderDocument, sTargetName, bForce) {
			var oSourceData = this._getDocumentData(oSourceDocument.getEntity().getFullPath());
			var oTargetData = this._getDocumentData(oTargetFolderDocument.getEntity().getFullPath());
			if (oTargetData.content[sTargetName]) {
				return Q.reject(new Error(this.ERROR_FOLDER_ALREADY_EXISTS));
			}
			if (oSourceDocument.getEntity().contains(oTargetFolderDocument.getEntity())) {
				return Q.reject(new Error(this.ERROR_DEST_NOT_ALLOWED));
			}
			if (!sTargetName) {
				sTargetName = oSourceDocument.getEntity().getName();
			}

			var oNewData = jQuery.extend({}, oSourceData);
			oNewData.parent = oTargetFolderDocument;
			var oEntity = new FileFolderEntity(oSourceData.type, sTargetName, oTargetFolderDocument);
			oEntity.setBackendData(oTargetData.content[sTargetName] = oNewData);
			return this.context.service.document.getDocument(oEntity);
		},

		/** Loads the passed document by delegating to the file service
		 * @param {object} oDocument
		 * @returns {object} the content and the ETag
		 */
		load: function (oDocument) {
			var oData = this._getDocumentData(oDocument.getEntity().getFullPath());
			if (oData.type !== "file") {
				throw new Error("Load only supported for files");
			}
			return Q({
				mContent: oData.content,
				sETag: oData.eTag
			});
		},

		/** Save the passed document
		 * @param {object} oDocument
		 * @returns {string} the new ETag
		 */
		save: function (oDocument) {
			var that = this;
			var oData = this._getDocumentData(oDocument.getEntity().getFullPath());
			if (oData.type !== "file") {
				throw new Error("Save only supported for files");
			}

			return oDocument.getContent().then(function (mContent) {
				oData.content = mContent;
				oData.eTag = that._eTag++;
				return Q(oData.eTag);
			});
		},

		deleteFile: function (oFileDocument) {
			var oData = this._getDocumentData(oFileDocument.getEntity().getFullPath());
			if (oData.parent.content) {
				delete oData.parent.content[oFileDocument.getEntity().getName()];
			} else {
				var oParentEntity = oData.parent.getEntity();
				delete oParentEntity.getBackendData().content[oFileDocument.getEntity().getName()];
			}
			
			return Q();
		},

		deleteFolder: function (oFolderDocument) {
			var oData = this._getDocumentData(oFolderDocument.getEntity().getFullPath());
			var sFolderName = oFolderDocument.getEntity().getName();
			if (oData.parent && oData.parent.content) {
				delete oData.parent.content[sFolderName];
			}
			else if (!_.isEmpty(_.keys(oData.parent._mEntity._mBackenData.content))) {
				delete oData.parent._mEntity._mBackenData.content[sFolderName];
			}
			return Q();
		},

		exportZip: function (oFolderDocument) {
			throw new Error("Export Zip Not implemented");
		},

		readFileMetadata: function (oFileDocument) {
			var oData = this._getDocumentData(oFileDocument.getEntity().getFullPath());
			return Q({
				"sETag": oData.eTag
			});
		},

		_getDocumentData: function (sPath, bOnlyLastFolder) {
			var aParts = sPath.split("/");
			var iLength = aParts.length;
			if (bOnlyLastFolder) {
				iLength--;
			}
			aParts = aParts.slice(1, iLength);
			var oData = this._content[""];
			var sName;
			while (sName = aParts.shift()) {
				if (oData.type !== "folder") {
					return oData;
				}
				oData = oData.content[sName];
				if (!oData) {
					return null;
				}
			}
			return oData;
		},

		_getFolderData: function (sPath) {
			return this._getDocumentData(sPath, true);
		},

		getDocument: function (sPath, sDAO, sVersion) {
			if (sVersion) {
				return null;
			}
			var oData = this._getDocumentData(sPath);
			if (!oData) {
				return Q(null);
			}

			var aParts = sPath.split("/");
			var sName = aParts.pop();
			var sParentPath = aParts.join("/");
			var oEntity = new FileFolderEntity(oData.type, sName, sParentPath);
			oEntity.setBackendData(oData);
			return this.context.service.document.getDocument(oEntity);
		},

		search: function (oInputObject) {
			throw new Error("Search not implemented");
		},
		
		getCurrentMetadata : function(oFolderDocument, bRecursive) {
			if (bRecursive) {
				return this.getFolderContentRecursive(oFolderDocument).then(function(aContent) {
					var aRawNodes = [];
					for (var i = 0; i < aContent.length; i++) {
						var oDoc = aContent[i];
						aRawNodes.push({name:oDoc.getEntity().getName(),
										path:oDoc.getEntity().getFullPath(),
										folder:oDoc.getEntity().isFolder(),
										parentPath:oDoc.getEntity().getParentPath()});
					}
					
					return aRawNodes;
				});	
			}
			return this.getFolderContent(oFolderDocument).then(function(aContent) {
				var aRawNodes = [];
				for (var i = 0; i < aContent.length; i++) {
					var oDoc = aContent[i];
					aRawNodes.push({name:oDoc.getEntity().getName(),
									path:oDoc.getEntity().getFullPath(),
									folder:oDoc.getEntity().isFolder(),
									parentPath:oDoc.getEntity().getParentPath()});
				}
				
				return aRawNodes;
			});	
		},
		
		getFolderContent: function (oFolderDocument) {
			var oData = this._getDocumentData(oFolderDocument.getEntity().getFullPath());
			var aEntries = [];
			if (oData) {
				for (var sName in oData.content) {
					var oChild = oData.content[sName];

					var oEntity = new FileFolderEntity(oChild.type, sName, oFolderDocument);
					oEntity.setBackendData(oChild);
					aEntries.push(this.context.service.document.getDocument(oEntity));
				}
			}
			return Q.all(aEntries);
		},

		getFolderContentRecursive: function (oFolderDocument) {
			var oData = this._getDocumentData(oFolderDocument.getEntity().getFullPath());
			if (!oData) {
				return Q([]);
			}
			// fill the folder document with the children promise
			return oFolderDocument.getFolderContent()
				.then(function () {
					var aEntriesPromises = [];
					for (var sName in oData.content) {
						var oChild = oData.content[sName];
						var oEntity = new FileFolderEntity(oChild.type, sName, oFolderDocument);
						oEntity.setBackendData(oChild);
						aEntriesPromises.push(this.context.service.document.getDocument(oEntity));
						//TODO - add children - like in the dao

						if (oChild.type === "folder") {
							var self = this;
							var oSubEntriesPromise = this.context.service.document.getDocument(oEntity).then(function (oSubFolderDocument) {
								// fill the folder document with the children promise
								return oSubFolderDocument.getFolderContent().then(function () {
									return self.getFolderContentRecursive(oSubFolderDocument);
								});
							});
							aEntriesPromises.push(oSubEntriesPromise);
						}
					}
					return Q.all(aEntriesPromises).then(function (aEntries) {
						var aFileEntries = [];
						for (var i in aEntries) {
							var oEntry = aEntries[i];
							if (typeof (oEntry) === "string") {
								aFileEntries.push(oEntry);
							} else {
								aFileEntries = aFileEntries.concat(oEntry);
							}
						}
						return Q.all(aFileEntries);
					});
				}.bind(this));
		},

		getVersions: function (oDocument, sDAO) {
			return [];
		},

		getVersion: function (oDocument, sVersion, sDAO) {
			return null;
		},

		//oFile might be a Blob also. In this case, sFileName needs to be provided

		/**
		 * Only supports Blob
		 * @param oParentFolderDocument
		 * @param oFile - currently ignore content and just creating file
		 * @param bUnzip - NOT SUPPORTED
		 * @param bForce - if false throws error when file exist
		 * @param sFileName
		 * @returns {*}
		 */
		importFile: function (oParentFolderDocument, oFile, bUnzip, bForce, sFileName) {
			return this.createFile(oParentFolderDocument, sFileName, bForce).then(function (oFileDocument) {
				// If we got Blob - convert it
				var oDeferred = Q.defer();
				if (oFile instanceof Blob) {
					var fileReader = new FileReader();
					//handler executed once reading(blob content referenced to a variable) from blob is finished.
					fileReader.addEventListener("loadend", function (e) {
						var sContent = e.srcElement.result;
						oFileDocument.setContent(sContent).then(function () {
							oFileDocument.save();
							oDeferred.resolve(oFileDocument);
						});
					});
					//start the reading process.
					fileReader.readAsText(oFile);
				} else {
					throw new Error("importFile only support Blob input");
				}
				return oDeferred.promise;
			});
		},

		_createZipFolders  : function(oParentFolderDocument, files, bForce) {
			var that = this;
			var nExpectedNewFolders = 0;
			var nActualNewOrExistingFolders = 0;
			var oPromise = Q();
			var oDeferred = Q.defer();

			var _checkNumFolders = function() {
				nActualNewOrExistingFolders++;
				if (nExpectedNewFolders === nActualNewOrExistingFolders) {
					oDeferred.resolve();
				}
			};

			// Get an object with folders only
			var folders = _.compact(_.map(files, function(oZipItem, sPath) {
				if (oZipItem.options.dir) {
					return sPath;
				}
			}));

			if (folders.length === 0) {
				oDeferred.resolve();
			} else {
				// Get the keys of the folders into a sorted array
				var sortedFolders = _.sortBy(folders);

				var rootName = oParentFolderDocument.getTitle();

				_.forEach(sortedFolders, function(filePath) {
					var filePathParts = filePath.split("/");
					filePathParts.pop();// Remove last part which is ""
					if (filePathParts.length > 0 && filePathParts[0] === "") {
						filePathParts.shift(); // Remove first part if it is ""
					}

					// Get the last folder in the path - this is the one we want to create
					var newFolderName = filePathParts.pop();
					nExpectedNewFolders++;
					// Each iteration we add a "then" to the end of our promise chain
					oPromise = oPromise.then(function () {
						var parentFullPath = "/" + rootName;
						if (filePathParts.length > 0) {
							parentFullPath += "/" + filePathParts.join("/"); // For all folders except those under the root
						}
						return that.context.service.filesystem.documentProvider.getDocument(parentFullPath).then(function(oParentDir) {
							return that.objectExists(oParentDir, newFolderName).then(function(bExist) {
								if (!bExist) {
									return that.createFolder(oParentDir, newFolderName, bForce).then(function () {
										_checkNumFolders();
									});
								} else {
									_checkNumFolders();
								}
							});
						});
					}).fail(function(oError) {
						console.log("_createZipFolders error: " + oError.message);
						oDeferred.reject(oError.message);
					});
				});
			}

			return oDeferred.promise;
		},

		_createZipFiles: function (oParentFolderDocument, files, bForce) {
			var that = this;
			var aPromises = [];
			var rootName = oParentFolderDocument.getTitle();
			_.forOwn(files, function (fileObject, filePath) {
				if (!fileObject.options.dir) {
					var pathParts = filePath.split("/");
					var fileName = pathParts.pop();
					if (pathParts.length > 0 && pathParts[0] === "") {
						pathParts.shift(); // Remove first part if it is ""
					}
					var parentFullPath = "/" + rootName;
					if (pathParts.length > 0) {
						parentFullPath += "/" + pathParts.join("/"); // For all files except those under the root
					}
					var p = that.context.service.filesystem.documentProvider.getDocument(parentFullPath).then(function (oParentFolder) {
						if (oParentFolder === null) {
							console.log("No parent for " + parentFullPath);
						}
						return that.createFile(oParentFolder, fileName, bForce).then(function (oFileDocument) {
							var sContent = fileObject.options.binary ? fileObject.asBinary() : fileObject.asText();
							return oFileDocument.setContent(sContent).then(function () {
								return oFileDocument.save();
							});
						});
					});

					aPromises.push(p);
				}
			});
			return Q.all(aPromises);
		},

		// oContent should ba an ArrayBuffer/Blob
		importZip: function (oParentFolderDocument, oContent, bForce) {
			// JSZip needs an ArrayBuffer. If we got Blob - convert it
			var oDeferred = Q.defer();
			if (oContent instanceof Blob) {
				var arrayBuffer;
				var fileReader = new FileReader();
				fileReader.onload = function () {
					arrayBuffer = this.result;
					oDeferred.resolve(arrayBuffer);
				};
				fileReader.onerror = function (e) {
					oDeferred.reject(e.target.error);
				};
				fileReader.readAsArrayBuffer(oContent);
			} else if (oContent instanceof ArrayBuffer) {
				oDeferred.resolve(oContent);
			} else {
				throw new Error("importZip implemented for ArrayBuffer or Blob only");
			}

			var that = this;
			var oZip = new JSZip();
			return oDeferred.promise.then(function (oZipContentAsArrayBuffer) {
				oZip.load(oZipContentAsArrayBuffer);
				return that._createZipFolders(oParentFolderDocument, oZip.files, bForce).then(function () {
					return that._createZipFiles(oParentFolderDocument, oZip.files, bForce).then(function () {
						return Q([]); // Return empty array - assume no files were modified
					});
				});
			});
		},

		objectExists: function (oParentFolderDocument, sName) {
			var oData = this._getDocumentData(oParentFolderDocument.getEntity().getFullPath());
			return Q(!!oData.content[sName]);
		},

		moveObject: function (oSourceDocument, oTargetFolderDocument, sTargetName) {
			var oSourceData = this._getDocumentData(oSourceDocument.getEntity().getFullPath());
			var oTargetData = this._getDocumentData(oTargetFolderDocument.getEntity().getFullPath());
			if (oTargetData.content[sTargetName]) {
				return Q.reject(new Error(this.ERROR_FOLDER_ALREADY_EXISTS));
			}
			if (oSourceDocument.getEntity().contains(oTargetFolderDocument.getEntity())) {
				return Q.reject(new Error(this.ERROR_DEST_NOT_ALLOWED));
			}
			if (!sTargetName) {
				sTargetName = oSourceDocument.getEntity().getName();
			}

			if (oSourceData !== oTargetData) {
				delete oSourceData.parent.content[oSourceDocument.getEntity().getName()];
			}

			var oNewData = jQuery.extend({}, oSourceData);
			oNewData.parent = oTargetFolderDocument;
			var oEntity = new FileFolderEntity(oSourceData.type, sTargetName, oTargetFolderDocument);
			oEntity.setBackendData(oTargetData.content[sTargetName] = oNewData);
			return this.context.service.document.getDocument(oEntity);
		}

	};
});