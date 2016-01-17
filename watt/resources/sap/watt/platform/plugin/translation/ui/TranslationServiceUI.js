define({

	/**
	 * Get the language the properties file is to translated to.
	 * <p>
	 * @param sFilename {string} the properties filename
	 * @param aLocales {array} the supported languages
	 * @returns promise
	 */
	getTranslationLanguageUI : function(sFilename, aLocales) {
		var oDialog, oModel, oModelData;

		if ("undefined" === typeof this._oTLDialog) {
			oModel = new sap.ui.model.json.JSONModel();
			oModelData = {
				filename : sFilename,
				locale : {
					id : "en",
					name : "English"
				},
				locales : aLocales,
				deferred : Q.defer()
			};
			oModel.setData(oModelData);

			oDialog = new sap.ui.commons.Dialog({
				title : "Choose Translation Language",
				showCloseButton : true,
				modal : true
			});

			oDialog.setModel(oModel);
			this._oTLDialog = oDialog;

			this._addCell = function(oRow, aContent) {
				var oCell = new sap.ui.commons.layout.MatrixLayoutCell();
				oCell.addContent(aContent);
				oRow.addCell(oCell);
			};

			var layout = new sap.ui.commons.layout.MatrixLayout();
			var row = new sap.ui.commons.layout.MatrixLayoutRow();
			var label = new sap.ui.commons.Label({
				text : "Filename:"
			});
			this._addCell(row, label);
			var textView = new sap.ui.commons.TextView({
				text : "{/filename}"
			});
			this._addCell(row, textView);
			layout.addRow(row);

			row = new sap.ui.commons.layout.MatrixLayoutRow();
			label = new sap.ui.commons.Label({
				text : "Language:"
			});
			this._addCell(row, label);
			textView = new sap.ui.commons.TextView({
				text : "{/locale/name}"
			});
			this._addCell(row, textView);
			layout.addRow(row);

			row = new sap.ui.commons.layout.MatrixLayoutRow();
			label = new sap.ui.commons.Label({
				text : "Translate to:"
			});
			this._addCell(row, label);
			var itemTemplate = new sap.ui.core.ListItem({
				key : "{id}",
				text : "{name}"
			});
			var oSorter = new sap.ui.model.Sorter("name");
			var comboBox = new sap.ui.commons.ComboBox({
				items : {
					path : "/locales",
					template : itemTemplate,
					sorter : oSorter
				}
			});
			comboBox.attachChange(comboBox, function(event, comboBox) {
				oModelData.targetLocale = comboBox.getSelectedKey();
				var hasError = "" === oModelData.targetLocale;
				var valueState = hasError ? sap.ui.core.ValueState.Error : sap.ui.core.ValueState.None;
				oAcceptBtn.setEnabled(!hasError);
				comboBox.setValueState(valueState);
			});
			this._addCell(row, comboBox);
			layout.addRow(row);

			row = new sap.ui.commons.layout.MatrixLayoutRow();
			layout.addRow(row);

			oDialog.addContent(layout);

			var oAcceptBtn = new sap.ui.commons.Button({
				text : "Accept"
			}).attachPress(comboBox, function(event, comboBox) {
				oModelData.targetLocale = comboBox.getSelectedKey();
				oDialog.close();
			}).setEnabled(false);
			oDialog.addButton(oAcceptBtn);

			oDialog.addButton(new sap.ui.commons.Button({
				text : "Cancel"
			}).attachPress(function() {
				oModelData.targetLocale = "";
				oDialog.close();
			}));

			oDialog.attachClosed(function() {
				if ("" !== oModelData.targetLocale) {
					oModelData.deferred.resolve(oModelData.targetLocale);
				} else {
					oModelData.deferred.reject();
				}
			}, this);
		} else {
			oDialog = this._oTLDialog;
			oModel = oDialog.getModel();
			oModelData = oModel.getData();
			oModelData.filename = sFilename;
			oModelData.targetLocale = "";
			oModelData.deferred = Q.defer();
			oModel.refresh();
		}

		oDialog.open();

		return oModelData.deferred.promise;
	},

	/**
	 * Display all translated properties and allow user to choose which to be written to properties file.
	 * <p>
	 * @param oLocale {object} the target language value and display text
	 * @param aProperties {array} the list of both original and translated properties
	 * @returns promise
	 */
	confirmTranslationUI : function(oLocale, aProperties) {
		var oDialog, oModel, oModelData;
		var oPropertyList;

		if ("undefined" === typeof this._oConfirmDialog) {
			oModel = new sap.ui.model.json.JSONModel();
			oModelData = {
				rows : aProperties,
				locale : oLocale,
				targets : [],
				deferred : Q.defer()
			};
			oModel.setData(oModelData);

			oDialog = new sap.ui.commons.Dialog({
				title : "Confirm Translation",
				showCloseButton : true,
				modal : true
			});

			oDialog.setModel(oModel);
			oDialog.addStyleClass("wattTranslationConfirm");
			this._oConfirmDialog = oDialog;

			oPropertyList = sap.ui.xmlfragment("sap.watt.platform.plugin.translation.ui.propertyList", this);
			oPropertyList.bindRows("/rows");
			oDialog.addContent(oPropertyList);
			oPropertyList.onBeforeRendering = (function() {
				oPropertyList.selectAll();
			});

			oDialog.addButton(new sap.ui.commons.Button({
				text : "Accept"
			}).attachPress(function() {
				oModelData.targets = oPropertyList.getSelectedIndices();
				oDialog.close();
			}, this));
			oDialog.addButton(new sap.ui.commons.Button({
				text : "Cancel"
			}).attachPress(function() {
				oDialog.close();
			}));

			oDialog.attachClosed(function() {
				if (0 < oModelData.targets.length) {
					oModelData.deferred.resolve(oModelData.targets);
				} else {
					oModelData.deferred.reject();
				}
			});
		} else {
			oDialog = this._oConfirmDialog;
			oModel = oDialog.getModel();
			oModelData = oModel.getData();
			oModelData.rows = aProperties;
			oModelData.locale = oLocale;
			oModelData.targets = [];
			oModelData.deferred = Q.defer();
			oModel.refresh();
		}

		oDialog.open();

		return oModelData.deferred.promise;
	}

});
