sap.ui.core.Control.extend("sap.watt.saptoolsets.fiori.editor.plugin.appdescriptoreditor.ui.ListBoxWithAddRemove", {
	metadata: {
		properties: {
			"dialogMetadata": {
				type: "object"
			},
			"width": {
				type: "sap.ui.core.CSSSize",
				defaultValue: "100%"
			},
			"height": {
				type: "sap.ui.core.CSSSize",
				defaultValue: "100%"
			},
			"selectedKey": "string",
			"dialogTitle": "string",
			"visibleListRows": {
				type: "string",
				defaultValue: "3"
			},
			"dialogComboBoxLabelText": "string"
		},

		aggregations: {
			"_lb": {
				type: "sap.ui.commons.ListBox",
				multiple: false,
				visibility: "hidden"
			},
			"_addButton": {
				type: "sap.ui.commons.Button",
				multiple: false,
				visibility: "hidden"
			},
			"_removeButton": {
				type: "sap.ui.commons.Button",
				multiple: false,
				visibility: "hidden",
				singularName: "item"

			},

			"items": {
				type: "sap.ui.core.Item",
				multiple: true,
				visibility: "public",
				bindable: "bindable"
			}
		},
		events: {
			"select": {},
			"entryChanged": {}
		}
	},

	_oPopUpDialogAddEntry: null,

	init: function() {
		this._ = require("sap/watt/lib/lodash/lodash"); //Already uploaded in the service

		var that = this;
		this._oList = new sap.ui.commons.ListBox({
			allowMultiSelect: false,
			visibleItems: 2,
			select: function(oEvent) {
				that.fireSelect(oEvent);
			},
			layoutData: {
				span: "L8 M6 S6"
			}
		}).addStyleClass("sapIDEListBox riverControlSmall");
		
		this.setAggregation("_lb", this._oList, true);

		this.setAggregation("_addButton", new sap.ui.commons.Button({
			icon: "sap-icon://add",
			press: function(oEvent) {
				that._pressAdd(oEvent);
			},
			layoutData: {
				span: "L2 M2 S2"
			}
		}).addStyleClass("sapIDEButtonAdd riverControlSmall"));

		this.setAggregation("_removeButton", new sap.ui.commons.Button({
			icon: "sap-icon://less",
			press: function(oEvent) {
				that._pressRemove(oEvent);
			},
			layoutData: {
				span: "L2 M2 S2"
			}
		}).addStyleClass("sapIDEButtonRemove riverControlSmall"));

	},
	
	setPreRemoveHandler: function(fnRemoveHandler, oContext) {
		this._oPreRemoveHandler = {
			handler: fnRemoveHandler,
			context: oContext
		};
	},

	_pressRemove: function() {
		var oModel = this.getModel();
		var oSelectedItem = this._oList.getSelectedItem();
		var that = this;
		if (oSelectedItem) {
			var deferred = Q.defer();
			var sItemPath = oSelectedItem.getBindingContext().getPath();
			var sAllItemsPath = sItemPath.substr(0, sItemPath.lastIndexOf("/"));
			var aItems = oModel.getProperty(sAllItemsPath);
			var oItem = oModel.getProperty(sItemPath);
			if (this._oPreRemoveHandler) {
				this._oPreRemoveHandler.handler.call(this._oPreRemoveHandler.context, Object.keys(oItem.item)[0]).then(function(bResult) {
					deferred.resolve(bResult);
				}).done();
			} else {
				deferred.resolve(true);
			}
			deferred.promise.then(function(bResult) {
				if (bResult) {
					aItems = aItems.filter(function(oElement) {
						return !that._.isEqual(oElement, oItem);
					});
					oModel.setProperty(sAllItemsPath, aItems);
					that.fireEntryChanged({
						item: oItem,
						action: "remove"
					});
					//remove the selection on the list
					that.setSelectedKey(undefined);
					that._oList.fireSelect({
						action: "remove"
					});
				}
			}).done();
		}
	},

	_pressAdd: function() {
		var oData = this.getDialogMetadata();
		var oModel;

		if (!this._oAddRemoveDefaultDialogFragment) {
			oModel = new sap.ui.model.json.JSONModel();
			oModel.setData({
				data: oData,
				bSingleValue: false,
				bOKEnabled: false,
				title: this.getDialogTitle()
			});
			this._oAddRemoveDefaultDialogFragment = sap.ui.xmlfragment(
				"sap.watt.saptoolsets.fiori.editor.plugin.appdescriptoreditor.ui.AddRemoveDefaultDialog", this);
			//need to find a way to save the reference so that destroy will not be needed
			//this.addDependent(this._oAddRemoveDefaultDialogFragment);
			if (oData.types.length === 1) {
				oModel.setProperty("/bSingleValue", true);
			} else {
				//Add Intial focus to the combobox
				this._oAddRemoveDefaultDialogFragment.setInitialFocus("appDescriptorListWithAddRemoveCombo");
			}
			this._oAddRemoveDefaultDialogFragment.setModel(oModel);
			this._oAddRemoveDefaultDialogFragment.bindElement("/data");
			this._oAddRemoveDefaultDialogFragment.addEventDelegate({
				onAfterRendering: function(oEvent) {
					var oComboBox;
					if (oModel.getProperty("/bSingleValue")) {
						oComboBox = sap.ui.getCore().byId("appDescriptorListWithAddRemoveCombo");
						oComboBox.fireChange({
							selectedItem: oComboBox.getItems()[0]
						});
						oComboBox.setSelectedKey(oComboBox.getItems()[0].getKey());
						//oComboBox
					}
				}
			});

			// set dialog i18n model
			this._oAddRemoveDefaultDialogFragment.setModel(this.getModel("i18n"), "i18n");
		}
		this._oAddRemoveDefaultDialogFragment.open();

	},

	_checkValidation: function(oElement) {
		if (oElement.pattern) {
			var regex = new RegExp(oElement.pattern);
			if (!regex.test(oElement.value)) {
				oElement.valueState = sap.ui.core.ValueState.Error;
				return true;
			} else {
				oElement.valueState = sap.ui.core.ValueState.None;
			}
		}
		return false;
	},

	formatAddRemoveCombo: function(bSingle) {
		return !bSingle;
	},

	onDefaultDialogCancel: function(oEvent) {
		//Clear all data inserted in the fields
		var sFieldsPath = sap.ui.getCore().byId("appDescriptorRowRepeater").getBindingContext().getPath();
		var oRowsData = oEvent.getSource().getModel().getProperty(sFieldsPath);
		var aFields = oRowsData.fields;
		for (var i=0; aFields && aFields.length && i<aFields.length; i++) {
			aFields[i].value = "";
			aFields[i].valueState = sap.ui.core.ValueState.None;
		}
		oEvent.getSource().getModel().setProperty(sFieldsPath, oRowsData );
		this._oAddRemoveDefaultDialogFragment.getModel().setProperty("/bOKEnabled", false);
		this._oAddRemoveDefaultDialogFragment.close();
		this._oAddRemoveDefaultDialogFragment.destroy();
		this._oAddRemoveDefaultDialogFragment = undefined;

	},
	
	onDialogTextFieldChange: function(oEvent) {
		var sRowPath = oEvent.getSource().getBindingContext().getPath();
		var oFieldRowData = oEvent.getSource().getModel().getProperty(sRowPath);
		var bError = oFieldRowData.required && oEvent.getSource().getValue === "" || this._checkValidation(oFieldRowData);
		oFieldRowData.valueState = bError ? sap.ui.core.ValueState.Error :sap.ui.core.ValueState.None;
		this._oAddRemoveDefaultDialogFragment.getModel().setProperty("/bOKEnabled", !bError);
		oEvent.getSource().getModel().setProperty(sRowPath, oFieldRowData);
	},

	onDefaultDialogClose: function() {
		//Init the dialog on close
		var oDialogComboBox = sap.ui.getCore().byId("appDescriptorListWithAddRemoveCombo");
		oDialogComboBox.setValue("");
		this._oAddRemoveDefaultDialogFragment.getModel().setProperty("/bOKEnabled", false);
	},

	onDefaultDialogOK: function(oEvent) {
		var bError = false;
		var oFields = sap.ui.getCore().byId("appDescriptorRowRepeater");
		var sRowsPath = oFields.getBindingContext().getPath();
		var aDialogData = oFields.getModel().getProperty(sRowsPath);
		var oListBoxWithAddRemoveModel = this.getModel();
		var oItem = {
			type: aDialogData.techType,
			item: {}
		};
		var that = this;
		//check if the new entry you want to insert already exists
		var aItems = oListBoxWithAddRemoveModel.getProperty(this.getBinding("items").getPath());
		aItems = this._.isArray(aItems) ? aItems : [];
		//If the entry in manifest is a not nested object --> an array
		if (!aDialogData.isHierarchy) {
			this._.forEach(aDialogData.fields, function(oElement, index) {
				bError = that._checkValidation(oElement);
				if (oElement.required && oElement.value === "") {
					bError = true;
					oElement.valueState = sap.ui.core.ValueState.Error;
				}
				if (bError) {
					return false;
				}
				if (oElement.tech !== "") {
					oItem.item[oElement.tech] = oElement.value;
				}
			});
			//If the entry in manifest is a  nested object --> not an array
		} else {
			var currNesting = oItem.item;
			//Handle patternProperty creation
			this._.forEach(aDialogData.fields, function(oElement, iKey) {
				if ((oElement.required && oElement.value === "")|| that._checkValidation(oElement)) {
					bError = true;
					oElement.valueState = sap.ui.core.ValueState.Error;
					return false;
				}
				if (oElement.tech === "") {
					if (!currNesting.hasOwnProperty(oElement.value)) {
						currNesting[oElement.value] = {};
					}
					currNesting = currNesting[oElement.value];
				} else {
					if (oElement.parentTech && oElement.parentTech !== "") {
						currNesting[oElement.parentTech][oElement.tech] = oElement.value;
					} else {
						currNesting[oElement.tech] = oElement.value;
					}
				}
			});
		}
		
		//update the model with the new values of valueState
		if (bError) {
			oFields.getModel().setProperty(sRowsPath, aDialogData);
			return;
		}

		if (!this._.includes(aItems, oItem)) {
			if (aDialogData.overwrite) { //overrite existing entry
				this._.remove(aItems, function(oElement) {
					return oItem.type === oElement.type;
				});
			}
			aItems.unshift(oItem);

			//Add item to array and update the model
			oListBoxWithAddRemoveModel.setProperty(this.getBinding("items").getPath(), aItems);
			//Fire the change event to the controller callback
			this.fireEntryChanged({
				item: oItem,
				action: "add"
			});
			this.getAggregation("_lb").setSelectedKeys(Object.keys(oItem.item));
			this._oList.fireSelect({
				selectedItem: this.getAggregation("_lb").getSelectedItem()
			});
		}

		//Clean the fields on the Dialog metadata 
		var oRows = oFields.getRows();
		var oRowData;
		this._.forEach(oRows, function(oElement, sKey) {
			oRowData = oFields.getModel().getProperty(oElement.getBindingContext().getPath());
			oRowData.value = oRowData.defaultValue ? oRowData.defaultValue : "";
			oRowData.valueState = sap.ui.core.ValueState.None;
			oFields.getModel().setProperty(oElement.getBindingContext().getPath(), oRowData);
		});
		//Destroy the dialog and the referance to it so we do not get duplicate id's
		this._oAddRemoveDefaultDialogFragment.close();
		this._oAddRemoveDefaultDialogFragment.destroy();
		this._oAddRemoveDefaultDialogFragment = undefined;
	},

	onComboTypeChange: function(oEvent) {
		var oItem = oEvent.getParameter("selectedItem");
		var oRepeater = sap.ui.getCore().byId("appDescriptorRowRepeater");
		if (oItem) {
			oRepeater.setBindingContext(oItem.getBindingContext());
		}
		//set the dialog ok button according to existance of item if only one item in the combo box the ok will be open
		this._oAddRemoveDefaultDialogFragment.getModel().setProperty("/bOKEnabled", !!oItem );
	},

	renderer: function(oRm, oControl) {
		oRm.write("<div class='sapIDEListBoxGrid'");
		oRm.writeControlData(oControl);

		oRm.addStyle("width", oControl.getWidth());
		oRm.addStyle("height", oControl.getHeight());
		oRm.writeStyles();
		oRm.write(">");

		var oListBox = oControl.getAggregation("_lb");
		oListBox.setVisibleItems(parseInt(oControl.getVisibleListRows()));
		oListBox.setSelectedKeys([oControl.getSelectedKey()]);
		oListBox.fireSelect({selectedItem: oListBox.getSelectedItem()});
		oRm.renderControl(oListBox);
		var oAddButton = oControl.getAggregation("_addButton");
		oRm.renderControl(oAddButton);
		var oRemoveButton = oControl.getAggregation("_removeButton");
		oRm.renderControl(oRemoveButton);

		oRm.write("</div>");
	}

});

/////// Copied from ui5 source https://github.com/SAP/openui5/blob/master/src/sap.m/src/sap/m/SelectDialog.js
/*
 * Set the model for the internal list AND the current control so that
 * both controls can be used with data binding
 * @override
 * @public
 * @param {sap.ui.Model} oModel the model that holds the data for the list
 * @param {string} sModelName the optional model name
 * @returns {sap.m.SelectDialog} this pointer for chaining
 */
sap.watt.saptoolsets.fiori.editor.plugin.appdescriptoreditor.ui.ListBoxWithAddRemove.prototype._setModel = sap.watt.saptoolsets.fiori.editor
	.plugin.appdescriptoreditor.ui.ListBoxWithAddRemove.prototype.setModel;
sap.watt.saptoolsets.fiori.editor.plugin.appdescriptoreditor.ui.ListBoxWithAddRemove
	.prototype.setModel = function(oModel, sModelName) {
		var aArgs = Array.prototype.slice.call(arguments);

		// reset busy mode if model was changed
		this._setBusy(false);
		this._bInitBusy = false;

		// we made a request in this control, so we update the counter
		this._iListUpdateRequested += 1;

		// pass the model to the list and also to the local control to allow binding of own properties
		this._oList.setModel(oModel, sModelName);
		sap.watt.saptoolsets.fiori.editor.plugin.appdescriptoreditor.ui.ListBoxWithAddRemove.prototype._setModel.apply(this, aArgs);

		// reset the selection label when setting the model
		this._updateSelectionIndicator();

		return this;
};

/*
 * Forwards a function call to a managed object based on the aggregation name.
 * If the name is items, it will be forwarded to the list, otherwise called locally
 * @private
 * @param {string} sFunctionName The name of the function to be called
 * @param {string} sAggregationName The name of the aggregation asociated
 * @returns {mixed} The return type of the called function
 */
sap.watt.saptoolsets.fiori.editor.plugin.appdescriptoreditor.ui.ListBoxWithAddRemove.prototype._callMethodInManagedObject = function(
	sFunctionName, sAggregationName) {
	var aArgs = Array.prototype.slice.call(arguments);

	if (sAggregationName === "items") {
		// apply to the internal list
		return this._oList[sFunctionName].apply(this._oList, aArgs.slice(1));
	} else {
		// apply to this control
		return sap.ui.base.ManagedObject.prototype[sFunctionName].apply(this, aArgs.slice(1));
	}
};

/**
 * Forwards aggregations with the name of items to the internal list.
 * @override
 * @protected
 * @param {string} sAggregationName The name for the binding
 * @param {object} oBindingInfo The configuration parameters for the binding
 * @returns {sap.m.SelectDialog} this pointer for chaining
 */
sap.watt.saptoolsets.fiori.editor.plugin.appdescriptoreditor.ui.ListBoxWithAddRemove.prototype.bindAggregation = function() {
	var args = Array.prototype.slice.call(arguments);

	// propagate the bind aggregation function to list
	this._callMethodInManagedObject.apply(this, ["bindAggregation"].concat(args));
	return this;
};

sap.watt.saptoolsets.fiori.editor.plugin.appdescriptoreditor.ui.ListBoxWithAddRemove.prototype.validateAggregation = function(
	sAggregationName, oObject, bMultiple) {
	return this._callMethodInManagedObject("validateAggregation", sAggregationName, oObject, bMultiple);
};

sap.watt.saptoolsets.fiori.editor.plugin.appdescriptoreditor.ui.ListBoxWithAddRemove.prototype.setAggregation = function(sAggregationName,
	oObject, bSuppressInvalidate) {
	this._callMethodInManagedObject("setAggregation", sAggregationName, oObject, bSuppressInvalidate);
	return this;
};

sap.watt.saptoolsets.fiori.editor.plugin.appdescriptoreditor.ui.ListBoxWithAddRemove.prototype.getAggregation = function(sAggregationName,
	oDefaultForCreation) {
	return this._callMethodInManagedObject("getAggregation", sAggregationName, oDefaultForCreation);
};

sap.watt.saptoolsets.fiori.editor.plugin.appdescriptoreditor.ui.ListBoxWithAddRemove.prototype.indexOfAggregation = function(
	sAggregationName, oObject) {
	return this._callMethodInManagedObject("indexOfAggregation", sAggregationName, oObject);
};

sap.watt.saptoolsets.fiori.editor.plugin.appdescriptoreditor.ui.ListBoxWithAddRemove.prototype.insertAggregation = function(
	sAggregationName, oObject, iIndex, bSuppressInvalidate) {
	this._callMethodInManagedObject("insertAggregation", sAggregationName, oObject, iIndex, bSuppressInvalidate);
	return this;
};

sap.watt.saptoolsets.fiori.editor.plugin.appdescriptoreditor.ui.ListBoxWithAddRemove.prototype.addAggregation = function(sAggregationName,
	oObject, bSuppressInvalidate) {
	this._callMethodInManagedObject("addAggregation", sAggregationName, oObject, bSuppressInvalidate);
	return this;
};

sap.watt.saptoolsets.fiori.editor.plugin.appdescriptoreditor.ui.ListBoxWithAddRemove.prototype.removeAggregation = function(
	sAggregationName, oObject, bSuppressInvalidate) {
	return this._callMethodInManagedObject("removeAggregation", sAggregationName, oObject, bSuppressInvalidate);
};

sap.watt.saptoolsets.fiori.editor.plugin.appdescriptoreditor.ui.ListBoxWithAddRemove.prototype.removeAllAggregation = function(
	sAggregationName, bSuppressInvalidate) {
	return this._callMethodInManagedObject("removeAllAggregation", sAggregationName, bSuppressInvalidate);
};

sap.watt.saptoolsets.fiori.editor.plugin.appdescriptoreditor.ui.ListBoxWithAddRemove.prototype.destroyAggregation = function(
	sAggregationName, bSuppressInvalidate) {
	this._callMethodInManagedObject("destroyAggregation", sAggregationName, bSuppressInvalidate);
	return this;
};

sap.watt.saptoolsets.fiori.editor.plugin.appdescriptoreditor.ui.ListBoxWithAddRemove.prototype.getBinding = function(sAggregationName) {
	return this._callMethodInManagedObject("getBinding", sAggregationName);
};

sap.watt.saptoolsets.fiori.editor.plugin.appdescriptoreditor.ui.ListBoxWithAddRemove.prototype.getBindingInfo = function(sAggregationName) {
	return this._callMethodInManagedObject("getBindingInfo", sAggregationName);
};

sap.watt.saptoolsets.fiori.editor.plugin.appdescriptoreditor.ui.ListBoxWithAddRemove.prototype.getBindingPath = function(sAggregationName) {
	return this._callMethodInManagedObject("getBindingPath", sAggregationName);
};

sap.watt.saptoolsets.fiori.editor.plugin.appdescriptoreditor.ui.ListBoxWithAddRemove.prototype.getBindingContext = function(sModelName) {
	return this._oList.getBindingContext(sModelName);
};

/*
 * Set the binding context for the internal list AND the current control so that
 * both controls can be used with the context
 * @override
 * @public
 * @param {sap.ui.model.Context} oContext The new context
 * @param {string} sModelName The optional model name
 * @returns {sap.m.SelectDialog} this pointer for chaining
 */
sap.watt.saptoolsets.fiori.editor.plugin.appdescriptoreditor.ui.ListBoxWithAddRemove.prototype._setBindingContext = sap.watt.saptoolsets.fiori
	.editor.plugin.appdescriptoreditor.ui.ListBoxWithAddRemove.prototype.setBindingContext;
sap.watt.saptoolsets.fiori.editor.plugin.appdescriptoreditor
	.ui.ListBoxWithAddRemove.prototype.setBindingContext = function(oContext,
		sModelName) {
		var args = Array.prototype.slice.call(arguments);

		// pass the model to the list and also to the local control to allow binding of own properties
		this._oList.setBindingContext(oContext, sModelName);
		sap.watt.saptoolsets.fiori.editor.plugin.appdescriptoreditor.ui.ListBoxWithAddRemove.prototype._setBindingContext.apply(this, args);

		return this;
};

sap.watt.saptoolsets.fiori.editor.plugin.appdescriptoreditor.ui.ListBoxWithAddRemove.prototype.setSelectedKey = function(sKey) {
	var oListBox = this.getAggregation("_lb");
	if (sKey) {
		oListBox.setSelectedKeys([sKey]);
	} else {
		oListBox.clearSelection();
	}
};

sap.watt.saptoolsets.fiori.editor.plugin.appdescriptoreditor.ui.ListBoxWithAddRemove.prototype.getSelectedKey = function() {
	var oListBox = this.getAggregation("_lb");
	return oListBox.getSelectedKeys()[0];
};