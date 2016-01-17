/*
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2015 SAP SE. All rights reserved
 */

sap.ui.define([	"jquery.sap.global", "sap/ui/comp/odata/SideEffects" ], function(jQuery, SideEffects) { // EXC_JSHINT_002
	"use strict";

	/**
	 * Creates a new instance.
	 * 
	 * @private
	 * @class
	 * @classdesc Analyzes OData Side-Effects annotation in the SmartField.
	 * @author SAP SE
	 * @experimental to be productized soon
	 * @version 1.32.7
	 * @since 1.31.0
	 * @alias sap.ui.comp.odata.SideEffects
	 * @param {sap.ui.core.Control} oParent the parent control
	 */
	var SideEffectUtil = function(oParent) { // EXC_JSLINT_021
		this._oParent = oParent;
		this._oSideEffects = new SideEffects();
	};
	
	/**
	 * Calculates the field group ID according to the side effects annotation.
	 * 
	 * @param {object} oMetaData the meta data used to create the control
	 * @param {object} oMetaData.entitySet the OData entity set definition
	 * @param {object} oMetaData.entityType the OData entity type definition
	 * @param {object} oMetaData.property the OData property definition
	 * @param {string} oMetaData.path the binding path
	 * @param {sap.ui.core.mvc.View} oView the current view
	 * @returns {string} the ID of the field group
	 * @public
	 */
	SideEffectUtil.prototype.getFieldGroupID = function(oMetaData, oView) {
		var oMeta, oComplex, sTypePath, mSideEffects;
		
		if (oMetaData.property.complex) {
			oComplex = oMetaData.property.parents[0];
			sTypePath = this._toTypePath(oMetaData.path, oComplex);
		}
		
		oMeta = {
			entitySet: oMetaData.entitySet,
			entityType: oMetaData.entityType,
			complexType: oComplex
		};
	 
		mSideEffects = this._oSideEffects.getSideEffects(oMetaData.path, sTypePath, oMeta);	
		return this._calcFieldGroup(mSideEffects, oMetaData, oView);
	};
	
	/**
	 * Calculates the field group definition and returns the ID of the field group.
	 * 
	 * @param {map} mSideEffects the given side effects
	 * @param {object} oMetaData the meta data used to create the control
	 * @param {object} oMetaData.entitySet the OData entity set definition
	 * @param {object} oMetaData.entityType the OData entity type definition
	 * @param {object} oMetaData.property the OData property definition
	 * @param {string} oMetaData.path the binding path
	 * @param {sap.ui.core.mvc.View} oView the current view
	 * @returns {string} the field group ID
	 * @private
	 */
	SideEffectUtil.prototype._calcFieldGroup = function(mSideEffects, oMetaData, oView) {
		var oContext, sUUID, sID, oID, oSideEffect = this._getSideEffect(mSideEffects, oMetaData);
		
		if (oSideEffect.sideEffect) {
			oContext = this._oParent.getBindingContext();
			oID = {
				name: oSideEffect.sideEffect.name,
				originType: oSideEffect.sideEffect.originType,
				originName: oSideEffect.origin.name,
				context: oContext.getPath()			       
			};
			sID = JSON.stringify(oID);					
			sUUID = oView.data(sID);
			
			if (!sUUID) {
				sUUID = this.createUUID();
				oView.data(sUUID, oID);
				oView.data(sID, sUUID);
			}
			
			return sUUID;
		}
		
		return null;
	};
	
	/**
	 * Returns the first side effect in the map.
	 * @param {map} mSideEffects the given side effects
	 * @param {object} oMetaData the meta data used to create the control
	 * @param {object} oMetaData.entitySet the OData entity set definition
	 * @param {object} oMetaData.entityType the OData entity type definition
	 * @param {object} oMetaData.property the OData property definition
	 * @param {string} oMetaData.path the binding path
	 * @returns {object} the first side effect in the map
	 * @private
	 */
	SideEffectUtil.prototype._getSideEffect = function(mSideEffects, oMetaData) {
		var oResult = {};
		
		oResult.sideEffect = this._getSideEffectFromEntity("entitySet", mSideEffects);
		
		if (oResult.sideEffect) {
			oResult.origin = oMetaData.entitySet;
		}
		
		if (!oResult.sideEffect) {
			oResult.sideEffect = this._getSideEffectFromEntity("entityType", mSideEffects);
			
			if (oResult.sideEffect) {
				oResult.origin = oMetaData.entityType;
			}
		}
		
		if (!oResult.sideEffect) {
			oResult.sideEffect = this._getSideEffectFromEntity("complexType", mSideEffects);
			
			if (oResult.sideEffect) {
				oResult.origin = oMetaData.property.parents[0];
			}
		}
		
		return oResult;
	};

	/**
	 * Returns the first side effect in the map.
	 * 
	 * @param {string} sName the name of the map
	 * @param {map} mSideEffects the given side effects
	 * @returns {object} the first side effect in the map
	 * @private
	 */
	SideEffectUtil.prototype._getSideEffectFromEntity = function(sName, mSideEffects) {
		var n;
		
		if (mSideEffects[sName]) {
			for (n in mSideEffects[sName]) {  // EXC_JSHINT_041
				return {
					name: n,
					originType: sName,
					sideEffect: mSideEffects[sName][n]
				};
			}
		}
	};
	
	/**
	 * Converts a given path to the type path.
	 * 
	 * @param {string} sPath the given path
	 * @param {object} oComplexType the given complex type
	 * @returns {string} the type path.
	 * @private
	 */
	SideEffectUtil.prototype._toTypePath = function(sPath, oComplexType) {
		var aProp = sPath.split("/");		
		return sPath.replace(aProp[0], oComplexType.name);
	};
	
	/**
	 * Creates a new UUID.
	 * 
	 * @returns {string} the new UUID.
	 * @public
	 */
	SideEffectUtil.prototype.createUUID = function() {
		var d = new Date().getTime();
		var uuid = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx".replace(/[x]/g, function(c) {
			var r = (d + Math.random() * 16) % 16 | 0;
			d = Math.floor(d / 16);
			return (c === "x" ? r : (r & 0x7 | 0x8)).toString(16);
		});
		return uuid;	
	};
	
	/**
	 * Frees all resources claimed during the life-time of this instance.
	 * 
	 * @public
	 */
	SideEffectUtil.prototype.destroy = function() { // EXC_JSLINT_021
		if (this._oSideEffects) {
			this._oSideEffects.destroy();
		}
		
		this._oSideEffects = null;
	};
	
	return SideEffectUtil;

}, true);