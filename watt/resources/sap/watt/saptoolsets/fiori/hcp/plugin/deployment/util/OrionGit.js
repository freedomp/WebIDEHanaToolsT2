define(function() {
	"use strict";

	var orionGit = {
		_fileService: null,
		_gitService: null,

		_initService: function(context) {
			this._gitService = context.service.git;
			this._fileService = context.service.filesystem;
		},

		_getOrionGitRepos: function(appLocation) {
			var oDeferred = Q.defer();
			this._gitService.getRepositoriesList(appLocation).then(function(response) {
				oDeferred.resolve(response);
			}).fail(function(oError) {
				oError.action = "orion_getrepos";
				oDeferred.reject(oError);
			});
			return oDeferred.promise;
		},

		_initOrionGitRepo: function(appName, appLocation) {
			var that = this;
			var root;
			var oDeferred = Q.defer();
			this._fileService.documentProvider.getRoot().then(function(oRoot) {
				root = oRoot;
				return that._gitService.initRepository(appName, oRoot.getEntity().getBackendData().location, appLocation);
			}).then(function() {
				return root.refresh();
			}).then(function(response) {
				oDeferred.resolve(response);
			}).fail(function(oError) {
				oError.action = "orion_initrepo";
				oDeferred.reject(oError);
			});
			return oDeferred.promise;
		},
		
		_getRemotesOfOrionGit: function(appGit) {
            var oDeferred = Q.defer();
			this._gitService.getRemotes(appGit).then(function(remotes) {
				oDeferred.resolve(remotes);
			}).fail(function(oError) {
				oError.action = "orion_getremotes";
				oDeferred.reject(oError);
			});
			return oDeferred.promise;
		},

		_getRemoteOrionGit: function(appGit) {//TODO-FN: Change to get remote branches. There is currently no need for this in our code anyway...
			var oDeferred = Q.defer();
			this._gitService.getRemoteBranches(appGit).then(function(response) {
				oDeferred.resolve(response);
			}).fail(function(oError) {
				oError.action = "orion_getremote";
				oDeferred.reject(oError);
			});
			return oDeferred.promise;
		},

		_addHeliumAsOrionRemoteGit: function(appGit, heliuGitUrl) {
			var oDeferred = Q.defer();
			this._gitService.addRemote(appGit, "origin", heliuGitUrl).then(function(response) {
				oDeferred.resolve(response);
			}).fail(function(oError) {
				oError.action = "orion_addremote";
				oDeferred.reject(oError);
			});
			return oDeferred.promise;
		},
		
		_deleteRemoteOrionGit: function(appGit, remoteAlias) {
			var oDeferred = Q.defer();
			this._gitService.deleteRemote(appGit, remoteAlias).then(function(response) {
				oDeferred.resolve(response);
			}).fail(function(oError) {
				oError.action = "orion_deleteremote";
				oDeferred.reject(oError);
			});
			return oDeferred.promise;
		},

		_fetchFromRemoteGit: function(appGit, heliumUsername, heliumPassword) {
			var that = this;
			var oDeferred = Q.defer();
			this._gitService.getRepositoryDetails(appGit).then(function(oDetails) {
				return that._gitService.fetch(appGit, oDetails, "", heliumPassword, heliumUsername);
			}).then(function(response) {
				oDeferred.resolve(response);
			}).fail(function(oError) {
				oError.action = "orion_fetchfromremote";
				oDeferred.reject(oError);
			});
			return oDeferred.promise;
		},

		_getStatusOrionGit: function(appGit) {
			var oDeferred = Q.defer();
			this._gitService.getStatus(appGit).then(function(response) {
				oDeferred.resolve(response);
			}).fail(function(oError) {
				oError.action = "orion_getstatus";
				oDeferred.reject(oError);
			});
			return oDeferred.promise;
		},

		_stageChangesOrionGit: function(appGit, path) {
			var oDeferred = Q.defer();
			this._gitService.stageMultipleFiles(appGit, path).then(function(response) {
				oDeferred.resolve(response);
			}).fail(function(oError) {
				oError.action = "orion_stage";
				oDeferred.reject(oError);
			});
			return oDeferred.promise;
		},

		_getConfigOrionGit: function() {
			var oDeferred = Q.defer();
			this._gitService.getGitSettings().then(function(response) {
				oDeferred.resolve(response);
			}).fail(function(oError) {
				if (oError && oError.status === 404 && oError.source === "git") {
					// first time the user entered the IDE environment
					var userInfo = {};
					userInfo.name = "";
					userInfo.email = "";
					oDeferred.resolve(userInfo);
				} else {
					oError.action = "orion_getconfig";
					oDeferred.reject(oError);
				}
			});
			return oDeferred.promise;
		},

		_commitChangesOrionGit: function(appGit, commitMessage) {
		    if(typeof commitMessage === "undefined" ) {
		        commitMessage = "project template";
		    }
			var oDeferred = Q.defer();
			this._gitService.commit(appGit, commitMessage, undefined, false, "").then(function(response) {
				oDeferred.resolve(response);
			}).fail(function(oError) {
				oError.action = "orion_commit";
				oDeferred.reject(oError);
			});
			return oDeferred.promise;
		},

		_rebaseChangesOrionGit: function(appGit) {
			var oDeferred = Q.defer();
			this._gitService.rebase(appGit, "origin/master").then(function(response) {
				oDeferred.resolve(response);
			}).fail(function(oError) {
				oError.action = "orion_reabse";
				oDeferred.reject(oError);
			});
			return oDeferred.promise;
		},
			
		_mergeChangesOrionGit: function(appGit) {
			var oDeferred = Q.defer();
			this._gitService.mergeChangesFromRemoteToHead(appGit, "origin/master").then(function(response) {
				oDeferred.resolve(response);
			}).fail(function(oError) {
				oError.action = "orion_merge";
				oDeferred.reject(oError);
			});
			return oDeferred.promise;
		},

		_pushAllToRemoteGit: function(appGit, heliumUsername, heliumPassword) {
			var that = this;
			var oDeferred = Q.defer();
			this._gitService.getRepositoryDetails(appGit).then(function(oDetails) {
				return that._gitService.push(appGit, false, oDetails, "", heliumPassword, heliumUsername);
			}).then(function(response) {
				oDeferred.resolve(response);
			}).fail(function(oError) {
				oError.action = "orion_pushtoremote";
				oDeferred.reject(oError);
			});
			return oDeferred.promise;
		},

		_setRepoConfigurations: function(appGit) {
			var that = this;
			var oDeferred = Q.defer();

			this._gitService.setRepositoryConfiguration(appGit, {
				Key: "branch.master.merge",
				Value: "refs/heads/master"
			}).then(function() {
				return that._gitService.setRepositoryConfiguration(appGit, {
					Key: "branch.master.remote",
					Value: "origin"
				});
			}).then(function() {
				oDeferred.resolve();
			}).fail(function(oError) {
				oError.action = "orion_setrepoconfig";
				oDeferred.reject(oError);
			});
			return oDeferred.promise;
		}
	};

	return orionGit;
});
