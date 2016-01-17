sap.ui.define(["sap/ui/test/Opa5","uitests/pageobjects/webIDEBase"], function(Opa5, WebIDEBase){

	function _withTab(sTitle){
		return {
			controlType : "sap.ui.ux3.NavigationItem",
			matchers : [
				new sap.ui.test.matchers.Properties({
					text : new RegExp("\\*?" + sTitle, "i")
				})
			]
		};
	}
	
	return Opa5.createPageObjects({
		inTheContent: {

			baseClass : WebIDEBase,

			actions : {
				iCloseTab : function(sTitle){
					return this.waitFor(jQuery.extend(_withTab(sTitle),{
						success : function(aTab) {
							this.waitFor({
								controlType : "sap.watt.platform.plugin.content.control.NavigationBar",
								success : function (aNavBar) {
									aNavBar[0].closeTab(aTab[0].getId());
								},
								errorMessage : "Can't find the content navbar"
							});

						},
						errorMessage : "Can't find the tab " + sTitle

					}));
				},
				iDblClickTab : function(sTitle){
				    var that = this;
					return this.waitFor(jQuery.extend(_withTab(sTitle),{
						success : function(aTab) {
							this.waitFor({
								controlType : "sap.watt.platform.plugin.content.control.NavigationBar",
								success : function () {
								 that.simulate.doubleClick(aTab[0]);
								},
								errorMessage : "Can't find the content navbar"
							});

						},
						errorMessage : "Can't find the tab " + sTitle

					}));
				},
				iRightClickTab : function(sTitle){
				    var that = this;
					return this.waitFor(jQuery.extend(_withTab(sTitle),{
						success : function(aTab) {
							this.waitFor({
								controlType : "sap.watt.platform.plugin.content.control.NavigationBar",
								success : function () {
								 that.simulate.rightClick(aTab[0]);
								},
								errorMessage : "Can't find the content navbar"
							});

						},
						errorMessage : "Can't find the tab " + sTitle

					}));
				}
			},

			assertions : {

				theTabExists : function(sTitle) {
					return this.waitFor(jQuery.extend(_withTab(sTitle),{
						success : function() {
							ok(true, "I found the specific tab");
						},
						errorMessage : "Can't find the specific tab"

					}));
				},

				noTabExists : function(sTitle) {
					return this.waitFor({
						controlType : "sap.ui.ux3.NavigationItem",
						success : function(aTabs) {
							for (var i = 0; i < aTabs.length; i++) {
								var oTab = aTabs[i];
								if (oTab.getText() === sTitle) {
									ok(false, "There should be no tab with this name...");
								}
							}
							ok(true, "Didn't find the searched tab which is good...");
						},
						errorMessage : "There should be no tab with this name..."

					});
				},

				iCheckIfTabExistsFor : function(oResource) {
					return this.waitFor({
						success : function() {
							this.theTabExists(oResource.name);
						},
						errorMessage : "Can't find the specific dirty tab"
					});
				},
				
				iCheckIfNoTabExistFor : function(oResource) {
					return this.waitFor({
						success : function() {
							this.noTabExists(oResource.name);
						},
						errorMessage : "There should be no tab with this name..."
					});
				},
				
				theTabIsDirty : function(sTitle) {

					return this.waitFor(jQuery.extend(_withTab(sTitle),{
						check : function(oItem) {
							return oItem[0].getText().indexOf("*")===0;
						},
						success : function() {
							ok(true, "I found the specific dirty tab");
						},
						errorMessage : "Can't find the specific dirty tab"

					}));
				},

				theTabIsNotDirty : function(sTitle) {
					return this.waitFor(jQuery.extend(_withTab(sTitle),{
						check : function(oItem) {
							return oItem[0].getText().indexOf("*")===-1;
						},
						success : function() {
							ok(true, "I found the specific non dirty tab");
						},
						errorMessage : "Can't find the specific non dirty tab"

					}));
				},
				
				iSeeTab: function() {
					this.waitFor({
						controlType: "sap.ui.ux3.NavigationItem",
                        matchers : function(oEditortab) {
                            return oEditortab.getDomRef().classList.contains("webidetabcontextMenu");
                        },
						success: function(oEditortab) {
						    strictEqual(oEditortab.length, 1, "Tab is opened as expected");
						},
						errorMessage: "Tab was not opened "
					});
                }
                ,
				
				iSeeTabContextMenu: function() {
				    this.waitFor({
						controlType: "sap.ui.unified.MenuItem",
                        matchers : function(oControl) {
                            return oControl.getDomRef().classList.contains("sapUiMnuItm");//title.contains("Close (Alt+W)");
                        },
						success: function(oControl) {
						    strictEqual(oControl[0].getDomRef().title, "Close (Alt+W)", "Close tab found in tab context menu");
						    strictEqual(oControl[1].getDomRef().title, "Close All (Alt+Shift+W)", "Close All tabs found in tab context menu");
						    strictEqual(oControl[2].getDomRef().title, "Close Others", "Close other tabs found in tab context menu");
						},
						errorMessage: "Context Tab was not opened "
					});
                },
				iClickCloseInTabContextMenu: function() {
				    var that = this;
				    this.waitFor({
						controlType: "sap.ui.unified.MenuItem",
                        matchers : function(oControl) {
                            return oControl.getDomRef().classList.contains("sapUiMnuItm");//title.contains("Close (Alt+W)");
                        },
						success: function(oControl) {
						    that.simulate.click(oControl[0]);//close
						   
						},
						errorMessage: "File was not closed"
					});
                },
				iClickCloseAllInTabContextMenu: function() {
				    var that = this;
				    this.waitFor({
						controlType: "sap.ui.unified.MenuItem",
                        matchers : function(oControl) {
                            return oControl.getDomRef().classList.contains("sapUiMnuItm");//title.contains("Close (Alt+W)");
                        },
						success: function(oControl) {
						    that.simulate.click(oControl[1]);//closeAll
						   
						},
						errorMessage: "Files was not closed"
					});
                }
			} // end of actions  , assertions { ... }
		}
	});
});