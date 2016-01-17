define([], function() {

	var _isAvailable = function() {
		var that = this;
		return this.context.service.uicontent.getExtensionTypes().then(function (mTypes) {
			return that.context.service.uicontent.isSelectedElementExtensibleForType(mTypes.REPLACE_VIEW_WITH_COPY);
		});
	};

	var _isEnabled = function() {
		return true;
	};

	var _execute = function() {
		var that = this;
		return this.context.service.uicontent.getExtensionTypes().then(function (mTypes) {
			return that.context.service.uicontent.extendSelectedElement(mTypes.REPLACE_VIEW_WITH_COPY);
		});
	};

	return {
		execute : _execute,
		isAvailable : _isAvailable,
		isEnabled : _isEnabled
	};
});