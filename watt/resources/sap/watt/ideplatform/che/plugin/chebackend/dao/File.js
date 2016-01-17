define(["../io/Request"], function (Request) {
    "use strict";
    // //////////////////////////////////////////////////////////////////////////////////////////////////////
    // Exposed //////////////////////////////////////////////////////////////////////////////////////////////
    var File = {
        /**
         * Connects to Che
         *
         * @memberOf sap.watt.uitools.chebackend.dao.File
         * @param {string}
         *            sUser the user name
         * @param {string}
         *            sPassword the password
         * @return {Promise} a deferred promise that will provide the user
         */
        connect: function (sUser, sPassword) {
            var that = this;
            if (sap.watt.getEnv("orion_needs_login")) {
                return _login(sUser, sPassword).fail(
                    function (oError) {

                        // Automated user creation for test environment
                        if (oError.status == 401 && sap.watt.getEnv("orion_create_user")) {
                            return Request.send(
                                "/users?login=" + encodeURI(sUser) + "&password=" + encodeURI(sPassword),
                                "POST", {}).then(function () {
                                return _login(sUser, sPassword);
                            });
                        } else {
                            throw oError;
                        }

                    }).then(function (oResult) {
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
        /**
         * Obtains the children of a remote resource.
         *
         * @memberOf sap.watt.uitools.chebackend.dao.File
         * @param {string}
         *            sLocation The location of the item to obtain children for
         * @return {Promise} a deferred promise that will provide the array of child objects
         */
        fetchChildren: function (sLocation) {
            return Request.send(sLocation);
        },
        /**
         * Creates a new workspace with the given name.
         *
         * @memberOf sap.watt.uitools.chebackend.dao.File
         * @param {string}
         *            sName The name of the new workspace
         */
        createWorkspace: function (sName, sAccountId) {
            return Request.send("/workspace", "POST", {}, {
                accountId: sAccountId,
                name: sName,
                attributes: {}
            });
        },
        /**
         * add member (userId) to a given workspace.
         *
         * @memberOf sap.watt.uitools.chebackend.dao.File
         * @param {string}
         *            sUser The member's userId
         * @param {string}
         *            workspaceId the location of the workspace to load
         */
        addMemberToWorkspace: function (sUser, workspaceId) {
            return Request.send("/workspace/" + workspaceId + "/members", "POST", {}, {
                userId: sUser,
                roles: ["workspace/admin", "workspace/developer"]
            });
        },
        getWorkspaceId: function (sWorkspaceName) {
            return Request.send("/workspace?name=" + sWorkspaceName, "GET", {});
        },
        /**
         * Loads all the user's workspaces.
         *
         * @memberOf sap.watt.uitools.chebackend.dao.File
         * @return {Promise} a deferred promise that will provide the loaded workspaces
         */
        loadWorkspaces: function () {
            return Request.send("/workspace/all");
        },
        /**
         * Loads the workspace with the given id and sets it to be the current workspace for the IDE. The workspace is
         * created if none already exists.
         *
         * @memberOf sap.watt.uitools.chebackend.dao.File
         * @param {string}
         *            workspaceId the location of the workspace to load
         * @return {Promise} a deferred promise that will provide the loaded workspace
         */
        loadWorkspace: function (workspaceId) {
            return Request.send("/workspace/" + workspaceId);
        },
        /**
         * Creates a folder.
         *
         * @memberOf ssap.watt.ideplatform.orion.orionbackend.dao.File
         * @param {string}
         *            sParentLocation The location of the parent folder
         * @param {string}
         *            sFolderName The name of the folder to create
         * @return {Promise} a deferred promise that will provide the JSON representation of the created folder
         */
        createFolder: function (sParentLocation, sFolderName) {
            // Check if the folder is root and create project if it is
            var url = sParentLocation + "/" + sFolderName;
            var data = {};
            return Request.send(url, "POST", {}, data);
        },
        /**
         * Create a new file in a specified location.
         *
         * @memberOf sap.watt.uitools.chebackend.dao.File
         * @param {string}
         *            sParentLlocation The location of the parent folder
         * @param {string}
         *            sFileName The name of the file to create
         * @return {Promise} a deferred promise that will provide the new file object
         */
        createFile: function (sParentLlocation, sFileName) {
            return Request.send(sParentLlocation + "/?name=" + sFileName, "POST", {
                "headers": {
                    "Content-Type": "text/plain"
                }
            }, {});
        },
        /**
         * Deletes a file, directory, or project.
         *
         * @memberOf sap.watt.uitools.chebackend.dao.File
         * @param {string}
         *            sLocation The location of the file or directory to delete.
         * @return {Promise} a deferred promise that will provide the response of the delete file request
         */
        deleteFile: function (sLocation) {
            return Request.send(sLocation, "DELETE");
        },
        /**
         * Moves a file or directory.
         *
         * @memberOf sap.watt.uitools.chebackend.dao.File
         * @param {string}
         *            sSourceLocation The location of the file or directory to move.
         * @param {string}
         *            sTargetFolder The location of the target folder.
         * @param {string}
         *            sName optional: The name of the destination file or directory in the case of a rename
         * @return {Promise} a deferred promise that will provide the response of the move file request
         */
        move: function (sSourceLocation, sTargetFolder, sName, bOverwrite) {
            var moveOptions = {};
            // if sName is null then default behaviour of server is chosen
            moveOptions.name = sName ? sName : "";
            // if bForce is null then default behaviour of server is chosen
            moveOptions.overWrite = bOverwrite ? bOverwrite : false;
            return Request.send(sSourceLocation + "/?to=" + sTargetFolder, "POST", {
                "headers": {
                    "Content-Type": "application/json"
                }
            }, moveOptions);
        },
        /**
         * Copies a file or directory.
         *
         * @memberOf sap.watt.uitools.chebackend.dao.File
         * @param {string}
         *            sSourceLocation The location of the file or directory to copy.
         * @param {string}
         *            sTargetLocation The location of the target folder.
         * @param {string}
         *            sName optional: The name of the destination file or directory in the case of a rename
         * @param {string}
         *            bOverwrite optional: true file shall be overwritten, false if not (default)
         * @return {jQuery.Promise} a deferred promise that will provide the response of the copied file request
         */
        copy: function (sSourceLocation, sTargetLocation, sName, bOverwrite) {
            var copyOptions = {};
            // if sName is null then default behaviour of server is chosen
            copyOptions.name = sName ? sName : "";
            // if bForce is null then default behaviour of server is chosen
            copyOptions.overWrite = bOverwrite ? bOverwrite : false;
            return Request.send(sSourceLocation + "/?to=" + sTargetLocation, "POST",{
                "headers": {
                    "Content-Type": "application/json"
                }
            }, copyOptions);
        },
        /**
         * Returns the metadata of the file at the given location.
         *
         * @memberOf sap.watt.uitools.chebackend.dao.File
         * @param {string}
         *            sLocation The location of the file to get metadata for
         * @return {Promise} a deferred promise that will provide the file metadata
         */
        readFileMetadata: function (sLocation) {
            var oDeferred = Q.defer();
            return Request.send(sLocation, "GET", {}).then(function (oResult) {
                var result = oResult;
                if (jQuery.type(oResult) === "string") {
                    result = JSON.parse(oResult);
                }
                oDeferred.resolve(result);
                return oDeferred.promise;
            });
        },
        /*
         * This method is used to retrieve the contents of a file from remote storage @param {type} sLocation the Url
         * used to retrieve file content brom BE @param {type} bBinary indecates if the given file is binary @returns
         * {undefined} a deferred promise that will provide the file content
         */
        readFileContent: function (sLocation, bBinary) {

            return Request.send(sLocation, "GET", {
                blob: bBinary
            }).then(
                function (oResult) {
                    var result = oResult;
                    if ((jQuery.type(oResult) === "object" || jQuery.type(oResult) === "array") && !jQuery.isXMLDoc(oResult) && !bBinary) {
                        result = JSON.stringify(oResult);
                    } else if (jQuery.isXMLDoc(oResult)) {
                        var oSerializer = new XMLSerializer();
                        result = oSerializer.serializeToString(oResult);
                    }
                    return result;
                });
        },
        /**
         * Writes the contents or metadata of the file at the given location.
         *
         * @memberOf sap.watt.uitools.chebackend.dao.File
         * @param {string}
         *            sLocation The location of the file to set contents for
         * @param {string|object}
         *            oContents The content string, or metadata object to write
         * @param {string}
         *            sETag The eTag
         * @return {Promise} a deferred promise that will provide the response of the write request
         */
        write: function (sLocation, oContents, sETag, bBinary) {
            // currently no further args are passed for the write request (as orion client implementation also only uses
            // eTag)
            // TODO REMOTE: handle binary content
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
            mHeader["Fetch-Date"] = true;
            return Request.send(sLocation, "PUT", mHeader, oContents);
        },
        /**
         * Imports file and directory contents from another server
         *
         * @memberOf sap.watt.uitools.chebackend.dao.File
         * @param {string}
         *            sTargetLocation The location of the folder to import into
         * @param {object}
         *            options An object specifying the import parameters
         */
        remoteImport: function (sTargetLocation, options) {
            throw new Error("Not implemented");
        },
        /**
         * Exports file and directory contents to another server.
         *
         * @memberOf sap.watt.uitools.chebackend.dao.File
         * @param {string}
         *            sSourceLocation The location of the folder to export from
         * @param {object}
         *            options An object specifying the export parameters
         */
        remoteExport: function (sSourceLocation, options) {
            throw new Error("Not implemented");
        },
        /**
         * Performs a search with the given query.
         *
         * @memberOf sap.watt.uitools.chebackend.dao.File
         * @param {string}
         *            sLocation
         * @param {string}
         *            sQuery
         * @return {Promise} a deferred promise that will provide array of File
         */
        // TODO REMOTE change parameters to {object} searchParams like in orion file client api?
        search: function (sLocation, sQuery) {
            var oDeferred = Q.defer();
            Request.send(sLocation + sQuery, "GET").then(function (oResult) {
                oDeferred.resolve(oResult);
            }, function (oError) {
                oDeferred.reject(oError);
            });
            return oDeferred.promise;
        },
        renameResource: function (sSourceLocation, sNewName) {
            return Request.send(sSourceLocation + "/?name=" + sNewName, "POST", {});
        }
    };

    // //////////////////////////////////////////////////////////////////////////////////////////////////////
    // Internal /////////////////////////////////////////////////////////////////////////////////////////////

    function _login(sUser, sPassword) {
        return Request.send("/login/form?login=" + encodeURI(sUser) + "&password=" + encodeURI(sPassword), "POST", {
            timeout: 5000
        });
    }

    return File;

});