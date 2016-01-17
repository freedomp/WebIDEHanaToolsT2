define(["sap/watt/lib/lodash/lodash"], function(_) {
	"use strict";
	/* eslint-disable max-params */
	var baseServiceUrl = sap.watt.getEnv("context_root") + "api/html5api/accounts/";
	var that;

	var executeGETCall = function(sAccount, sUsername, sPassword, action, urlSuffix, resetBackEndSession) {

		return that.context.service.system.getSystemInfo().then(function(result) {
			var serviceUrl = baseServiceUrl + sAccount;
			var heliumServiceUrl = serviceUrl + "/applications" + urlSuffix;
			var username = result.sEMail;

			if (sUsername) {
				username = sUsername;
			}

			return that.context.service.ajaxrequest.serviceCall(action, heliumServiceUrl, "GET", null, username, sPassword,
				resetBackEndSession);
		});
	};

	var executePOSTCall = function(sAccount, sUsername, sPassword, action, urlSuffix, sData) {

		return that.context.service.system.getSystemInfo().then(function(result) {
			var serviceUrl = baseServiceUrl + sAccount;
			var heliumServiceUrl = serviceUrl + "/applications" + urlSuffix;
			var username = result.sEMail;

			if (sUsername) {
				username = sUsername;
			}

			return that.context.service.ajaxrequest.serviceCall(action, heliumServiceUrl, "POST", sData, username, sPassword);
		});
	};

	var _getHCPAccounts = function(sAccount, sUsername, sPassword) {
		that = this;
		var serviceURL = sap.watt.getEnv("context_root") + "services/v1/instances/" + sAccount + "/accounts/v1/members/" + sUsername +
			"/accountlist";
		return that.context.service.ajaxrequest.serviceCall("helium_listaccounts", serviceURL, "GET", null, sUsername,
			sPassword);
	};

	var _getSubscriptions = function(sAccount, sUsername, sPassword, resetBackEndSession, resetHeaders) {
		that = this;

		return this.context.service.system.getSystemInfo().then(function(result) {
			var serviceUrl = baseServiceUrl + sAccount;
			var HeliumServiceSubsUrl = serviceUrl + "/subscriptions";
			var username = result.sUsername;
			if (sUsername) {
				// MK: if a username was provided in this method, it means we should use it in our calls for HCP. 
				// this is in order to support cases where the username comes from a different IDP (i.e. SuccessFactors),
				// the username provided in the getSystemInfo() method is of the different IDP, and not the username for HCP!
				username = sUsername;
			}
			return that.context.service.ajaxrequest.serviceCall("helium_listapps", HeliumServiceSubsUrl, "GET", null, username,
				sPassword, resetBackEndSession, resetHeaders);
		});
	};

	var _getApps = function(sAccount, sUsername, sPassword, resetBackEndSession) {
		that = this;
		var urlSuffix = "";

		return executeGETCall(sAccount, sUsername, sPassword, "hcp_connectivity_getapps", urlSuffix, resetBackEndSession);
	};

	var _createApp = function(sAccount, sUsername, sPassword, appName, hcpGitUrl) {
		that = this;
		var sData = {
			"name": appName
		};

		//Optional string parameter
		if (hcpGitUrl) {
			//According to a mail to Martin Hermes the name of the repository is:
			//If the repo URL is: https://git.neo.ondemand.com/x2a4336b4/abcd
			//Then the name is: x2a4336b4/abcd
			var splittedArray = hcpGitUrl.split("/");
			var repositoryNameOnHCP = [splittedArray[3], splittedArray[4]].join("/");
			sData.repository = repositoryNameOnHCP;
		}

		var urlSuffix = "";

		return executePOSTCall(sAccount, sUsername, sPassword, "hcp_connectivity_createapp", urlSuffix, sData);
	};

	var _getAppInfo = function(sAccount, sUsername, sPassword, appName) {
		that = this;
		var urlSuffix = "/" + appName;

		return executeGETCall(sAccount, sUsername, sPassword, "hcp_connectivity_getappinfo", urlSuffix);
	};

	var _getAppCommits = function(sAccount, sUsername, sPassword, appName) {
		that = this;
		var urlSuffix = "/" + appName + "/commits";

		return executeGETCall(sAccount, sUsername, sPassword, "heliumGetCommits", urlSuffix);
	};

	var _getAppVersions = function(sAccount, sUsername, sPassword, appName) {
		that = this;
		var urlSuffix = "/" + appName + "/versions";

		return executeGETCall(sAccount, sUsername, sPassword, "heliumGetVersions", urlSuffix).then(function(response) {
			response.appName = appName;
			return response;
		});
	};

	var _setAppVersion = function(sAccount, sUsername, sPassword, appName, commitId, sVersion) {
		that = this;
		var sData = {
			"version": sVersion,
			"commitId": commitId
		};
		var urlSuffix = "/" + appName + "/versions";

		return executePOSTCall(sAccount, sUsername, sPassword, "heliumSetAppVersion", urlSuffix, sData);
	};

	var _activateApp = function(sAccount, sUsername, sPassword, appName, sVersion) {
		that = this;
		// encode the version as it may hold special characters such as '#'
		sVersion = encodeURIComponent(sVersion);
		var urlSuffix = "/" + appName + "/versions/" + sVersion + "/action";
		var sData = "ACTIVATE";

		return executePOSTCall(sAccount, sUsername, sPassword, "heliumActivateApp", urlSuffix, sData);
	};

	var _startApp = function(sAccount, sUsername, sPassword, appName) {
		that = this;
		var urlSuffix = "/" + appName + "/action";
		var sData = "START";

		return executePOSTCall(sAccount, sUsername, sPassword, "heliumActivateApp", urlSuffix, sData);
	};

	var _restartApp = function(sAccount, sUsername, sPassword, appName) {
		that = this;
		var urlSuffix = "/" + appName + "/action";
		var sData = "RESTART";

		return executePOSTCall(sAccount, sUsername, sPassword, "heliumActivateApp", urlSuffix, sData);
	};

	var _getLinkToCockPit = function(sAccount) {
		var serverType = sap.watt.getEnv("server_type");
		//var account;
		// local dev or local installation don't have HCP Cockpit
		if (serverType === "java" || serverType === "local_hcproxy") {
			return null;
		}
		return Q(sAccount ? sAccount : this.getHCPDefaultAccount()).then(function(account) {
			/* eslint-disable no-undef */
			var origin = window.location.origin;
			/* eslint-enable no-undef */

			if (!origin) {
				/* eslint-disable no-undef */
				// There's no origin in IE
				origin = window.location.host;
				/* eslint-enable no-undef */
			}

			var arr = origin.split(".");

			/* eslint-disable no-undef */
			var sUrl = window.location.protocol + "//" + "account";
			/* eslint-enable no-undef */
			for (var i = 2; i < arr.length; i++) { // starting from 2 - removing the first 2 parts of the url
				sUrl += "." + arr[i];
			}
			sUrl += "/" + "cockpit";

			if (account !== null) {
				sUrl += "#/acc/" + account + "/accountdashboard";
			}
			return sUrl;
		});
	};

	var _getLinkToUIThemeDesigner = function() {
		var serverType = sap.watt.getEnv("server_type");
		// local dev or local installation don't have theme designer
		if (serverType === "java" || serverType === "local_hcproxy") {
			return null;
		}

		return this.context.service.system.getSystemInfo().then(function(result) {
			var account = result.sAccount ? result.sAccount.toLowerCase() : null;

			if (account) {
				/* eslint-disable no-undef */
				var origin = window.location.origin;
				/* eslint-enable no-undef */

				if (!origin) {
					/* eslint-disable no-undef */
					// There's no origin in IE
					origin = window.location.host;
					/* eslint-enable no-undef */
				}

				var arr = origin.split(".");

				/* eslint-disable no-undef */
				var sUrl = window.location.protocol + "//" + "themedesigner-" + account;
				/* eslint-enable no-undef */
				for (var i = 1; i < arr.length; i++) { // starting from 1 - removing the first part of the url
					sUrl += "." + arr[i];
				}

				return sUrl;
			}
			/*else {
				// TODO
			}*/
		});
	};

	var _openCockpit = function(oWindow) {
		this.getLinkToCockPit().then(function(cockPitURL) {
			if (oWindow) {
				oWindow.location.href = cockPitURL;
				oWindow.focus();
			}
		}).done();
	};

	var _openUIThemeDesigner = function(oWindow) {
		// return this.context.service.hcpauthentication.authenticate().then(function(oUserCrad) {
		// return _checkForThemeDesignerSubscription(oUserCrad.username, oUserCrad.password).then(function(subscriptionExists) {
		// if (subscriptionExists) {
		this.getLinkToUIThemeDesigner().then(function(themeDesignerURL) {
			if (oWindow) {
				oWindow.location.href = themeDesignerURL;
				oWindow.focus();
			}
		}).done();
		// } else {
		//     if (oWindow && !oWindow.closed) {
		//  	// close the window if it exists and opened
		//  	oWindow.close();
		//  }

		//  // TODO: show popup dialog

		// }
		// });
		// });
	};

	var _getHCPAppNameByGitURL = function(hcpGitURL, sUsername, sPassword, sAccount) {
		var hcpAppName = null;
		return this.getApps(sAccount, sUsername, sPassword).then(function(hcpApps) {
			hcpAppName = _.find(hcpApps, function(application) {
				return application.repository === hcpGitURL;
			});
			if (hcpAppName) {
				return hcpAppName.name;
			} else {
				return hcpAppName;
			}
		});
	};

	var _getHCPAppName = function(oProjectDocument, sUsername, sPassword, sAccount) {
		var appGit = oProjectDocument.getEntity().getBackendData().git;
		if (appGit) {
			return this.context.service.git.getRemotes(appGit).then(function(remotes) {
				return that.getHCPRemoteGitURL(remotes);
			}).then(function(hcpRemoteGitUrl) {
				return that.getHCPAppNameByGitURL(hcpRemoteGitUrl, sUsername, sPassword, sAccount);
			});
		} else {
			return undefined;
		}
	};

	var _getLandscapeDomain = function() {
		var landscapeDomain = null;
		if (sap.watt.getEnv("server_type") === "hcproxy") {
			var orion_landscape = sap.watt.getEnv("orion_preview");
			var orion_domain = orion_landscape.split("/")[2];
			var parts = orion_domain.split(".");
			var offset = parts.length - 3;
			var domain = [];
			for (var i = 0; i < 3; i++) {
				domain.push(parts[offset + i]);
			}
			landscapeDomain = domain.join(".");
		} else {
			landscapeDomain = "neo.ondemand.com";
		}
		return landscapeDomain;
	};

	var _getHCPRemoteGitURL = function(remotes) {
		var hcpRemoteGitURLS = null;
		hcpRemoteGitURLS = _.filter(remotes.Children, function(remote) {
			var gitURL = remote.GitUrl;
			var landscapeDomain = that.getLandscapeDomain();
			var domain = gitURL.split("/")[2];
			//Any git repository that is on HCP but different landscape is filtered
			return _.startsWith(domain, "git.") && _.endsWith(domain, landscapeDomain);
		});
		if (hcpRemoteGitURLS.length > 0) {
			return hcpRemoteGitURLS[0].GitUrl;
		} else {
			return "";
		}
	};

	/**
	 * get the account name from the Git repository URL on HCP.
	 *
	 * @param oGit  - the local Git of the application
	 *
	 * @returns HCP account name if the remote Git repository URL exists , else return undefined.
	 */
	var _getHCPAccountByGitURL = function(oGit) {
		that = this;
		if (oGit) {
			return this.context.service.git.getRemotes(oGit).then(function(remotes) {
				return that.getHCPRemoteGitURL(remotes);
			}).then(function(hcpRemoteGitUrl) {
				if (hcpRemoteGitUrl) {
					var hcpAccount = hcpRemoteGitUrl.split("/")[3];
					return hcpAccount;
				} else {
					return undefined;
				}
			});
		} else {
			return undefined;
		}
	};

	var _getHCPDefaultAccount = function() {
		return this.context.service.system.getSystemInfo().then(function(oResult) {
			var account = oResult.sAccount ? oResult.sAccount.toLowerCase() : null;
			return account;
		});
	};

	var _setContext = function(newContext) {
		this.context = newContext;
	};

	/* eslint-enable max-params */
	return {
		getSubscriptions: _getSubscriptions,
		getHCPRemoteGitURL: _getHCPRemoteGitURL,
		getHCPAccounts: _getHCPAccounts,
		getLandscapeDomain: _getLandscapeDomain,
		getApps: _getApps,
		getHCPAppName: _getHCPAppName,
		getHCPAppNameByGitURL: _getHCPAppNameByGitURL,
		getHCPDefaultAccount: _getHCPDefaultAccount,
		getHCPAccountByGitURL: _getHCPAccountByGitURL,
		createApp: _createApp,
		getAppInfo: _getAppInfo,
		getAppCommits: _getAppCommits,
		getAppVersions: _getAppVersions,
		setAppVersion: _setAppVersion,
		activateApp: _activateApp,
		startApp: _startApp,
		restartApp: _restartApp,
		openCockpit: _openCockpit,
		getLinkToCockPit: _getLinkToCockPit,
		openUIThemeDesigner: _openUIThemeDesigner,
		getLinkToUIThemeDesigner: _getLinkToUIThemeDesigner,
		setContext: _setContext
	};
});