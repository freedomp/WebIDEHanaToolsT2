define(["sap/watt/lib/lodash/lodash"], function(_) {

	var oContext = null;

	var _displayMessage = function(key, params, isInfo) {
		if (isInfo === true) {
			oContext.service.log.info("CloneAndOpen", oContext.i18n.getText("i18n", key, params), ["user"]).done(); 
		} else {
			oContext.service.log.error("CloneAndOpen", oContext.i18n.getText("i18n", key, params), ["user"]).done(); 
		}
		
		oContext.service.usernotification.liteInfo(oContext.i18n.getText("i18n", key, params)).done();
	};

	/**
	 * Returns a path that starts with a "/"
	 * @param path
	 * @private
	 */
	var _getPathWithSlashPrefix = function(path) {
		var resPath;
		if (path.charAt(0) === "/") {
			resPath = path;
		} else {
			resPath = "/" + path;
		}
		return resPath;
	};
	
	var _openFileAndSetEditorPosition = function(projectPath, path, editorposition) {
		var resPath;

		if (path) {
			resPath = _getPathWithSlashPrefix(path);
			// get workspace document by its full path (projectPath + resPath)
			return oContext.service.filesystem.documentProvider.getDocument(projectPath + resPath).then(function(oDocument) {
				if (oDocument) {
					// only a file could be opened by document.open method
					if (oDocument.getEntity().getType() === "file") {
						return oContext.service.document.open(oDocument).then(function() {
							if (editorposition) { // get line and column if editorposition is provided
								var numbers = editorposition.split(",");
								if (numbers.length === 1) { //TODO:
									_displayMessage("editor position by block name is not yet supported", [], false);
								} else if (numbers.length === 2) {
									var line = numbers[0].trim();
									var column = numbers[1].trim();

									if (jQuery.isNumeric(line) === true && jQuery.isNumeric(column) === true) {
										return oContext.service.aceeditor.gotoLine(line, column, true);
									}

									_displayMessage("line_and_column_must_be_numbers", [], false);
								} else {
									_displayMessage("invalid_line_column_coordinates", [], false);
								}
							}
						});
					}
				}
				_displayMessage("resource_not_found", [path], false);
			});
		} else {
			_displayMessage("path_not_found", [], false);
			return Q();
		}
	};

	/**
	 * Set the selection on the file if a path to the file is valid else select the project.
	 * @param {string} - projectPath path to the project
	 * @param {string} - path path to the file in a project (relative to the project). The path may start with a slash.
	 * 					 If it doesn't it will be automatically added.
	 * @returns {promise}
	 * @private
	 */
	var _setSelection = function (projectPath, path) {
		var fullPath;
		if(path) {
			//Select the file
			fullPath = projectPath + _getPathWithSlashPrefix(path);
		} else {
			//Select the project
			fullPath = projectPath;
		}

		return oContext.service.filesystem.documentProvider.getDocument(fullPath).then(function(oDocument) {
			if (oDocument) {
				// select the document. if it is a folder it will be expanded
				return oContext.service.repositorybrowser.setSelection(oDocument, true);
			} else {
				//select the project folder
				return oContext.service.filesystem.documentProvider.getDocument(projectPath).then(function(oProjectDocument) {
					if (oProjectDocument) {
						return oContext.service.repositorybrowser.setSelection(oProjectDocument, true);
					}
				});
			}
		});

	};

	// retrieve path from url
	// the return value of "http://host:port/path1/file.xml" is "/path1/file.xml"
	var getUrlPath = function(url) {
		var indexOfSlashes = url.indexOf("://") + 3;
		// index of first "/" that is bigger than index of "://"
		var indexOfFirstSlash = url.indexOf("/", indexOfSlashes);

		return url.substring(indexOfFirstSlash);
	};

	// validate whether project already exist in workspace
	var projectExist = function(repositoryurl) {
		// get repositoryurl path
		var repositoryUrlPath = getUrlPath(repositoryurl);
		// get workspace root
		return oContext.service.filesystem.documentProvider.getRoot().then(function(oRoot) {
			var sLocation = oRoot.getEntity().getBackendData().location;
			// get all existing workspace Git repositories
			return oContext.service.git.getRepositoriesList(sLocation).then(function(list) {
				//Filter repositories that have GitUrl only
				var reposWithUrl = _.filter(list, function(repository) {
					return repository.GitUrl;
				});

				var projectPath = "";

				for(var i = 0; i < reposWithUrl.length; i++) {
					var repository = reposWithUrl[i];
					var gitItemUrlPath = getUrlPath(repository.GitUrl);
					if ( gitItemUrlPath === repositoryUrlPath ) { // project exist in workspace
						// get workspace project path
						projectPath = "/" + repository.Name;
						_displayMessage("reposetory_exist", [repositoryurl], true);
						return projectPath;
					}
				}

				return projectPath;
			});
		});
	};

	/**
	 * This method is called by the external command framework. It clones the project from @sParam.repositoryurl in
	 * case the repository doesn't already exist in the workspace. This function has also the following side effects:
	 *
	 * If @sParam.path is valid, the file will be opened and it will be selected.
	 * If @sParam.path is invalid or not supplied, the project will be selected.
	 * If both @sParam.path and @sParam.editorposition are valid, the cursor will point to the given line and column.
	 *
	 * @param {Object} sParam - The json parameter sent with the external command
	 * @param {string} sParam.repositoryurl - Required parameter. The URL of the repository that should be cloned
	 * @param {boolean} [sParam.confgerritcid] - Optional parameter. Represents the value of the checkbox of add
	 * 											 configuration for Gerrit change ID
	 * @param {string} [sParam.path] - Optional parameter. Path pf the file to open. The path is relative to the
	 * 								   project and starts with a slash "/". If supplied the file will be opened
	 * 								   after the clone finishes.
	 * @param {string} [sParam.editorposition] -  Optional parameter. Valid only if @sParam.path is supplied. This
	 * 											  parameter is a string containing two integers separated by a comma.
	 * 											  The first integer is the line number and the second is the column.
	 * 											  //TODO this should be refactored to be an object containing line and column
	 * @returns Promise
	 * @private
	 */
	var _execute = function(sParam) {

		oContext = this.context;
		//projectPath is not defined in the module since we do not want it to be shared between repetitive invocations
		//of _execute
		var projectPath = "";

		if(!sParam.repositoryurl) {
			// repositoryurl is a mandatory parameter
			_displayMessage("repositoryurl_missing", ["repositoryurl"], false);
			return Q();
		}

		return projectExist(sParam.repositoryurl).then(function(_projectPath) {
			projectPath = _projectPath;
			if(!_projectPath) {
				//if the project does not exist then clone it first
				return oContext.service.clone.doClone(sParam.repositoryurl, sParam.confgerritcid).then(function(result) {
					if (result === false) {
						// Cancel button pressed (Git dialog)
						_displayMessage("clone_canceled", [sParam.repositoryurl], true);
					} else {
						// OK button pressed (Git dialog)
						_displayMessage("clone_completed", [sParam.repositoryurl], true);
						// report when clone succeeded
						oContext.service.usagemonitoring.report("externalcommands", "invoke", "clone").done();
						// get project path
						projectPath = result.Location.substring(result.Location.lastIndexOf("/"));
					}
					return result;
				});
			}
			return true;
		}).then(function (result) {
			if(result) {
				//we open the file and set the position and selection only if the user didn't press cancel in the
				//clone dialog if the repository already exists
				return _openFileAndSetEditorPosition(projectPath, sParam.path, sParam.editorposition).then(function() {
					//Set the selection on the file if a path to the file is valid else select the project
					return _setSelection(projectPath, sParam.path);
				});
			}
		});

	};

	return {
		execute : _execute
	};
});