//  The SaneTestFramework should be imported via 'STF' path.
define(["STF", "sinon"], function(STF, sinon) {
	"use strict";

	//  every suite must have a uniqueName. using a none unique name will cause an error.
	var suiteName = "snippet_service_tests";
	var suiteWindowObj;

	var oMenuService;
	var oCommandGroupService;
	var oSelectionService;
	var oSnippetService;
	var oCommandService;
	var oUserNotificationService;
	var oMenu;
	var oFakeAceEditor;
	var MockFileDocument;
	var sandbox;

	describe("Snippet service", function() {
		before(function() {
			return STF.startWebIde(suiteName, {config : "editor/monaco/ideplatform/plugin/snippet/service/config.json"}).
			then(function(webIdeWindowObj) {
				suiteWindowObj = webIdeWindowObj;
				oMenuService = STF.getService(suiteName, "menu");
				oCommandGroupService = STF.getService(suiteName, "commandGroup");
				oSelectionService = STF.getService(suiteName, "selection");
				oSnippetService = STF.getService(suiteName, "snippet");
				oCommandService = STF.getService(suiteName, "command");
				oUserNotificationService = STF.getService(suiteName, "usernotification");
				oMenu = new suiteWindowObj.sap.ui.commons.Menu();
				return STF.require(suiteName, [
					"sane-tests/editor/monaco/ideplatform/plugin/snippet/service/mocks/fakeAceEditor",
					"sane-tests/util/mockDocument"
				]);
			}).spread(function(FakeAceEditor, oMockDocument) {
				oFakeAceEditor = new FakeAceEditor();
				MockFileDocument = oMockDocument.MockFileDocument;
			});
		});

		beforeEach(function() {
			sandbox = sinon.sandbox.create();
		});

		afterEach(function() {
			sandbox.restore();
		});

		it("Snippet insertion should work for when ace editor is open with supported file extension", function() {
			var oDoc = new MockFileDocument("testProj/1.test", "test");
			oFakeAceEditor.setDocument(oDoc);
			sandbox.stub(oSelectionService, "getOwner").returns(Q(oFakeAceEditor));
			var oEditorAddStringSpy = sandbox.spy(oFakeAceEditor, "addString");
			var oSnippetsGroup;
			var aGroupItems;
			return oCommandGroupService.getGroup("edit.insertSnippet.snippets").then(function(oGroup) {
				oSnippetsGroup = oGroup;
				return oMenuService.populate(oMenu, oGroup);
			}).then(function() {
				var aItems = oMenu.getItems();
				expect(aItems).to.have.length(2);
				expect(aItems[0].getText()).to.equal("test snippet with handler");
				expect(aItems[1].getText()).to.equal("test snippet without handler");
				return oSnippetsGroup.getItems();
			}).then(function(aItems) {
				aGroupItems = aItems;
				return aGroupItems[0].getCommand().execute(aGroupItems[1].getCommand().getValue("testSnippetWithHandler"));
			}).then(function() {
				var sExpectedContent = "snippet1: " + oDoc.getEntity().getFullPath();
				expect(oEditorAddStringSpy.calledWith(sExpectedContent)).to.be.true;
				return aGroupItems[1].getCommand().execute(aGroupItems[1].getCommand().getValue("testSnippetWithoutHandler"));
			}).then(function() {
				var sExpectedContent = "snippet2";
				expect(oEditorAddStringSpy.calledWith(sExpectedContent)).to.be.true;
			});
		});

		it("Snippet menu should not be shown when ace editor is open with unsupported file extension", function() {
			var oDoc = new MockFileDocument("testProj/1.xml", "xml");
			oFakeAceEditor.setDocument(oDoc);
			sandbox.stub(oSelectionService, "getOwner").returns(Q(oFakeAceEditor));
			return oCommandGroupService.getGroup("edit.insertSnippet.snippets").then(function(oGroup) {
				return oMenuService.populate(oMenu, oGroup);
			}).then(function() {
				var aItems = oMenu.getItems();
				expect(aItems).to.be.empty;
			});
		});

		it("Snippet menu should not be shown when selection owner is not ace editor", function() {
			sandbox.stub(oSelectionService, "getOwner").returns(Q(null));
			return oCommandGroupService.getGroup("edit.insertSnippet.snippets").then(function(oGroup) {
				return oMenuService.populate(oMenu, oGroup);
			}).then(function() {
				var aItems = oMenu.getItems();
				expect(aItems).to.be.empty;
			});
		});
		
		it("Missing or invalid file path in configuration should result in returning no snippets", function() {
			return oSnippetService.getAllSnippets("test3").then(function(aSnippets) {
				expect(aSnippets).to.be.null;
			});
		});

		it("Alert should be displayed when snippet handler throws an excpetion", function(done) {
			oCommandService.getCommand("sap.watt.ideplatform.snippet.insertSnippet").then(function(oCommand) {
				var oData = {
					preSnippetInsertionHandler: {
						updateSnippetBeforeInsertion: function() {
							return Q.reject(new Error("error"));
						}
					}
				};
				sandbox.stub(oUserNotificationService, "alert", function() {
					expect(true).to.be.true;
					done();
				});
				return oCommand.execute(oData);
			}).done();
		});

		after(function() {
			STF.shutdownWebIde(suiteName);
		});
	});
});