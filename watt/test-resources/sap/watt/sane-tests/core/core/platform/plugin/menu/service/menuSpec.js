define(["STF"], function(STF) {
	"use strict";

	var oMenuService;
	var oCommandGroup;
	var suiteName = "menu_test";
	var iFrameWindow = null;
	var sap;

	describe("Menu test", function() {
		var getService = STF.getServicePartial(suiteName);
		before(function() {
			return STF.startWebIde(suiteName, {
				config: "core/core/platform/plugin/menu/config.json"
			}).
				then(function(webIdeWindowObj) {
				var mConsumer = {
					"name": "menuTest",

					"requires": {
						"services": [
							"commandGroup",
							"command",
							"menu",
							"selection",
							"usernotification"
						]
					},

					"configures": {

						"services": {
							"command:commands" : [{
								"id": "qUnit.ide.exit",
								"label": "Exit",
								"service": "sap.watt.uitools.plugin.ide.command.Exit",
								"keyBinding": "mod+shift+x",
								"available" : true,
								"enabled" : true
							}],

							"commandGroup:items" : [
								{
									"parent": "qUnit.file",
									"command": "qUnit.ide.exit",
									"prio": "9999"
								},
								{
									"parent": "qUnit.menu",
									"group" : "qUnit.file",
									"label" : "File",
									"type": "menu",
									"prio" : 1
								},
								{
									"parent": "qUnit.menu",
									"group" : "qUnit.edit",
									"label" : "Edit",
									"type": "menu",
									"prio" : 2
								},
								{
									"parent": "qUnit.menu",
									"group" : "qUnit.run",
									"label" : "Run",
									"type": "menu",
									"prio" : 3
								},
								{
									"parent": "qUnit.menu",
									"group" : "qUnit.search",
									"label" : "Search",
									"type": "menu",
									"prio" : 4
								},
								{
									"parent": "qUnit.menu",
									"group" : "qUnit.help",
									"label" : "Help",
									"type": "menu",
									"prio" : 5
								}
							],

							"commandGroup:groups": [
								{ "id" : "qUnit.menu"},
								{ "id" : "qUnit.file"},
								{ "id" : "qUnit.edit"},
								{ "id" : "qUnit.run"},
								{ "id" : "qUnit.search"},
								{ "id" : "qUnit.help"}
							]
						}

					}

				};

				iFrameWindow = webIdeWindowObj;
				sap = iFrameWindow.sap;
				oMenuService = getService("menu");
				oCommandGroup = getService("commandGroup");

				return STF.register(suiteName, mConsumer);
			});
		});

		it('Should Populate', function() {
			expect(true).to.equal(true);
			var oMenu = new sap.ui.commons.Menu();

			return oCommandGroup.getGroup("qUnit.menu").then(function(oGroup) {
				return oMenuService.populate(oMenu, oGroup).then(function () {
					expect(oMenu.getItems().length).to.equal(1); // Correct number of items
					expect(oMenu.getItems()[0].getText()).to.equal("File"); // First item is named right
					oMenu.destroy();
				});
			});

		});

		it('Populate item with keybinding text', function(){
			var oMenu = new sap.ui.commons.Menu();
			var bIsMac = (sap.ui.Device.os.name === "mac");
			var bIsWin = (sap.ui.Device.os.name === "win");
			return oCommandGroup.getGroup("qUnit.file").then(function(oGroup) {
				return oMenuService.populate(oMenu, oGroup).then(function () {
					expect(oMenu.getItems().length).to.equal(1); // Correct number of items"
					expect(oMenu.getItems()[0].getText()).to.equal("Exit"); // First item is named right

					iFrameWindow.$("body").append("<div id='sap-ui-static'>add our menu</div>");
					oMenu.placeAt(iFrameWindow.$("#sap-ui-static"));

					sap.ui.getCore().applyChanges();
					var expectedText = bIsMac ? "\u21E7\u2318X" : (bIsWin ? "Ctrl+Shift+X" : "Shift+Ctrl+X");

					expect(oMenu.getItems()[0].$("scuttxt").text()).to.equal(expectedText); // Key binding text is shown separately

					oMenu.destroy();
				});
			});
		});

		it("Populate Visitor", function(){
			var oMenu = new sap.ui.commons.Menu();
			var iCount = 0;
			var mExpectedItem = {
				"type" : "menu",
				"defaultAction" : undefined,
				"icon": undefined,
				"iconLabel": undefined,
				"id": "qUnit.menu-qUnit.file",
				"itemId": "qUnit.file",
				"label": "File",
				"prio": 1
			};
			return oCommandGroup.getGroup("qUnit.menu").then(function(oGroup) {
				return oMenuService.populate(oMenu, oGroup, {
					fnVisitor : function(iIndex, mItem) {
						iCount++;
						expect(mItem.group.getId()).to.equal("qUnit.file"); // Group is set right;
						delete mItem.group;
						expect(mItem).to.deep.equal(mExpectedItem);
					}
				}).then(function () {
					expect(iCount).to.equal(1); // "Visitor called"
				});
			});
		});

		after(function() {
			STF.shutdownWebIde(suiteName);
		});
	});

});
