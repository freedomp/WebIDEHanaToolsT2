//  The SaneTestFramework should be imported via 'STF' path.
define(['STF', "sap/watt/core/q",
		"sap/watt/saptoolsets/fiori/project/plugin/fioriexttemplate/services/WorkspaceApplicationFactory"
	],
	function(STF, coreQ, WorkspaceApplicationFactory) {
		"use strict";

		describe('Workspace Application Factory', function() {
			it("Replace unix/mac new line with windows new line", function() {
				var waf = new WorkspaceApplicationFactory();

				// No new line
				var res = waf._normalizeEOLtoWindowsStyle("A string with out new line");
				expect(res).to.equal("A string with out new line");

				////////////////////// Unix: \n is replaced with \r\n //////////////////////
				// Unix new line at the end
				res = waf._normalizeEOLtoWindowsStyle("A string with unix new line\n");
				expect(res).to.equal("A string with unix new line\r\n");
				// Unix new line at the start
				res = waf._normalizeEOLtoWindowsStyle("\nA string with unix new line");
				expect(res).to.equal("\r\nA string with unix new line");
				// Unix new line at the middle
				res = waf._normalizeEOLtoWindowsStyle("A string with\nunix new line");
				expect(res).to.equal("A string with\r\nunix new line");
				// Unix multiple new line at the end
				res = waf._normalizeEOLtoWindowsStyle("A string with unix new line\n\n");
				expect(res).to.equal("A string with unix new line\r\n\r\n");
				// Unix multiple new line at the start
				res = waf._normalizeEOLtoWindowsStyle("\n\nA string with unix new line");
				expect(res).to.equal("\r\n\r\nA string with unix new line");
				// Unix multiple new line at the middle
				res = waf._normalizeEOLtoWindowsStyle("A string with\n\nunix new line");
				expect(res).to.equal("A string with\r\n\r\nunix new line");

				////////////////////// Mac: \r is replaced with \r\n //////////////////////
				// Mac new line at the end
				res = waf._normalizeEOLtoWindowsStyle("A string with mac new line\r");
				expect(res).to.equal("A string with mac new line\r\n");
				// Mac new line at the start
				res = waf._normalizeEOLtoWindowsStyle("\rA string with mac new line");
				expect(res).to.equal("\r\nA string with mac new line");
				// Mac new line at the middle
				res = waf._normalizeEOLtoWindowsStyle("A string with\rmac new line");
				expect(res).to.equal("A string with\r\nmac new line");
				// Mac multiple new line at the end
				res = waf._normalizeEOLtoWindowsStyle("A string with mac new line\r\r");
				expect(res).to.equal("A string with mac new line\r\n\r\n");
				// Mac multiple new line at the start
				res = waf._normalizeEOLtoWindowsStyle("\r\rA string with mac new line");
				expect(res).to.equal("\r\n\r\nA string with mac new line");
				// Mac multiple new line at the middle
				res = waf._normalizeEOLtoWindowsStyle("A string with\r\rmac new line");
				expect(res).to.equal("A string with\r\n\r\nmac new line");

				////////////////////// Windows: \r\n are left as-is //////////////////////
				// Windows new line at the end
				res = waf._normalizeEOLtoWindowsStyle("A string with windows new line\r\n");
				expect(res).to.equal("A string with windows new line\r\n");
				// Windows new line at the start
				res = waf._normalizeEOLtoWindowsStyle("\r\nA string with windows new line");
				expect(res).to.equal("\r\nA string with windows new line");
				// Windows new line at the middle
				res = waf._normalizeEOLtoWindowsStyle("A string with\r\nwindows new line");
				expect(res).to.equal("A string with\r\nwindows new line");
				// Windows multiple new line at the end
				res = waf._normalizeEOLtoWindowsStyle("A string with windows new line\r\n\r\n");
				expect(res).to.equal("A string with windows new line\r\n\r\n");
				// Windows multiple new line at the start
				res = waf._normalizeEOLtoWindowsStyle("\r\n\r\nA string with windows new line");
				expect(res).to.equal("\r\n\r\nA string with windows new line");
				// Windows multiple new line at the middle
				res = waf._normalizeEOLtoWindowsStyle("A string with\r\n\r\nwindows new line");
				expect(res).to.equal("A string with\r\n\r\nwindows new line");

				////////////////////// Mix of windows and unix: \n is replaced with \r\n, \r\n are left as-is //////////////////////
				// Mix of windows and unix new line at the end
				res = waf._normalizeEOLtoWindowsStyle("A string with mix of windows and unix new line\n\r\n");
				expect(res).to.equal("A string with mix of windows and unix new line\r\n\r\n");
				// Mix of windows and unix new line at the start
				res = waf._normalizeEOLtoWindowsStyle("\r\n\nA string with Mix of windows and unix new line");
				expect(res).to.equal("\r\n\r\nA string with Mix of windows and unix new line");
				// Mix of windows and unix new line at the middle
				res = waf._normalizeEOLtoWindowsStyle("A string with\n\r\nMix of windows and unix new line");
				expect(res).to.equal("A string with\r\n\r\nMix of windows and unix new line");
				// Mix of windows and unix multiple new line at the end
				res = waf._normalizeEOLtoWindowsStyle("A string with Mix of windows and unix new line\r\n\r\n\n\n");
				expect(res).to.equal("A string with Mix of windows and unix new line\r\n\r\n\r\n\r\n");
				// Mix of windows and unix multiple new line at the start
				res = waf._normalizeEOLtoWindowsStyle("\n\n\r\n\r\nA string with Mix of windows and unix new line");
				expect(res).to.equal("\r\n\r\n\r\n\r\nA string with Mix of windows and unix new line");
				// Mix of windows and unix multiple new line at the middle
				res = waf._normalizeEOLtoWindowsStyle("A string with\r\n\r\n\n\nMix of windows and unix new line");
				expect(res).to.equal("A string with\r\n\r\n\r\n\r\nMix of windows and unix new line");

				////////////////////// Mix of windows and mac: \r is replaced with \r\n, \r\n are left as-is //////////////////////
				// Mix of windows and mac new line at the end
				res = waf._normalizeEOLtoWindowsStyle("A string with mix of windows and mac new line\r\r\n");
				expect(res).to.equal("A string with mix of windows and mac new line\r\n\r\n");
				// Mix of windows and mac new line at the start
				res = waf._normalizeEOLtoWindowsStyle("\r\n\rA string with Mix of windows and mac new line");
				expect(res).to.equal("\r\n\r\nA string with Mix of windows and mac new line");
				// Mix of windows and mac new line at the middle
				res = waf._normalizeEOLtoWindowsStyle("A string with\r\r\nMix of windows and mac new line");
				expect(res).to.equal("A string with\r\n\r\nMix of windows and mac new line");
				// Mix of windows and mac multiple new line at the end
				res = waf._normalizeEOLtoWindowsStyle("A string with Mix of windows and mac new line\r\n\r\n\r\r");
				expect(res).to.equal("A string with Mix of windows and mac new line\r\n\r\n\r\n\r\n");
				// Mix of windows and mac multiple new line at the start
				res = waf._normalizeEOLtoWindowsStyle("\r\r\r\n\r\nA string with Mix of windows and mac new line");
				expect(res).to.equal("\r\n\r\n\r\n\r\nA string with Mix of windows and mac new line");
				// Mix of windows and mac multiple new line at the middle
				res = waf._normalizeEOLtoWindowsStyle("A string with\r\n\r\n\r\rMix of windows and mac new line");
				expect(res).to.equal("A string with\r\n\r\n\r\n\r\nMix of windows and mac new line");
			});

			it("Build local app name with slash", function() {
				var sPathToZip = "../test-resources/sap/watt/sane-tests/extensibility/unit/mdProject.zip";
				var sURL = require.toUrl(sPathToZip);
				return coreQ.sap.ajax(sURL, {responseType: "arraybuffer"}).then(function(oZip) {
					var waf = new WorkspaceApplicationFactory();
					var sProjectWithSlash = "/mdProject";
					var oProjectDocument = {getEntity: function() {
						return {getFullPath: function() {
							return sProjectWithSlash;
						}};
					}};
					var oEvent = {target: {result: oZip[0]}};
					var oDeferred = Q.defer();
					
					waf._onZipLoad(oEvent, oProjectDocument, [], oDeferred);
					
					return oDeferred.promise.then(function(oApplication) {
						expect(oApplication.localProjectName).to.equal(sProjectWithSlash);
						expect(oApplication.remoteDocuments[3].getEntity().getFullPath()).to.equal(sProjectWithSlash + "/webapp/controller");
					});
				});
			});

			var waf = new WorkspaceApplicationFactory();
			var oProjectDocumentRoot = {};

			var updateRootDocumentNoIgnoreFile = function(){
				oProjectDocumentRoot.getFolderContent = function() {
					var files = [];
					files.push(distFolder);
					return Q(files);
				};
			};

			var updateRootDocumentWithIgnoreFile = function(){
				oProjectDocumentRoot.getFolderContent = function() {
					var files = [];
					files.push(distFolder);
					files.push(Ui5RepositoryIgnoreFile);
					return Q(files);
				};
			};

			var distFolder = {
				getEntity : function() {
					var getType = function() {
						return "folder";
					};

					var getName = function() {
						return "dist";
					};

					var getFullPath = function() {
						return "/dist";
					};

					return {
						getType: getType,
						getName: getName,
						getFullPath : getFullPath
					};
				},
				getProject : function() {
					return Q(oProjectDocumentRoot);
				},
				exportZip : function() {
					var fileParts = ['<a id="a"><b id="b">hey!</b></a>'];
					var myBlob = new Blob(fileParts, {type : 'text/html'});
					return Q(myBlob);
				}
			};

			var Ui5RepositoryIgnoreFile = {
				getEntity : function() {
					var getName = function() {
						return ".Ui5RepositoryIgnore";
					};
					return {
						getName: getName
					};
				},
				getContent : function() {
					return Q("dummy content of .Ui5RepositoryIgnore file \n row2 of content");
				}
			};

			it("test - buildIgnoreList - with ignore file", function() {
				updateRootDocumentWithIgnoreFile();
				return waf._buildIgnoreList(oProjectDocumentRoot).then(function(ignoreList) {
					//we have .Ui5RepositoryIgnore file in root , with 2 rows
					expect(ignoreList[0]).to.equal("dummy content of .Ui5RepositoryIgnore file");
					expect(ignoreList[1]).to.equal("row2 of content");
				});
			});

			it("test - buildIgnoreList - not ignore file", function() {
				updateRootDocumentNoIgnoreFile();
				return waf._buildIgnoreList(oProjectDocumentRoot).then(function(ignoreList) {
					//we don't have .Ui5RepositoryIgnore file in root
					expect(ignoreList.length).to.equal(0);
				});
			});

			it("test - getApplicationFromWorkspace - check that we build the ignore list correctly even when we don't get the root folder. root with ignore file", function() {
				updateRootDocumentWithIgnoreFile();
				waf._onZipLoad  = function(e, workspaceProjectdocument, ignoreList,oDeferred){
					expect(ignoreList[0]).to.equal("dummy content of .Ui5RepositoryIgnore file");
					expect(ignoreList[1]).to.equal("row2 of content");
					oDeferred.resolve({});
				};
				return waf.getApplicationFromWorkspace(distFolder);
			});

			it("test - getApplicationFromWorkspace - check that we build the ignore list correctly even when we don't get the root folder. root without ignore file", function() {
				updateRootDocumentNoIgnoreFile();
				waf._onZipLoad  = function(e, workspaceProjectdocument, ignoreList,oDeferred){
					//we don't have .Ui5RepositoryIgnore file in root
					expect(ignoreList.length).to.equal(0);
					oDeferred.resolve({});
				};
				return waf.getApplicationFromWorkspace(distFolder);
			});
		});
	});