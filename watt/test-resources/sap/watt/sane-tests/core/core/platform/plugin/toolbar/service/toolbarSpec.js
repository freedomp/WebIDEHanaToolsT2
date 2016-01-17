define(["STF"], function(STF) {
	"use strict";

	var suiteName = "toolbarpAlive";
	var oToolbarService, sap, jQuery;
	var toolbarID = "__toolbar0-qUnit.applicationToolbar";
	var toolbaritemIDPrefix = toolbarID + "-";
	describe("toolbar test", function() {
		var getService = STF.getServicePartial(suiteName);

		before(function() {
			return STF.startWebIde(suiteName, {
				config: "core/core/platform/plugin/toolbar/config.json"
			}).then(function(webIdeWindowObj) {
				oToolbarService = getService("toolbar");
				sap = webIdeWindowObj.sap;
				jQuery = webIdeWindowObj.jQuery;
			});
		});

		after(function() {
			STF.shutdownWebIde(suiteName);
		});

		describe("full configuration tests", function() {
			it("Toolbar content test", function() {
				function _assertToolbar(actualToolbarItems) {
					// items[0] = command
					// items[1] = menu	
					// items[2] = seperator
					// items[3] = command 
					// items[4] = seperator
					// items[5] = list

					assert.equal(actualToolbarItems.length, 6, "should be 6 items contained in the toolbar");

					_assertToolbarItemButton(actualToolbarItems[0], {
						"id": "qUnit.content.close",
						"label": "CLOSE",
						"icon": "close",
						"iconLabel": "Close",
						"service": "sap.watt.platform.content/command/Close"
					});

					_assertToolbarItemMenu(actualToolbarItems[1], 2);

					_assertToolbarItemSeperator(actualToolbarItems[2]);

					_assertToolbarItemButton(actualToolbarItems[3], {
						"id": "qUnit.tools.development",
						"label": "Development",
						"service": "sap.watt.uitools.plugin.ide.command.Editor"
					});

					_assertToolbarItemSeperator(actualToolbarItems[4]);

					_assertToolbarItemComboBox(actualToolbarItems[5], 2);
				}

				function _assertToolbarItemButton(itemButton, command) {
					assert.ok(itemButton instanceof sap.ui.commons.Button, "button is constructed for type action and inline");

					var tobeComparedID = itemButton.getId();
					if (tobeComparedID.indexOf(toolbaritemIDPrefix) == 0) {
						tobeComparedID = tobeComparedID.substr(toolbaritemIDPrefix.length);
					}
					assert.equal(tobeComparedID, command.id, "the toolbar item id should be: " + command.id);

					if (command.iconLabel) {
						assert.ok(itemButton.hasStyleClass("watt_toolbar_text"), "button with iconlabel defined has style class watt_toolbar_text");
						assert.equal(itemButton.getText(), command.iconLabel, "text is set as iconlabel for  " + command.id +
							"  when icon and iconlabel are defined");
					} else {
						if (command.icon) {
							assert.equal(itemButton.getText(), command.iconLabel, "text is set as iconlabel for  " + command.id +
								"  when icon and iconlabel are defined");
						} else {
							assert.equal(itemButton.getText(), command.label, "text is set as label for  " + command.id +
								"  when icon and iconlabel are defined");
						}
					}

				}

				function _assertToolbarItemMenu(itemMenu, sizeOfMenu) {
					assert.ok(itemMenu instanceof sap.ui.commons.MenuButton, "menu is constructed for type menu");
				}

				function _assertToolbarItemSeperator(itemSeperator) {
					assert.ok(itemSeperator instanceof sap.ui.commons.ToolbarSeparator, "new group starts with toolbarseparator");
				}

				function _assertToolbarItemComboBox(itemComboBox, sizeOfMenu) {
					assert.ok(itemComboBox instanceof sap.ui.commons.ComboBox, "ComboBox is constructed for type list");
				}

				return oToolbarService.getContent().then(function(oContent) {
					assert.ok(oContent, "configuration contains no error");
					_assertToolbar(oContent.getItems());
				});
			});
		});

		var mConfig = {};
		var oToolbarServiceImpl = undefined;

		describe("single configuration tests", function() {
			before(function() {
				return oToolbarService._getImpl().then(function(oNonLazyProxy) { //test changed w.r.t. lazy vs. non lazy proxy
					return oNonLazyProxy._getImpl().then(function(oImpl) {
						oToolbarServiceImpl = oImpl;
					});
				});
			});

			after(function() {
				mConfig = {};
				refreshToolBarService();
			});
			
			it("test none existing group",function() {
			var wronglyConfiguredGroups = {
				"commandGroup:groups" : [
					{ "id" : "qUnit.applicationToolbar"}
				],
				
				"commandGroup:items" : [				    
				    { "parent" : "qUnit.applicationToolbar", "group" : "qUnit.foo.dummy", "type" : "menu" , "prio": 20 }
				],
				"toolbar:group" : "qUnit.applicationToolbar"				
			};
				
			mConfig = wronglyConfiguredGroups;
			return oToolbarServiceImpl.configure(mConfig).then(function() {
				assert.ok(false, "toolbar should reject non-existing group");
			}, function() {	
				assert.ok(true, "toolbar rejects non-existing group");
			});
		});
		
		function refreshToolBarService() {
			oToolbarServiceImpl._aItems = {};
		}
		});
	});
});