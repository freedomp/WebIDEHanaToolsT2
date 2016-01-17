define(["STF"], function(STF) {
	"use strict";

	var oCommandGroupService;
	var tobeTestedGroup;

	var groupDummyAction  = [];
	var groupDummyInline = [];
	var groupDummyMenu = [];
	var groupDummyList = [];
	var groupFooInline  = [];
	var groupFooMenu  = [];
	var groupFooList  = [];

	var suiteName = "commandGroup_test";
	var iFrameWindow = null;

	describe("Command Group test", function() {
		var getService = STF.getServicePartial(suiteName);
		before(function() {
			return STF.startWebIde(suiteName, {
				config: "core/core/platform/plugin/menu/config.json"
			}).
				then(function(webIdeWindowObj) {
				var mConsumer = {
					"name" : "commandGroupTestConsumer",

					"requires" : {
						"services" : [ "commandGroup", "command", "focus", "system", "log" ]
					},

					"configures" : {

						"services" : {

							"command:commands" : [
								{
									"id" : "qUnit.createFile",
									"label" : "Create File",
									"service" : "sap.watt.uitools.plugin.repositorybrowser.command.createFile"
								},
								{
									"id" : "qUnit.createFolder",
									"label" : "Create Folder",
									"service" : "sap.watt.uitools.plugin.repositorybrowser.command.createFolder"
								},
								{
									"id" : "qUnit.ide.exit",
									"label": "Exit",
									"service": "sap.watt.uitools.plugin.ide.command.Exit"
								},
								{
									"id" : "qUnit.ide.help",
									"label": "Documentation",
									"service": "sap.watt.uitools.plugin.ide.command.Help"
								},
								{
									"id" : "qUnit.ide.about",
									"label": "About",
									"service": "sap.watt.uitools.plugin.ide.command.About"
								},
								{
									"id" : "qUnit.tools.git",
									"label": "GIT",
									"service": "sap.watt.uitools.plugin.ide.command.Git"
								},
								{
									"id" : "qUnit.tools.development",
									"label": "Development",
									"service": "sap.watt.uitools.plugin.ide.command.Editor"
								},
								{
									"id" : "qUnit.dummy.foo",
									"label": "Dummy",
									"service": "sap.watt.uitools.plugin.ide.command.Editor"
								},
								{
									"id" : "qUnit.dummy.bar",
									"label": "Development",
									"service": "sap.watt.uitools.plugin.ide.command.Editor"
								}
							],

							"commandGroup:groups" : [
								{"id" : "qUnit.dummy.action", "label" : "Dummy Action"},

								{ "id" : "qUnit.dummy.inline", "label": "Dummy Inline"},
								{ "id" : "qUnit.dummy.menu", "label" : "Dummy Menu"},
								{ "id" : "qUnit.dummy.list", "label" : "Dummy List"},

								{ "id" : "qUnit.foo.inline", "label" : "Foo Inline"},
								{ "id" : "qUnit.foo.menu", "label" : "Foo Menu"},
								{ "id" : "qUnit.foo.list", "label" : "Foo List"}
							],

							"commandGroup:items" : [
								{ "parent" : "qUnit.dummy.action", "command" : "qUnit.createFile", "prio": 1 },
								{ "parent" : "qUnit.dummy.action", "command" : "qUnit.createFolder", "prio": 1 },

								{ "parent" : "qUnit.dummy.inline", "group" : "qUnit.foo.inline", "type" : "inline", "prio": 1},
								{ "parent" : "qUnit.dummy.menu", "group" : "qUnit.foo.menu", "type" : "menu", "prio": 10},
								{ "parent" : "qUnit.dummy.list", "group" : "qUnit.foo.list", "type" : "list", "prio": 20},

								{ "parent" : "qUnit.foo.inline", "command" : "qUnit.tools.git", "prio": 1 },
								{ "parent" : "qUnit.foo.inline", "command" : "qUnit.tools.development", "prio": 10 },

								{ "parent" : "qUnit.foo.menu", "command" : "qUnit.ide.help", "prio": 1 },
								{ "parent" : "qUnit.foo.menu", "command" : "qUnit.ide.about", "prio": 1 },

								{ "parent" : "qUnit.foo.list", "command" : "qUnit.dummy.foo", "prio": 1 },
								{ "parent" : "qUnit.foo.list", "command" : "qUnit.dummy.bar", "prio": 1 }
							]
						}	// end of service
					} // end of configure
				};

					iFrameWindow = webIdeWindowObj;
					oCommandGroupService = getService("commandGroup");

					return STF.register(suiteName, mConsumer);
				});
		});

		after(function() {
			STF.shutdownWebIde(suiteName);
		});

		describe("positive configuration tests", function() {
			before(function() {
				groupDummyAction = {
					id: "qUnit.dummy.action",
					label: "Dummy Action",
					items: [
						{id: "qUnit.createFile", type: "ActionItem"},
						{id: "qUnit.createFolder", type: "ActionItem"}
					]
				};
				groupFooInline = {
					id: "qUnit.foo.inline",
					label: "Foo Inline",
					items: [
						{id: "qUnit.tools.git", type: "ActionItem"},
						{id: "qUnit.tools.development", type: "ActionItem"}
					]
				};
				groupFooMenu = {
					id: "qUnit.foo.menu",
					label: "Foo Menu",
					items: [
						{id: "qUnit.ide.help", type: "ActionItem"},
						{id: "qUnit.ide.about", type: "ActionItem"}
					]
				};
				groupFooList = {
					id: "qUnit.foo.list",
					label: "Foo List",
					items: [
						{id: "qUnit.dummy.foo", type: "ActionItem"},
						{id: "qUnit.dummy.bar", type: "ActionItem"}
					]
				};
				groupDummyInline = {
					id: "qUnit.dummy.inline",
					label: "Dummy Inline",
					items: [
						{id: "qUnit.foo.inline", type: "InlineItem"}
					]
				};
				groupDummyMenu = {
					id: "qUnit.dummy.menu",
					label: "Dummy Menu",
					items: [
						{id: "qUnit.foo.menu", type: "MenuItem"}
					]
				};
				groupDummyList = {
					id: "qUnit.dummy.list",
					label: "Dummy List",
					items: [
						{id: "qUnit.foo.list", type: "MenuItem"}
					]
				};
			});

			after(function() {
				groupDummyAction  = [];
				groupDummyInline = [];
				groupDummyMenu = [];
				groupDummyList = [];
				groupFooInline  = [];
				groupFooMenu  = [];
				groupFooList  = [];
			});

			it("test command group type action", function() {
				tobeTestedGroup = groupDummyAction;
				return oCommandGroupService.getGroup(tobeTestedGroup.id).then(function(oGroup) {
					assert.ok(oGroup);
					_assertCommandGroup(oGroup, tobeTestedGroup);
					return Q();
				});
			});

			it("test command group type menu", function() {
				tobeTestedGroup = groupDummyMenu;
				return oCommandGroupService.getGroup(tobeTestedGroup.id).then(function(oGroup) {
					assert.ok(oGroup);
					_assertCommandGroup(oGroup, tobeTestedGroup);
					return Q();
				});
			});

			it("test command group type inline", function() {
				tobeTestedGroup = groupDummyInline;
				return oCommandGroupService.getGroup(tobeTestedGroup.id).then(function(oGroup) {
					assert.ok(oGroup);
					_assertCommandGroup(oGroup, tobeTestedGroup);
					return Q();
				});
			});

			it("test command group type list", function() {
				tobeTestedGroup = groupDummyList;
				return oCommandGroupService.getGroup(tobeTestedGroup.id).then(function(oGroup) {
					assert.ok(oGroup);
					_assertCommandGroup(oGroup, tobeTestedGroup);
					return Q();
				});
			});

			function _assertCommandGroup(oActualGroup, oExpectedGroup) {
				_assertID(oActualGroup.getId(), oExpectedGroup.id);
				_assertLabel(oActualGroup.getLabel(), oExpectedGroup.label);
				_assertItems(oActualGroup, oExpectedGroup.items);
			}

			function _assertID(oActualGroupID, oExpectedGroupID) {
				assert.equal(oActualGroupID, oExpectedGroupID, "expected ID is: "+oExpectedGroupID);
			}

			function _assertLabel(oActualGroupLabel, oExpectedGroupLabel) {
				assert.equal(oActualGroupLabel, oExpectedGroupLabel, "expected label is: "+oExpectedGroupLabel);
			}

			function _assertItems(oActualGroup, oExpectedGroupItems) {
				oActualGroup.getItems().then(function(oItems){
					assert.equal(oItems.length, oExpectedGroupItems.length, "totally "+oExpectedGroupItems.length+" are expected");
					for (var i=0; i<oItems.length; i++) {
						var oItem = oItems[i];
						assert.ok(oItem.getId() === oExpectedGroupItems[i].id);
						switch(oExpectedGroupItems[i].type) {
							case "ActionItem":
								assert.ok(oItem.getCommand());
								break;
							case "InlineItem":
							case "MenuItem":
								assert.ok(oItem.getGroup());
								break;
						}
					}
				});
			}

		});
	});
});
