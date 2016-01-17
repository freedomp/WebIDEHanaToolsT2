define([], function() {

	var _isAvailable = function() {
		var that = this;
		return this.context.service.uicontent.getFocusElement().then(function(oNodeModel) {
			// handle case of undefined or null:
			// command triggered from application preview, but no corresponding element located on outline tree
			if (!oNodeModel) {
				var message = that.context.i18n.getText("i18n", "VisualExt_ElementNotFound");
				that.context.service.usernotification.info(message).done();
			}
			return that.context.service.uicontent.getExtensionTypes().then(function (mTypes) {
				return that.context.service.uicontent.isSelectedElementExtensibleForType(mTypes.HIDE_CONTROL);
			});
		});
	};

	var _isEnabled = function() {
		return true;
	};

	var _execute = function() {
		var that = this;
		return this.context.service.uicontent.getExtensionTypes().then(function (mTypes) {
			return that.context.service.uicontent.extendSelectedElement(mTypes.HIDE_CONTROL);
		});
	};

	return {
		execute : _execute,
		isAvailable : _isAvailable,
		isEnabled : _isEnabled
	};
});