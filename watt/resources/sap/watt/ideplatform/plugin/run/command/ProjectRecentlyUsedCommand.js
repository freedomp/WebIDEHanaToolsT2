define(function() {

	return {
		
		_prepareCommand : function(oCommandData) {
			var that = this;
			
			return this.context.service.run.getSelectedDocument().then(function(oSelectedDocument) {
				if (oSelectedDocument) {
					return oSelectedDocument.getProject().then(function(oProjectDocument) {
						oCommandData.oProjectDocument = oProjectDocument;
						oCommandData.oSelectedDocument = oSelectedDocument;
						return that.context.service.run.appcachebuster.createAppCacheBusterFile(oProjectDocument);
					});
				}
			});
		},
		
		execute : function() {
			// overriden by Run.js
		},

		isAvailable : function(oCommandData) {
			return this._prepareCommand(oCommandData).then(function() {
				return true;
			});
		},

		isEnabled : function() {
            return this.context.service.perspective.getCurrentPerspective().then(function(sPerspectiveName) {
                return (sPerspectiveName === "development" ? true : false);
            });
		}
	};
});