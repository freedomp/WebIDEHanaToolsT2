define(["../io/Request"], function (Request) {
	
	"use strict";
	
	var MTAConverter = {
		convertFolderToModule : function(workspaceId, oFolderDocument, projectType) {
			return oFolderDocument.getProject(true).then(function (oProjectDocument) {
				var parentPath = oProjectDocument.getEntity().getFullPath();
				var folderRelativePath = oFolderDocument.getEntity().getFullPath().replace(parentPath + "/", "");
				var url = "/project/" + workspaceId + parentPath + "?path=" + folderRelativePath;

				var oData = {
						"name" : folderRelativePath,
						"type" : projectType,
						"generatorDescription": {} // TODO required due to bug
				};

				return Request.send(url, "POST", {}, oData);
			});
		},
		
		getProjectModules : function(workspaceId, sProjectPath) {
			var url = "/project/" + workspaceId + "/modules/" + sProjectPath;			
			return Request.send(url, "GET", {}, {});	
		}

	};
	
	return MTAConverter;
});