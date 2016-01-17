define(["../util/ExtendUtil"], function(ExtendUtil) {

	var _isAvailable = function() {
		return this.context.service.uicontent.getFocusElement().then(function(oNodeModel) {
			if (!oNodeModel) {
				return false;
			}

			var nodeType = oNodeModel.type;
			//	Disable the ability to remove 'view replacement' and 'controller' extensions from Extensibility Pane until the refactoring is done.
			if (nodeType === ExtendUtil.EXT_TYPE_VIEW || nodeType === ExtendUtil.EXT_TYPE_CONTROLLER) {
				return false;	
			}
			return ExtendUtil.isExtendedByNode(oNodeModel);
		});
	};

	var _isEnabled = function() {
		return true;
	};

	var _execute = function() {
		return this.context.service.uicontent.removeExtensionFromSelectedElement();
	};

	return {
		execute : _execute,
		isAvailable : _isAvailable,
		isEnabled : _isEnabled
	};
});