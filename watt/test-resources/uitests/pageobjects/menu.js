sap.ui.define(["sap/ui/test/Opa5","uitests/pageobjects/webIDEBase"], function(Opa5, WebIDEBase){

	var clickInMenu = function (aIds, oPreviousSubMenu) {

		if (aIds.length) {
			var sId = aIds.shift();
			this.waitFor({
				id : sId,
				controlType : "sap.ui.unified.MenuItem",
				matchers : new sap.ui.test.matchers.Ancestor(oPreviousSubMenu),
				success : function (aMenuItems) {
					this.simulate.click(aMenuItems[0]);

					if (aIds.length) {
						this.waitFor({
							controlType : "sap.ui.unified.Menu",
							matchers : [
								function(oControl) {
									return oControl.hasStyleClass("WattMainMenuSub");
								},
								new sap.ui.test.matchers.Ancestor(oPreviousSubMenu)
							],
							success : function (aSubMenus) {
								var oSubMenu = aSubMenus[0];
								clickInMenu.call(this, aIds, oSubMenu);
							},
							errorMessage : "I can't find submenu with ancestor: " + oPreviousSubMenu
						});
					}
				},
				errorMessage : "Can't click '" + sId + "' in (sub)menu"
			});
		}

		return this;
	};

    return Opa5.createPageObjects({
        inTheMenuBar : {

            baseClass : WebIDEBase,

			actions: {
				iCallOpenResource : function() {
					return clickInMenu.call(this, [
						/menubarapplicationMenu-search/i,
						/search-resourceindex.resourcelist/i
					]);
				},

				iCreateNewProject : function() {
					return clickInMenu.call(this, [
						/menubarapplicationMenu-file/i,
						/file.new/i,
						/file.new-template.createProject/i
					]);
				},
				
				iCreateNewComponent : function() {
					return clickInMenu.call(this, [
						/menubarapplicationMenu-file/i,
						/file.new/i,
						/file.new-template.createComponent/i
					]);
				},
				
				iCreateNewProjectFromSample : function() {
					return clickInMenu.call(this, [
						/menubarapplicationMenu-file/i,
						/file.new/i,
						/file.new-template.createReferenceProject/i
					]);
				},

				iAddReferenceToLibrary : function() {
					return clickInMenu.call(this, [
						/menubarapplicationMenu-file/i,
						/template.CreateReferenceToLibrary/i
					]);
				},

				iOpenGitClone: function() {
					return clickInMenu.call(this, [
					    /menubarapplicationMenu-file/i,
						/file.git/i,
						/gitclient.clone/i
					]);
				},
				
				iOpenGitPane: function() {
					return clickInMenu.call(this, [
					   /menubarapplicationMenu-view/i, 
					   /gitclient.open/
					]);
				},
				
				iOpenGitHistory: function() {
					return clickInMenu.call(this, [
					    /menubarapplicationMenu-file/i,
						/file.git/i,
						/gitclient.gitlog/i
					]);
				},

				iOpenWorkspace: function() {
					return clickInMenu.call(this, [
						/menubarapplicationMenu-view/i,
						/repositorybrowser.toggle/i
					]);
				},

				iResetToDefault: function() {
					return clickInMenu.call(this, [
						/menubarapplicationMenu-view/i,
						/perspective.reset/i
					]);
				},
				
				iOpenGitPreferences: function() {
					return clickInMenu.call(this, [
					    /menubarapplicationMenu-tools/i,
						/tools.userpreference/i
					]);
				},
				
                iOpenDevelopment: function() {
					return clickInMenu.call(this, [
					    /menubarapplicationMenu-tools/i,
						/tools.development/i
					]);
				},
				
				iOpenWelcomeScreen: function() {
					return clickInMenu.call(this, [
					    /menubarapplicationMenu-tools/i,
						/tools.welcome/i
					]);
				},
				
				iOpenPreferences : function() {
					return clickInMenu.call(this, [
					    /menubarapplicationMenu-tools/i,
						/tools.userpreference/i
					]);
				},

				iOpenExtensionProjectWizard : function() {
					return clickInMenu.call(this, [
						/menubarapplicationMenu-file/i,
						/file.new/i,
						/file.new-template.createExtensionProject/i
					]);
				},

				iCreateNewFolder : function() {
					return clickInMenu.call(this, [
						/menubarapplicationMenu-file/i,
						/file.new/i,
						/new-repositorybrowser.createFolder/i
					]);
				},

				iCreateNewFile : function() {
					return clickInMenu.call(this, [
						/menubarapplicationMenu-file/i,
						/file.new/i,
						/new-repositorybrowser.createFile/i
					]);
				},
				
				iCloseFile : function() {
				    
					return clickInMenu.call(this, [
						/menubarapplicationMenu-file/i,
						/content.close/i
					]);
				},

				iSaveFile: function() {
					return clickInMenu.call(this, [
						/menubarapplicationMenu-file/i,
                        /content.save/i
					]);
				},
				
				iDeleteFile: function() {
					return clickInMenu.call(this, [
						/menubarapplicationMenu-edit/i,
                        /repositorybrowser.delete/i
					]);
				},

				iRunPreview : function() {
					return clickInMenu.call(this, [
						/menubarapplicationMenu-run/i,
						/run-preview.run/i
					]);
				},

				iOpenTheAboutPopup: function() {
				    return clickInMenu.call(this, [
				        /menubarapplicationMenu-help/i,
				        /ide.about/i
				    ]);
				},
				iOpenExtensibilityPane:function(){
				    return clickInMenu.call(this, [
				        /menubarapplicationMenu-tools/i,
				        /preview.extensionwithmock/i
				    ]);

				},
				iOpenExternalPlugins:function(){
				    return clickInMenu.call(this, [
				        /menubarapplicationMenu-tools/i,
				        /tools-pluginmanager.importPlugins/i
				    ]);
				},
				iCreateTranslationTestFiles:function(){
				    return clickInMenu.call(this, [
				        /menubarapplicationMenu-file/i,
				        /file.translation/i,
				        /translation-pseudotranslation.generateFolder/i
				    ]);
				}

			}
			
			/* , assertions: {

			} */
		}
	});

});
