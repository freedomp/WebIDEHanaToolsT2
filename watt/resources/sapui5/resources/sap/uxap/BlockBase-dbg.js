/*!
 * SAP UI development toolkit for HTML5 (SAPUI5) (c) Copyright
		2009-2015 SAP SE. All rights reserved
 */

// Provides control sap.uxap.BlockBase.
sap.ui.define(['sap/ui/core/Control', 'sap/ui/core/CustomData', './BlockBaseMetadata', './ModelMapping', './library'],
	function (Control, CustomData, BlockBaseMetadata, ModelMapping, library) {
	"use strict";

	/**
	 * Constructor for a new BlockBase.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 *
	 * A block is the main element that will be displayed, mainly in an object page, but not necessarily
	 * only there.
	 *
	 * A block is a control that use a view for storing its internal control tree.
	 * A block is a control that has modes and a view associated to each modes.
	 * At rendering time, the view associated to the mode is rendered.
	 *
	 * As any UI5 views, the view can have a controller which automatically comes a this.oParentBlock attribute (so that the controller can interacts with the block).
	 * If the controller implements the onParentBlockModeChange method, this method will get called with the sMode parameter when the view is used or re-used by the block.
	 *
	 * @extends sap.ui.core.Control
	 * @author SAP SE
	 * @constructor
	 * @public
	 * @alias sap.uxap.BlockBase
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */


	/**
	 * Returns an object containing the supported modes for the block.
	 *
	 * @name sap.uxap.BlockBase#getSupportedModes
	 * @function
	 * @type object
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */

var BlockBase = Control.extend("sap.uxap.BlockBase", {
		metadata: {
			library: "sap.uxap",
			properties: {
				/**
				 * Determines the mode of the block.
				 * When block is used inside ObjectOage this mode is inherited my the SubSection.
				 * The mode of the block is changed when SubSection mode changes.
				 */
				"mode": {type: "string", group: "Appearance"},

				/**
				 * Determines the visibility of the block.
				 */
				"visible": {type: "boolean", group: "Appearance", defaultValue: true},

				/**
				 * Determines on how columns the layout will be rendered.
				 * Allowed values are integers from 1 to 4 and "auto".
				 */
				"columnLayout": {type: "sap.uxap.BlockBaseColumnLayout", group: "Behavior", defaultValue: "auto"},

				/**
				 * Determines whether the show more button should be shown.
				 */
				"showSubSectionMore": {type: "boolean", group: "Behavior", defaultValue: false}
			},
			defaultAggregation: "mappings",
			aggregations: {

				/**
				 * Map external UI5 model and internal Block model
				 */
				"mappings": {type: "sap.uxap.ModelMapping", multiple: true, singularName: "mapping"},

				 /**
				 * Internal aggregation that contains all views inside this Block
				 */
				"_views": {type: "sap.ui.core.Control", multiple: true, singularName: "view", visibility: "hidden"}
			},
			associations: {

				/**
				 * The view that is rendered now.
				 * Can be used as getter for the rendered view.
				 */
				"selectedView": {type: "sap.ui.core.Control", multiple: false}
			},
			views: {

//				 define your views here following the pattern:
				 "yourModeName": {viewName: "your.view.path" , type: "yourUI5ViewType" }

//				 for example:
//				 "Collapsed": {
//				 viewName: "sap.uxap.testblocks.multiview.MultiViewBlockCollapsed",
//				 type: "XML"
//				 },
//				 "Expanded": {
//				 viewName: "sap.uxap.testblocks.multiview.MultiViewBlockExpanded",
//				 type: "XML"
//				 }
//
//				 if no views are provided, the blockBase looks for an xml view which name is equal to the block's one
//
			}
		},
		renderer: "sap.uxap.BlockBaseRenderer"
	}, BlockBaseMetadata);

	BlockBase.prototype.init = function () {
		//convenience mechanism:
		//if there are no views defined by the Block,
		// we look for the default one which would have the same name as the block and type XML
		if (!this.getMetadata().hasViews()) {
			this.getMetadata().setView("defaultXML", {viewName: this.getMetadata().getName(), type: "XML"});
		}

		//for performance optimization
		this._oMappingApplied = {};

		//lazy loading
		this._bLazyLoading = false; //by default, no lazy loading so we can use it out of an objectPageLayout
		this._bConnected = false;   //indicates connectToModels function has been called
		this._oUpdatedModels = {};
	};

	BlockBase.prototype.onBeforeRendering = function () {
		if (!this.getMode() || this.getMode() === "") {
			if (this.getMetadata().getView("defaultXML")) {
				this.setMode("defaultXML");
			} else {
				jQuery.sap.log.error("BlockBase ::: there is no mode defined for rendering " + this.getMetadata().getName() +
				". You can either set a default mode on the block metadata or set the mode property before rendering the block.");
			}
		}

		this._bLazyLoading = this._getObjectPageLayout() && this._getObjectPageLayout().getEnableLazyLoading();
	};

	BlockBase.prototype.onAfterRendering = function () {
		if (this._getObjectPageLayout()) {
			this._getObjectPageLayout()._adjustLayout();
		}
	};

	/**
	 * Set the parent control for the current block.
	 * Every time the parent changes, we try to find the parent objectPageLayout in order to determine the lazy loading strategy to apply.
	 * @param oParent
	 * @param sAggregationName
	 * @param bSuppressInvalidate
	 */
	BlockBase.prototype.setParent = function (oParent, sAggregationName, bSuppressInvalidate) {
		Control.prototype.setParent.call(this, oParent, sAggregationName, bSuppressInvalidate);

		if (oParent instanceof sap.uxap.ObjectPageSubSection) {
			this._bLazyLoading = true; //we activate the block lazy loading since we are within an objectPageLayout
			this._oParentObjectPageSubSection = oParent;
		}
	};

	/*********************************************
	 * model mapping management
	 * *******************************************/


	/**
	 * This triggers rerendering of itself and its children.<br/> As <code>sap.ui.base.ManagedObject</code> "bubbles up" the
	 * invalidate, changes to child-<code>Elements</code> will also result in rerendering of the whole sub tree.
	 * @protected
	 * @name sap.ui.base.ManagedObject#invalidate
	 * @function
	 */
	BlockBase.prototype.invalidate = function (oOrigin) {
		this._applyMapping();
		Control.prototype.invalidate.call(this, oOrigin);
	};

	/**
	 * Intercept direct setModel calls.
	 * @param oModel
	 * @param sName
	 * @returns {sap.ui.base.ManagedObject}
	 */
	BlockBase.prototype.setModel = function (oModel, sName) {
		this._applyMapping(sName);
		return Control.prototype.setModel.call(this, oModel, sName);
	};

	/**
	 * Called for applying the modelmapping once all properties are set.
	 * @private
	 */
	BlockBase.prototype._applyMapping = function () {
		if (this._bLazyLoading && !this._bConnected) {
			jQuery.sap.log.debug("BlockBase ::: Ignoring the _applyMapping as the block is not connected");
		} else {
			this.getMappings().forEach(function (oMapping, iIndex) {
				var oModel,
					sInternalModelName = oMapping.getInternalModelName(),
					sExternalPath = oMapping.getExternalPath(),
					sExternalModelName = oMapping.getExternalModelName(),
					sPath;

				if (sExternalPath) {
					if (sInternalModelName == "" || sExternalPath == "") {
						throw new Error("BlockBase :: incorrect mapping, one of the modelMapping property is empty");
					}

					if (!this._isMappingApplied(sInternalModelName) /* check if mapping is set already */
							|| (this.getModel(sInternalModelName) != this.getModel(sExternalModelName)) /* model changed, then we have to update internal model mapping */ ){

						jQuery.sap.log.info("BlockBase :: mapping external model " + sExternalModelName + " to " + sInternalModelName);

						oModel = this.getModel(sExternalModelName);

						if (oModel) {
							sPath = oModel.resolve(sExternalPath, this.getBindingContext(sExternalModelName));

							this._oMappingApplied[sInternalModelName] = true;
							Control.prototype.setModel.call(this, oModel, sInternalModelName);
							this.setBindingContext(new sap.ui.model.Context(oModel, sPath), sInternalModelName);
						}
					}
				}
			}, this);
		}
	};

	BlockBase.prototype._isMappingApplied = function (sInternalModelName) {
		return this.getModel(sInternalModelName) && this._oMappingApplied[sInternalModelName];
	};

	/**
	 * Intercept propagated properties.
	 * @param vName
	 * @returns {*}
	 */
	BlockBase.prototype.propagateProperties = function (vName) {
		if (this._bLazyLoading && !this._bConnected && !this._oUpdatedModels.hasOwnProperty(vName)) {
			this._oUpdatedModels[vName] = true;
		} else {
			this._applyMapping(vName);
		}

		return Control.prototype.propagateProperties.call(this, vName);
	};

	/*********************************************
	 * mode vs views management
	 * *******************************************/

	/**
	 * Returns an object containing the supported modes for the block.
	 * @returns {sap.ui.core/object}
	 */
	BlockBase.prototype.getSupportedModes = function () {
		var oSupportedModes = jQuery.extend({}, this.getMetadata().getViews());

		for (var key in oSupportedModes) {
			oSupportedModes[key] = key; //this is what developers expect, for ex: {Collapsed:"Collapsed"}
		}

		return oSupportedModes;
	};

	/**
	 * Set the view mode for this particular block.
	 * @param sMode {string} the mode to apply to the control (that should be synchronized with view declared)
	 * @public
	 */
	BlockBase.prototype.setMode = function (sMode) {
		sMode = this._validateMode(sMode);

		if (this.getMode() !== sMode) {
			this.setProperty("mode", sMode, false);
			//if Lazy loading is enabled, and if the block is not connected
			//delay the view creation (will be done in connectToModels function)
			if (!this._bLazyLoading || this._bConnected) {
				this._initView(sMode);
			}
		}

		return this;
	};

	/**
	 * Provide a clone mechanism: the selectedView needs to point to one of the _views.
	 * @returns {sap.ui.core.Element}
	 */
	BlockBase.prototype.clone = function () {
		var iAssocIndex = -1,
			sAssoc = this.getAssociation("selectedView"),
			aViews = this.getAggregation("_views") || [];

		//find the n-view associated
		if (sAssoc) {
			aViews.forEach(function (oView, iIndex) {

				if (oView.getId() === sAssoc) {
					iAssocIndex = iIndex;
				}

				return iAssocIndex < 0;
			});
		}

		var oNewThis = Control.prototype.clone.call(this);
		//we need to maintain the association onto the new object
		if (iAssocIndex >= 0) {
			oNewThis.setAssociation("selectedView", oNewThis.getAggregation("_views")[iAssocIndex]);
		}

		return oNewThis;
	};

	/**
	 * Validate that the provided mode has been declared in the metadata views section, throw an exception otherwise.
	 * @param sMode
	 * @private
	 */
	BlockBase.prototype._validateMode = function (sMode) {
		this.validateProperty("mode", sMode); //type expected as per properties definition

		if (!this.getMetadata().getView(sMode)) {
			var sBlockName = this.getMetadata()._sClassName || this.getId();

			//the view wasn't defined.
			//as a fallback mechanism: we look for the defaultXML one and raise an error before raising an exception
			if (this.getMetadata().getView("defaultXML")) {
				jQuery.sap.log.warning("BlockBase :: no view defined for block " + sBlockName + " for mode " + sMode + ", loading defaultXML instead");
				sMode = "defaultXML";
			} else {
				throw new Error("BlockBase :: no view defined for block " + sBlockName + " for mode " + sMode);
			}
		}

		return sMode;
	};

	/**
	 * Get the view associated with the selectedView.
	 * @returns {null}
	 * @private
	 */
	BlockBase.prototype._getSelectedViewContent = function () {
		var oView = null, sSelectedViewId, aViews;

		sSelectedViewId = this.getAssociation("selectedView");
		aViews = this.getAggregation("_views");

		if (aViews) {
			for (var i = 0; !oView && i < aViews.length; i++) {
				if (aViews[i].getId() === sSelectedViewId) {
					oView = aViews[i];
				}
			}
		}

		return oView;
	};

	/***
	 * Create view
	 * @param mParameter
	 * @returns {sap.ui.core.mvc.View}
	 * @protected
	 */
	BlockBase.prototype.createView = function (mParameter) {
		return sap.ui.xmlview(mParameter);
	};

	/**
	 * Initialize a view and returns it if it has not been defined already.
	 * @param sMode the valid mode corresponding to the view to initialize
	 * @returns {sap.ui.view}
	 * @private
	 */
	BlockBase.prototype._initView = function (sMode) {
		var oView,
			aViews = this.getAggregation("_views") || [],
			mParameter = this.getMetadata().getView(sMode);

		//look for the views if it was already instantiated
		aViews.forEach(function (oCurrentView, iIndex) {
			if (oCurrentView.data("layoutMode") === sMode) {
				oView = oCurrentView;
			}
		});

		//the view is not instantiated yet, handle a new view scenario
		if (!oView) {
			oView = this._initNewView(sMode);
		}

		this.setAssociation("selectedView", oView, true);

		//try to notify the associated controller that the view is being used for this mode
		if (oView.getController() && oView.getController().onParentBlockModeChange) {
			oView.getController().onParentBlockModeChange(sMode);
		} else {
			jQuery.sap.log.info("BlockBase ::: could not notify " + mParameter.viewName + " of loading in mode " + sMode + ": missing controller onParentBlockModeChange method");
		}

		return oView;
	};

	/**
	 * Initialize new BlockBase view
	 * @param sMode the valid mode corresponding to the view to initialize
	 * @returns {sap.ui.view}
	 * @private
	 */
	BlockBase.prototype._initNewView = function (sMode) {
		var oView = this._getSelectedViewContent(),
			mParameter = this.getMetadata().getView(sMode);

		//check if the new view is not the current one (we may want to have the same view for several modes)
		if (!oView || mParameter.viewName != oView.getViewName()) {
			oView = this.createView(mParameter);

			//link to the controller defined in the Block
			if (oView) {

				//inject a reference to this
				if (oView.getController()) {
					oView.getController().oParentBlock = this;
				}

				oView.addCustomData(new CustomData({
					"key": "layoutMode",
					"value": sMode
				}));

				this.addAggregation("_views", oView, true);
			} else {
				throw new Error("BlockBase :: no view defined in metadata.views for mode " + sMode);
			}
		}

		return oView;
	}

	/*************************************************************************************
	 * objectPageLayout integration & lazy loading management
	 ************************************************************************************/

	/**
	 * Getter for the parent object page layout.
	 * @returns {*}
	 * @private
	 */
	BlockBase.prototype._getObjectPageLayout = function () {
		if (!this._oParentObjectPageLayout) {
			this._oParentObjectPageLayout = sap.uxap.ObjectPageLayout._getClosestOPL(this);
		}

		return this._oParentObjectPageLayout;
	};

	/**
	 * Setter for the visibility of the block.
	 * @public
	 */
	BlockBase.prototype.setVisible = function (bValue, bSuppressInvalidate) {
		this.setProperty("visible", bValue, bSuppressInvalidate);
		this._getObjectPageLayout() && this._getObjectPageLayout()._adjustLayoutAndUxRules();

		return this;
	};

	/**
	 * Set the showSubSectionMore property.
	 * Ask the parent ObjectPageSubSection to refresh its see more visibility state if present.
	 * @param bValue
	 * @param bInvalidate
	 * @returns {*}
	 */
	BlockBase.prototype.setShowSubSectionMore = function (bValue, bInvalidate) {
		//suppress invalidate as ShowSubSectionMore has no impact on block itself.
		if (bValue != this.getShowSubSectionMore()) {
			this.setProperty("showSubSectionMore", bValue, true);

			//refresh the parent subsection see more visibility if we have changed it and we are within an objectPageSubSection
			if (this._oParentObjectPageSubSection) {
				this._oParentObjectPageSubSection.refreshSeeMoreVisibility();
			}
		}

		return this;
	};

	/**
	 * Connect Block to the UI5 model tree.
	 * Initialize view if lazy loading is enabled.
	 * @returns {*}
	 */
	BlockBase.prototype.connectToModels = function () {
		if (!this._bConnected) {
			jQuery.sap.log.debug("BlockBase :: Connecting block to the UI5 model tree");
			this._bConnected = true;
			if (this._bLazyLoading) {
				//if lazy loading is enabled, the view has not been created during the setMode
				//so create it now
				var sMode = this.getMode();
				sMode && this._initView(sMode);
			}

			this.invalidate();
		}
	};

	/**
	 * Override of the default model lifecycle method to disable the automatic binding resolution for lazyloading.
	 * @override
	 * @param bSkipLocal
	 * @param bSkipChildren
	 * @param sModelName
	 * @param bUpdateAll
	 * @returns {*}
	 */
	BlockBase.prototype.updateBindingContext = function (bSkipLocal, bSkipChildren, sModelName, bUpdateAll) {
		if (!this._bLazyLoading || this._bConnected) {
			return Control.prototype.updateBindingContext.call(this, bSkipLocal, bSkipChildren, sModelName, bUpdateAll);
		} else {
			jQuery.sap.log.debug("BlockBase ::: Ignoring the updateBindingContext as the block is not visible for now in the ObjectPageLayout");
		}
	};

	/**
	 * Override of the default model lifecycle method to disable the automatic binding resolution for lazyloading.
	 * @override
	 * @param bUpdateAll
	 * @param sModelName
	 * @returns {*}
	 */
	BlockBase.prototype.updateBindings = function (bUpdateAll, sModelName) {
		if (!this._bLazyLoading || this._bConnected) {
			return Control.prototype.updateBindings.call(this, bUpdateAll, sModelName);
		} else {
			jQuery.sap.log.debug("BlockBase ::: Ignoring the updateBindingContext as the block is not visible for now in the ObjectPageLayout");
		}
	};

	return BlockBase;
});
