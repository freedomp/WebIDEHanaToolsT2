// TODO REMOTE Global Error handling
define(["./AbstractSystem", "../dao/File", "../util/PathMapping"], function (AbstractSystem, FileDao, PathMapping) {
    "use strict";

    // //////////////////////////////////////////////////////////////////////////////////////////////////////
    // Internal /////////////////////////////////////////////////////////////////////////////////////////////

    var _ensureLogin = null;
    var _mUser = {
        sName: null,
        sAccount: null,
        sEMail: null,
        sFirstName: null,
        sLastName: null
    };

    function _getAccountId() {
		var sAccount;
		var serverType = sap.watt.getEnv("server_type");
		if (serverType == "hcproxy") { //HCP scenario
			//TODO: TEMP w/a; need to get hcp account id from hcp; NOT parse it from hostname!!
			var sHost = window.location.hostname;
			var aParts = sHost.split(".");
			var sServer = aParts[0];
			aParts.shift();
			var sDispatcher = aParts.join(".");
			aParts.shift();
			sAccount = sServer.split("-")[1];
		} else if (serverType == "xs2"){ //xs2 scenario
			//TODO TEMP hardcoded w/a; need to get account id from DI!!
			sAccount = "local_account_xs2";
		}
        return sAccount;
    }

    function _callHeliumApi(sUrl) {
        return jQuery.ajax({
            url: sUrl,
            dataType: "json"
        });
    }

    function _getCurrentUser() {
        if (sap.watt.getEnv("server_type") === "hcproxy") {
            return _callHeliumApi(sap.watt.getEnv("context_root") + "services/userapi/currentUser");
        } else if (sap.watt.getEnv("server_type") === "xs2") {
			//TODO: should use Request.send()
			return _callHeliumApi(sap.watt.getEnv("che_server") + "user").then(function(oUser){
				var mUser = {};
				mUser.email = oUser.email;
				mUser.firstName = oUser.id;
				mUser.lastName = oUser.id;
				mUser.account = _getAccountId();
				mUser.name = oUser.id;
				return Q(mUser);
			});
		} else {
            return Q(null);
        }
    }

    function _isCloudSessionLost(oXhr) {
        return (oXhr.getResponseHeader("com.sap.cloud.security.login") == "login-request");
    }

    // //////////////////////////////////////////////////////////////////////////////////////////////////////
    // Exposed //////////////////////////////////////////////////////////////////////////////////////////////

    var oSystem = jQuery.extend(AbstractSystem, {

        logout: function () {
        	this.context.event.fireLoggedOut();
        	window.location.replace('/watt/logout');
       },

        login: function (sUsername, sPassword) {
            //Use a promise to track the login state and handle concurrent calls
            if (_ensureLogin) {
                return _ensureLogin;
            }
            var that = this;
            _ensureLogin = Q.all([_getCurrentUser()]).spread(function (mUser) {
                if (mUser) {
                    _mUser.sName = mUser.name;
                    _mUser.sEMail = mUser.email;
                    _mUser.sFirstName = mUser.firstName;
                    _mUser.sLastName = mUser.lastName;
                }
                return FileDao.loadWorkspaces();
            }).then(function (aWorkspaces) {
                if (aWorkspaces && aWorkspaces.length > 0 && aWorkspaces[0].workspaceReference) {
                    var workspace = aWorkspaces[0];
                    var aUserName = workspace.userId.split("$");
                    // UserName is either <account>$<userId> for tenant-aware orion or else <userId>
                    var sAccount = aUserName.length > 1 ? aUserName[0] : null;
                    var sUserName = aUserName.length > 1 ? aUserName[1] : aUserName[0];
                    _mUser.sAccount = sAccount;
                    if (!_mUser.sName) { // fallback if not running in cloud
                        _mUser.sName = sUserName;
                    }

                    var oWorkspace = workspace.workspaceReference;
                    return FileDao.loadWorkspace(oWorkspace.id);
                } else {
                    // if running in the cloud it might happen that workspace does not exist yet
                    var accountId = _getAccountId();
                    var workspaceName = "webide-" + _mUser.sName;
                    var userId = _mUser.sName;
                    return FileDao.createWorkspace(workspaceName, accountId).then(function (oResult) {
                        var workspaceId = oResult.id;
                        return FileDao.addMemberToWorkspace(userId, workspaceId).then(function () {
                            return FileDao.loadWorkspace(workspaceId);
                        });
                    }).fail(function (oError) {
                        if (oError.status === 409) {
                            FileDao.getWorkspaceId(workspaceName).then(function (oResult) {
                                var workspaceId = oResult.id;
                                return FileDao.addMemberToWorkspace(userId, workspaceId).then(function () {
                                    return FileDao.loadWorkspace(workspaceId);
                                });
                            }).fail(function (oError) {
                                throw new Error(oError.message);
                            });
                        } else {
                            throw new Error(oError.message);
                        }
                    });
                }
            }).then(function (mWorkspace) {
                // Map the file root to the workspace root
                PathMapping.workspace.id = mWorkspace.id;
                // Map the file root to the workspace root
                PathMapping.workspace.location = ""; //"/project";
                PathMapping.workspace.childLocation = "/project/" + mWorkspace.id;

                // TODO: fill in search location...                                              
                return that.context.event.fireLoggedIn();
            }, function (oError) {
                if (oError.status === 401) {
                    throw new Error(JSON.parse(oError.responseText).error);
                } else if (oError.status === 0 && oError.statusText === "timeout") {
                    throw new Error(that.context.i18n.getText("i18n", "system_timeout"));
                } else {
                    var sText = that.context.i18n.getText("i18n", "system_unexpectedError");
                    console.error(sText);
                    console.error(oError.message + "\n" + oError.stack);
                    return that.context.event.fireFailure();
                }
            });
            return _ensureLogin;
        },

        isAlive: function () {
            var sUri = URI("user").absoluteTo(sap.watt.getEnv("che_server")).toString();
            var oXhr = jQuery.ajax(sUri);
            return Q(oXhr).then(function () {
                if (oXhr.status !== 200) {
                    throw new Error("SERVER_ERROR");
                } else {
                    if (_isCloudSessionLost(oXhr)) {
                        throw new Error("SESSION_LOST");
                    }
                }
            }, function (oXHR) {
                throw new Error("CONNECTION_LOST");
            });
        },

        getSystemInfo: function () {
            return _ensureLogin.then(function () {
                return {
                    sDbname: "Orion", // TODO REMOTE This is just to specify a title for the root node
                    sUsername: _mUser.sName,
                    sAccount: _getAccountId(),
                    sEMail: _mUser.sEMail,
                    sFirstName: _mUser.sFirstName,
                    sLastName: _mUser.sLastName
                };
            });
        }

    });

    return oSystem;

});
