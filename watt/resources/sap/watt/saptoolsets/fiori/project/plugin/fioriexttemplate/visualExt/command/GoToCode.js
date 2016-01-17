define(function() {

	var _isAvailable = function() {
		return this.context.service.uicontent.getFocusElement().then(function(oNodeModel) {
			if (!oNodeModel) {
				return false;
			}
			return oNodeModel.isExtended === true;
		});
	};

	var _isEnabled = function() {
		return true;
	};

	var _execute = function() {
		return this.context.service.uicontent.openExtensionCodeOfSelectedElement(false);
	};

	return {
		execute : _execute,
		isAvailable : _isAvailable,
		isEnabled : _isEnabled
	};
});
