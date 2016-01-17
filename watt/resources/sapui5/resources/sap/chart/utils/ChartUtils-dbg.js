/*
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2015 SAP SE. All rights reserved
 */
sap.ui.define([], function() {
	var _CONFIG = {
		chartTypes: [
			"bar",
			"column",
			"line",
			"combination",
			"pie",
			"donut",
			"scatter",
			"bubble",
			"heatmap",
			"bullet",
			"vertical_bullet",
			"stacked_bar",
			"stacked_column",
			"stacked_combination",
			"horizontal_stacked_combination",
			"dual_bar",
			"dual_column",
			"dual_line",
			"dual_stacked_bar",
			"dual_stacked_column",
			"dual_stacked_combination",
			"dual_horizontal_stacked_combination",
			"100_stacked_bar",
			"100_stacked_column",
			"100_dual_stacked_bar",
			"100_dual_stacked_column",
			"time_bubble",
			"timeseries_line",
			"timeseries_bubble",
			"timeseries_scatter"
		]
	};
	return {
		CONFIG: _CONFIG,
		makeNotifyParentProperty: function(sPropertyName) {
			return function(oValue, bSuppressInvalidate) {
				var oOldValue = this.mProperties[sPropertyName];

				oValue = this.validateProperty(sPropertyName, oValue);

				if (jQuery.sap.equal(oOldValue, oValue)) {
					return this;
				}

				this.setProperty(sPropertyName, oValue, bSuppressInvalidate);

				if (bSuppressInvalidate) {
					return this;
				}

				var oParent = this.getParent();
				if (oParent && typeof oParent._invalidateBy === "function") {
					oParent._invalidateBy({
						source: this,
						property: sPropertyName,
						oldValue: oOldValue,
						newValue: oValue
					});
				}

				return this;
			};
		},
		hostVizPropertySetter: function(sProp, sVizProp, oConfig) {
			var validateFn = oConfig.validate
				convertFn = oConfig.convert;

			return function(oValue) {
				oValue = this.validateProperty(sProp, oValue);
				if (typeof convertFn === "function") {
					oValue = convertFn(oValue);
				}
				if (!validateFn || validateFn(oValue)) {
					this.setProperty(sProp, oValue);
					var oVizFrame = this._getVizFrame();
					if (oVizFrame) {
						var args = {};
						args[sVizProp] = oValue;
						oVizFrame.setVizProperties(args);
					}
				}
				return this;
			};			
		},
		hostVizPropertyGetter: function(sProp, sVizProp) {
			return function() {
				var oVizFrame = this._getVizFrame();
				if (!oVizFrame) {
					return this.getProperty(sProp);
				} else {
					return sVizProp.split(".").reduce(function(val, path) {
						return val.hasOwnProperty(path) ? val[path] : undefined;
					}, oVizFrame.getVizProperties());
				}
			};
		}
	};
});
