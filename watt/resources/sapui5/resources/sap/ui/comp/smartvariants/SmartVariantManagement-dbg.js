/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2015 SAP SE. All rights reserved
 */

// Provides control sap.ui.comp.smartvariants.SmartVariantManagement.
sap.ui.define([
	'jquery.sap.global', 'sap/ui/comp/library', './PersonalizableInfo', 'sap/ui/comp/variants/VariantItem', 'sap/ui/comp/variants/VariantManagement', 'sap/ui/core/ValueState', 'sap/ui/fl/Change', 'sap/ui/fl/Persistence', 'sap/ui/fl/registry/Settings', 'sap/ui/fl/Utils'
], function(jQuery, library, PersonalizableInfo, VariantItem, VariantManagement, ValueState, Change, Persistence, Settings, FlexUtils) {
	"use strict";

	/**
	 * Constructor for a new SmartVariantManagement.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given 
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * The SmartVariantManagement control is a specialization of the {@link sap.ui.comp.variants.VariantManagement VariantManagement} control and communicates with the layer that offers SAPUI5 flexibility services to manage the variants.<br>
         * For more information about SAPUI5 flexibility, refer to the Developer Guide.
	 * @extends sap.ui.comp.variants.VariantManagement
	 * 
	 * @constructor
	 * @public
	 * @alias sap.ui.comp.smartvariants.SmartVariantManagement
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var SmartVariantManagement = VariantManagement.extend("sap.ui.comp.smartvariants.SmartVariantManagement", /** @lends sap.ui.comp.smartvariants.SmartVariantManagement.prototype */
	{
		metadata: {

			library: "sap.ui.comp",
			aggregations: {

				/**
				 * All controls that rely on variant handling have to be added to this aggregation.
				 */
				personalizableControls: {
					type: "sap.ui.comp.smartvariants.PersonalizableInfo",
					multiple: true,
					singularName: "personalizableControl"
				}
			},
			events: {

				/**
				 * This event is fired when the SmartVariantManagement control is initialized.
				 */
				initialise: {},

				/**
				 * This event is fired after a variant has been saved. This event can be used to retrieve the ID of the saved variant.
				 */
				afterSave: {}
			}
		}
	});

	/**
	 * Sets the current variant ID.
	 *
	 * @name sap.ui.comp.smartvariants.SmartVariantManagement#setCurrentVariantId
	 * @function
	 * @param {string} sVariantKey The variant key
	 * @param {boolean} bDoNotApplyVariant If set to <code>true</code>, the <code>applyVariant</code> method is not executed yet. Relevant during navigation, when called before the initialise event has been executed.
	 * @type void
	 * @public
	 * @since 1.28.1
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */

	/**
	 * Retrieves the current variant ID. If a standard variant is currently set, an empty string is returned.
	 *
	 * @name sap.ui.comp.smartvariants.SmartVariantManagement#getCurrentVariantId
	 * @function
	 * @type string
	 * @public
	 * @since 1.28.1
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */

	SmartVariantManagement._mComponentReadError = {};

	/**
	 * control initialization
	 * 
	 * @public
	 * @since 1.26.1
	 */
	SmartVariantManagement.prototype.init = function() {
		VariantManagement.prototype.init.apply(this); // Call base class

		this._mStandardVariants = {};
		this._mControlPersistence = {};
		this._mControlComponent = {};
		this._mControlPromise = {};
		this._mCurrentVariantId = {};		

		this._aPersonalizableControls = null;

		this._bIsInitialized = false;

		if (this.setLifecycleSupport) {
			this.setLifecycleSupport(true);
		}
		this._setBackwardCompatibility(false);
	};

	/**
	 * Registers all controls interested and relying on variant handling.
	 * 
	 * @public
	 * @param {sap.ui.comp.smartvariants.PersonalizableInfo} oCurrentControlInfo Provides information about the personalizable control.
	 */
	SmartVariantManagement.prototype.addPersonalizableControl = function(oCurrentControlInfo) {
		var oControl = null;
		var sControlId = oCurrentControlInfo.getControl();

		this.addAggregation("personalizableControls", oCurrentControlInfo, true);
		
		if (sControlId) {
			oControl = sap.ui.getCore().byId(sControlId);
			this._mControlPersistence[oControl] = new Persistence(oControl, oCurrentControlInfo.getKeyName());

			this._mControlComponent[oControl] = sap.ui.fl.Utils.getComponentClassName(oControl);
		}

		
		this._handleGetChanges(oControl);
	};

	SmartVariantManagement.prototype._handleGetChanges = function(oControl) {
		var that = this;
		
		if (oControl && this._mControlPersistence && this._mControlPersistence[oControl]) {

			this._mControlPromise[oControl] = {};
			this._mControlPromise[oControl].promise = new Promise(function(resolve, reject) {
				that._mControlPersistence[oControl].getChanges().then(function(mVariants) {

					var sComponentName = that._mControlPersistence[oControl].getComponentName();
					var mPropertyBag = {
					                    appDescriptor: FlexUtils.getAppDescriptor(oControl),
					                    siteId: FlexUtils.getSiteId(oControl)
					};
					sap.ui.fl.registry.Settings.getInstance(sComponentName, mPropertyBag).then(function(oSettings) {

						var oResolvedObj = {variants: mVariants, settings: oSettings};
						resolve(oResolvedObj);
					});
				},
				function(args) {
					reject(args);
				});								
				
			});
		}
	};
	

	SmartVariantManagement.prototype._createControlWrapper = function(oCurrentControlInfo) {
		var oControlInfo = null;
		var oControl = sap.ui.getCore().byId(oCurrentControlInfo.getControl());
		if (oControl) {
			oControlInfo = {
				control: oControl,
				type: oCurrentControlInfo.getType(),
				dataSource: oCurrentControlInfo.getDataSource(),
				persistence: this._mControlPersistence[oControl],
				keyName: oCurrentControlInfo.getKeyName()
			};

			if (this._mControlPromise[oControl] && this._mControlPromise[oControl].promise) {
				oControlInfo.promise = this._mControlPromise[oControl].promise;
			}
		}

		return oControlInfo;
	};

	/**
	 * Retrieves the variant content.
	 * 
	 * @public
	 * @param {sap.ui.core.Control} oControl Current personalizable control
	 * @param {string} sKey The variant key
	 * @returns {object} JSON Representing the content of the variant
	 */
	SmartVariantManagement.prototype.getVariantContent = function(oControl, sKey) {
		var oContent = null;

		if (sKey === this.STANDARDVARIANTKEY) {
			oContent = this._getStandardVariant(oControl);
		} else {
			oContent = this._getVariantContent(oControl, sKey);
		}

		return oContent;
	};

	/**
	 * Retrieves the variant with the requested ID.
	 * 
	 * @private
	 * @param {sap.ui.core.Control} oCurrentControl current control
	 * @param {string} id the variant key
	 * @returns {sap.ui.fl.Change} object representing the variant
	 */
	SmartVariantManagement.prototype._getVariant = function(oCurrentControl, id) {

		var oChange = null;

		if (oCurrentControl) {

			var oPersistence = this._mControlPersistence[oCurrentControl];
			if (oPersistence) {
				oChange = oPersistence.getChange(id);
			}
		}

		return oChange;
	};

	SmartVariantManagement.prototype._getVariantContent = function(oCurrentControl, sKey) {

		var oContent = null;

		var oVariant = this._getVariant(oCurrentControl, sKey);
		if (oVariant) {
			oContent = oVariant.getContent();
		}

		return oContent;
	};

	/**
	 * Returns all registered providers.
	 * 
	 * @private
	 * @returns {array} a list of all registered controls
	 */
	SmartVariantManagement.prototype._getAllPersonalizableControls = function() {
		var i;
		var oControlWrapper = null;

		if (!this._aPersonalizableControls) {

			this._aPersonalizableControls = [];

			var aPersInfos = this.getPersonalizableControls();
			if (aPersInfos) {
				for (i = 0; i < aPersInfos.length; i++) {

					oControlWrapper = this._createControlWrapper(aPersInfos[i]);
					if (oControlWrapper) {
						this._aPersonalizableControls.push(oControlWrapper);
					}
				}
			}
		}

		return this._aPersonalizableControls;
	};

	/**
	 * Creates entries into the variant management control, based on the list of variants.
	 * 
	 * @private
	 * @param {map} mVariants list of variants, as determined by the flex layer
	 * @param {object} oCurrentControlInfo describes the personalizable control
	 * @returns {array} containing all variant keys
	 */
	SmartVariantManagement.prototype._createVariantEntries = function(mVariants, oCurrentControlInfo) {

		var n = null;
		var sVariantKey, sStandardVariantKey = null;
		var oVariant, oVariantItem;
		var aVariantKeys = [];

		this.removeAllItems();

		if (mVariants) {
			for (n in mVariants) {
				if (n) {
					oVariant = mVariants[n];
					if (oVariant.isVariant()) {
						oVariantItem = new VariantItem({
							key: oVariant.getId(),
							text: oVariant.getText("variantName"),
							global: !oVariant.isUserDependent(),
							executeOnSelection: this._getExecuteOnSelection(oVariant),
							lifecycleTransportId: oVariant.getRequest(),
							lifecyclePackage: oVariant.getPackage(),
							namespace: oVariant.getNamespace(),
							readOnly: oVariant.isReadOnly(),
							labelReadOnly: oVariant.isLabelReadOnly()
						});

						if (this._isIndustrySolutionStandardVariant(oVariant)) {
							sStandardVariantKey = oVariant.getId();
						}

						this.addVariantItem(oVariantItem);

						aVariantKeys.push(oVariant.getId());
					}
				}
			}
		}

		if (oCurrentControlInfo) {
			sVariantKey = this._getDefaultVariantKey(oCurrentControlInfo);
			if (sVariantKey) {
				this.setInitialSelectionKey(sVariantKey); // set the current selected variant
			}

			var bFlag = sap.ui.fl.Utils.isApplicationVariant(oCurrentControlInfo.control);
			if (bFlag) {
				this.setIndustrySolutionMode(bFlag);

				bFlag = sap.ui.fl.Utils.isVendorLayer();
				this._setVendorLayer(bFlag);
			}

			if (this.getIndustrySolutionMode()) {
				if (oCurrentControlInfo.standardvariantkey !== undefined) {
					delete oCurrentControlInfo.standardvariantkey;
				}

				if (sStandardVariantKey) {
					oCurrentControlInfo.standardvariantkey = sStandardVariantKey;
					this.setStandardVariantKey(sStandardVariantKey);
				}
			}
		}

		if (this._isVariantDownport(oCurrentControlInfo)) {
			this._enableManualVariantKey(true);
		}

		return aVariantKeys;
	};

	/**
	 * Retrieves the list of known variants via access to 
	 * 
	 * @private
	 * @param {Function} fCallBack will be called once the promise is full filled
	 */
	SmartVariantManagement.prototype.getVariantsInfo = function(fCallBack) {

		if (!fCallBack) {
			jQuery.sap.log.error("'getVariantsInfo' failed . Expecting callBack not passed.");
			return;
		}

		var n = null;
		var oVariant;
		var aVariants = [];
		var aCurrentControls;
		var that = this;

		try {

			aCurrentControls = this._getAllPersonalizableControls();
			if (aCurrentControls && (aCurrentControls.length === 1) && aCurrentControls[0].persistence && aCurrentControls[0].control) {

				aCurrentControls[0].persistence.getChanges().then(function(mVariants) {
					if (mVariants) {
						for (n in mVariants) {
							if (n) {
								oVariant = mVariants[n];
								if (oVariant.isVariant()) {
									aVariants.push({
										key: oVariant.getId(),
										text: oVariant.getText("variantName")
									});
								}
							}
						}
					}

					fCallBack(aVariants);
				}, function(args) {
					var sError = "'getChanges' failed:";
					if (args && args[0] && args[0].messages && args[0].messages[0]) {
						sError += (' ' + args[0].messages[0]);
					}
					that._setErrorValueState(that.oResourceBundle.getText("VARIANT_MANAGEMENT_READ_FAILED"), sError, aCurrentControls[0].control);

					fCallBack(aVariants);
				});
			}

		} catch (ex) {
			this._setErrorValueState(this.oResourceBundle.getText("VARIANT_MANAGEMENT_READ_FAILED"), "'getChanges' throws an exception", null);
		}
	};

	/**
	 * Retrieves the current variant ID. For a standard variant, an empty string is returned.
	 * 
	 * @public
	 * @since 1.28.1
	 * @returns {string} Current variant ID
	 */
	SmartVariantManagement.prototype.getCurrentVariantId = function() {
		var sKey = "";
		var oItem = this._getSelectedItem();
		if (oItem) {
			sKey = oItem.getKey();
			if (sKey === this.STANDARDVARIANTKEY) {
				sKey = "";
			}
		}

		return sKey;
	};

	/**
	 * Sets the current variant ID.
	 * 
	 * @public
	 * @since 1.28.1
	 * @param {string} sVariantId ID of the variant
	 * @param {boolean} bDoNotApplyVariant If set to <code>true</code>, the <code>applyVariant</code> method is not executed yet. Relevant during navigation, when called before the initialise event has been executed	
	 */
	VariantManagement.prototype.setCurrentVariantId = function(sVariantId, bDoNotApplyVariant) {
		var oContent;

		var sId = this._determineVariantId(sVariantId);

		var aCurrentControls = this._getAllPersonalizableControls();
		if (aCurrentControls && (aCurrentControls.length === 1) && aCurrentControls[0].persistence && aCurrentControls[0].control) {

			if (!this._bIsInitialized) {
				
				this._mCurrentVariantId[aCurrentControls[0].control] = sVariantId;				
				
			} else {
				oContent = this.getVariantContent(aCurrentControls[0].control, sId);
				if (oContent) {
					this._setSelectionByKey(sId); // set the current selected variant
					if (bDoNotApplyVariant !== true) {
						this._applyVariant(aCurrentControls[0].control, oContent);
					}
				}
			}
		}

	};

	SmartVariantManagement.prototype._determineVariantId = function(sVariantId) { 
		var sId = sVariantId;
		if (!sId) {
			sId = this.getStandardVariantKey();
		} else {

			/* eslint-disable no-lonely-if */
			if (!this.getItemByKey(sId)) {
				sId = this.getStandardVariantKey();
			}
			/* eslint-enable no-lonely-if */
		}

		return sId;
	};

	/**
	 * Initializes the SAPUI5 layer with the flexibility services by retrieving the list of variants. Once the initialization has been completed, the control for personalization is informed via the initialise event.
	 * 
	 * @public
	 */
	SmartVariantManagement.prototype.initialise = function() {
		var that = this;
		var aCurrentControls;
		var oContent = null, oContent2 = null, oVariant;
		var parameter = {
			variantKeys: []
		};
		var sKey;

		try {

			aCurrentControls = this._getAllPersonalizableControls();
			if (aCurrentControls && (aCurrentControls.length === 1) && aCurrentControls[0].persistence && aCurrentControls[0].control && aCurrentControls[0].promise) {

				aCurrentControls[0].promise.then(function(oResolvedObj) {

					var mVariants = oResolvedObj.variants;
					var oSettings = oResolvedObj.settings;
					if (oSettings) {
						that.setShowShare(oSettings.isKeyUser());
					}

					parameter.variantKeys = that._createVariantEntries(mVariants, aCurrentControls[0]);

					var sDefaultKey = that._getDefaultVariantKey(aCurrentControls[0]);
					if (sDefaultKey) {
						oVariant = that._getVariant(aCurrentControls[0].control, sDefaultKey);
						if (oVariant) {
							that.setDefaultVariantKey(sDefaultKey); // set the default variant
							that.setInitialSelectionKey(sDefaultKey); // set the current selected variant
						}
					}
					
					if (aCurrentControls[0].type === "table" && aCurrentControls[0].standardvariantkey) {
						oContent2 = that._getVariantContent(aCurrentControls[0].control, aCurrentControls[0].standardvariantkey);
						that._applyVariant(aCurrentControls[0].control, oContent2, "STANDARD");		
//						that._assignStandardVariant(aCurrentControls[0].control);						
					}

					that.fireEvent("initialise", parameter);
					that._bIsInitialized = true;
										
					if (!aCurrentControls[0].standardvariantkey) {					
						that._setStandardVariant(aCurrentControls[0]);
					}

					// navigation to FilterBar: initialize leads to VM.clearVariantSelection --> ignore an eventual defaultVariant
					var sCurrentVariant = that._mCurrentVariantId[aCurrentControls[0].control];
					if (sCurrentVariant) {
						sKey = that._determineVariantId(sCurrentVariant);
						that.setInitialSelectionKey(sKey);
						that._mCurrentVariantId[aCurrentControls[0].control] = undefined;
					} 

					sKey = that.getSelectionKey();
					if (sKey && (sKey !== that.getStandardVariantKey())) {
						oContent = that._getVariantContent(aCurrentControls[0].control, sKey);				
					} else {
						/* eslint-disable no-lonely-if */						
						if (aCurrentControls[0].standardvariantkey && (!oContent2)) {
							oContent = that._getVariantContent(aCurrentControls[0].control, aCurrentControls[0].standardvariantkey);
						}	
						/* eslint-enable no-lonely-if */						
					}

					if (oContent) {
						that._applyVariant(aCurrentControls[0].control, oContent);
//						if (aCurrentControls[0].standardvariantkey && (aCurrentControls[0].standardvariantkey === sKey)) {
//							that._assignStandardVariant(aCurrentControls[0].control);							
//						}
					} else {
						/* eslint-disable no-lonely-if */
						if ((sKey === that.STANDARDVARIANTKEY) && that.bExecuteOnSelectForStandard) {
							if (aCurrentControls[0].control.search) {
								that.setInitialSelectionKey(sKey);
								aCurrentControls[0].control.search();
							}
						}
						/* eslint-enable no-lonely-if */
					}

				}, function(args) {
					var sError = "'getChanges' failed:";
					if (args && args[0] && args[0].messages && args[0].messages[0]) {
						sError += (' ' + args[0].messages[0]);
					}
					that._setErrorValueState(that.oResourceBundle.getText("VARIANT_MANAGEMENT_READ_FAILED"), sError, aCurrentControls[0].control);

					that.fireEvent("initialise", parameter);
					that._setStandardVariant(aCurrentControls[0].control);
				});

			} else {
				this._setErrorValueState(this.oResourceBundle.getText("VARIANT_MANAGEMENT_READ_FAILED"), "'initialise' no personalizable component available", null);

				this.fireEvent("initialise", parameter);
				if (aCurrentControls && (aCurrentControls.length === 1) && aCurrentControls[0].control) {
					this._setStandardVariant(aCurrentControls[0].control);
				}
			}

		} catch (ex) {
			this._setErrorValueState(this.oResourceBundle.getText("VARIANT_MANAGEMENT_READ_FAILED"), "'getChanges' throws an exception", null);

			this.fireEvent("initialise", parameter);
			if (aCurrentControls && (aCurrentControls.length === 1) && aCurrentControls[0].control) {
				this._setStandardVariant(aCurrentControls[0].control);
			}
		}
	};

	
	SmartVariantManagement.prototype._updateVariant = function(oVariantInfo, oCurrentControlInfo) {

		if (this._isIndustrySolutionModeAndVendorLayer() || (oVariantInfo.key !== this.getStandardVariantKey())) {

			if (oVariantInfo && oCurrentControlInfo && oCurrentControlInfo.control && oCurrentControlInfo.control.fetchVariant) {
				var oVariant = this._getVariant(oCurrentControlInfo.control, oVariantInfo.key);
				if (oVariant) {
					try {

						if ((oVariantInfo.lifecycleTransportId !== null) && (oVariantInfo.lifecycleTransportId !== undefined)) {
							oVariant.setRequest(oVariantInfo.lifecycleTransportId);
						}

						var oContent = oCurrentControlInfo.control.fetchVariant();
						if (oContent) {

							var oItem = this.getItemByKey(oVariantInfo.key);
							if (oItem) {
								oContent.executeOnSelection = oItem.getExecuteOnSelection();
							}

							if (oContent.standardvariant !== undefined) {
								delete oContent.standardvariant;
							}

							if (this._isIndustrySolutionModeAndVendorLayer() && (oVariantInfo.key === this.getStandardVariantKey())) {
								oContent.standardvariant = true;
							}

							oVariant.setContent(oContent);
						}

					} catch (ex) {
						jQuery.sap.log.error("'_updateVariant' throws an exception");
					}
				}
			}
		}
	};

	SmartVariantManagement.prototype._newVariant = function(oVariantInfo, oCurrentControlInfo) {

		var sId;

		if (oVariantInfo && oCurrentControlInfo && oCurrentControlInfo.control && oCurrentControlInfo.control.fetchVariant && oCurrentControlInfo.persistence) {

			var sType = oCurrentControlInfo.type;
			var sDataService = oCurrentControlInfo.dataSource;

			var bUserDependent = !oVariantInfo.global;

			var sPackage = "";
			if ((oVariantInfo.lifecyclePackage !== null) && (oVariantInfo.lifecyclePackage !== undefined)) {
				sPackage = oVariantInfo.lifecyclePackage;
			}

			var sTransportId = "";
			if ((oVariantInfo.lifecycleTransportId !== null) && (oVariantInfo.lifecycleTransportId !== undefined)) {
				sTransportId = oVariantInfo.lifecycleTransportId;
			}

			var oContent = oCurrentControlInfo.control.fetchVariant();
			if (oContent) {

				var sContent = JSON.stringify(oContent);
				oContent = JSON.parse(sContent);

				if (oVariantInfo.exe) {
					oContent.executeOnSelection = oVariantInfo.exe;
				}
				if (oVariantInfo.tile) {
					oContent.tile = oVariantInfo.tile;
				}

				if (oContent.standardvariant !== undefined) {
					delete oContent.standardvariant;
				}
				if (this._isIndustrySolutionModeAndVendorLayer() && oVariantInfo.key === this.STANDARDVARIANTKEY) {
					oContent.standardvariant = true;
				}

			}

			sId = this._isVariantDownport(oCurrentControlInfo) ? oVariantInfo.key : null;

			var mParams = {
				type: sType,
				ODataService: sDataService,
				texts: {
					variantName: oVariantInfo.name
				},
				content: oContent,
				isVariant: true,
				packageName: sPackage,
				isUserDependent: bUserDependent,
				id: sId
			};

			sId = oCurrentControlInfo.persistence.addChange(mParams);
			this.replaceKey(oVariantInfo.key, sId);
			this.setInitialSelectionKey(sId);

			if (this.getIndustrySolutionMode() && oVariantInfo.key === this.STANDARDVARIANTKEY) {
				this.setStandardVariantKey(sId);
			}

			var oVariant = this._getVariant(oCurrentControlInfo.control, sId);
			if (oVariant) {
				oVariant.setRequest(sTransportId);

				var oItem = this.getItemByKey(sId);
				if (oItem) {
					oItem.setNamespace(oVariant.getNamespace());
				}
			}

			if (oVariantInfo.def === true) {
				this._setDefaultVariantKey(oCurrentControlInfo, sId);
			}
		}
	};

	SmartVariantManagement.prototype._appendLifecycleInformation = function(oVariant, sId) {

		var sTransportId;

		var oItem = this.getItemByKey(sId);

		if (oItem) {
			// sPackage = oItem.getLifecyclePackage();
			// if (sPackage === null || sPackage === undefined) {
			// sPackage = "";
			// }

			sTransportId = oItem.getLifecycleTransportId();
			if (sTransportId === null || sTransportId === undefined) {
				sTransportId = "";
			}

			if (oVariant) {
				oVariant.setRequest(sTransportId);
			}
		}

	};

	SmartVariantManagement.prototype._renameVariant = function(oVariantInfo, oCurrentControlInfo) {

		if (oVariantInfo.key !== this.getStandardVariantKey()) {
			if (oVariantInfo && oCurrentControlInfo && oCurrentControlInfo.control) {
				var oVariant = this._getVariant(oCurrentControlInfo.control, oVariantInfo.key);
				if (oVariant) {
					oVariant.setText("variantName", oVariantInfo.name);
					this._appendLifecycleInformation(oVariant, oVariantInfo.key);
				}
			}
		}
	};

	SmartVariantManagement.prototype._deleteVariants = function(aVariantInfo, oCurrentControlInfo) {
		var i;
		if (aVariantInfo && aVariantInfo.length && oCurrentControlInfo && oCurrentControlInfo.control) {

			var sVariantKey = this._getDefaultVariantKey(oCurrentControlInfo);

			for (i = 0; i < aVariantInfo.length; i++) {

				if (aVariantInfo[i] === this.getStandardVariantKey()) {
					continue;
				}

				var oVariant = this._getVariant(oCurrentControlInfo.control, aVariantInfo[i]);
				if (oVariant) {
					oVariant.markForDeletion();
					if (sVariantKey && sVariantKey === aVariantInfo[i]) {
						this._setDefaultVariantKey(oCurrentControlInfo, "");
					}

					this._appendLifecycleInformation(oVariant, aVariantInfo[i]);
				}
			}
		}
	};

	SmartVariantManagement.prototype._getDefaultVariantKey = function(oCurrentControlInfo) {

		var sDefaultVariantKey = "";
		if (oCurrentControlInfo && oCurrentControlInfo.persistence) {
			sDefaultVariantKey = oCurrentControlInfo.persistence.getDefaultVariantIdSync();
		}

		return sDefaultVariantKey;
	};

	SmartVariantManagement.prototype._setDefaultVariantKey = function(oCurrentControlInfo, sVariantKey) {

		// if (sVariantKey !== this.getStandardVariantKey()) {
		if (oCurrentControlInfo && oCurrentControlInfo.persistence) {
			oCurrentControlInfo.persistence.setDefaultVariantIdSync(sVariantKey);
		}
		// }
	};

	SmartVariantManagement.prototype._isVariantDownport = function(oCurrentControlInfo) {

		var bDownport = false;
		if (oCurrentControlInfo && oCurrentControlInfo.persistence) {
			bDownport = oCurrentControlInfo.persistence.isVariantDownport();
		}

		return bDownport;
	};

	SmartVariantManagement.prototype._getExecuteOnSelection = function(oVariant) {

		var oContent;

		if (oVariant) {
			oContent = oVariant.getContent();
			if (oContent && (oContent.executeOnSelection !== undefined)) {
				return oContent.executeOnSelection;
			}
		}

		return false;
	};

	SmartVariantManagement.prototype._isIndustrySolutionStandardVariant = function(oVariant) {

		var oContent;

		if (oVariant) {
			oContent = oVariant.getContent();
			if (oContent && oContent.standardvariant) {
				return oContent.standardvariant;
			}
		}

		return false;
	};

	SmartVariantManagement.prototype._setExecuteOnSelections = function(aVariantInfo, oCurrentControlInfo) {

		var i;
		if (aVariantInfo && aVariantInfo.length && oCurrentControlInfo && oCurrentControlInfo.control) {

			for (i = 0; i < aVariantInfo.length; i++) {

//				if (aVariantInfo[i].key === this.getStandardVariantKey()) {
//					continue;
//				}

				var oVariant = this._getVariant(oCurrentControlInfo.control, aVariantInfo[i].key);
				if (oVariant) {
					var oJson = oVariant.getContent();
					if (oJson) {
						oJson.executeOnSelection = aVariantInfo[i].exe;
						oVariant.setContent(oJson);
					}

					this._appendLifecycleInformation(oVariant, aVariantInfo[i].key);
				}
			}
		}
	};

	/**
	 * Save all variants.
	 * 
	 * @private
	 * @param {sap.ui.comp.smartvariants.PersonalizableInfo} oCurrentControlInfo information about the control to be personalized
	 */
	SmartVariantManagement.prototype._save = function(oCurrentControlInfo) {

		var that = this;

		if (oCurrentControlInfo && oCurrentControlInfo.persistence) {
			try {
				oCurrentControlInfo.persistence.saveAll().then(function() {
					that.fireEvent("afterSave");
				}, function(args) {
					var sError = "'_save' failed:";
					if (args && args[0] && args[0].messages && args[0].messages[0]) {
						sError += (' ' + args[0].messages[0]);
					}
					that._setErrorValueState(that.oResourceBundle.getText("VARIANT_MANAGEMENT_SAVE_FAILED"), sError, oCurrentControlInfo.control);
				});
			} catch (ex) {
				this._setErrorValueState(this.oResourceBundle.getText("VARIANT_MANAGEMENT_SAVE_FAILED"), "'_save' throws an exception", oCurrentControlInfo.control);
			}
		}
	};

	/**
	 * Eventhandler for the save event of the VariantManagement control.
	 * 
	 * @public
	 * @param {object} oVariantInfo Describes the variant to be saved
	 */
	SmartVariantManagement.prototype.fireSave = function(oVariantInfo) {

		var bSave = false;

		var aCurrentControls = this._getAllPersonalizableControls();
		if (aCurrentControls && (aCurrentControls.length === 1)) {

			if (oVariantInfo) {
				if (oVariantInfo.overwrite) {
					if (this._isIndustrySolutionModeAndVendorLayer() || (oVariantInfo.key !== this.getStandardVariantKey())) { // Prohibit save on standard variant

						this.fireEvent("save");

						if (oVariantInfo.key === this.STANDARDVARIANTKEY) {
							this._newVariant(oVariantInfo, aCurrentControls[0]);
						} else {
							this._updateVariant(oVariantInfo, aCurrentControls[0]);
						}

						bSave = true;
					}
				} else {

					this.fireEvent("save");
					this._newVariant(oVariantInfo, aCurrentControls[0]);
					bSave = true;
				}

				if (bSave) {
					this._save(aCurrentControls[0]);
				}
			}
		}
	};

	/**
	 * Eventhandler for the manage event of the VariantManagement control.
	 * 
	 * @public
	 * @param {object} oVariantInfo Describes the variants that will be deleted/renamed
	 */
	SmartVariantManagement.prototype.fireManage = function(oVariantInfo) {

		var i;
		var aCurrentControlsInfo = this._getAllPersonalizableControls();
		if (aCurrentControlsInfo && (aCurrentControlsInfo.length === 1)) {

			if (oVariantInfo) {

				if (oVariantInfo.renamed) {

					for (i = 0; i < oVariantInfo.renamed.length; i++) {
						this._renameVariant(oVariantInfo.renamed[i], aCurrentControlsInfo[0]);
					}
				}

				if (oVariantInfo.deleted) {
					this._deleteVariants(oVariantInfo.deleted, aCurrentControlsInfo[0]);
				}

				if (oVariantInfo.exe) {
					this._setExecuteOnSelections(oVariantInfo.exe, aCurrentControlsInfo[0]);
				}

				if (oVariantInfo.def) {

					var sDefaultVariantKey = this._getDefaultVariantKey(aCurrentControlsInfo[0]);
					if (sDefaultVariantKey !== oVariantInfo.def) {
						this._setDefaultVariantKey(aCurrentControlsInfo[0], oVariantInfo.def);
					}
				}

				if ((oVariantInfo.deleted && oVariantInfo.deleted.length > 0) || (oVariantInfo.renamed && oVariantInfo.renamed.length > 0) || (oVariantInfo.exe && oVariantInfo.exe.length > 0) || oVariantInfo.def) {
					this._save(aCurrentControlsInfo[0]);
				}
			}
		}
	};

	/**
	 * Eventhandler for the select event of the VariantManagement control.
	 * 
	 * @public
	 * @param {object} oVariantInfo Describes the selected variant
	 */
	SmartVariantManagement.prototype.fireSelect = function(oVariantInfo) {

		var oContent = null;

		var aCurrentControls = this._getAllPersonalizableControls();
		if (aCurrentControls && (aCurrentControls.length === 1)) {
			if (oVariantInfo && oVariantInfo.key) {

				oContent = this.getVariantContent(aCurrentControls[0].control, oVariantInfo.key);

				if (oContent) {
					var sContent = JSON.stringify(oContent);
					oContent = JSON.parse(sContent);

					if ((oVariantInfo.key === this.STANDARDVARIANTKEY) && this.bExecuteOnSelectForStandard) {
						oContent.executeOnSelection = this.bExecuteOnSelectForStandard;
					}

					this._applyVariant(aCurrentControls[0].control, oContent);
				}
			}
		}
	};

	/**
	 * Retrieves the standard variant from the ui - control.
	 * 
	 * @private
	 * @param {sap.ui.comp.smartvariants.PersonalizableInfo} oCurrentControlInfo information about the control to be personalized
	 */
	SmartVariantManagement.prototype._setStandardVariant = function(oCurrentControlInfo) {

		var oCurrentControl = oCurrentControlInfo.control;

		if (oCurrentControl) {

			if (oCurrentControl.fireBeforeVariantSave) {
				oCurrentControl.fireBeforeVariantSave(VariantManagement.STANDARD_NAME); // to obtain the CUSTOM_DATA
			}

			this._assignStandardVariant(oCurrentControl);
		}
	};

	SmartVariantManagement.prototype._assignStandardVariant = function(oCurrentControl) {

		var oStandardVariant = null;

		if (oCurrentControl) {

			if (oCurrentControl.fetchVariant) {
				oStandardVariant = oCurrentControl.fetchVariant();
			}

			this._mStandardVariants[oCurrentControl] = oStandardVariant;
		}
	};	
	
	
	SmartVariantManagement.prototype._setStandardVariant2 = function(oCurrentControlInfo) {

		var oStandardVariant;
		var oCurrentControl = oCurrentControlInfo.control;

		if (oCurrentControl) {

			if (oCurrentControlInfo.standardvariantkey) {

				oStandardVariant = this._getVariantContent(oCurrentControl, oCurrentControlInfo.standardvariantkey);

			} else {

				if (oCurrentControl.fireBeforeVariantSave) {
					oCurrentControl.fireBeforeVariantSave(VariantManagement.STANDARD_NAME); // to obtain the CUSTOM_DATA
				}

				if (oCurrentControl.fetchVariant) {
					oStandardVariant = oCurrentControl.fetchVariant();
				}
			}

			this._mStandardVariants[oCurrentControl] = oStandardVariant;
		}
	};	

	SmartVariantManagement.prototype._getStandardVariant = function(oCurrentControl) {
		var oContent = null;

		if (this._mStandardVariants && this._mStandardVariants[oCurrentControl]) {

			oContent = this._mStandardVariants[oCurrentControl];
		}

		return oContent;
	};

	/**
	 * Appliance of the the standard variant.
	 * 
	 * @private
	 * @param {sap.ui.core.Control} oCurrentControl Personalizable Control
	 * @param {object} oContent JSON object
	 * @param {string} sContext Describes in what context the apply was executed. The context will be forwarded, via the event <code>afterVariantLoad</code> to the application.
	 */
	SmartVariantManagement.prototype._applyVariant = function(oCurrentControl, oContent, sContext) {

		if (oCurrentControl && oCurrentControl.applyVariant) {
			oCurrentControl.applyVariant(oContent, sContext);
		}
	};

	/**
	 * Sets an error state on the variant management control.
	 * 
	 * @private
	 * @param {string} sText describing the error reason
	 * @param {string} sLogText describing the error reason for logging
	 * @param {object} oControl to obtain the correspondinf component name; may be null
	 */
	SmartVariantManagement.prototype._setErrorValueState = function(sText, sLogText, oControl) {
		this.setEnabled(false);

		if (sLogText) {
			jQuery.sap.log.error(sLogText);
		}
	};

	/**
	 * Destroys the control.
	 * 
	 * @public
	 */
	SmartVariantManagement.prototype.exit = function() {
		VariantManagement.prototype.exit.apply(this, arguments);

		this._mStandardVariants = null;
		this._mControlPersistence = null;

		this._aPersonalizableControls = null;

		var n, sComponentName;
		for (n in this._mControlComponent) {
			if (n) {
				sComponentName = this._mControlComponent[n];
				if (sComponentName) {
					delete SmartVariantManagement._mComponentReadError[sComponentName];
				}
			}
		}

		for (n in this._mControlPromise) {
			if (n && this._mControlPromise[n].promise) {
				this._mControlPromise[n].promise = null;
				delete this._mControlPromise[n].promise;
			}
		}

		this._mControlPromise   = null;
		this._mControlComponent = null;
		this._mCurrentVariantId = null;		
	};

	return SmartVariantManagement;

}, /* bExport= */true);
