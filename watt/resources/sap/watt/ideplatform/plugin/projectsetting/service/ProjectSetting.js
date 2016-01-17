define(["sap/watt/common/plugin/platform/service/ui/AbstractPart"
], function ( AbstractPart) {
	"use strict";

	return AbstractPart.extend("sap.watt.common.plugin.projectsetting.service.ProjectSetting", {
		_oPanel : null,
		_oPluginList : null,
		_oSettingBorderLayout : null,
		_oTitleLabel : null,
		_oDescriptionLabel : null,
		_oTitleDivider : null,
		_cancelButton : null,
		_saveButton : null,
		_oCurrentPlugin : null,
		_oCurrentPluginButton : null,
		_mPluginsId : [],
		_pluginButtons : [],
		_oCurrentProject : null,
		_inShowSetting : false,
		_generation: null,

        
		setVisible : function(bVisible, oDocument, sPluginIdToOpen) {
		    if (!oDocument && bVisible !== false) {
		        return Q();
		    }
		    
			if(bVisible && sPluginIdToOpen){
				this.sPluginIdToOpen = sPluginIdToOpen;
			}else{
				this.sPluginIdToOpen = null;
			}
			if(this._oPanel && this	.sPluginIdToOpen){
				var that = this;
				return this._openSpecificPlugin().then(function(){
					return that._updateVisibleState(bVisible, oDocument, sPluginIdToOpen);
				});
			}else{
				return this._updateVisibleState(bVisible, oDocument, sPluginIdToOpen);
			}
		},

		_updateVisibleState : function(bVisible, oDocument){
			if (bVisible) {
			    var oArgs = arguments;
				if (oDocument && !oDocument.getEntity().isRoot()) {
					var that = this;
					return oDocument.getProject().then(function (oProject) {
						// If a different project opened we want to select the default sPluginIdToOpen
						if (that._oCurrentProject && that._oCurrentProject !== oProject) {
							that._cleanUI();
						} else if(that._oCurrentPlugin && !that.sPluginIdToOpen) {
							// Will cause the button plugin to be selected during _openSpecificPlugin
							that.sPluginIdToOpen = that._oCurrentPlugin.id;
						}
						
						that._oCurrentProject = oProject;
						return that.context.service.projectType.getProjectTypes(oProject).then(function(aProjectTypes) {
    						that._oCurrentProject._aProjectTypes = aProjectTypes;
    						return AbstractPart.prototype.setVisible.apply(that, oArgs);
						});
					});
				} 
				throw new Error("ProjectSettings: cannot open editor without defined project");
			} 
			return AbstractPart.prototype.setVisible.apply(this, arguments);
		},

		_createErrorUI : function() {
			var panel = new sap.ui.commons.layout.BorderLayout({
				width: "100%",
				height: "100%",
				busyIndicatorDelay : 0
			}).addStyleClass("projectsettingPanel");

			return panel;
		},

		_createUI : function() {
			var that = this;
			this._oPanel = new sap.ui.commons.Splitter().addStyleClass("projectsettingPanel");
			this._oPanel.setSplitterOrientation(sap.ui.commons.Orientation.vertical);
			this._oPanel.setSplitterPosition("15%");
			this._oPanel.setMinSizeFirstPane("15%");
			this._oPanel.setMinSizeSecondPane("60%");
			this._oPanel.setWidth("100%");
			this._oPanel.setHeight("100%");
			//adding Labels to both panes
			this._oPluginList = new sap.ui.layout.VerticalLayout({
				width: "100%"
			}).addStyleClass("pluginList");
			this._oPanel.addFirstPaneContent(this._oPluginList);
			this._oSettingBorderLayout = new sap.ui.commons.layout.BorderLayout({
				width: "100%",
				height: "100%",
				busyIndicatorDelay : 0
			}).addStyleClass("settingBorderLayout");
			this._oPanel.addSecondPaneContent(this._oSettingBorderLayout);

			var oTitlePanel = new sap.ui.layout.VerticalLayout({
				width: "100%",
				layoutData: new sap.ui.layout.form.GridElementData({hCells: "16"})
			});

			this._oTitleLabel = new sap.ui.commons.Label().addStyleClass("titleLabel");
			oTitlePanel.addContent(this._oTitleLabel);

			this._oDescriptionLabel = new sap.ui.commons.Label().addStyleClass("descriptionLabel");
			oTitlePanel.addContent(this._oDescriptionLabel);

			//divider
			this._oTitleDivider = new sap.ui.commons.HorizontalDivider({
				visible: false
			}).addStyleClass("titlePanelDivider");
			oTitlePanel.addContent(this._oTitleDivider);

			this._oSettingBorderLayout.createArea(sap.ui.commons.layout.BorderLayoutAreaTypes.top, oTitlePanel);
			this._oSettingBorderLayout.setAreaData(sap.ui.commons.layout.BorderLayoutAreaTypes.top, {
				size : "120px",
				visible : true
			});

			var oActionPanel = new sap.ui.layout.VerticalLayout({
				width: "100%",
				layoutData: new sap.ui.layout.form.GridElementData({hCells: "16"})
			});

			var oButtonPanel = new sap.ui.layout.HorizontalLayout({
				allowWrapping : true,
				layoutData : new sap.ui.layout.GridData({
					span : "L12 M12 S12",
					linebreak : true
				})
			}).addStyleClass("buttonPanel");

			this._saveButton = new sap.ui.commons.Button({
				text : this.context.i18n.getText("i18n", "button_save"),
				tooltip : this.context.i18n.getText("i18n", "button_save"),
				visible : false,
				press: function(){
					that._saveSetting();
				}
			});

			oButtonPanel.addContent(this._saveButton);
			this._cancelButton = new sap.ui.commons.Button({
				text : this.context.i18n.getText("i18n", "button_cancel"),
				tooltip : this.context.i18n.getText("i18n", "button_cancel"),
				press: function(){
					that._cancelSetting();
				}
			});
			oButtonPanel.addContent(this._cancelButton);
			oActionPanel.addContent(oButtonPanel);
			this._oSettingBorderLayout.createArea(sap.ui.commons.layout.BorderLayoutAreaTypes.bottom, oActionPanel);
			this._oSettingBorderLayout.setAreaData(sap.ui.commons.layout.BorderLayoutAreaTypes.bottom, {
				size : "54px",
				contentAlign : "left",
				visible : true
			});

			return this._oPanel;
		},

		/**
		*	comparision function for sorting
		*/
		_sortByName: function(a , b) {
			// mix compare "group" and "name".
			// if the item is in a group (not undefined, not null, not "null", then use group name for comparision
			// otherwise, use item name instead
			var isAGroup = true;
			var sA = a.group;
			if (!sA || sA === null) {
				sA = a.name;
				isAGroup = false;
			}

			var isBGroup = true;
			var sB = b.group;
			if (!sB || sB === null) {
				sB = b.name;
				isBGroup = false;
			}

			if (!sA || !sB) {
				return 0;
			}

			if (sA < sB) {
     			return -1;
			} else if (sA > sB) {
    			return 1;
  			} else {
  				//both items are in the same group, so compare the item name for sorting
  				if (isAGroup && isBGroup) {
  					if (a.name < b.name) {
  						return -1;
  					} else if (a.name > b.name) {
  						return 1;
  					} else {
  						return 0;
  					}
  				}
  				else {
  					return 0;
  				}
  			}

  			return 0;
		},

		/**
		* Search the group of sGroupName in the control list of aControlList.
		* If found, return the object, otherwise return undefined.
		* parameters:
		* 	aControlList	an array of control for searching in format of [{"groupName":"", "object": null}]
		*	sGroupName		the group to find
		* return:
		*	the group object or undefined if not found
		*/
		_findExistingGroup: function(aControlList, sGroupName) {
			if (aControlList) {
				for (var i = 0; i < aControlList.length; i++) {
					if (sGroupName === aControlList[i].groupName) {
						return aControlList[i].object;
					}
				}
			}

			return undefined;
		},
		
		_removeOldPlugin : function(oOldPluginButton) {
			oOldPluginButton = oOldPluginButton || this._oCurrentPluginButton;
			if (oOldPluginButton) {
				oOldPluginButton.removeStyleClass("selectedPluginButton");
				return this.context.service.focus.detachFocus(this._oCurrentPlugin.service);
			} else {
				return Q();
			}
		},
		
		_pressPluginButton : function(oPlugin, oControl, oOldPluginButton) {
			var that = this;
			return that._removeOldPlugin(oOldPluginButton).then(function() {
				that._oCurrentPluginButton = oControl;
				oControl.addStyleClass("selectedPluginButton");
				return that.context.service.focus.attachFocus(oPlugin.service).then(function() {
					return that._showSetting(oPlugin);
				});
			});
		},

		_createList : function() {
		    this._pluginButtons = [];
		    this._oPluginList.removeAllContent();

			this._mPluginsId.sort(this._sortByName);
			var aControls = [];
			var that = this;
			jQuery.each(this._mPluginsId, function(iIndex, oPlugin) {
				var oControl = new sap.ui.commons.Button({
					width: '100%', // sap.ui.core.CSSSize
					text: oPlugin.name,
					press: function(){
						that._pressPluginButton(oPlugin, oControl).done();
					}
				}).addStyleClass("pluginButton");

				if (that._isDisplayProjectSettingsUIComponent(oPlugin) === true) {
    				that._pluginButtons.push({plugin: oPlugin, button: oControl});
    				if (oPlugin.group && oPlugin.group !== "null" ) {
    					oControl.addStyleClass("indentPluginButton");
    
    					var oGroup = that._findExistingGroup(aControls, oPlugin.group);
    					if (oGroup) {
    						//group exists, add the new item to it
    						oGroup.oSection1.addContent(oControl);
    					} else {
    						//group did not exists
    						oGroup = new sap.ui.commons.Accordion({
    							width: "100%"
    						});
    						var oSection1 = new sap.ui.commons.AccordionSection({
    							title: oPlugin.group,
    							collapsed: true
    						});
    
    						oGroup.addSection(oSection1);
    						oGroup.oSection1 = oSection1;
    
    						that._oPluginList.addContent(oGroup);
    						oGroup.oSection1.addContent(oControl);
    
    						aControls.push({"groupName": oPlugin.group, "object": oGroup});
    					}
    				} else {
    					that._oPluginList.addContent(oControl);
    
    					aControls.push({"groupName": oPlugin.group, "object": oControl});
    				}
                }
			});
		},

		_showSetting : function(oPlugin) {
			if (this._inShowSetting) {
				return Q();
			}

			this._inShowSetting = true;
			this._oTitleLabel.setText(oPlugin.title);
			this._oDescriptionLabel.setText(oPlugin.description);
			this._oTitleDivider.setVisible(true);
			this._saveButton.setVisible(true);
			this._oSettingBorderLayout.setBusy(true);
			this._oSettingBorderLayout.removeAllContent(sap.ui.commons.layout.BorderLayoutAreaTypes.center);
			this._oCurrentPlugin = oPlugin;
			var sProjectPath = this._oCurrentProject.getEntity().getFullPath();
			var that = this;
			
			that.context.service.usagemonitoring.report("projectSettings", "selectSetting", [oPlugin.id, oPlugin.name]).done();
			return oPlugin.service.getProjectSettingContent(oPlugin.id, oPlugin.group, sProjectPath).then(function(oContent) {
				that._oSettingBorderLayout.addContent(sap.ui.commons.layout.BorderLayoutAreaTypes.center, oContent);
				that._oSettingBorderLayout.setBusy(false);
				return that.context.service.focus.attachFocus(oPlugin.service).then(function(){
					that._inShowSetting = false;
					return Q();
				});
			});
		},
		
		_cleanUI: function() {
				if (this._oPluginList) {
					this._oPluginList.removeAllContent();
				}
				if (this._oSettingBorderLayout) {
					this._oSettingBorderLayout.removeAllContent(sap.ui.commons.layout.BorderLayoutAreaTypes.center);	
				}
				this._pluginButtons = [];
				this._oPanel = null;
				this.sPluginIdToOpen = null;
		},

		_cancelSetting : function() {
			//this._oCurrentProject = null;
			this.context.service.content.setVisible(true).done();
		},

		_saveSetting : function() {
			if (this._oCurrentPlugin) {
				var that = this;
                var sProjectPath = this._oCurrentProject.getEntity().getFullPath();
                this._oCurrentPlugin.service.saveProjectSetting(this._oCurrentPlugin.id,
						this._oCurrentPlugin.group, sProjectPath).then(function() {
					that.context.service.usernotification.liteInfo(that.context.i18n.getText("i18n", "msg_saved")).done();
				}).fail(function (errMsg) {
				    if (errMsg !== undefined) {
				        that.context.service.usernotification.alert(errMsg).done();
				    }
				}).done();
			}
		},

		_openSpecificPlugin : function(){
			//find the plugin by id
			for (var i = 0; i < this._pluginButtons.length; i++) {
				var pluginInfo = this._pluginButtons[i];
				if (pluginInfo.plugin.id === this.sPluginIdToOpen) {
					break;
				}
			}
			var oPluginToOpen= pluginInfo.plugin;
			var oPluginButtonToOpen = pluginInfo.button;
			return this._pressPluginButton(oPluginToOpen, oPluginButtonToOpen, null);
		},
		// ====================================================================================
		// Interface methods: sap.watt.common.service.ui.Part
		// ====================================================================================
		getContent : function() {
			var that = this;
			return AbstractPart.prototype.getContent.apply(this, arguments).then(function() {
				if (that._oPanel === null) {
					that._createUI();
				}
				return Q();
			}).then(function() {
				return that._initPlugins();
			}).then(function(oldPluginButon) {
				if(that.sPluginIdToOpen){
					return that._openSpecificPlugin();
				}else if (that._oCurrentPlugin) {
					return that._pressPluginButton(that._oCurrentPlugin, that._oCurrentPluginButton, oldPluginButon);
				} else {
					that._oTitleLabel.setText("");
					that._oDescriptionLabel.setText("");
					that._oTitleDivider.setVisible(false);
					that._saveButton.setVisible(false);
					that._oSettingBorderLayout.removeAllContent(sap.ui.commons.layout.BorderLayoutAreaTypes.center);
					
					if (oldPluginButon) {
						return that._removeOldPlugin();
					} else {
						return Q();
					}
				}
			}).then(function() {
				return Q(that._oPanel);
			}).fail(function(err) {
				that.context.service.usernotification.alert(
					that.context.i18n.getText("i18n", "load_error_message", err.message)).then(function() {
					that._cancelSetting();
				}).done();
				
				return Q(that._createErrorUI());
			});
		},

		getFocusElement : function() {
			if (this._oPanel == null) {
				return this.getContent();
			} else {
				return Q(this._oPanel);
			}
		},
		
		getSelection : function() {
			return {document: this._oCurrentProject};
		},
		
		configure : function(mConfig) {
			var that = this;
			AbstractPart.prototype.configure.apply(this, arguments).then(function() {
				that._generation = mConfig.generation;
				jQuery.each(mConfig.plugins, function(iIndex, oPlugin) {
					that._mPluginsId.push(oPlugin);

					var oPluginService = oPlugin.service;
					if (!oPluginService._hasProjectSettingChangedEvent) {
						oPluginService._hasProjectSettingChangedEvent = true;
						oPluginService.attachEvent('projectSettingChangedEvent', that.onProjectSettingChanged, that);
					}
				});
				return that.context.event.firePluginsLoaded();
			}).done();
		},

		onDocumentSelected : function(oEvent) {
		    if (!this._oCurrentProject || !this.isVisible()) {
				return;
			}
			// Project settings should listen only to selection change event of repository browser
			if (!oEvent.params.owner.instanceOf("sap.watt.common.service.ui.Browser")) {
			    return;
			}
			var that = this;
			var oSelectedDocument = oEvent.params.selection && oEvent.params.selection[0] && oEvent.params.selection[0].document;
			if (oSelectedDocument) {
				if (oSelectedDocument.getEntity().isRoot()) {
					that._cancelSetting();
				} else {
					oSelectedDocument.getProject().then(function (oProjectDocument) {
						if (that._oCurrentProject !== oProjectDocument) {
							that._cleanUI();
							that._cancelSetting();
						}
					}).done();
				}
			} else { //no selected document, CANNOT save so close it
				that._cancelSetting();
			}
		},

		_initPlugins : function() {
			if (!this._oCurrentProject) {
				return Q();
			}
			
			this._createList();
			var that = this;
			
			var oldPluginButon = null;
			if (that._oCurrentPlugin) {
				for (var i = 0; i < that._pluginButtons.length; i++) {
					var pluginInfo = that._pluginButtons[i];
					if (pluginInfo.plugin === that._oCurrentPlugin) {
						oldPluginButon = pluginInfo.button;
						// Set sPluginIdToOpen for focus on the button
						that.sPluginIdToOpen = pluginInfo.plugin.id;
						break;
					}
				}
			}
			
			// Find the first default plugin in the first project settings load (oCurrentPlugin is null)
			// and if the current project doesn't have the currentPlugin configured (oldPluginButon is null).
			if (!oldPluginButon && that._oCurrentPlugin || !that._oCurrentPlugin) {
				var found = false;
				for (i = 0; i < that._pluginButtons.length; i++) {
					pluginInfo = that._pluginButtons[i];

					if (pluginInfo.button.getVisible()) {
						that._oCurrentPlugin = pluginInfo.plugin;
						that._oCurrentPluginButton = pluginInfo.button;
						
						found = true;
						
						break;
					}
				}
				
				if (!found) {
					that._oCurrentPlugin = null;
					that._oCurrentPluginButton = null;
				}
			}
			
			return Q(oldPluginButon);
		},

		onDocumentDeleted : function(oEvent) {
			if (!this._oCurrentProject) {
				return;
			}

			var oDocument = oEvent.params.document;
			if (oDocument && oDocument.isProject()) {
				this._cancelSetting();
			}
		},

		//for unit test purpose
		getPlugins: function() {
			return this._mPluginsId;
		},

		onProjectSettingChanged: function() {
			//the event was fired by registered service
		},
		
		_isDisplayProjectSettingsUIComponent : function(oPlugin) {
            var that = this;
            if (this._isIncludeProjectSettingsUIComponentInAllProjectsTypes(oPlugin)) {
		        return true; // To keep the old behaivour of adding all existing types and future include plugin to all.
		    }
            // primary/builtIn project types: fiori, web...
            if (that._oCurrentProject && that._oCurrentProject._aProjectTypes) {
                for (var i=0; i<that._oCurrentProject._aProjectTypes.length; i++) { 
                	var oProjectType = that._oCurrentProject._aProjectTypes[i];
            	    if (that._isProjectSettingsUIComponentConfiguredProjectType(oPlugin, oProjectType.id)) {
            	        return true;
            	    }
                }
            }
            return false;
		},
		
		_isProjectSettingsUIComponentConfiguredProjectType : function(oPlugin, sProjectTypeId) {
		   
            // The Project settings UI component (plugin) defined project types
            if (oPlugin && oPlugin.projectTypes) {
                if (oPlugin.projectTypes.indexOf(sProjectTypeId) >= 0){
                    return true;
                }
            }
            return false;
		},
		
		/*
		    The Project Settings UI Component will be included to all project types:
		    1) If the projectTypes key is not defined in the Project Settings UI Component.
		    2) If the projectTypes key includes "*".
		    
		*/
		_isIncludeProjectSettingsUIComponentInAllProjectsTypes: function(oPlugin) {
		    if (oPlugin) {
		        if (oPlugin.projectTypes === undefined) { // To keep the old behaivour of adding all existing types
		            return true;
		        } else if (oPlugin.projectTypes.indexOf("*") >= 0) { // include in all projects
		            return true;
		        }
		    }
		    return false;
		},
		
		onProjectTypeConfigSaved : function() {
			var that = this;
			if (this._oCurrentProject) {
				return this._updateVisibleState(true, this._oCurrentProject).then(function() {
					that._createList();
				});
			}			
		}
	});
});