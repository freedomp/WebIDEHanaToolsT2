define([], function () {
	"use strict";
	
	/**
	 * open then load content from remote document using document provider
	 * @public
	 */
	function loadDocument(docFullPath) {
		if (!docFullPath) {
			var errMessage = this.i18n.getText("i18n", "log_emptypath");
			return Q.reject(new Error(errMessage));
		}
		
		return this.docProvider.getDocument(docFullPath).then(function(document) {
			if (document) {
				return document.getContent().then(function(content) {
					// make sure only '\n' as the line terminator, instead of '\r' and '\n'
					return Q(content.replace(/\r/g, ''));
				});
			} else {
				return Q();
			}
		}).fail(function(error) {
			return Q.reject(error);
		});
	}
	
	/**
	 * save content to remote document using document provider
	 * @public
	 */
	function saveDocument(docFullPath, docContent) {
		if (!docFullPath) {
			var errMessage = this.i18n.getText("i18n", "log_emptypath");
			return Q.reject(new Error(errMessage));
		}
		
		var docProvider = this.docProvider;
		var i18n = this.i18n;
		return createDocumentIfNotExists(docFullPath, docProvider, i18n).then(function() {
			return docProvider.getDocument(docFullPath).then(function(document) {
				if (document) {
					return document.setContent(docContent).then(function() {
						return document.save();
					});
				} else {
					var errMessage = i18n.getText("i18n", "log_failtoopen", [docFullPath]);
					return Q.reject(new Error(errMessage));
				}
			});
		}).fail(function(error) {
			return Q.reject(error);
		});
	}
	
	/**
	 * delete remote document using document provider
	 * @public
	 */
	function deleteDocument(docFullPath) {
		if (!docFullPath) {
			var errMessage = this.i18n.getText("i18n", "log_emptypath");
			return Q.reject(new Error(errMessage));
		}
		
		var i18n = this.i18n;
		return this.docProvider.getDocument(docFullPath).then(function(document) {
			if (document) {
				return document.delete();
			} else {
				var errMessage = i18n.getText("i18n", "log_failtoopen", [docFullPath]);
				return Q.reject(new Error(errMessage));
			}
		}).fail(function(error) {
			return Q.reject(error);
		});
	}
	
	/**
	 * get the metadata info from remote document using document provider
	 * @public
	 */
	function getDocumentMetadata(docFullPath) {
		if (!docFullPath) {
			var errMessage = this.i18n.getText("i18n", "log_emptypath");
			return Q.reject(new Error(errMessage));
		}
		
		return this.docProvider.getDocument(docFullPath).then(function(document) {
			if (document) {
				return Q(document.getDocumentMetadata());
			} else {
				return Q();
			}
		}).fail(function(error) {
			return Q.reject(error);
		});
	}
	
	/**
	 * get folder content using document provider
	 * @public
	 */
	/*function getFolderContent(folderFullPath, isRecursive) {
		if (!folderFullPath) {
			var errMessage = this.i18n.getText("i18n", "log_emptypath");
			return Q.reject(new Error(errMessage));
		}
		
		var docProvider = this.docProvider;
		var i18n = this.i18n;
		return docProvider.getDocument(folderFullPath).then(function(foderDoc) {
			if (foderDoc) {
				if (isRecursive) {
					// do not use 'foderDoc.getFolderContent()' here, as it is a network heavy invoke without any cache locally
					return getFolderContentRecursive(foderDoc, docProvider);
				} else {
					return foderDoc.getFolderContent().then(function(docEntries) {
						var folderFiles = [];
						for (var i in docEntries) {
							var docEntity = docEntries[i].getEntity();
							if (docEntity) {
								folderFiles.push(docEntity.getFullPath());
							}
						}
						return Q(folderFiles);
					});
				}
			} else {
				var errMessage = i18n.getText("i18n", "log_failtoopen", [folderFullPath]);
				return Q.reject(new Error(errMessage));
			}
		}).fail(function(error) {
			return Q.reject(error);
		});
	}*/
	
	/**
	 * get folder content in recursive
	 * @private
	 */
	/*function getFolderContentRecursive(folderDocument, docProvider) {
		if (!folderDocument) {
			return Q();
		}
		
		return folderDocument.getFolderContent().then(function(docEntries) {
			var promises = [];
			for (var i in docEntries) {
				var docEntity = docEntries[i].getEntity();
				if (docEntity) {
					var docFullPath = docEntity.getFullPath();
					if (docEntity.getType() == "folder") {
						var promise = docProvider.getDocument(docFullPath).then(function(subFolderDoc) {
							return getFolderContentRecursive(subFolderDoc, docProvider);
						});
						promises.push(promise);
					} else {
						promises.push(Q(docFullPath));
					}
				}
			}
			return Q.all(promises).then(function(fullPaths) {
				var fileFullPaths = [];
				for (var i in fullPaths) {
					var fullPath = fullPaths[i];
					if (Object.prototype.toString.call(fullPath) === '[object Array]') {
						fileFullPaths = fileFullPaths.concat(fullPath);
					} else if (typeof(fullPath) === 'string') {
						fileFullPaths.push(fullPath);
					}
				}
				return Q(fileFullPaths);
			});
		});
	}*/
	
	/**
	 * create remote document if the document does not exist
	 * @private
	 */
	function createDocumentIfNotExists(docFullPath, docProvider, i18n) {
		return docProvider.getDocument(docFullPath).then(function(document) {
			if (document) {
				return Q();
			}
			
			var pos = docFullPath.lastIndexOf('/');
			if (pos < 0) {
				var errMessage = i18n.getText("i18n", "log_invalidpath", [docFullPath]);
				return Q.reject(new Error(errMessage));
			}
			
			var folderFullPath = docFullPath.substring(0, pos);
			var docFileName = docFullPath.substring(pos + 1);
			return createFolderIfNotExists(folderFullPath, docProvider, i18n).then(function(parentFolder) {
				if (parentFolder) {
					return parentFolder.createFile(docFileName);
				} else {
					var errMessage = i18n.getText("i18n", "log_failtocreateopen", [folderFullPath]);
					return Q.reject(new Error(errMessage));
				}
			});
		});
	}
	
	/**
	 * create remote folder if the folder does not exist
	 * @private
	 */
	function createFolderIfNotExists(folderFullPath, docProvider, i18n) {
		return docProvider.getDocument(folderFullPath).then(function(folder) {
			if (folder) {
				return Q(folder);
			} else {
				var upperPath = getUpperPath(folderFullPath);
				if (!upperPath) {
					var errMessage = i18n.getText("i18n", "log_failtocreatenoroot", [folderFullPath]);
					return Q.reject(new Error(errMessage));
				} else {
					var thisFolderName = folderFullPath.substring(upperPath.length + 1);
					return createFolderIfNotExists(upperPath, docProvider, i18n).then(function(upperFolder) {
						return upperFolder.createFolder(thisFolderName);
					});
				}
			}
		}).fail(function(error) {
			// retry, if the folder already exists
			//console.warn(error);
			return docProvider.getDocument(folderFullPath);
		});
	}
	
	/**
	 * @private
	 */
	function getUpperPath(path) {
		if (!path || !path.trim()) {
			return;
		}
		
		path = path.trim();		
		if (path[path.length - 1] == '/') {
			path = path.substring(0, path.length - 1);
		}
		var pos = path.lastIndexOf('/');
		if (pos < 0) {
			return;
		}
		return path.substring(0, pos);
	}
	
	function RemoteDocUtil(docProvider, i18n) {
		if (!docProvider || !i18n) {
			throw new Error();
		}
		
		this.docProvider = docProvider;
		this.i18n = i18n;
	}
	
	RemoteDocUtil.prototype = {
		loadDocument: loadDocument,
		saveDocument: saveDocument,
		deleteDocument: deleteDocument,
		getDocumentMetadata: getDocumentMetadata
		//getFolderContent: getFolderContent
	};
	
	return {
		RemoteDocUtil: RemoteDocUtil
	};
});