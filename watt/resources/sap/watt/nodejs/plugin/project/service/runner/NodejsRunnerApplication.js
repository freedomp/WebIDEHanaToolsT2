define(["./BaseNodejsRunner"], function(BaseNodejsRunner) {
	"use strict";

	var sRunnerTypeId = "system:/sap.nodejs/default";
	var sRunnerId = "sap.xs.nodejs.project.nodejsRunnerApplication";

	/**
	 * Constructs new instance.
	 *
	 * @public
	 * @constructor
	 */
	var NodejsRunnerApplication = function() {
		BaseNodejsRunner.call(this, sRunnerId, sRunnerTypeId);
		return this;
	};

	NodejsRunnerApplication.prototype = Object.create(BaseNodejsRunner.prototype);

	NodejsRunnerApplication.ID = sRunnerTypeId;

	return NodejsRunnerApplication;
});
