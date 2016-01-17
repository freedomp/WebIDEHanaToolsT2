define(["sap/watt/common/plugin/platform/service/ui/AbstractConfig"], function(AbstractConfig) {
	"use strict";
	return AbstractConfig.extend("sap.watt.platform.plugin.translation.service.TranslationSettings", {
		_oContent: null,
		_oDomainDropdownBox: null,
		_oSelelctAllCheckBox: null,
		_oDropdownDefault: null,
		_oLenguageTable: null,
		_oTrData: {},
		_oDocumentByPath: null,

		_createEmptyModel: function() {
			//create empty translation category - in case project created not in web ide
			return {
				"translationDomain": "",
				"supportedLanguages": "",
				"defaultLanguage": "",
				"defaultI18NPropertyFile": "",
				"resourceModelName": ""
			};
		},

		getProjectSettingContent: function(id, group, sProjectPath) {

			var that = this;
			var oService = this.context.service;

			return this._getDocumentByPath(sProjectPath).then(function(oDocument) {
				that._oDocumentByPath = oDocument;
				return oService.setting.project.get(oService.translation, oDocument).then(function(oSettings) {
					that._oTrData.oSettings = oSettings;

					if (!that._oTrData.oSettings || that._oTrData.oSettings.length === 0) {
						that._oTrData.oSettings = that._createEmptyModel();
					}

					// if _oContent is empty, create UI, otherwise UI already created
					if (!that._oContent) {
						return that._getData().then(function(oTrData) {
							if (oTrData) {
								//get languages and domain data once
								that._oTrData.oStaticLanguageList = oTrData.oStaticLanguageList;
								that._oTrData.oDomainsList = oTrData.oDomainsList;

								that._oContent = that._createUI();
								//prepare data for Model
								that._prepareData();

								//update Model with data
								that._initModel();
								return that._oContent;
							}
						});

					}

					//prepare data for Model
					that._prepareData();

					//update Model with data
					that._initModel();

					return that._oContent;

				}).fail(function() {
					that._onErrorDataFetch();
					that.context.service.log.error("project settings", "Failed to load language settings", ["user"]).done();
					return that._oContent;
				});

			});
		},

		_getDocumentByPath: function(sProjectPath) {
			return this.context.service.document.getDocumentByPath(sProjectPath);
		},

		//get language list and domain list
		_getData: function() {
			var that = this;
			var oService = this.context.service;
			var oTrData = {};

			return this._getLanguages().then(function(oLanguageList) {
				oTrData.oStaticLanguageList = oLanguageList;
				if (sap.watt.getEnv("internal")) {
					return oService.translation.getDomains().then(function(oDomains) {
						oTrData.oDomainsList = oDomains;
						return oTrData;
					//failed to bring domains list	
					}).fail(function() {
						that.context.service.log.error("project settings", "Error while fetching data for domains!", ["user"]).done();
						oTrData.oDomainsList = {domains: []};
						return oTrData;
					});
				}
				return oTrData;
			}).fail(function() {
				that.context.service.log.error("project settings", "Error while fetching data for languages", ["user"]).done();
			});
		},

		//get languages from languageList.json file
		_getLanguages: function() {
			var aLanguages = [];
			var sURL = "resources/sap/watt/platform/plugin/translation/languages/languageList.json";
			return Q.sap.ajax(sURL).then(function(oResponse) {
				if (oResponse[0]) {
					var oJsonResponse;
					if (typeof oResponse[0] === "string") {
						oJsonResponse = JSON.parse(oResponse[0]);
					} else {
						oJsonResponse = oResponse[0];
					}
					var oLanguages = oJsonResponse.languages;
					for (var key in oLanguages) {
						aLanguages.push({
							id: key,
							name: oLanguages[key]
						});
					}
				}
				return {
					languages: aLanguages
				};
			});
		},

		//update model with data
		_initModel: function() {
			var oModel = this._oContent.getModel();
			oModel.setProperty("/oTrData", this._oTrData);
		},

		//prepare data for initial use
		_prepareData: function() {
			//get oDomain , handle external case where domains are not available
			if (sap.watt.getEnv("internal")) {
				this._oTrData.oDomain = this._getDomainObjFromSettings();
				this._oTrData.bInternalProject = true;
			} else {
				this._oTrData.bInternalProject = false;
			}
			//get and set supported languages
			this._oTrData.aLanguageList = this._createLanguageList();
			this._setSupportedLanguages();
			//get DefaultLanguage
			this._oTrData.oDefault = this._getDefaultObjFromSettings();
			//get DefaultLanguageList
			this._oTrData.aDefaultList = this._getDefaultListFromSettings();
			//get tristate checkbox initial state
			this._oTrData.sTristateState = this._getTristateInitialState();
			//get default language dropbox initial state
			this._oTrData.bDefaultEditable = this._oTrData.aDefaultList.length === 0 ? false : true;
		},

		//display not editable controlls if fail to load data
		_onErrorDataFetch: function() {
			if (!this._oContent) {
				this._oContent = this._createUI();
			}
			this._oDomainDropdownBox.setEnabled(false);
			this._oDropdownDefault.setEnabled(false);
			this._oSelelctAllCheckBox.setEnabled(false);
			this._oLenguageTable.setEditable(false);
			this._oLenguageTable.setVisibleRowCount(5);
		},

		//create language list to be attached to Languages table
		_createLanguageList: function() {
			var aLanguages = this._oTrData.oStaticLanguageList.languages;
			var aLanguageList = [];

			var bPseudo = false;
			//check if 2Q is in the list. 
			var pos = aLanguages.map(function(x) {
				return x.id;
			}).indexOf("en_us_sappsd");
			if (pos >= 0) {
				bPseudo = true;
			}
			//if 2Q is not contained in the list of languages and project is internal, add it
			if (!bPseudo && sap.watt.getEnv("internal")) {
				aLanguageList.push({
					"selected": false,
					"languageName": "2Q",
					"languageId": "en_us_sappsd"
				});
			}
			for (var i = 0; i < aLanguages.length; i++) {
				aLanguageList.push({
					"selected": false,
					"languageName": aLanguages[i].name,
					"languageId": aLanguages[i].id
				});

			}
			return aLanguageList;
		},

		_getDomainObjFromSettings: function() {
			var sDomainId = this._oTrData.oSettings.translationDomain;
			var aDomains = this._oTrData.oDomainsList.domains;
			var pos = aDomains.map(function(x) {
				return x.id;
			}).indexOf(sDomainId);
			if (pos >= 0) {
				return {
					id: aDomains[pos].id,
					name: aDomains[pos].name
				};
			} else {
				return {
					id: "",
					name: ""
				};
			}
		},

		_getDefaultObjFromSettings: function() {
			var sDefaultId = this._oTrData.oSettings.defaultLanguage;
			var sSupportedLanguages = this._oTrData.oSettings.supportedLanguages;

			//if default language not supplied , take  first lang as default and save before display
			if (!sDefaultId && sSupportedLanguages) {
				sDefaultId = sSupportedLanguages.split(",")[0];
				this._oTrData.oSettings.defaultLanguage = sDefaultId;
			}
			this.context.service.setting.project.set(this.context.service.translation,
				this._oTrData.oSettings, this._oDocumentByPath).done();

			var aLanguages = this._oTrData.aLanguageList;
			var pos = aLanguages.map(function(x) {
				return x.languageId;
			}).indexOf(sDefaultId);

			if (pos >= 0) {
				return {
					id: aLanguages[pos].languageId,
					name: aLanguages[pos].languageName
				};
			} else {
				return {
					id: "",
					name: ""
				};
			}
		},

		//get list of supported languages to be attached to default drop box
		_getDefaultListFromSettings: function() {
			var aDefaultList = [];
			var aLanguages = this._oTrData.aLanguageList;
			for (var i = 0; i < aLanguages.length; i++) {
				if (aLanguages[i].selected) {
					aDefaultList.push({
						id: aLanguages[i].languageId,
						name: aLanguages[i].languageName
					});
				}
			}
			return aDefaultList;
		},

		//set supported languages state to selected
		_setSupportedLanguages: function() {
			var that = this;
			var aSupportedLanguages = that._oTrData.oSettings.supportedLanguages.split(",");
			//add default language id to the supported list, if it is not there and save it
			var sDefaultLanguage = that._oTrData.oSettings.defaultLanguage;
			if (sDefaultLanguage && aSupportedLanguages.indexOf(sDefaultLanguage) === -1) {
				aSupportedLanguages.push(sDefaultLanguage);
				var sDefAdd = this._oTrData.oSettings.supportedLanguages ? "," + sDefaultLanguage : sDefaultLanguage;
				this._oTrData.oSettings.supportedLanguages = this._oTrData.oSettings.supportedLanguages + sDefAdd;
				this.context.service.setting.project.set(this.context.service.translation, this._oTrData.oSettings).done();
			}
			//update selected property of language list item
			for (var i = 0; i < aSupportedLanguages.length; i++) {
				var languageEntry = aSupportedLanguages[i];
				var iPostion = that._oTrData.aLanguageList.map(function(x) {
					return x.languageId;
				}).indexOf(languageEntry);
				if (iPostion >= 0) {
					that._oTrData.aLanguageList[iPostion].selected = true;
				}
			}
		},

		_getTristateInitialState: function() {
			//no selected items, default list contains only one empty object
			if (this._oTrData.aDefaultList.length === 0) {
				return "Unchecked";
			} else if (this._oTrData.aDefaultList.length === this._oTrData.aLanguageList.length) {
				return "Checked";
			} else {
				return "Mixed";
			}
		},

		//save project settings in .project.json
		saveProjectSetting: function(id, group, sProjectPath) {

			var oModel = this._oContent.getModel();
			var oTranslationData = oModel ? oModel.getProperty("/oTrData/oSettings") : null;
			if (oTranslationData) {
				//save domain
				var sDomain = oModel.getProperty("/oTrData/oDomain/id");
				oTranslationData.translationDomain = sDomain;

				//save supported labguages
				var aLanguages = oModel.getProperty("/oTrData/aLanguageList");
				var sLanguageIds = "";
				for (var i = 0; i < aLanguages.length; i++) {
					if (aLanguages[i].selected) {
						sLanguageIds = sLanguageIds + aLanguages[i].languageId + ",";
					}
				}
				sLanguageIds = sLanguageIds.substring(0, sLanguageIds.length - 1);
				oTranslationData.supportedLanguages = sLanguageIds;

				//save default language
				var sDefault = oModel.getProperty("/oTrData/oDefault/id");
				oTranslationData.defaultLanguage = sDefault;
				var that = this;
				return this._getDocumentByPath(sProjectPath).then(function(oDocument) {
					var oService = that.context.service;
					return oService.setting.project.set(oService.translation, oTranslationData, oDocument);
				});
			}
		},

		//-UI Handlers-----------------------------------------------------

		//-Domain handlers------------------------------------
		_addDomainsToDropdownBox: function(mDomains) {
			var firstListItem = new sap.ui.core.ListItem({
				text: ""
			});

			this._oDomainDropdownBox.addItem(firstListItem);
			if (mDomains.domains) {
				// fill domains items
				for (var oDomain = 0, len = mDomains.domains.length; oDomain < len; oDomain++) {
					var listItem = new sap.ui.core.ListItem({
						text: mDomains.domains[oDomain].name
					}).data("domain", mDomains.domains[oDomain]);

					this._oDomainDropdownBox.addItem(listItem);
				}
			}
		},

		_onDomainSelected: function(oEvent) {
			var selectedDomain = oEvent.getParameter("selectedItem").data("domain");
			var oModel = this._oContent.getModel();
			var oDomain = {};
			if (selectedDomain) {
				oDomain.id = selectedDomain.id;
				oDomain.name = selectedDomain.name;
			} else {
				oDomain.id = "";
				oDomain.name = "";
			}
			oModel.setProperty("/oTrData/oDomain", oDomain);
		},

		// -Language table handlers -----------------------------

		_onCheckBoxClick: function() {
			this._registerChildren(this._oSelelctAllCheckBox);
			// update aDefaultLanguages in Model 
			this._updateDefaultLanguageList();
			//update  defaultlangValue in Model
			this._updateDefaultLanguage();
			//update default dropbox state
			this._updateDefaultDropBoxState();
		},

		_onTristateClick: function() {
			var aItems = this._oContent.getModel().getProperty("/oTrData/aLanguageList");
			var i = 0;
			if (this._oSelelctAllCheckBox.getSelectionState() === "Checked") {
				for (i = 0; i < aItems.length; i++) {
					aItems[i].selected = true;

				}
			} else {
				for (i = 0; i < aItems.length; i++) {
					aItems[i].selected = false;
				}
			}
			this._oContent.getModel().setProperty("/oTrData/aLanguageList", aItems);
			this._updateDefaultLanguageList();
			this._updateDefaultLanguage();
			this._updateDefaultDropBoxState();
		},

		//update defaulte list when language gets selected or unselected
		_updateDefaultLanguageList: function() {
			var aItems = this._oContent.getModel().getProperty("/oTrData/aLanguageList");
			//get selected items 
			var aDefaultList = [];
			for (var i = 0; i < aItems.length; i++) {
				if (aItems[i].selected) {
					aDefaultList.push({
						id: aItems[i].languageId,
						name: aItems[i].languageName
					});
				}
			}
			this._oContent.getModel().setProperty("/oTrData/aDefaultList", aDefaultList);
		},

		//update default language in case default language removed from supported langs
		_updateDefaultLanguage: function() {
			//get default value from model
			var oDefaultId = this._oContent.getModel().getProperty("/oTrData/oDefault/id");
			var aItems = this._oContent.getModel().getProperty("/oTrData/aLanguageList");
			var aDefaultList = this._oContent.getModel().getProperty("/oTrData/aDefaultList");

			//if default list contains only one item, this item will be selected in default
			if (aDefaultList.length === 1) {
				this._oContent.getModel().setProperty("/oTrData/oDefault", {
					id: aDefaultList[0].id,
					name: aDefaultList[0].name
				});
			}
			//if default was removed , set another language in list as default
			var pos = aItems.map(function(x) {
				return x.languageId;
			}).indexOf(oDefaultId);
			if (pos >= 0 && !aItems[pos].selected) {
				if (aDefaultList.length > 0) {
					this._oContent.getModel().setProperty("/oTrData/oDefault", {
						id: aDefaultList[0].id,
						name: aDefaultList[0].name
					});
				} else {
					this._oContent.getModel().setProperty("/oTrData/oDefault", {
						id: "",
						name: ""
					});

				}
			}
		},

		//update default drop box state to editable or not
		_updateDefaultDropBoxState: function() {
			var aItems = this._oContent.getModel().getProperty("/oTrData/aDefaultList");
			if (aItems.length === 0) {
				this._oContent.getModel().setProperty("/oTrData/bDefaultEditable", false);
			} else {
				this._oContent.getModel().setProperty("/oTrData/bDefaultEditable", true);
			}
		},

		//update tristate checkbox state according to the user chose
		_registerChildren: function(oParent) {
			var aItems = this._oContent.getModel().getProperty("/oTrData/aLanguageList");

			var nSelectedChildren = 0;
			//get the selected children
			for (var i = 0; i < aItems.length; i++) {
				if (aItems[i].selected) {
					nSelectedChildren++;
				}
			}
			//set the state acourding to the selected children
			if (nSelectedChildren === 0) {
				oParent.toggle("Unchecked");
			} else if (nSelectedChildren === aItems.length) {
				oParent.toggle("Checked");
			} else {
				oParent.toggle("Mixed");
			}
		},

		// -Default dropbox handlers -----------------------------
		_onDefaultSelected: function(oEvent) {
			var selectedId = oEvent.oSource.getSelectedKey();
			var selectedName = oEvent.oSource.getValue();
			var oModel = this._oContent.getModel();
			var oDefault = {};
			if (selectedId) {
				oDefault.id = selectedId;
				oDefault.name = selectedName;
			} else {
				oDefault.id = "";
				oDefault.name = "";
			}
			oModel.setProperty("/oTrData/oDefault", oDefault);
		},

		//- Create UI---------------------------
		_createUI: function() {
			var that = this;
			
			//create Domain control and fill it with data
			this._oDomainDropdownBox = new sap.ui.commons.DropdownBox({
				width: "100%",
				accessibleRole: sap.ui.core.AccessibleRole.Combobox,
				change: [that._onDomainSelected, that],
				value: "{/oTrData/oDomain/name}",
				visible: "{/oTrData/bInternalProject}"

			});

			if (this._oTrData.oDomainsList) {
				this._addDomainsToDropdownBox(this._oTrData.oDomainsList);
			}

			//-Supported Languages table----------------------------------------------------
			// create supported languages table
			this._oLenguageTable = new sap.ui.table.Table({
				allowColumnReordering: false,
				width: "100%",
				selectionMode: sap.ui.table.SelectionMode.None
			});

			this._oLenguageTable.bindRows("/oTrData/aLanguageList");

			// create the TriStateCheckBox
			this._oSelelctAllCheckBox = new sap.ui.commons.TriStateCheckBox({
				selectionState: "{/oTrData/sTristateState}"
			});

			//register to change event
			this._oSelelctAllCheckBox.attachChange(that._onTristateClick, that);

			// add select column to table
			this._oLenguageTable.addColumn(new sap.ui.table.Column({
				label: this._oSelelctAllCheckBox,
				sortProperty: "languageName",
				sorted: true,
				template: new sap.ui.commons.CheckBox({
					change: [this._onCheckBoxClick, this]
				}).bindProperty("checked", "selected"),
				width: "60px",
				tooltip: "{i18n>tlt_selectAll}",
				hAlign: "Center"
			}));

			// add language column to table
			this._oLenguageTable.addColumn(new sap.ui.table.Column({
				label: new sap.ui.commons.Label({
					text: "{i18n>lbl_availableLanguages}"
					//design: "Bold"
				}),
				template: new sap.ui.commons.Label().bindProperty("text", "languageName"),
				width: "300px",
				sortProperty: "languageName",
				filterProperty: "languageName"
			}));

			//-Deafult Language dropdown box--------
			// create Default Language label
			var oDefaultLanguageLbl = new sap.ui.commons.Label({
				text: "{i18n>lbl_defaultLanguage}"
			});

			//create Default Language dropdown box
			this._oDropdownDefault = new sap.ui.commons.DropdownBox({
				value: "{/oTrData/oDefault/name}",
				editable: "{/oTrData/bDefaultEditable}",
				change: [this._onDefaultSelected, this],
				width: "100%"
			});

			var oItemTemplate1 = new sap.ui.core.ListItem();
			oItemTemplate1.bindProperty("text", "name");
			oItemTemplate1.bindProperty("key", "id");
			this._oDropdownDefault.bindItems("/oTrData/aDefaultList", oItemTemplate1);

			// -Simple Form-------------------------------------------------
			var oSimpleForm = new sap.ui.layout.form.SimpleForm("sf1", {
				layout: sap.ui.layout.form.SimpleFormLayout.ResponsiveGridLayout,
				emptySpanL: 4,
				emptySpanM: 2,
				emptySpanS: 1,
				columnsL: 1,
				labelSpanL: 2,
				labelSpanM: 3,
				maxContainerCols: 1,
				content: [
					//empty row
    				new sap.ui.commons.Label(),
    				new sap.ui.commons.TextView({
						text: "",
						visible: "{/oTrData/bInternalProject}"
					}),
    				//application domain
					new sap.ui.commons.Label({
						text: "{i18n>lbl_applicationDomain}"
					}),
					this._oDomainDropdownBox,

					//empty row
    				new sap.ui.commons.Label(),
    				new sap.ui.commons.TextView({
						text: ""
					}),
					//select languages
					new sap.ui.commons.Label({
						text: "{i18n>lbl_selectLanguages}",
						tooltip: "{i18n>tlt_selectLanguages}"
					}),
					this._oLenguageTable,
					//empty row
    				new sap.ui.commons.Label(),
    				new sap.ui.commons.TextView({
						text: ""
					}),
					//default language
					oDefaultLanguageLbl,
					this._oDropdownDefault
				]
			});

			// create JSON model
			var oModel = new sap.ui.model.json.JSONModel();

			// bind model
			oSimpleForm.setModel(oModel);

			this.context.i18n.applyTo(oSimpleForm);

			return oSimpleForm;

		}

	});
});