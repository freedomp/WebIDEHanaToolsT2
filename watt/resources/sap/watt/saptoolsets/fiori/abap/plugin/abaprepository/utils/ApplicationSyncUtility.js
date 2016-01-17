define(["sap/watt/platform/plugin/utils/common/RemoteDocument",
		"./ABAPRepositoryConstants"],
		function(RemoteDocument,Constants) {

	
	//returns the relative path to the root(i.e AppName ) of the file/folder .. the resulting path delimiter is "/"
	var getRelativeLocalPath = function(remoteDocument, appName) {
		var localfilePathWithName = remoteDocument.getEntity().getFullPath();
		localfilePathWithName = localfilePathWithName + "/" + remoteDocument.getEntity().getName();
		return localfilePathWithName.split(appName + "/").join("");
	};

	//returns the relative path to the root(i.e AppName ) of the file/folder . the resulting path delimiter is "/"
	var getRelativeRemotePath = function(resourcesInfo, sAppName) {
		var path = resourcesInfo.path;
		path = path.split("%2f").join("/");
		var index = path.indexOf(sAppName);
		path = path.substring(index + sAppName.length + 1);
		
		return path;
	};

	//checked if the remoteDocument should be created or updated
	// returns the repsective action
	var checkForCreateOrUpdate = function(aResourcesInfo, oRemoteDocument, sAppName, sLocalAppName) {
		var relativeLocalPath = getRelativeLocalPath(oRemoteDocument, sLocalAppName);
		for (var i = 0; i < aResourcesInfo.length; i++) {
			var relativeRemotePath = getRelativeRemotePath(aResourcesInfo[i], sAppName);
			if (relativeRemotePath === relativeLocalPath) {
				return Constants.UPDATE_ACTION;
			}
		}
		return Constants.CREATE_ACTION;
	};

	var getResourcesForDeletion = function(resourcesInfo, remoteDocuments, appName, localAppName) {
		var remoteDocumentsForDeletion = [];
		var toDelete = true; //a flag if a resource should be deleted

		for (var i = 0; i < resourcesInfo.length; i++) {
			toDelete = true; // the remote resource should be deleted unless found in local array
			var relativeRemotePath = getRelativeRemotePath(resourcesInfo[i], appName);
			for (var x = 0; x < remoteDocuments.length; x++) {
				var relativeLocalPath = getRelativeLocalPath(remoteDocuments[x], localAppName);
				if (relativeRemotePath === relativeLocalPath) {
					toDelete = false;
				}
			}
			if (toDelete) { // if marked for Deletion , create a representation of remote document

				var path = "/" + resourcesInfo[i].path.split("%2f").join("/"); // relplace delimiter
				path = path.split("/" + appName).join(localAppName); // replace remote App name to local App name

				var lastSeparatorIndex = path.lastIndexOf("/"); //full path is without the file / folder name 
				if (lastSeparatorIndex !== -1) {
					path = path.substring(0, lastSeparatorIndex);
				}
				
				var parent; // undefined
				
                // here among other things, we make sure the remote document has its content url
				var remoteDocument = new RemoteDocument(resourcesInfo[i].name, resourcesInfo[i].type, "X", path, parent, resourcesInfo[i].contentUrl, resourcesInfo[i].parentContentUrl);
				remoteDocumentsForDeletion.push(remoteDocument);
			}
		}
		return remoteDocumentsForDeletion;
	};

	var _isSameResource = function(sRemoteDocumentName, sRemoteDocumentPath, oResourceInfo) {
		return sRemoteDocumentName === oResourceInfo.name && (sRemoteDocumentPath + "/" + sRemoteDocumentName) === oResourceInfo.localFullName;
	};

	//update the application object with the diff to the resourcesInfo
	var _sync = function(application, aResourcesInfo) {
		var aSyncActions = [];
		var sRemoteDocumentName;
		var sRemoteDocumentPath;
		var aRemoteDocuments = application.remoteDocuments;
		
		for (var i = 0; i < aRemoteDocuments.length; i++) {
		    // check each remoteDocument if it should be updated or created
			var res = checkForCreateOrUpdate(aResourcesInfo, aRemoteDocuments[i], application.name, application.localPath);
			
			sRemoteDocumentName = aRemoteDocuments[i].getEntity().getName();
			sRemoteDocumentPath = aRemoteDocuments[i].getEntity().getFullPath();
			for (var j = 0 ; j < aResourcesInfo.length ; j++) {
			    // find the matching resourceInfo to get its content url  and its parent content url, and set it in the remote document
			    if (_isSameResource(sRemoteDocumentName, sRemoteDocumentPath, aResourcesInfo[j])/* sRemoteDocumentName === aResourcesInfo[j].name && sRemoteDocumentPath + "/" + sRemoteDocumentName === aResourcesInfo[j].localFullName*/) { 
			        aRemoteDocuments[i].getEntity().setContentUrl(aResourcesInfo[j].contentUrl);
			        aRemoteDocuments[i].getEntity().setParentContentUrl(aResourcesInfo[j].parentContentUrl);
			        //aRemoteDocuments[i].getEntity().setParent(aResourcesInfo[j].parent);
			        break;
			    }
			}
			
			var syncAction = {
				actionType: res,
				remoteDocument: aRemoteDocuments[i]
			};

			aSyncActions.push(syncAction);
		}

		// go over the resourcesInfo and add to the application.remoteDocuments array 
		// the remoteDocuments that should be deleted
		var aRemoteDocumentsForDeletion = getResourcesForDeletion(aResourcesInfo, application.remoteDocuments, application.name, application.localPath);
		
		for (i = 0; i < aRemoteDocumentsForDeletion.length; i++) {
            syncAction = {
				actionType: Constants.DELETE_ACTION,
				remoteDocument: aRemoteDocumentsForDeletion[i]
			};

			aSyncActions.push(syncAction);
		}
		
		return aSyncActions;
	};
	
	return {
		sync: _sync,
		// Internal functions - returned for tests
		_isSameResource: _isSameResource
	};
});