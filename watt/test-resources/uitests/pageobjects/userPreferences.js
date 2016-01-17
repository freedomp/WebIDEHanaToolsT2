sap.ui.define(["sap/ui/test/Opa5",
		"sap/ui/test/opaQunit",
		"uitests/pageobjects/webIDEBase",
		"sap/ui/test/matchers/Selector",
		"uitests/pageobjects/preferencesMock"
	],
	function(Opa5,
		opaQunit,
		WebIDEBase,
		Selector,
		oPreferencesMock) {

		"use strict";

		var NODE_REPOSITORY_BROWSER = "sap.watt.common.repositorybrowser.service.RepositoryBrowserPersistence";
		var NODE_PERSPECTIVE = "sap.watt.common.service.ui.Perspective";
		var NODE_CONTENT = "sap.watt.common.content.service.ContentServicePersistence";
		var NODE_EXTERNAL_PLUGINS = "config.json";

		var setup = {
			baseClass: WebIDEBase,
			actions: {
			    
			    iClickOnPluginNode: function(sPluginID) {
					return this.waitFor({
						id: sPluginID,
						success: function(oButton) {
						    this.simulate.click(oButton);
						},
						errorMessage: "There was no plugin button with id " + sPluginID
					});
			    },
			    
			    iClickSave: function() {

					return this.waitFor({
						controlType: "sap.ui.commons.Button",
						matchers: new sap.ui.test.matchers.Properties({
							id: "applyButton"
						}),

						success: function(aButton) {
							ok(aButton[0], "Save button");
							aButton[0].firePress();

						},
						errorMessage: "No Save button available"
					}); //success
				},

				iClickOKOnSaveDialog : function() {

					return this.waitFor({
						controlType: "sap.ui.commons.Dialog",
						matchers: new sap.ui.test.matchers.Properties({
							id: "MSG_INFO"
						}),

						success: function(aDialog) {

							return this.waitFor({
								controlType: "sap.ui.commons.Button",
								matchers: new sap.ui.test.matchers.Properties({
									id: "MSG_INFO--btn-OK"
								}),

								success: function(aButton) {
									this.simulate.click(aButton[0]);
									return this.waitFor({

										success: function() {
											ok(true, "Information dialog is closed");
										},
										errorMessage: "Preferences Information Dialog not closed"
									});
								},
								errorMessage: "No OK button available"
							});
						}
					}); //success
				}
					
			},
			assertions: {
		    	iSeeUserPreferences: function() {
					this.waitFor({
						controlType: "sap.ui.commons.layout.BorderLayout",
                        matchers : function(oBorderLayout) {
                            return oBorderLayout.$().hasClass("userPrefPanel");
                        },
						success: function(aBorderLayouts) {
						    strictEqual(aBorderLayouts.length, 1, "User Preferences right side is opened as expected");
						},
						errorMessage: "There was no user preferences panel"
					});
					
					return this.waitFor({
						controlType: "sap.ui.commons.layout.BorderLayout",
                        matchers : function(oBorderLayout) {
                            return oBorderLayout.$().hasClass("userPrefPluginBorderLayout");
                        },
						success: function(aBorderLayouts) {
					        strictEqual(aBorderLayouts.length, 1, "User Preferences left side is opened as expected");
						},
						errorMessage: "There was no user preferences plugins panel"
					});
				}
			}
		};

		var nodes = {
			"repositoryBrowser": NODE_REPOSITORY_BROWSER,
			"content": NODE_CONTENT,
			"perspective": NODE_PERSPECTIVE,
			"externalPlugins" : NODE_EXTERNAL_PLUGINS
		};

		jQuery.each(nodes, function(name, node) {

			var key = name + "IsAwaitingAChange";
			setup.actions[key] = function() {
				return this.waitFor({
					success: function() {
						oPreferencesMock.resetNodeChanged(node);
						return true;
					}
				});
			};

			key = name + "PreviousStateHasBeen";
			setup.actions[key] = function(sSetting) {
				return this.waitFor({
					success: function() {
						oPreferencesMock.handleNode(node, sSetting);
					}
				});
			};

			key = name + "IsChanged";
			setup.assertions[key] = function() {
				return this.waitFor({
					check: function() {
						return oPreferencesMock.isNodeChanged(node);
					},
					success : function() {
						ok(true, "Persistence Node changed: " + node);
					},
					errorMessage : name + " settings have not been written to persistence"
				});
			};
		});

		// @OVERRIDE
		var externalPluginsOld = setup.actions.externalPluginsPreviousStateHasBeen;
		setup.actions.externalPluginsPreviousStateHasBeen = function externalPluginsPreviousStateHasBeen(aPlugins) {
			
			aPlugins = aPlugins || [];
			aPlugins = aPlugins.map(function(sValue){
				return "/plugins/pluginrepository/" + sValue;
			});
			var mConfig = {
				"plugins" : aPlugins
			};
			return externalPluginsOld.call(this, mConfig);
		};

		return Opa5.createPageObjects({
			inTheUserPreferences: setup
		});
	});
