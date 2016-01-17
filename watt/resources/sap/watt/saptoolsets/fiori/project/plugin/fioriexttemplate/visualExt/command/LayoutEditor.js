define(["../util/ExtendUtil"], function(ExtendUtil) {

	var _isAvailable = function() {
		return this.context.service.uicontent.getFocusElement().then(function(oNodeModel) {
			if (!oNodeModel) {
				return false;
			}
			return (oNodeModel.type === ExtendUtil.EXT_TYPE_VIEW || oNodeModel.type === ExtendUtil.EXT_TYPE_EXT_POINT) && oNodeModel.isExtended === true;
		});
	};

	var _isEnabled = function() {
		return true;
	};

	var _execute = function() {
		return this.context.service.uicontent.openExtensionCodeOfSelectedElement(true);
	};

	return {
		execute: _execute,
		isAvailable: _isAvailable,
		isEnabled: _isEnabled
	};
});