define(["STF"], function(STF) {
	"use strict";

	var oFilesystem;
	var oFakeFileDAO;
	var oRepository;
	var oResource;
	var aStyle;

	var sap;
	var mFiles;
	var suiteName = "decoration_test";
	var iFrameWindow = null;


	describe("Decoration test", function() {
		var getService = STF.getServicePartial(suiteName);

		function init(){
			mFiles = {
				"AFolderWithDecorationStyle" : {
					"FileWithPrefix.js" : "js",
					"FileWithSuffix.js" : "js",
					"FileWithMultipleSuffixes.js" : "js",
					"FileWithPrefixAndSuffix.js" : "js",
					"FileWithIconDecorators.js" : "js"
				},
				"BFolder" :{},
				"CFolder" :{}
			};
			sap.ui.getCore().applyChanges();
			var aStyle = [{	"uri" : "core/core/platform/plugin/decoration/css/Decorations.css"}];
			return oFakeFileDAO.setContent(mFiles).then(function(){
				return oResource.includeStyles(aStyle);
			});
		}

		function cleanUp(){
			sap.ui.getCore().getUIArea("content").removeAllContent();
			return Q();
		}

		before(function() {
			return STF.startWebIde(suiteName, {
				config: "core/core/platform/plugin/decoration/config.json"
			}).
				then(function(webIdeWindowObj) {
					var mConsumer = {
						"name": "decoration",
						"requires": {
							"services": [
								"document",
								"menu",
								"repositorybrowser",
								"repositoryBrowserFactory",
								"filesystem.documentProvider",
								"fakeFileDAO",
								"decoration",
								"resource",
								"commandGroup",
								"menuBar"
							]
						},
						"configures": {
							"services": {
								"decoration:decorators": [{
									"prio": "1",
									"service": "core/core/platform/plugin/decoration/service/RepositoryBrowserTestDecorator"
								}],
								"commandGroup:groups": [{"id": "applicationMenu"}],
								"menuBar:group": "applicationMenu"
							}

						}
					};

					iFrameWindow = webIdeWindowObj;
					sap = iFrameWindow.sap;
					oFilesystem = getService("filesystem.documentProvider");
					oFakeFileDAO = getService("fakeFileDAO");
					oRepository = getService("repositorybrowser");
					oResource = getService("resource");

					return STF.register(suiteName, mConsumer).then(function() {
						return init();
					});
				});
		});

		after(function() {
			return cleanUp().then(function() {
				STF.shutdownWebIde(suiteName);
			});
		});

		describe("Decoration Test", function(){
			function nodeCompare( oNode, sExpectedText, sExpectedStyleClass ) {
				var sText =  oNode.firstChild.nodeValue.trim();
				var sStyleClass = oNode.className;
				assert.equal(sText, sExpectedText);
				assert.equal(sStyleClass, sExpectedStyleClass);
			}

			function performTests(oDef){
				var arr;
				arr = iFrameWindow.document.getElementsByClassName("sapUiTreeNodeDecorationFolderBL");
				if (!arr || !arr.length > 0){
					oDef.resolve();
					return;
				}
				assert.equal(arr[0].firstChild.firstChild.nodeValue, "AFolderWithDecorationStyle");
				arr = iFrameWindow.document.getElementsByClassName("sapUiTreeNodeContent");
				if (!arr || !arr.length > 0){
					oDef.resolve();
					return;
				}
				for (var i = 0; i < arr.length; i++){

					var oDom = arr[i];
					var sNodeName = oDom.firstChild.nodeValue;
					var childs = oDom.children;
					var str;
					if (!sNodeName){
						//in case the node has a prefix
						sNodeName = oDom.childNodes[1].nodeValue;
					}

					switch(sNodeName){
						case "FileWithPrefix.js":
							assert.equal(childs.length, 1);
							nodeCompare(childs[0], "prefix", "sapUiTreeNodePrefixGreen");
							break;
						case "FileWithSuffix.js":
							assert.equal(childs.length, 1);
							nodeCompare(childs[0], "suffix", "sapUiTreeNodeSuffixRedItalic");
							break;
						case "FileWithMultipleSuffixes.js":
							assert.equal(childs.length, 3);
							nodeCompare(childs[0], "suffix1", "sapUiTreeNodeSuffixBlueItalic");
							nodeCompare(childs[1], "suffix2", "sapUiTreeNodeSuffixRedItalic");
							nodeCompare(childs[2], "suffix3", "sapUiTreeNodeSuffixGreenItalic");
							break;
						case "FileWithPrefixAndSuffix.js":
							assert.equal(childs.length, 2);
							nodeCompare(childs[0], "prefix", "sapUiTreeNodePrefixRed");
							nodeCompare(childs[1], "suffix", "sapUiTreeNodeSuffixGreenItalic");
							break;
						case "FileWithIconDecorators.js":
							// TODO clarify why the decorator icon is not visible at this point in time...
							break;
					}
				}
				oDef.resolve();
			}

			it("Decoration Test", function(){
				var bCalled = false;
				var that = this;
				return oFilesystem.getDocument("/AFolderWithDecorationStyle/FileWithPrefix.js").then(function(oDoc){
					return oRepository.getContent().then(function(oControl){
						var oDef = Q.defer();
						oControl.getController().byId("repositoryTree").onAfterRendering = function(evt){
							performTests(oDef);
						};
						oControl.setHeight("400px");
						oControl.setWidth("100%");
						oControl.placeAt("content");
						oRepository.setSelection(oDoc,true).then();
						sap.ui.getCore().applyChanges();
						return oDef.promise.timeout(10000);
					});
				});
			});
		});
	});
});
