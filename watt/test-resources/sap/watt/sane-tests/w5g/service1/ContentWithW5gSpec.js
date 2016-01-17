define(['STF'], function (STF) {
	"use strict";
	var suiteName = "Content Integration", getService = STF.getServicePartial(suiteName);
	describe(suiteName, function () {
		var oFakeFileDAO, oDocumentProvider, oContent, oDocument, oAceEditor, oWysiwygEditor;
		//initialize Documents only at startup. Assume single tests leaving documents in consistent state in case they do changes
		var oDoc_View01, oDoc_View02, oDoc_ViewWithDuplicateTag;

		before(function () {
			return STF.startWebIde(suiteName, {
				config: "w5g/config.json",
				html: "w5g/service1/w5geditor.html"
			}).then(function () {
				return STF.require(suiteName, ["sane-tests/w5g/w5gTestUtils"]).spread(function (w5gTestUtils) {
					oWysiwygEditor = getService('ui5wysiwygeditor');
					oAceEditor = getService('aceeditor');
					oFakeFileDAO = getService('fakeFileDAO');
					oDocumentProvider = getService('filesystem.documentProvider');
					oContent = getService('content');
					oDocument = getService('document');
					w5gTestUtils.initializeBeforeServiceTest(getService('setting.project'));
					return createFileStructure().then(function (aDocs) {
						//initialize document
						oDoc_View01 = aDocs[1];
						oDoc_View02 = aDocs[2];
						oDoc_ViewWithDuplicateTag = aDocs[3];
						//place content service's content on page
						return oContent.getContent();
					}).then(function (oCtrl) {
						w5gTestUtils.placeAt("contentPlaceholderForSomeTest", oCtrl);
					}).then(function () {
						return w5gTestUtils.configureEditor(getService, "ui5wysiwygeditor");
					});
				});
			});
		});

		after(function () {
			STF.shutdownWebIde(suiteName);
		});

		afterEach(function () {
			return oContent.saveAll()
				.then(function () {
					return oContent.closeAll();
				});
		});

		function getTestXMLView(sViewName) {
			var sURL = window.W5G_LIBS_PREFIX + "/src/main/webapp/test-resources/sap/watt/sane-tests/w5g/service1/ContentWithW5g/" + sViewName;
			var sResult;
			jQuery.ajax({
				url: sURL,
				dataType: 'text',
				success: function (result) {
					sResult = result;
				},
				async: false
			});
			return sResult;
		}

		function createFileStructure() {
			return oFakeFileDAO.setContent({
				"folder": {
					"file1.js": "any js code"
				},
				"AnApp": {
					"view": {
						"View01.view.xml": getTestXMLView("View01.view.xml"),
						"View02.view.xml": getTestXMLView("View02.view.xml"),
						"ViewWithDuplicateTag.view.xml": getTestXMLView("ViewWithDuplicateTag.view.xml")
					},
					"index.html": "<script data-sap-ui-resourceroots='{\"AnApp\": \"./\"}'/>"
				}
			}).then(function () {
				return Q.all([oDocumentProvider.getDocument("/folder/file1.js"),
					oDocumentProvider.getDocument("/AnApp/view/View01.view.xml"),
					oDocumentProvider.getDocument("/AnApp/view/View02.view.xml"),
					oDocumentProvider.getDocument("/AnApp/view/ViewWithDuplicateTag.view.xml"),
					oDocumentProvider.getDocument("/AnApp")
				]).spread(function (_oDoc_File1, _oDoc_View01, _oDoc_View02, _oDoc_ViewWithDuplicateTag, _oDoc_App) {
					var oDoc_File1 = _oDoc_File1;
					var oDoc_View01 = _oDoc_View01;
					oDoc_View01.getEntity().getBackendData().location = "/AnApp/view/View01.view.xml";
					var oDoc_View02 = _oDoc_View02;
					oDoc_View02.getEntity().getBackendData().location = "/AnApp/view/View02.view.xml";
					_oDoc_ViewWithDuplicateTag.getEntity().getBackendData().location = "/AnApp/view/ViewWithDuplicateTag.view.xml";
					_oDoc_App.getEntity().getBackendData().location = "/AnApp/";
					return Q([oDoc_File1, oDoc_View01, oDoc_View02, _oDoc_ViewWithDuplicateTag]);
				});
			});
		}

		it("Open single XML View in W5G editor", function () {
			return oDocument.open(oDoc_View01)
				.then(function () {
					return oContent.getCurrentEditor();
				}).then(function (oCurrentEditor) {
					assert.equal(oCurrentEditor.getProxyMetadata().getName(), "ui5wysiwygeditor", "Expecting Layout Editor is opened");
					return oContent.getCurrentDocument();
				}).then(function (oCurrentDocument) {
					assert.equal(oCurrentDocument, oDoc_View01, "Expecting View-XML-File is opened");
				});
		});

		it("Open one XML View in ACE and W5G Editor", function () {
			//assume documents opened in this order one after the other - open uses queueing mechanism
			return Q.all([oContent.open(oDoc_View02, oAceEditor), oDocument.open(oDoc_View02)])
				.then(function () {
					return oContent.getDocuments();
				}).then(function (aDocuments) {
					assert.equal(aDocuments.length, 1, "Expecting 1 open document");
				});
		});

		it("Open one correct XML W5G editor and one XML with duplicate tag in W5G editor", function () {
			//assume documents opened in this order one after the other - open uses queueing mechanism
			return Q.all([oDocument.open(oDoc_View02), oDocument.open(oDoc_ViewWithDuplicateTag)]).then(function () {
				return oContent.getDocuments();
			}).then(function (aDocuments) {
				assert.equal(aDocuments.length, 1, "Expecting 1 open document");
				return oDocument.open(oDoc_View01);
			}).then(function () {
				return oContent.getDocuments();
			}).then(function (aDocuments) {
				//able to open up layout editor again
				assert.equal(aDocuments.length, 2, "Expecting 2 open documents");
			});
		});

		it("Change content - check editors getting dirty", function () {
			//assume documents opened in this order one after the other - open uses queueing mechanism
			return Q.all([oContent.open(oDoc_View01, oAceEditor), oContent.open(oDoc_View02, oAceEditor), oDocument.open(oDoc_View02)])
				.then(function () {
					//change content of View02's document
					return oDoc_View02.getContent();
				}).then(function (sViewXML) {
					var iIndex = sViewXML.indexOf('<content>') + 9;
					sViewXML = sViewXML.substring(0, iIndex) + '<Button text="Button"/>' + sViewXML.substring(iIndex);
					return oDoc_View02.setContent(sViewXML);
					//assert ACE editor dirty
				}).then(function () {
					return oContent.open(oDoc_View02, oAceEditor);
				}).then(function () {
					return oContent.isDirty();
				}).then(function (bIsDirty) {
					assert.ok(bIsDirty, "Expecting content for ACE Editor tab is dirty ");
					//assert W5G editor dirty
					return oContent.open(oDoc_View02, oWysiwygEditor);
				}).then(function () {
					return oContent.isDirty();
				}).then(function (bIsDirty) {
					assert.ok(bIsDirty, "Expecting content for W5G Editor tab is dirty ");
				});
		});

		it("Damage content - check W5G editor getting close", function () {
			//assume documents opened in this order one after the other - open uses queueing mechanism
			return oContent.open(oDoc_View02, oAceEditor)
				.then(function () {
					return oDoc_View02.getContent();
				})
				.then(function (sViewXML) {
					var iIndex = sViewXML.indexOf('<content>');
					sViewXML = sViewXML.substring(0, iIndex) + '>>' + sViewXML.substring(iIndex);
					return oDoc_View02.setContent(sViewXML);
				})
				.then(function () {
					assert.ok(oContent.isDirty(), "Expecting content for XML Editor tab is dirty ");
				})
				.then(function () {
					return oDocument.open(oDoc_View02);
				})
				.then(function () {
					return oContent.getDocuments();

				})
				.then(function (aDocuments) {
					assert.equal(aDocuments.length, 1, "expecting the only one opened document");
				})
				.then(function () {
					assert.ok(oContent.isDirty(), "Expecting content for XML Editor tab is stay dirty ");
				});
		});

	});
});
