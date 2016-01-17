define([ "sap/watt/common/plugin/filesystem/document/FileFolderEntity" ], function(FileFolderEntity) {
	return {
		
		getRoot : function(sDAO, sVersion){
			return this.getDocument("", sDAO, sVersion);
		},

		getVersions : function(oDocument, sDAO){
			if (sDAO !== "dummy"){
				throw new Error("Wrong dao passed " + sDAO);
			}
			var oVersion = this.getVersion(oDocument, "dummyVersion", sDAO);
			var mResult = [];
			if (oVersion){
				mResult.push(oVersion);
			}
			return Q.all(mResult);
		},
		
		getVersion : function(oDocument, sVersion, sDAO){
			return this.getDocument(oDocument.getEntity().getFullPath(), sDAO, sVersion);

		},
		
		getDocument : function(sPath, sDAO, sVersion){
			if (sDAO !== "dummy"){
				throw new Error("Wrong dao passed " + sDAO);
			}
			
			var oEntity;
			if (sVersion) {
				if (sPath === "" && sVersion === "dummyVersion"){
					var oEntity = new FileFolderEntity("folder", "", null, sDAO, sVersion);
				}else{
					return null;
				}
			}else{
				switch(sPath){
				case "":
					oEntity = new FileFolderEntity("folder", "", null, sDAO);
					break;
				case "/projectFolder/aFile":
					oEntity = new FileFolderEntity("file", sPath, null, sDAO);
					break;
				case"/projectFolder":
					oEntity = new FileFolderEntity("folder", sPath, null, sDAO);
					break;
				default:
					throw new Error("Unexpected path " + sPath);
				}
			}
			
			return this.context.service.document.getDocument(oEntity).then(function(oDocument){
				return oDocument;
			});
			
		}
		
	};
});