// TODO REMOTE Global Error handling
define([ "./AbstractSystem", "../dao/File", "../util/PathMapping", "../io/Request" ], function(AbstractSystem, oFileDao, mPathMapping, Request) {
	"use strict";
	var oSystem = jQuery.extend(AbstractSystem, {

		/** 
		 * @private
		 * @memberOf sap.watt.ideplatform.orion.orionbackend.service.System
		 * @type {sap.watt.ideplatform.orion.orionbackend.util.PathMapping.workspace}
		 */
		_mWorkspace : mPathMapping.workspace,
		/** 
		 * @private
		 * @memberOf sap.watt.ideplatform.orion.orionbackend.service.System
		 * @type {sap.watt.ideplatform.orion.orionbackend.dao.File}
		 */
		_oDao : oFileDao,

		_ensureLogin : null,

		_mUser : {
			sName : null,
			sAccount : null,
			sEMail : null,
			sFirstName : null,
			sLastName : null
		},

		logout : function() {
			var that = this;
			return this._logout().then(function(bCloud) {
				that._ensureLogin = null;
				var sLogoutPage = "logout.html";
				var sLogoutpath = "/" + sLogoutPage;
				that.context.event.fireLoggedOut().done();
				// In any case localInstallation/ HCP logput page will be displayed.
				if(bCloud !== true) {
					//in case of local installation the path is <host>/webide/index.html
					//as opposed to to cloud installation where the path is <host>/index.html
					//for correct redirect we have this logic
					sLogoutPage = "logoutLocal.html";
					var sPath = window.location.pathname;
					var aParts = sPath.split(/\//);//split / from path
					var iWebIDEIndex = jQuery.inArray("webide",aParts);
					if (iWebIDEIndex >-1) {
						aParts[iWebIDEIndex+1] = sLogoutPage;
						sLogoutpath = aParts.join('/');
					}
				}
				window.location.href = sLogoutpath;
				
			});
		},

		login : function(sUsername, sPassword) {
			//Use a promise to track the login state and handle concurrent calls
			if (this._ensureLogin) {
				return this._ensureLogin;
			}
			var that = this;
			this._ensureLogin = Q.all([ this._getCurrentUser(), this._oDao.connect(sUsername, sPassword) ]).spread(function(mUser) {
				if (mUser) {
					that._mUser.sName = mUser.name;
					that._mUser.sEMail = mUser.email;
					that._mUser.sFirstName = mUser.firstName;
					that._mUser.sLastName = mUser.lastName;
				}
				return that._oDao.loadWorkspaces();
			}).then(function(aWorkspaces) {
				var aUserName = aWorkspaces.UserName.split("$");
				// UserName is either <account>$<userId> for tenant-aware orion or else <userId>
				var sAccount = aUserName.length > 1 ? aUserName[0] : null;
				var sUserName = aUserName.length > 1 ? aUserName[1] : aUserName[0];
				that._mUser.sAccount = sAccount;
				if (!that._mUser.sName) { // fallback if not running in cloud
					that._mUser.sName = sUserName;
				}
				if (aWorkspaces && aWorkspaces.Workspaces.length > 0) {
					var oWorkspace = aWorkspaces.Workspaces[0];
					return that._oDao.loadWorkspace(oWorkspace.Location);
				} else {
					// if running in the cloud it might happen that workspace does not exist yet
					// (then it needs to be created first - name is "Orion Content")
					return that._oDao.createWorkspace("Orion Content");
				}
			}).then(function(mWorkspace) {
				// Map the file root to the workspace root
				that._mWorkspace.location = mWorkspace.Location;
				that._mWorkspace.childLocation = mWorkspace.ChildrenLocation;
				that._mWorkspace.searchLocation = mWorkspace.SearchLocation;
				return that.context.event.fireLoggedIn();
			}, function(oError) {
				if (oError.status === 401) {
					throw new Error(JSON.parse(oError.responseText).error);
				} else if (oError.status === 0 && oError.statusText === "timeout") {
					throw new Error(that.context.i18n.getText("i18n", "system_timeout"));
				} else {
					var sText = that.context.i18n.getText("i18n", "orionbackend_unexpected_error");
					console.error(sText);
					console.error(oError.message + "\n" + oError.stack);
					// Load the failure page
					return that.context.event.fireFailure();
				}
			});
			return this._ensureLogin;
		},

		_callHeliumApi : function(sUrl) {
			return jQuery.ajax({
				url : sUrl,
				dataType : "json"
			});
		},

		_getCurrentUser : function() {
			if (sap.watt.getEnv("server_type") === "hcproxy") {
				return this._callHeliumApi(sap.watt.getEnv("context_root") + "services/userapi/currentUser");
			} else {
				return Q(null);
			}
		},

		_logout : function() {
			/*only local installation logout is being called here.
			 * In case of logout from HCP  the process of logging out from HCP will be trigered by setting new window.location.href parametter - in
			 * logout method.
			 * */
			 if (sap.watt.getEnv("server_type") === "local_hcproxy" || sap.watt.getEnv("server_type") === "java") {
				//call logout from orion for local installation
				return this._oDao.logout();
			} else {
				return Q(true);
			}
		},
		
		getQuota : function() {
	        return Request.send("/s2s/config/quota/global", "GET", {dataType : "json"}).fail(function() {
    		    // catch error and continue, flow should not fail
    		    return null;
    		});
		},

		isAlive : function() {
			//Avoid get workspace call without X-CSRF-Token
			// var sUri = URI("workspace").absoluteTo(sap.watt.getEnv("orion_path")).toString();
			// return Request.send(sUri);
			var that = this;
			var sUri = URI("workspace").absoluteTo(sap.watt.getEnv("orion_server")).toString();
			var oXhr = jQuery.ajax(sUri);
			return Q(oXhr).then(function() {
				if (oXhr.status !== 200) {
					throw new Error("SERVER_ERROR");
				} else {
					if (that._isCloudSessionLost(oXhr)) {
						throw new Error("SESSION_LOST");
					}
				}
			}, function(oXHR) {
				throw new Error("CONNECTION_LOST");
			});
		},

		_isCloudSessionLost : function(oXhr) {
			return (oXhr.getResponseHeader("com.sap.cloud.security.login") == "login-request");
		},

		getSystemInfo : function() {
			var that = this;
			return this._ensureLogin.then(function() {
				return {
					sDbname : "Orion", // TODO REMOTE This is just to specify a title for the root node
					sUsername : that._mUser.sName,
					sAccount : that._mUser.sAccount,
					sEMail : that._mUser.sEMail,
					sFirstName : that._mUser.sFirstName,
					sLastName : that._mUser.sLastName
				};
			});
		}

	});

	return oSystem;

});