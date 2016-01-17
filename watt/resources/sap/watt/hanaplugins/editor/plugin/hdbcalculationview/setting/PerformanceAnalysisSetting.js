/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define(["../util/ResourceLoader"], function(ResourceLoader) {
	var resourceLoader = new ResourceLoader("/watt/resources/sap/watt/hanaplugins/editor/plugin/hdbcalculationview");
	var PerformanceAnalysisSetting = function() {
		this._cache = [];
	};
	PerformanceAnalysisSetting.prototype = {
		getName: function() {
			return resourceLoader.getText("tit_performance_analysis");
		},
		getContent: function(values, jsonModel) {
			var that = this;
			// CheckBox
			var oCB = new sap.ui.commons.CheckBox({
				text: resourceLoader.getText('txt_performance_analysis_always_on'),
				checked: "{/" + values[0].key + "}",
				layoutData: new sap.ui.layout.GridData({
					span: "L12 M12 S12"
				}),
				change: function(oEvent) {
					that._updateCache(values[0].key, oCB.getChecked());
				}
			});
			//threshold value
			var thresholdValTxt = new sap.ui.commons.TextField({
				width: "80%",
				value: "{/" + values[1].key + "}",
				layoutData: new sap.ui.layout.GridData({
					span: "L8 M6 S12"
				}),
				change: function(oEvent) {
					that._updateCache(values[1].key, oEvent.oSource.getValue());
				}
			});
			thresholdValTxt.attachBrowserEvent("keypress", function(e) {
				var keyCodes = [48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 0, 8];
				if ($.inArray(e.which, keyCodes) < 0) {
					e.preventDefault();
				}
			});

			var thresholdValLbl = new sap.ui.commons.Label({
				text: resourceLoader.getText('txt_performance_analysis_threshold_value'),
				labelFor: thresholdValTxt,
				layoutData: new sap.ui.layout.GridData({
					span: "L4 M6 S12"
				})
			});
			var note = new sap.ui.commons.FormattedTextView({
				layoutData: new sap.ui.layout.GridData({
					span: "L12 M12 S12"
				}),
				htmlText: '<strong>' + resourceLoader.getText('txt_note') + '</strong>' + resourceLoader.getText('txt_performance_analysis_note')
			});
			var layout = new sap.ui.layout.Grid({
				hSpacing: 1,
				vSpacing: 1,
				content: [oCB, thresholdValLbl, thresholdValTxt, note],
				layoutData: new sap.ui.layout.GridData({
					span: "L12 M12 S12"
				}),
				width: "100%"
			});
			layout.setModel(jsonModel);
			return layout;
		},
		getValues: function(setting) {
			var values = [{
				key: "performanceAnalysisAlwaysOn",
				value: false,
				defaultValue: false
            }, {
				key: "performanceAnalysisThresholdValue",
				value: "5000",
				defaultValue: "5000"
            }];
			values.forEach(function(val) {
				val.value = setting[val.key] || val.defaultValue;
			});
			return values;
		},
		getCache: function() {
			return this._cache;
		},
		_updateCache: function(key, value) {
			var isUpdated = false;
			for (var i = 0; i < this._cache.length; i++) {
				var param = this._cache[i];
				if (param.key === key) {
					param.value = value;
					isUpdated = true;
					break;
				}
			}
			if (!isUpdated) {
				this._cache.push({
					key: key,
					value: value
				});
			}
		}
	};
	return PerformanceAnalysisSetting;
});
