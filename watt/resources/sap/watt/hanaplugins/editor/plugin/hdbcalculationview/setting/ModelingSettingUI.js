/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define(["../util/ResourceLoader", "./PerformanceAnalysisSetting"],
	function(ResourceLoader, PerformanceAnalysisSetting) {
		var resourceLoader = new ResourceLoader("/watt/resources/sap/watt/hanaplugins/editor/plugin/hdbcalculationview");
		var subSettings = [];
		return {
			_goSelectedOption: subSettings[0],
			_getRegisteredSubsettings: function() {
				return [{
					id: "performanceAnalysis",
					service: new PerformanceAnalysisSetting(),
					values: [],
					jsonModel: {}
				}];
			},
			_initialiseOptions: function(context, setting) {
				subSettings = [];
				subSettings = subSettings.concat(this._getRegisteredSubsettings());
				subSettings.forEach(function(opt) {
					var data = {};
					opt.values = opt.service.getValues(setting);
					opt.values.forEach(function(val) {
						data[val.key] = val.value;
					});
					opt.jsonModel = new sap.ui.model.json.JSONModel(data);
				});
				this._goSelectedOption = subSettings[0];
			},

			getContent: function(context, setting, width) {
				var that = this;
				that._initialiseOptions(context, setting);
				var oGridForm = new sap.ui.layout.Grid({
					hSpacing: 1,
					vSpacing: 1,
					content: that._addContent(),
					width: "100%"
				});
				return oGridForm;
			},

			_addContent: function() {
				var that = this;

				var optionsLbl = new sap.ui.commons.Label({
					text: resourceLoader.getText('txt_select_setting'),
					layoutData: new sap.ui.layout.GridData({
						span: "L12 M12 S12"
					})
				});

				var itemsList = [];
				subSettings.forEach(function(opt) {
					itemsList.push(new sap.ui.core.ListItem({
						text: opt.service.getName(),
						key: opt.id
					}));
				});

				var selectedOptionLbl = new sap.ui.commons.FormattedTextView({
					layoutData: new sap.ui.layout.GridData({
						span: "L12 M12 S12"
					}),
					htmlText: '<strong>' + that._goSelectedOption.service.getName() + '</strong>'
				});

				var vLayout = new sap.ui.layout.VerticalLayout({
					content: [that._goSelectedOption.service.getContent(that._goSelectedOption.values, that._goSelectedOption.jsonModel)],
					layoutData: new sap.ui.layout.GridData({
						span: "L12 M12 S12"
					})
				});

				var optionsDropdown = new sap.ui.commons.DropdownBox({
					width: "100%",
					tooltip: resourceLoader.getText('txt_select_setting'),
					items: itemsList,
					layoutData: new sap.ui.layout.GridData({
						span: "L12 M12 S12"
					}),
					change: function(oEvent) {
						for (var i = 0; i < subSettings.length; i++) {
							var opt = subSettings[i];
							if (oEvent.oSource.getSelectedKey() === opt.key) {
								that._goSelectedOption = opt;
								break;
							}
						}
						selectedOptionLbl.setHtmlText('<strong>' + oEvent.oSource.getValue() + '</strong>');
						vLayout.destroyContent();
						var content = that._goSelectedOption.service.getContent(that._goSelectedOption.values, that._goSelectedOption.jsonModel);
						if (content) {
							vLayout.addContent(content);
						}
					}
				});
				optionsDropdown.setSelectedKey(that._goSelectedOption.key);

				return [optionsLbl, optionsDropdown, selectedOptionLbl, vLayout];
			},

			getModifiedSettings: function() {
				var cache = [];
				for (var i = 0; i < subSettings.length; i++) {
					var setting = subSettings[i];
					cache = cache.concat(setting.service.getCache());
				}

				return cache;
			}
		};
	});
