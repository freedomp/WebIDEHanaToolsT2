define({
	/**
	 * Trigger intellisence plugin.
	 * <p>
	 * This command will get the editor's current status, invoke the code completion plugin
	 * and display a suggestion popup with the proposals returned by code completion plugin.
	 */
	execute: function() {
		return this.context.service.intellisence.executeIntellisence();//.done();
	},

	isAvailable: function() {
		return true;
	},

	isEnabled: function() {
		return this.context.service.intellisence.getCodeEditor().then(function(oEditor) {
			if (oEditor) {
				return oEditor.getVisible().then(function(visible) {
					if (visible) {
						return true;
					} else {
						return false;
					}
				});
			} else {
				return false;
			}
		});
	}
});