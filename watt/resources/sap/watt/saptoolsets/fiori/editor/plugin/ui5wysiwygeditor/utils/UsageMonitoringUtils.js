define(
	[
		"sap/watt/lib/lodash/lodash"
	],
	function (_) {
		"use strict";

// Private variables and methods
// Begin
		var
			/**
			 * usagemonitoring service object
			 *
			 * @type {object}
			 * @private
			 */
			_oUsageMonitoringService = null;
// End
// Private variables and methods

		/**
		 * WYSIWYG UsageMonitoringUtils utilities
		 *
		 * @type {sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.utils.UsageMonitoringUtils}
		 */
		var UsageMonitoringUtils = {

			/**
			 * Initializes UsageMonitoringUtils
			 * This method is invoked only once
			 *
			 * @param {object} oContext service context object
			 *
			 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.utils.UsageMonitoringUtils.init
			 * @function
			 * @public
			 */
			init: _.once(function (oContext) {
				jQuery.sap.assert(oContext, "oContext must be a valid service context");
				_oUsageMonitoringService = _.get(oContext, "service.usagemonitoring");
				jQuery.sap.assert(_oUsageMonitoringService, "usagemonitoring service does not exists in the given context");
			}),

			/**
			 * Report usage on w5g component
			 *
			 * @param {string} sEventType Event type to report
			 * @param {string=} sEventValue Event value to report
			 *
			 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.utils.UsageMonitoringUtils.report
			 * @function
			 * @public
			 */
			report: function (sEventType, sEventValue) {
				jQuery.sap.assert(_oUsageMonitoringService, "UsageMonitoringUtils is not initialized");
				_oUsageMonitoringService.report("w5g", sEventType, sEventValue).done();
			},

			/**
			 * Start performance measuring on w5g component
			 *
			 * @param {string} sEventType Event type to report
			 *
			 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.utils.UsageMonitoringUtils.startPerf
			 * @function
			 * @public
			 */
			startPerf: function(sEventType) {
				jQuery.sap.assert(_oUsageMonitoringService, "UsageMonitoringUtils is not initialized");
				_oUsageMonitoringService.startPerf("w5g", sEventType).done();
			}
		};

		return UsageMonitoringUtils;
	}
);
