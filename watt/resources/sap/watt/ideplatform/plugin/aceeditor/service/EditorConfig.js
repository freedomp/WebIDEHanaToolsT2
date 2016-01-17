define(["sap/watt/common/plugin/platform/service/ui/AbstractConfig", "../control/Editor"], function(AbstractConfig) {
	"use strict";

	return AbstractConfig.extend("sap.watt.common.plugin.aceeditor.service.EditorConfig", {

		_oThemesRBG: null,
		_sSelectedTheme: null,
		_sStoredTheme: null,
		_oContent: null,
		_nFontSize: null,
		_oDropdownBox_fontSize: null,

		_demoScript: "/**\n" + "* This is a sample sum function \n" + "*/\n" + "getSum: function(a, b) {\n" + " var i;\n" +
			"                i = a + b;\n" +
			"              return i;\n" + "}",

		_previewSetFontSize: function(fontSize) {
			this._oEditor.setFontSize(fontSize + "px");
		},

		getUserPreferenceContent: function() {
			if (!this._oContent) {
				this._oContent = this._createUI();
			}
			this._sStoredTheme = this._oSettings.theme;
			this._setSelectedTheme(this._sStoredTheme);
			
			return this._oContent;
		},

		configure: function(mConfig) {
			this._oPreferenceModel = new this.PreferenceModel(mConfig.preferenceService);
			this._aStyles = mConfig.styles;
		},

		saveUserPreference: function() {
			if (!this._oContent) {
				return Q();
			}

			this._configureAutoSave();

			var that = this;
			if (this._sSelectedTheme || this._nFontSize) {
				if (this._sSelectedTheme) {
					this._sStoredTheme = this._sSelectedTheme;
					jQuery.extend(that._oSettings, {
				    	theme: that._sSelectedTheme
					});
                	
                	// Update editor preview
                	if (this._oEditor) {
    					this._oEditor.setTheme(that._sSelectedTheme);
                	}
				}

				//Font size will be added to the settings only if the user has chosen some value from the font size control
				if (that._nFontSize) {
					//add the field fontSize to the settings
					jQuery.extend(that._oSettings, {
						fontSize: that._nFontSize
					});

				}

				that._oPreferenceModel.storeSession(that._oSettings);
				that.context.event.firePreferencesSaved(that._oSettings).done();

			}
			return Q();

		},

		cancel: function() {
			this._setSelectedTheme(this._sStoredTheme);
		},

		_createUI: function() {

			var that = this;
			this.context.service.resource.includeStyles(this._aStyles).done();
			this._oThemesRBG = new sap.ui.commons.RadioButtonGroup({
				items: [new sap.ui.core.Item({
					text: this.context.i18n.getText("i18n", "theme_eclipse"),
					key: "ace/theme/eclipse"
				}), new sap.ui.core.Item({
					text: this.context.i18n.getText("i18n", "theme_xcode"),
					key: "ace/theme/xcode"
				}), new sap.ui.core.Item({
					text: this.context.i18n.getText("i18n", "theme_chrome"),
					key: "ace/theme/chrome"
				}), new sap.ui.core.Item({
					text: this.context.i18n.getText("i18n", "theme_cumulus"),
					key: "ace/theme/sap-cumulus"
				}), new sap.ui.core.Item({
					text: this.context.i18n.getText("i18n", "theme_flower"),
					key: "ace/theme/sap-flowerpower"
				}), new sap.ui.core.Item({
					text: this.context.i18n.getText("i18n", "theme_monokai"),
					key: "ace/theme/monokai"
				}), new sap.ui.core.Item({
					text: this.context.i18n.getText("i18n", "theme_tomorrow_night"),
					key: "ace/theme/tomorrow_night"
				}), new sap.ui.core.Item({
					text: this.context.i18n.getText("i18n", "theme_basement"),
					key: "ace/theme/sap-basement"
				}),	new sap.ui.core.Item({
					text: this.context.i18n.getText("i18n", "theme_morlock"),
					key: "ace/theme/sap-morlock"
				})],
				select: function() {
					that._sSelectedTheme = that._oThemesRBG.getSelectedItem().getKey();
					return that._oEditor.setTheme(that._sSelectedTheme);
				}
			}).addStyleClass("editorSetting_form  editor_labels2");

			if (!this._oEditor) {
				this._oEditor = new sap.watt.common.plugin.aceeditor.control.Editor("editor-theme", {
					width: "100%",
					height: "300px",
					layoutData: new sap.ui.layout.form.GridElementData({
						hCells: "8",
						vCells: 8
					})
				});

				this._oEditor.addEventDelegate({
					onAfterRendering: function() {
						that._oEditor.setTheme(that._sSelectedTheme || that._sStoredTheme);
						that._oEditor.getSession().setMode("ace/mode/javascript");
						// Do not use Worker!
						that._oEditor.getSession().setUseWorker(false);
						that._oEditor.setValue(that._demoScript);
						that._oAutoSaveCheckBox.setChecked(that._oSettings.autoSave);
						/* Font size will be taken from the settings only if the user has choosen some value from the font size control- 
                              otherwise this field doesn't exist there yet (see saveUserPreference)*/
						if (that._oSettings.fontSize) {
							that._previewSetFontSize(that._oSettings.fontSize);
							that._oDropdownBox_fontSize.setSelectedKey(that._oSettings.fontSize);
						} else { /*we'll set it to ACE default - 12px - since we don't have a getFontSize from ACE*/
							that._previewSetFontSize(12);
							that._oDropdownBox_fontSize.setSelectedKey(12);
						}
					}
				});
			}

			this._oAutoSaveCheckBox = new sap.ui.commons.CheckBox({
				text: this.context.i18n.getText("i18n", "dlg_Auto_Save_selection"),
				tooltip: this.context.i18n.getText("i18n", "dlg_Auto_Save_selection")
			});

			var oAutoSaveDescription = new sap.ui.commons.Label({
				text: this.context.i18n.getText("i18n", "dlg_Auto_Save_description"),
				tooltip: this.context.i18n.getText("i18n", "dlg_Auto_Save_description")
			});

			this._oDropdownBox_fontSize = new sap.ui.commons.DropdownBox("DropdownBox_fontSize", {
				tooltip: this.context.i18n.getText("i18n", "tooltip_fontsize"),
				items: [new sap.ui.core.ListItem("ID1", {
						text: "8px",
						key: 8
					}),
                        new sap.ui.core.ListItem("ID2", {
						text: "9px",
						key: 9
					}),
                        new sap.ui.core.ListItem("ID3", {
						text: "10px",
						key: 10
					}),
                        new sap.ui.core.ListItem("ID4", {
						text: "11px",
						key: 11
					}),
                        new sap.ui.core.ListItem("ID5", {
						text: "12px",
						key: 12
					}),
                        new sap.ui.core.ListItem("ID6", {
						text: "13px",
						key: 13
					}),
                        new sap.ui.core.ListItem("ID7", {
						text: "14px",
						key: 14
					}),
                        new sap.ui.core.ListItem("ID8", {
						text: "16px",
						key: 16
					}),
                        new sap.ui.core.ListItem("ID9", {
						text: "18px",
						key: 18
					})],
				change: function(oEvent) {
					//while selecting a value from the drop down- we'll update the preview editor
					that._nFontSize = parseInt(oEvent.oSource.getSelectedKey(), 10);
					that._previewSetFontSize(that._nFontSize);
				},
				layoutData: new sap.ui.layout.form.GridElementData({
					hCells: "2"
				})

			});

			var oLabel_Font = new sap.ui.commons.Label("LabelFont", {
				text: this.context.i18n.getText("i18n", "dlg_font_title"),
				layoutData: new sap.ui.layout.form.GridElementData({
					hCells: "2"
				})
			}).addStyleClass("editorSetting_form editor_labels");

			var oLabel_Size = new sap.ui.commons.Label("LabelSize", {
				text: this.context.i18n.getText("i18n", "dlg_size_title"),
				layoutData: new sap.ui.layout.form.GridElementData({
					hCells: "2"
				})
			}).addStyleClass("editorSetting_form editor_labels2");

			var oLayout = new sap.ui.layout.form.GridLayout("EditorConfigLayout");

			var oForm = new sap.ui.layout.form.Form("EditorConfigForm", {
				layout: oLayout,
				formContainers: [
				new sap.ui.layout.form.FormContainer("EditorConfigContainer1", {
						title: new sap.ui.core.Title({
							text: this.context.i18n.getText("i18n", "dlg_theme_selection")
						}),
						formElements: [
						new sap.ui.layout.form.FormElement({
								fields: [new sap.ui.commons.Label({
										text: this.context.i18n.getText("i18n", "dlg_editortheme_title")
									}).addStyleClass("editorSetting_form editor_labels"),
									this._oEditor
							]
							}),
						new sap.ui.layout.form.FormElement({
								fields: [this._oThemesRBG]
							}),
						new sap.ui.layout.form.FormElement({
								fields: [oLabel_Font]
							}),
						new sap.ui.layout.form.FormElement({
								fields: [oLabel_Size, this._oDropdownBox_fontSize]
							}),
						new sap.ui.layout.form.FormElement({
								label: new sap.ui.commons.Label({
									text: " ",
									layoutData: new sap.ui.layout.form.GridElementData({
										hCells: "1"
									})
								})
							})
					]
					}),
				new sap.ui.layout.form.FormContainer("EditorConfigContainer2", {
						title: new sap.ui.core.Title({
							text: this.context.i18n.getText("i18n", "dlg_Auto_Save_Title_selection")
						}),
						formElements: [
                            new sap.ui.layout.form.FormElement({
								fields: [this._oAutoSaveCheckBox]
							}), new sap.ui.layout.form.FormElement({
								fields: [oAutoSaveDescription]
							})
                        ]
					})
			]
			});

			oForm.addStyleClass("editorSetting_form");

			return oForm;

		},

		_configureAutoSave: function(bAutoSave) {

			if (this._oSettings.autoSave !== this._oAutoSaveCheckBox.getChecked()) {

				if (this._oAutoSaveCheckBox.getChecked()) {
					this.context.service.content.startAutoSave().done();
				} else {
					this.context.service.content.stopAutoSave().done();
				}

				jQuery.extend(this._oSettings, {
					autoSave: this._oAutoSaveCheckBox.getChecked()
				});
				this._oPreferenceModel.storeSession(this._oSettings);

			}

		},

		_setSelectedTheme: function(sTheme) {
			var items = this._oThemesRBG.getItems();
			for (var i = 0; i < items.length; i++) {
				if (items[i].getKey() === sTheme) {
					this._oThemesRBG.setSelectedIndex(i);
				}
			}
		},

		// This object handles the editor user settings and Persistence service
		PreferenceModel: function(oPreferenceService) {

			// an empty model implementation 
			var mDummy = {

				beginSession: function() {
					return Q(true);
				},

				storeSession: function(oUserSettingsAsJson) {},

				getSession: function() {
					return null;
				},

				removeSession: function() {
					return Q(true);
				}
			};

			var mFunc = {

				_fPersistenceSrv: undefined,
				_sPersistenceNode: undefined,
				_oUserPreferencesAsJson: undefined,
				_bLoaded: false,
				beginSession: function() {
					var that = this;
					if (!this._bLoaded) {
						this._bLoaded = true;
						return this._fPersistenceSrv.get(this._sPersistenceNode).then(function(oUserSettingsAsJson) {
							if (oUserSettingsAsJson) {
								that._oUserPreferencesAsJson = {};
								for (var pname in oUserSettingsAsJson) {
									if (oUserSettingsAsJson.hasOwnProperty(pname)) {
										that._oUserPreferencesAsJson[pname] = oUserSettingsAsJson[pname];
									}
								}
							}

							return that._oUserPreferencesAsJson;
						}).fail(function(oError) {
							that._oUserPreferencesAsJson = undefined;
						});
					} else {
						return Q(this._oUserPreferencesAsJson);
					}
				},

				storeSession: function(oUserSettingsAsJson) {
					// Cache current user settings                                                                    
					this._oUserPreferencesAsJson = oUserSettingsAsJson;
					// Write through to orion
					this._fPersistenceSrv.set(oUserSettingsAsJson, this._sPersistenceNode).done();

				},

				getSession: function() {
					// may or may not initialized
					return this._oUserPreferencesAsJson;
				},

				removeSession: function() {
					this._oUserPreferencesAsJson = undefined;
					this._fPersistenceSrv.remove(this._sPersistenceNode).done();
				}

			};

			if (oPreferenceService && oPreferenceService.service) {
				mFunc._fPersistenceSrv = oPreferenceService.service;
				mFunc._sPersistenceNode = oPreferenceService.node;
				return mFunc;
			} else {
				return mDummy;
			}
		},

		/**
		 * Get User Settings. It is called from editor to initialize properties.
		 *
		 * @param          the user settings
		 */
		getUserSetting: function() {
			if (this._oSettings) {
				return this._oSettings;
			} else {
				var that = this;
				return this._oPreferenceModel.beginSession().then(function(oSettings) {
					if (!oSettings) {
						oSettings = {
							theme: "ace/theme/sap-cumulus",
							showInvisibles: false,
							autoSave: false
						};
					}
					that._oSettings = oSettings;
					return oSettings;
				});
			}
		},

		/**
		 * Set User Settings. Now showInvisibles need this entry
		 *
		 * @param          the user settings
		 */
		setUserSetting: function(oSettings) {
			this._oSettings = oSettings;
			return this._oPreferenceModel.storeSession(oSettings);
		}

	});
});