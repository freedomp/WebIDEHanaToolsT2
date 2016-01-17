define([ "sap/watt/common/plugin/filesystem/document/FileFolderEntity" ], function(FileFolderEntity) {
	return {
		
		getRoot : function(sDAO){
			var oEntity = new FileFolderEntity("folder", "", null, sDAO, "");
			oEntity.setBackendData(this._content);
			return this.context.service.document.getDocument(oEntity);
		},
		
		getFolderContent : function(){
			return [];
		},
		
		getDocument : function(sPath, sDAO){
			
			var oEntity;
			switch(sPath){
			case "/projectFolder/aFile":
				oEntity = new FileFolderEntity("file", sPath, null, sDAO);
				break;
			case"/projectFolder":
				oEntity = new FileFolderEntity("folder", sPath, null, sDAO);
				break;
			default:
				throw new Error("Unexpected path " + sPath);
			}
			
			return this.context.service.document.getDocument(oEntity).then(function(oDocument){
				return oDocument;
			});
			
		}
		
	};
});