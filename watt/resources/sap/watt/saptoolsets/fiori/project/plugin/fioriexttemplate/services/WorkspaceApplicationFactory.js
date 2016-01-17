define(["sap/watt/platform/plugin/utils/common/RemoteDocument", "sap/watt/lib/jszip/jszip-shim"], function(RemoteDocument, JSZip) {

	var WorkspaceApplicationFactory = function() {
		var that = this;

		this._normalizeEOLtoWindowsStyle = function(text) {
			return text.replace(/(?:\r\n|\r|\n)/g, "\r\n");
		};

		var getRelativePath = function(file, filename) {
			var index = file.lastIndexOf(filename);
			index = (index > 0 ? index - 1 : 0); //remove the "/" from the path if exists
			var path = file.substring(0, index);
			if (path === "") {
				return "";
			} else {
				return "/" + path;
			}
		};

		var endsWith = function(stringValue, suffix) {
			return stringValue.indexOf(suffix, stringValue.length - suffix.length) !== -1;
		};

		var isDir = function(resource) {
			var isDirByName = endsWith(resource.name, "/");
			if (resource.options.dir || isDirByName) {
				return true;
			}

			return false;
		};

		var getFileExtension = function(name) {
			var sExtension = "";
			var index = name.lastIndexOf(".");
			if (index > 0) {
				sExtension = name.substr(index + 1);
			}
			return sExtension;
		};

		var isBinaryFile = function(name) {
			switch (getFileExtension(name).toLowerCase()) {
				case "jpg":
				case "jpeg":
				case "gif":
				case "ico":
				case "png":
				case "ttf":
				case "zip":
				case "jar":
				case "war":
				case "bmp":
				case "tif":
				case "tiff":
					return true;

				default:
					return false;
			}
		};

		var checkIgnore = function(ignoreList,resname) {
		    if(resname.indexOf(".git") > -1){ //allways ignore .git dir
		        return true;
		    }
			for (var i = 0; i < ignoreList.length; i++) {
                if (resname.indexOf(ignoreList[i]) >= 0 ) { // ignore the entire path that contains resname			
                    return true;
				}
			}
			return false;
		};
		
		
		var getUI5IgnoreDocument = function(projectDocument) {
			return projectDocument.getFolderContent().then(function(folderDocuments) {
				for (var i = 0; i < folderDocuments.length; i++) {
					var document = folderDocuments[i];
					if (document.getEntity().getName() === ".Ui5RepositoryIgnore") {
						return document;
					} 
				}
				return;
			});
		};

		this._buildIgnoreList = function(projectDocument) {
		    var ignoreList = [];
			return getUI5IgnoreDocument(projectDocument).then(function(ignoreDocument) {
				if (ignoreDocument) {
					return ignoreDocument.getContent().then(function(fileContent) {
					    
						var ignoreListNames = fileContent.split("\n"); //files or folder names

						for (var i = 0; i < ignoreListNames.length; i++) {
						    ignoreListNames[i] = ignoreListNames[i].trim();
						    if (ignoreListNames[i].length > 0) {
						        //update the ignoreList
						    	ignoreList.push(ignoreListNames[i]);
						    }
						}
						
						return ignoreList;

					});
				} else {
				    return [];
				}
			});
		};

		this._onZipLoad = function(e, projectDocument,ignoreList, oDeferred) {
			var application = {};
			application.localPath = projectDocument.getEntity().getFullPath();
			var oRemoteDocuments = [];
			var zip = new JSZip(e.target.result);
			var files = zip.files;
			var localProjectName = application.localPath;

			for (var file in files) {
				if (files.hasOwnProperty(file)) {
					if (!checkIgnore(ignoreList,file)) { // if the file or folder name is in the ignore list then dont deploy it
						var fileContent = "";
						var type = "folder";
						var name = null;
						var parent = null;
						var arr = null;

                        if (isDir(files[file])) { // directory
                        	arr = file.split("/");
                        	name = arr[arr.length - 2];
                        	if ((arr.length - 3) >= 0) {
                        		parent = arr[arr.length - 3];
                        	}
                        } else { // file
                        	type = "file";
                        	arr = file.split("/");
                        	name = arr[arr.length - 1];
                        	if ((arr.length - 2) >=0) {
                        		parent = arr[arr.length - 2];
                        	}
                        	if (isBinaryFile(name)) {
                        		fileContent = files[file].asUint8Array();
                        	} else {
                        		fileContent = that._normalizeEOLtoWindowsStyle(files[file].asText());
                        	}
                        }

						var parentfolderPath = localProjectName + getRelativePath(file, name);
						var remoteDocument = new RemoteDocument(name, type, fileContent, parentfolderPath, parent);
						oRemoteDocuments.push(remoteDocument);
					}
				}
			}

			application.localProjectName = localProjectName;
			application.remoteDocuments = oRemoteDocuments;
			oDeferred.resolve(application);
		};
        
        /* MK: This function turns the project from workspace to a ZIP,
           and goes over all of its resources (folders/files).
           Then it builds a RemoteDocument object out of every resource which contains the resource's content.
           It is done this way because it is less expensive in performance (instead of using the method
           getContent of Orion Document which is very expensive and done asynchronously).
        */
		this.getApplicationFromWorkspace = function(workspaceProjectdocument) {
			if (workspaceProjectdocument) {
				return workspaceProjectdocument.getProject().then(function(oProjectDocument){
					//ignor file is placed in the root, and in buildable projects we get an inner folder
				    return that._buildIgnoreList(oProjectDocument).then(function(ignoreList){
				        return workspaceProjectdocument.exportZip().then(function(blob) {
	    					var oDeferred = Q.defer();
	    					 /* eslint-disable no-undef */
	    					var reader = new FileReader();
	    					 /* eslint-enable no-undef */
	    					reader.onload = function(e) {
	    						that._onZipLoad(e, workspaceProjectdocument, ignoreList,oDeferred);
	    					};
	    					reader.readAsArrayBuffer(blob);
	    					return oDeferred.promise;
	    				});
				    });
				});
			}

			return Q();
		};
	};

	return WorkspaceApplicationFactory;
});