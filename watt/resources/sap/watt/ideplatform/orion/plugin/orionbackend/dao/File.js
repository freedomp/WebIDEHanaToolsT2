define(["../io/Request"], function(Request) {
	"use strict";
	var File = {

		/** 
		 * @private
		 * @memberOf sap.watt.ideplatform.orion.orionbackend.dao.File
		 * @type {sap.watt.ideplatform.orion.orionbackend.io.Request}
		 */
		_io: Request,

		/**
		 * orion version
		 */
		_orionVersion: null,

		/** Connects to orion
		 * @memberOf sap.watt.ideplatform.orion.orionbackend.dao.File
		 * @param {string} sUser the user name
		 * @param {string} sPassword the password
		 * @return {Promise} a deferred promise that will provide the user
		 */
		connect: function(sUser, sPassword) {
			var that = this;
			if (sap.watt.getEnv("orion_needs_login")) {
				return this._login(sUser, sPassword).fail(
					function(oError) {

						//Automated user creation for test environment
						if (oError.status == 401 && sap.watt.getEnv("orion_create_user")) {
							var oNewUser = {
								"UserName": encodeURI(sUser),
								"Password": encodeURI(sPassword),
								"FullName": encodeURI(sUser)
							};

							return that._io.send("/users?" + that._getUserParam(sUser) + "&password=" + encodeURI(sPassword), "POST", {}, oNewUser)
								.then(function() {
									return that._login(sUser, sPassword);
								});
						} else {
							throw oError;
						}

					}).then(function(oResult) {
					that.user = oResult;
					if (!that.user) {
						that.user = {
							Name: "orionode"
						};
					}
					return that.user;
				});
			} else {
				// cloud would need s2s communication - user is then already logged in
				return Q();
			}
		},

		_getUserParam: function(sUser) {
			var sEncodedUser = encodeURI(sUser);
			return "username=" + sEncodedUser + "&login=" + sEncodedUser;
		},

		_login: function(sUser, sPassword) {
			return this._io.send("/login/form?" + this._getUserParam(sUser) + "&password=" + encodeURI(sPassword), "POST", {
				timeout: 5000
			});
		},

		/** Performs a logout.
		 * @memberOf sap.watt.ideplatform.orion.orionbackend.dao.File
		 */
		logout: function() {
			return this._io.send("logout", "POST");
		},

		/** Obtains the children of a remote resource.
		 * @memberOf sap.watt.ideplatform.orion.orionbackend.dao.File
		 * @param {string} sLocation The location of the item to obtain children for
		 * @return {Promise} a deferred promise that will provide the array of child objects
		 */
		fetchChildren: function(sLocation) {
			return this._io.send(sLocation);
		},

		/** Creates a new workspace with the given name.
		 * @memberOf sap.watt.ideplatform.orion.orionbackend.dao.File
		 * @param {string} sName The name of the new workspace
		 */
		createWorkspace: function(sName) {
			var sUri = URI("workspace").absoluteTo(sap.watt.getEnv("orion_path")).toString();
			return this._io.send(sUri, "POST", {
				headers: {
					"Slug": sName
				}
			});
		},

		/** Loads all the user's workspaces.
		 * @memberOf sap.watt.ideplatform.orion.orionbackend.dao.File
		 * @return {Promise} a deferred promise that will provide the loaded workspaces
		 */
		loadWorkspaces: function() {
			var sUri = URI("workspace").absoluteTo(sap.watt.getEnv("orion_path")).toString();
			return this._io.send(sUri);
		},

		/** Loads the workspace with the given id and sets it to be the current
		 * workspace for the IDE. The workspace is created if none already exists.
		 * @memberOf sap.watt.ideplatform.orion.orionbackend.dao.File
		 * @param {string} sLocation the location of the workspace to load
		 * @return {Promise} a deferred promise that will provide the loaded workspace
		 */
		loadWorkspace: function(sLocation) {
			return this._io.send(sLocation);
		},

		/** Adds a project to a workspace.
		 * @memberOf sap.watt.ideplatform.orion.orionbackend.dao.File
		 * @param {string} sUrl The workspace location
		 * @param {string} sProjectName the human-readable name of the project
		 * @param {string} sServerPath The optional path of the project on the server.
		 * @param {boolean} bCreate If true, the project is created on the server file system if it doesn't already exist
		 */
		createProject: function(sUrl, sProjectName, sServerPath, bCreate) {
			throw new Error("Not implemented");
		},

		/** Creates a folder.
		 * @memberOf sap.watt.ideplatform.orion.orionbackend.dao.File
		 * @param {string} sParentLlocation The location of the parent folder
		 * @param {string} sFolderName The name of the folder to create
		 * @return {Promise} a deferred promise that will provide the JSON representation of the created folder
		 */
		createFolder: function(sParentLlocation, sFolderName) {
			return this._io.send(sParentLlocation + "/", "POST", {
				headers: {
					"Slug": sFolderName,
					"X-Create-Options": "no-overwrite" //Causes the ORION backend to return an error, if folder exists already
				}
			}, {
				"Name": sFolderName,
				"Directory": true
			});
		},

		/** Create a new file in a specified location.
		 * @memberOf sap.watt.ideplatform.orion.orionbackend.dao.File
		 * @param {string} sParentLlocation The location of the parent folder
		 * @param {string} sFileName The name of the file to create
		 * @return {Promise} a deferred promise that will provide the new file object
		 */
		createFile: function(sParentLlocation, sFileName) {
			return this._io.send(sParentLlocation + "/", "POST", {
				headers: {
					"Slug": sFileName,
					"X-Create-Options": "no-overwrite" //Causes the ORION backend to return an error, if file exists already
				}
			}, {
				"Name": sFileName,
				"Directory": false
			});
		},

		/** Deletes a file, directory, or project.
		 * @memberOf sap.watt.ideplatform.orion.orionbackend.dao.File
		 * @param {string} sLocation The location of the file or directory to delete.
		 * @return {Promise} a deferred promise that will provide the response of the delete file request
		 */
		deleteFile: function(sLocation) {
			return this._io.send(sLocation, "DELETE");
		},

		/** Moves a file or directory.
		 * @memberOf sap.watt.ideplatform.orion.orionbackend.dao.File
		 * @param {string} sSourceLocation The location of the file or directory to move.
		 * @param {string} sTargetFolder The location of the target folder.
		 * @param {string} sName optional: The name of the destination file or directory in the case of a rename
		 * @return {Promise} a deferred promise that will provide the response of the move file request
		 */
		move: function(sSourceLocation, sTargetFolder, sName) {
			return this._io.send(sTargetFolder + "/", "POST", {
				headers: {
					"Slug": sName,
					"X-Create-Options": "move"
				}
			}, {
				"Location": sSourceLocation
			});
		},

		/** Copies a file or directory.
		 * @memberOf sap.watt.ideplatform.orion.orionbackend.dao.File
		 * @param {string} sSourceLocation The location of the file or directory to copy.
		 * @param {string} sTargetLocation The location of the target folder.
		 * @param {string} sName optional: The name of the destination file or directory in the case of a rename
		 * @param {string} bOverwrite optional: true file shall be overwritten, false if not (default)
		 * @return {jQuery.Promise} a deferred promise that will provide the response of the copied file request
		 */
		copy: function(sSourceLocation, sTargetLocation, sName, bOverwrite) {
			return this._io.send(sTargetLocation + "/", "POST", {
				headers: {
					"Slug": sName,
					"X-Create-Options": "copy" + ((bOverwrite) ? "" : ",no-overwrite")
				}
			}, {
				"Location": sSourceLocation
			});
		},

		/** Returns the contents or metadata of the file at the given location.
		 * @memberOf sap.watt.ideplatform.orion.orionbackend.dao.File
		 * @param {string} sLocation The location of the file to get contents for
		 * @param {boolean} bIsMetadata : If defined and true, returns the file metadata, otherwise file contents are returned
		 * @return {Promise} a deferred promise that will provide the file content or the metadata
		 */
		read: function(sLocation, bIsMetadata, bBinary, bIsMetaAndContent) {
			if (bIsMetadata) {
				return this._io.send(sLocation + "?parts=meta").then(function(oResult) {
					// Orion does not set content type properly
					if (jQuery.type(oResult) === "string") {
						oResult = JSON.parse(oResult);
					}
					return oResult;
				});
			} else if (bIsMetaAndContent) {
				return this._io.sendMultipart(sLocation + "?parts=meta,body", "GET", {
					headers: {
						"Content-Type": "text/plain"
					},
					dataType: "text"
				}).then(function(aResults) {
					var sMetadata = aResults[0].replace("Content-Type: application/json", "").trim();
					aResults[0] = JSON.parse(_.unescape(sMetadata));
					return aResults;
				});
			} else {
				return this._io.send(sLocation, "GET", {
					headers: {
						"Content-Type": "text/plain"
					},
					dataType: "text",
					responseType: ((bBinary) ? "blob" : undefined)
				});
			}
		},

		doGetOrionVersion: function() {
			var that = this;
			var oVersion = {};
			oVersion.DAOName = "Orion";

			if (this._orionVersion) {
				return Q(this._orionVersion);
			} else {
				// get orion version
				return this._io.send("/healthcheck", "GET", {
					headers: {
						"Content-Type": "text/html"
					},
					dataType: "text"
				}).then(function(response) {
					var healthcheckSuffix = response.substring(response.indexOf("Orion Server"));
					oVersion.version = healthcheckSuffix.substr("Orion Server".length + 1, 1);
					that._orionVersion = oVersion;
					return Q(that._orionVersion);
				}).fail(function() {
					oVersion.version = 5;
					that._orionVersion = oVersion;
					return Q(that._orionVersion);
				});

			}

		},

		/** Writes the contents or metadata of the file at the given location.
		 * @memberOf sap.watt.ideplatform.orion.orionbackend.dao.File
		 * @param {string} sLocation The location of the file to set contents for
		 * @param {string|object} oContents The content string, or metadata object to write
		 * @param {string} sETag The eTag
		 * @return {Promise} a deferred promise that will provide the response of the write request
		 */
		write: function(sLocation, oContents, sETag, bBinary) {
			// currently no further args are passed for the write request (as orion client implementation also only uses eTag)
			//TODO REMOTE: handle binary content
			var mHeader = {
				headers: {
					"Content-Type": "text/plain"
				}
			};
			if (sETag) {
				mHeader = jQuery.extend(true, mHeader, {
					headers: {
						"If-Match": sETag
					}
				});
			}
			return this._io.send(sLocation, "PUT", mHeader, oContents);
		},

		/** Imports file and directory contents from another server
		 * @memberOf sap.watt.ideplatform.orion.orionbackend.dao.File
		 * @param {string} sTargetLocation The location of the folder to import into
		 * @param {object} options An object specifying the import parameters
		 */
		remoteImport: function(sTargetLocation, options) {
			throw new Error("Not implemented");
		},

		/** Exports file and directory contents to another server.
		 * @memberOf sap.watt.ideplatform.orion.orionbackend.dao.File
		 * @param {string} sSourceLocation The location of the folder to export from
		 * @param {object} options An object specifying the export parameters
		 */
		remoteExport: function(sSourceLocation, options) {
			throw new Error("Not implemented");
		},

		/** Performs a search with the given query.
		 * @memberOf sap.watt.ideplatform.orion.orionbackend.dao.File
		 * @param {string} sLocation
		 * @param {string} sQuery
		 * @return {Promise} a deferred promise that will provide array of File
		 */
		//TODO REMOTE change parameters to {object} searchParams like in orion file client api?
		search: function(sLocation, sQuery) {
			var oDeferred = Q.defer();
			this._io.send(sLocation + sQuery, "GET").then(function(oResult) {
				oDeferred.resolve(JSON.parse(_.unescape(oResult)));
			}, function(oError) {
				oDeferred.reject(oError);
			});
			return oDeferred.promise;
		}

	};

	return File;

});