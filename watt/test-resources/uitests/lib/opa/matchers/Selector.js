/*!
 * @copyright@
 */

sap.ui.define([], function () {

	/**
	 * @class Selector - checks if a control has a specified with jquery selector element inside and returns it as result
	 * @param {strint} sSelector the jQuery string selector #id.className[data=value] ...
	 * @public
	 * @alias sap.ui.test.matchers.Selector
	 * @author SAP SE
	 * @since 1.27
	 */
	return function(sSelector) {
		return function (oControl) {
			var $el = oControl.$().find(sSelector);
			if ($el.length) {
				return $el;
			} else {
				return false;
			}
		};
	};

}, /* bExport= */ true);
