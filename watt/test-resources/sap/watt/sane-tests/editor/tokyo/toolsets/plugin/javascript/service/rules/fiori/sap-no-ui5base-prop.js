/**
 * @fileoverview Rule to flag use of sap ui5base prop
 * @author Achref Kilani Jrad - C5215143
 * @ESLint			Version 0.14.0 / February 2015
 */

// ------------------------------------------------------------------------------
// Rule Definition
// ------------------------------------------------------------------------------

module.exports = function(context) {
	"use strict";

	// variables should be defined here
	var PRIVATE_MEMBERS = [ "mProperties", "mAggregations", "mAssociations",
                            "mMethods", "oParent", "aDelegates", "aBeforeDelegates",
                            "iSuppressInvalidate", "oPropagatedProperties", "oModels",
                            "oBindingContexts", "mBindingInfos", "sBindingPath",
                            "mBindingParameters", "mBoundObjects" ];

	// --------------------------------------------------------------------------
	// Helpers
	// --------------------------------------------------------------------------
	function contains(a, obj) {
		for (var i = 0; i < a.length; i++) {

			if (obj === a[i]) {
				return true;
			}
		}
		return false;
	}

	// --------------------------------------------------------------------------
	// Public
	// --------------------------------------------------------------------------

	return {

		"MemberExpression": function(node) {

			var val = node.property.name;

			if ((typeof val === "string") && contains(PRIVATE_MEMBERS, val)) {

				context
						.report(node,
								"Direct usage of a private member from  sap.ui.base.ManagedObject detected!");

			}

		}
	};

};
