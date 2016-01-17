define(["sap/watt/platform/plugin/tipsandtricks/service/TipsAndTricksViewsFactory"], function(TipsAndTricksViewsFactory) {
	describe("The TipsAndTricksViewsFactory", function () {
		describe("has a _getCommandKeyBindingAsArray function that works", function() {
			it("for MAC", function() {
				var oCommand = {
					getKeyBindingAsText: function() {
						return "\u2318\u21E7R";
					}
				};

				var aKeyBinding =  TipsAndTricksViewsFactory._getCommandKeyBindingAsArray(oCommand);
				expect(aKeyBinding).to.have.length(3);
				expect(aKeyBinding[0]).to.equal("\u2318");
				expect(aKeyBinding[1]).to.equal("\u21E7");
				expect(aKeyBinding[2]).to.equal("R");
			});

			it("for Windows", function() {
				var oCommand = {
					getKeyBindingAsText: function() {
						return "Ctrl+Shift+R+rrr";
					}
				};

				var aKeyBinding =  TipsAndTricksViewsFactory._getCommandKeyBindingAsArray(oCommand);
				expect(aKeyBinding).to.have.length(4);
				expect(aKeyBinding[0]).to.equal("Ctrl");
				expect(aKeyBinding[1]).to.equal("Shift");
				expect(aKeyBinding[2]).to.equal("R");
				expect(aKeyBinding[3]).to.equal("rrr");
			});
		});

		describe("has a _buildShortcutsLayout that works given", function() {

			it("multiple commands", function() {
				var aCommands = [
					{
						getKeyBindingAsText: function() {
							return "Ctrl+Shift+R";
						}
					},
					{
						getKeyBindingAsText: function() {
							return "Alt+p";
						}
					}
				];

				var verticalLayout = TipsAndTricksViewsFactory._buildShortcutsLayout(aCommands);

				expect(verticalLayout).to.be.ok;
				expect(verticalLayout.getContent()).to.have.length(2);

				//Validate the first horizontal layout
				var horizontalLayout1 = verticalLayout.getContent()[0];
				expect(horizontalLayout1).to.be.ok;
				expect(horizontalLayout1.getMetadata().getName()).to.equal("sap.ui.layout.HorizontalLayout");
				expect(horizontalLayout1.getContent()).to.have.length(5);
				expect(horizontalLayout1.getContent()[0].getMetadata().getName()).to.equal("sap.watt.platform.plugin.tipsandtricks.ui.controls.ShortcutLabel");
				expect(horizontalLayout1.getContent()[0].getText()).to.equal("Ctrl");
				expect(horizontalLayout1.getContent()[1].getMetadata().getName()).to.equal("sap.ui.commons.Label");
				expect(horizontalLayout1.getContent()[1].getText()).to.equal("+");
				expect(horizontalLayout1.getContent()[2].getMetadata().getName()).to.equal("sap.watt.platform.plugin.tipsandtricks.ui.controls.ShortcutLabel");
				expect(horizontalLayout1.getContent()[2].getText()).to.equal("Shift");
				expect(horizontalLayout1.getContent()[3].getMetadata().getName()).to.equal("sap.ui.commons.Label");
				expect(horizontalLayout1.getContent()[3].getText()).to.equal("+");
				expect(horizontalLayout1.getContent()[4].getMetadata().getName()).to.equal("sap.watt.platform.plugin.tipsandtricks.ui.controls.ShortcutLabel");
				expect(horizontalLayout1.getContent()[4].getText()).to.equal("R");

				//Validate the second horizontal layout
				var horizontalLayout2 = verticalLayout.getContent()[1];
				expect(horizontalLayout2).to.be.ok;
				expect(horizontalLayout2.getMetadata().getName()).to.equal("sap.ui.layout.HorizontalLayout");
				expect(horizontalLayout2.getContent()).to.have.length(3);
				expect(horizontalLayout2.getContent()[0].getMetadata().getName()).to.equal("sap.watt.platform.plugin.tipsandtricks.ui.controls.ShortcutLabel");
				expect(horizontalLayout2.getContent()[0].getText()).to.equal("Alt");
				expect(horizontalLayout1.getContent()[1].getMetadata().getName()).to.equal("sap.ui.commons.Label");
				expect(horizontalLayout1.getContent()[1].getText()).to.equal("+");
				expect(horizontalLayout2.getContent()[2].getMetadata().getName()).to.equal("sap.watt.platform.plugin.tipsandtricks.ui.controls.ShortcutLabel");
				expect(horizontalLayout2.getContent()[2].getText()).to.equal("p");

			});
		});
	});
});