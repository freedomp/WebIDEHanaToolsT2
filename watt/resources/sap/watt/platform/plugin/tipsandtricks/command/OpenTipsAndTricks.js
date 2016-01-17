define({

	execute: function() {
		return this.context.service.tipsandtricks.openTipsAndTricksDialog();
	},

	isAvailable: function() {
		return this.context.service.tipsandtricks.getValidConfiguredTipsArray().then(function(aValidTips) {
			return aValidTips && aValidTips.length >= 1;
		});
	},

	isEnabled: function() {
		return true;
	}
});