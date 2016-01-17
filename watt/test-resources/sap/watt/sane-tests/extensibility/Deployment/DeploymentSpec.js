define(['STF', "sap/watt/core/q"], function (STF, coreQ) {

	"use strict";

	describe("Unit tests for Deployment service", function () {

		var oRequiredDeploymentService;
		var oContext;
		var oContent = {
			".project.json" : "{\"hcpdeploy\" : {\"name\":\"opafioristartercc\"}}"
		};

		var MockDocument = function(sFullPath, sFileExtension, sContent, oProject) {
			this.sContent = sContent;
			this.extensionSeperator = '.';
			this.oProject = oProject;
			var oEntity = {
				sFileExtension : sFileExtension,
				sFullPath : sFullPath,
				getFullPath : function() {
					return sFullPath;
				},
				getFileExtension : function() {
					return sFileExtension;
				},
				getBackendData : function() {
					return {
						git: {
							BlameLocation: "/s2s/gitapi/blame/HEAD/file/x2a4336b4$I059286-OrionContent/opaFioriStarter/",
							CloneLocation: "/s2s/gitapi/clone/file/x2a4336b4$I059286-OrionContent/opaFioriStarter/",
							CommitLocation: "/s2s/gitapi/commit/master/file/x2a4336b4$I059286-OrionContent/opaFioriStarter/",
							ConfigLocation: "/s2s/gitapi/config/clone/file/x2a4336b4$I059286-OrionContent/opaFioriStarter/",
							DefaultRemoteBranchLocation: "/s2s/gitapi/remote/origin/master/file/x2a4336b4$I059286-OrionContent/opaFioriStarter/",
							DiffLocation: "/s2s/gitapi/diff/Default/file/x2a4336b4$I059286-OrionContent/opaFioriStarter/",
							HeadLocation: "/s2s/gitapi/commit/HEAD/file/x2a4336b4$I059286-OrionContent/opaFioriStarter/",
							IndexLocation: "/s2s/gitapi/index/file/x2a4336b4$I059286-OrionContent/opaFioriStarter/",
							RemoteLocation: "/s2s/gitapi/remote/file/x2a4336b4$I059286-OrionContent/opaFioriStarter/",
							StatusLocation: "/s2s/gitapi/status/file/x2a4336b4$I059286-OrionContent/opaFioriStarter/",
							TagLocation: "/s2s/gitapi/tag/file/x2a4336b4$I059286-OrionContent/opaFioriStarter/"
						}
					};
				},
				isRoot : function() {
					return false;
				},
				getName : function() {
					return "name";
				}
			};

			this.getEntity = function() {
				return oEntity;
			};

			this.getContent = function() {
				return Q(this.sContent);
			};

			this.getProject = function() {
				return Q(this.oProject);
			};

			this.getChild = function(){
				return Q(oContent);
			};
		};

		before(function() {
			buildMockContext();
		});

		beforeEach(function () {
			return coreQ.sap.require("sap/watt/saptoolsets/fiori/hcp/plugin/deployment/service/Deployment").then(function(Deployment) {
				oRequiredDeploymentService = Deployment;
			});
		});

		function buildMockContext() {
			oContext = {};
			oContext.service = {};
			oContext.service.hcpconnectivity = {};
			oContext.service.hcpconnectivity.getHCPRemoteGitURL = function() {
				return Q("dummyUrl");
			};
			oContext.service.hcpconnectivity.getHCPAppNameByGitURL = function() {
				return Q("dummyAppName");
			};
			oContext.service.hcpconnectivity.getAppInfo = function() {
				var oAppInfo = {};
				oAppInfo.url = "dummyUrl";
				return Q(oAppInfo);
			};
			oContext.service.hcpconnectivity.getAppCommits = function() {
				var oCommit = {};
				oCommit.commitId = "dummyCommitId";
				var aAppCommits = [oCommit];
				return Q(aAppCommits);
			};

			oContext.service.system = {};
			oContext.service.system.getSystemInfo = function() {
				var oResult = {};
				oResult.account = "dummyAccount";
				return Q(oResult);
			};

			oContext.service.git = {};
			oContext.service.git.getRemotes = function() {
				var oRemotes = {
					"Children": [{
						"CloneLocation": "/s2s/gitapi/clone/file/x2a4336b4$I059286-OrionContent/opaFioriStarter/",
						"GitUrl": "https://git.neo.ondemand.com/x2a4336b4/opafioristartercc",
						"IsGerrit": false,
						"Location": "/s2s/gitapi/remote/origin/file/x2a4336b4$I059286-OrionContent/opaFioriStarter/",
						"Name": "origin",
						"Type": "Remote"
					}],
					"Type": "Remote"
				};

				return Q(oRemotes);
			};
			oContext.service.git.getRepositoryDetails = function() {
				return Q();
			};
			oContext.service.git.fetch = function() {
				return Q();
			};

			oContext.service.filesystem = {};
		};

		it("Tests getDeploymentCase method", function() {

			var oProjectDocument = new MockDocument("RootFolder", null, null, null);
			var oMockDocument = new MockDocument("S3Controller", "js", "var a = 1;", oProjectDocument);
			oRequiredDeploymentService._appEntity = oMockDocument.getEntity();

			oRequiredDeploymentService.context = oContext;

			oRequiredDeploymentService.init();
			// flow 1 - with HCPRemoteGitURL
			return oRequiredDeploymentService.getDeploymentCase("username", "password", "account").then(function(oDeploymentCase1) {
				assert.equal(oDeploymentCase1.firstDeployment, false);
				assert.equal(oDeploymentCase1.gitURL, "dummyUrl");
				assert.equal(oDeploymentCase1.useHCPForSCAndDeployment, true);
				// app exist in hcp
				assert.equal(oDeploymentCase1.HCPAppName, "dummyAppName");
				assert.equal(oDeploymentCase1.isGitUrlAlive, true);

				oContext.service.hcpconnectivity.getHCPRemoteGitURL = function() {
					return Q(); // return undefined
				};
				oRequiredDeploymentService.context = oContext;

				// flow 2 - no HCPRemoteGitURL
				return oRequiredDeploymentService.getDeploymentCase("username", "password", "account").then(function(oDeploymentCase2) {
					assert.equal(oDeploymentCase2.firstDeployment, true);

					oContext.service.hcpconnectivity.getHCPRemoteGitURL = function() {
						return Q("dummyUrl");
					};

					// flow 3 - the app exists
					return oRequiredDeploymentService.getDeploymentCase("username", "password", "account").then(function(oDeploymentCase3) {
						assert.equal(oDeploymentCase3.isGitUrlAlive, true);
						assert.equal(oDeploymentCase3.HCPAppName, "dummyAppName");

						oContext.service.hcpconnectivity.getHCPAppNameByGitURL = function() {
							return Q(); // return undefined - app was deleted
						};
						oRequiredDeploymentService.context = oContext;

						// flow 4 - the app was deleted - its Git repository exists
						return oRequiredDeploymentService.getDeploymentCase("username", "password", "account").then(function(oDeploymentCase4) {
							assert.equal(oDeploymentCase4.isGitUrlAlive, true);

							oContext.service.git.fetch = function() {
								throw new Error("error");
							};
							oRequiredDeploymentService.context = oContext;

							// flow 5 - the app was deleted - its Git repository deleted as well
							return oRequiredDeploymentService.getDeploymentCase("username", "password", "account").then(function(oDeploymentCase5) {
								assert.equal(oDeploymentCase5.isGitUrlAlive, false);

								var oEntityNoGit = {
									sFileExtension : "js",
									sFullPath : "S3Controller",
									getFullPath : function() {
										return sFullPath;
									},
									getFileExtension : function() {
										return "js";
									},
									getBackendData : function() {
										return {
											git: undefined
										};
									},
									isRoot : function() {
										return false;
									},
									getName : function() {
										return "name";
									}
								};
								oRequiredDeploymentService._appEntity = oEntityNoGit;

								// flow 6 - no Git in document
								return oRequiredDeploymentService.getDeploymentCase("username", "password", "account").then(function(oDeploymentCase6) {
									assert.equal(oDeploymentCase6.firstDeployment, true);
									assert.equal(oDeploymentCase6.gitURL, "");
								});
							});
						});
					});
				});
			});
		});

		it("Tests getAppUri method", function() {
			return oRequiredDeploymentService.getAppURI("account", "username", "password", "opafioristartercc").then(function(res) {
				assert.equal(res.activeURI, "dummyUrl");
				assert.equal(res.commitURI, "dummyUrl/?hc_commitid=dummyCommitId");
			});
		});

		afterEach(function () {
			oRequiredDeploymentService = undefined;
		});
	});
});