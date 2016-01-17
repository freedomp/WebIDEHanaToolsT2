define(function() {

	var _isAvailable = function() {
		return true;
	};

	var _isEnabled = function() {
		return this.context.service.uicontent.getFocusElement().then(function(oNodeModel) {
			if (!oNodeModel) {
				return false;
			}
			return oNodeModel.isRoot !== true;
		});
	};

	var _execute = function() {
		return this.context.service.uicontent.openOriginalCodeOfSelectedElement();
	};

	return {
		execute : _execute,
		isAvailable : _isAvailable,
		isEnabled : _isEnabled
	};
});
