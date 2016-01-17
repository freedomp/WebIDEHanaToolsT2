define([], function() {

	/**
	 * Opens the tips and tricks dialog on Web-IDE startup only if the welcome screen was not
	 * the perspective opened on startup and the user didn't check the don't show on startup
	 * checkbox in the dialog previously.
	 *
	 */
	function _onWelcomePerspectiveNotVisibleOnStartup() {
		var that = this;
		return that.context.service.tipsandtricks.getShowOnStartup().then(function(bShowOnStartup) {
			if(bShowOnStartup) {
				return that.context.service.tipsandtricks.openTipsAndTricksDialog();
			}
		});
	}


	return {
		onWelcomePerspectiveNotVisibleOnStartup: _onWelcomePerspectiveNotVisibleOnStartup
	};
});
