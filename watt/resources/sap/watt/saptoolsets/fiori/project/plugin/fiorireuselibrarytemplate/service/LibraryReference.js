define(["../util/NeoAppUtil"], function(neoAppUtil) {
	var LibraryReference = {
		configure: function(mConfig) {
			this._aStyles = mConfig.styles;
			if (this._aStyles) {
				this.context.service.resource.includeStyles(this._aStyles).done();
			}
		},
		isValidForReference: function() {
			var that = this;
			return that.context.service.selection.getSelection().then(function(aSelection) {
				var sFullPath = "/";
				if (aSelection && aSelection[0]) {
					if (aSelection[0].document.getType() === "folder" && aSelection[0].document.getEntity().getFullPath() !== "") {
						sFullPath = aSelection[0].document.getEntity().getFullPath();
					}
				}
				return that.context.service.librarydevelopment.isProject(sFullPath);
			}).fail(function() {
				return false;
			});
		},

		setLibraryReference: function(libraryDetails, repositoryType, sProjectPath) {
			var that = this;
			return that.context.service.librarydevelopment.getSelectedLibraryModelObject(libraryDetails, repositoryType).then(function(libraryObject) 
			{
  				// add dependency in app descriptor,if exists (manifest.json)
				that.context.service.filesystem.documentProvider.getDocument(sProjectPath).then(function(oTargetDocument) {
				    that.context.service.ui5projecthandler.getDependencies(oTargetDocument).then(function(oDependencies) {
        			    oDependencies.libs[libraryObject.libraryName] = {"minVersion" : libraryObject.libraryNumber};
				        
        				that.context.service.ui5projecthandler.addDependencies(
                                oTargetDocument, //oDocument
                                oDependencies,//oContent
                                true //bOverWrite
                        );
				    }).fail(function(error)
				    {
				        // no manifest.json, this is OK
				    });
                });

                // add dependency in neoapp.json
				return neoAppUtil.updateNeoAppFile(libraryObject, sProjectPath, that.context).then(function() {
				 	return that.context.service.librarydevelopment.updateAppParamsInProjectSetting(sProjectPath);
				});

			});
		}
	};

	return LibraryReference;
});