define(function() {

	return {

		execute : function() {
			// overriden by Run.js
		},

		isAvailable : function() {
			return false;
		},

		isEnabled : function() {
            return this.context.service.perspective.getCurrentPerspective().then(function(sPerspectiveName) {
                return (sPerspectiveName === "development" ? true : false);
            });
		}
	};
});