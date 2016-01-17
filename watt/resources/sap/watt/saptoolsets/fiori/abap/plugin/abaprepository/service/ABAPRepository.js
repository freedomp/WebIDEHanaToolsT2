define(["sap/watt/platform/plugin/utils/xml/XmlUtil",
        "../utils/ABAPRepositoryConstants",
		"../ui/dialog/IndexMessagesDialog",
        "../utils/DeploymentUtility",
		"sap/watt/lib/lodash/lodash",
        "sap/watt/lib/jqueryxpathplugin/jqueryXpath"],
	function(xmlUtil, Constants, IndexMessagesDialog, oDeploymentUtility, _) {

   /* eslint-disable no-use-before-define */

	var ABAPRepositoryService = function() {
		var that = this;
		var rootPath = " ";
		
        var currentDeployActionIndex = 1; 
        var totalDeployActions = 1;
		var deployInProgress = false; 
		
		var contentUrlsMap = {};
		
		var SAP_BC_UI5_UI5 = "/sap/bc/ui5_ui5";
		var HTTPS = "https";
		var DEFAULT_NAMESPACE = "sap";

		//sync method
		this.getdeployInProgress = function(){
		    return deployInProgress;
		};
		
		// Opens the deployment wizard with the given selection object
		this.openDeployWizard = function(oSelection) {
			return Q.sap.require("sap/watt/saptoolsets/fiori/abap/plugin/abaprepository/ui/wizard/DeployWizard").then(function(DeployWizard) {
	            return DeployWizard.openWizard(that.context, [oSelection]);
			}); 	
		};
		
		this.getErrorMessage = function(responseText) {
			var res = "";
			if (responseText.indexOf("<?xml") === 0) { // check if the response text is a string that represents an xml
			    var responseXml = xmlUtil.stringToXml(responseText);
                var messageTag = xmlUtil.getChildByTagName(responseXml.childNodes[0], "message");
                if (messageTag) {
                    res = messageTag.textContent;
                } else {
                    res = responseText;
                }
			} else if (responseText.indexOf("<html") === 0) { // check if the response text is a string that represents an html
				var el = $("<div></div>");
				el.html(responseText);
				var aElements = $("h1", el); // all the h1 elements
				if (aElements && aElements.length > 0) {
					res = aElements[0].innerHTML;
				} else {
					res = responseText;
				}
			} else {
               res = responseText; // sometimes the response text can be a string who's not an xml
			}
			
            return res;
        };
        
        /*
    	* Sends a request to get the resource atom feed xml
    	*/
    	var getAtomFeedXml = function(oDiscoveryStatus, sResourceName) {

            sResourceName = encodeURIComponent(sResourceName);
    		var url = oDiscoveryStatus.filestore_ui5_bsp + "/" + sResourceName;
    		
    		return Q.sap.ajax({
				type: "GET",
				url: url,
				headers: {
					"X-CSRF-Token": oDiscoveryStatus.csrfToken
				}
			});
    	};
    	
    	
    	/* Refresh the application's index after it has been deployed to the ABAP repository */
    	var refreshApplicationIndex = function(discoveryStatus) {

			// build the url to refresh the index of the application
    		var url = discoveryStatus.proxyUrlPrefix + discoveryStatus.appIndexUrl;

			return Q.sap.ajax({
				type: "POST",
				url: url,
				headers: {
					"Accept": "*/*",
					"Content-Type": "application/octet-stream",
					"X-CSRF-Token": discoveryStatus.csrfToken
				}
			});
    	};
    	
    	
    	/* Handle the application index refresh response XML.
    	 
    	   An example of a response with no messages:
    	   =========================================
         	 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
            	<asx:values>
            		<DATA>
            			<REPOSITORY>APPNAME</REPOSITORY>
            			<MESSAGES></MESSAGES>
            		</DATA>
            	</asx:values>
             </asx:abap>
    	  
    	   An example of a response with messages:
    	   ======================================
    	    <?xml version="1.0" encoding="utf-8"?>
            <asx:abap version="1.0"
                xmlns:asx="http://www.sap.com/abapxml">
                <asx:values>
                    <DATA>
                        <REPOSITORY>TEST_ESTY</REPOSITORY>
                        <MESSAGES>
                            <BAPIRET2>
                                <TYPE>W</TYPE>
                                <ID>/UI5/APP_API</ID>
                                <NUMBER>019</NUMBER>
                                <MESSAGE>SAPUI5 component ID Flights in SAPUI5 repository DANY1 is potentially invalid</MESSAGE>
                                <LOG_NO/>
                                <LOG_MSG_NO>000000</LOG_MSG_NO>
                                <MESSAGE_V1>Flights</MESSAGE_V1>
                                <MESSAGE_V2>DANY1</MESSAGE_V2>
                                <MESSAGE_V3/>
                                <MESSAGE_V4/>
                                <PARAMETER/>
                                <ROW>0</ROW>
                                <FIELD/>
                                <SYSTEM/>
                            </BAPIRET2>
                            <BAPIRET2>
                                <TYPE>W</TYPE>
                                <ID>/UI5/APP_API</ID>
                                <NUMBER>019</NUMBER>
                                <MESSAGE>SAPUI5 component ID Flights in SAPUI5 repository FLIGHTS is potentially invalid</MESSAGE>
                                <LOG_NO/>
                                <LOG_MSG_NO>000000</LOG_MSG_NO>
                                <MESSAGE_V1>Flights</MESSAGE_V1>
                                <MESSAGE_V2>FLIGHTS</MESSAGE_V2>
                                <MESSAGE_V3/>
                                <MESSAGE_V4/>
                                <PARAMETER/>
                                <ROW>0</ROW>
                                <FIELD/>
                                <SYSTEM/>
                            </BAPIRET2>
                        </MESSAGES>
                    </DATA>
                </asx:values>
            </asx:abap>
    	 
    	  Possible types:
    	  ==============
    	    S = Success
		 	I = Information
		 	A = Aborted/Canceled;
		 	W = Warning
		 	E = Error
    	 */
    	var handleApplicationIndexResponse = function(response) {
    	    var responseXmlDocument = response[0];
    	    // get messages
    		var messages = $(responseXmlDocument).xpath("//*:MESSAGES/*");
    		if (!messages || messages.length === 0) {
    		    // there are no messages
    		    // only write to the console
				that.context.service.log.info(that.context.i18n.getText("i18n", "DeployToBSPDialog_DeployLogTitle"),
        			 that.context.i18n.getText("i18n", "ABAPRepository_AppIndexInfo"), [ "user" ]).done();
        			 
    		    return;
    		} else {
                var errors = [];
				for (var i = 0; i < messages.length; i++) {
					var sTypeText = "W"; //default value - in case of no type defined for response message, display it to user as warning.
					var sLongText = ""; //default value in case of no long text defined for response message.
					var sMessageText;
					
					var oType = $(messages[i]).xpath("TYPE/text()")[0];
					if (oType) {
					    sTypeText = oType.textContent;
					}
					
					var oLongText = $(messages[i]).xpath("LONG_TEXT/text()")[0];
					if (oLongText) {
					    sLongText = oLongText.textContent;
					}
					
					var oMessageText = $(messages[i]).xpath("MESSAGE/text()")[0];
					if (oMessageText) {
					    sMessageText = oMessageText.textContent;
					}
					else {
					    switch (sTypeText) {
					        // Give general message in case of abort / error response with no message text.
					        case "A":
					            sMessageText = that.context.i18n.getText("i18n", "DeployIndexResponse_AbortedMessage");
					            break;
					        case "E":
					           sMessageText = that.context.i18n.getText("i18n", "DeployIndexResponse_ErrorMessage");
					           break;
					        default:
					            continue; // Skip this message as there is no text to display.
					    }
					}
					
                    // Display the message according to its type:
					switch (sTypeText) {
                        // If not successfull, pop up the error messages
						case "A":
						case "W":
						case "E":
                            errors.push({
                                messageType : that.context.i18n.getText("i18n", "DeployIndexResponse_Type" + sTypeText),
                                messageText : sMessageText,
								longText : sLongText
                            });
						// Anyway write message to console
						case "S":
						case "I":
                            sTypeText = that.context.i18n.getText("i18n", "DeployIndexResponse_Type" + sTypeText);
							that.context.service.log.info(sTypeText + " - " + sMessageText, [ "user" ]).done();
							break;
					}
				}
				if (errors.length > 0) {
                    IndexMessagesDialog.open(that.context, errors).done();
				}
    		}
    	};

		/*
		 * Creates the application on the ABAP Repository system.
		 */
		this.createApplication = function(oDiscoveryStatus, oApplication) {
		    
             //set deployInProgress to true
            deployInProgress = true;
            currentDeployActionIndex = 1;
            totalDeployActions = oApplication.remoteDocuments.length;
			if (oDiscoveryStatus.filestore_ui5_bsp) {
                // sends the first POST request to create the root folder 
                // it returns the root atom feed - from it we extract the 'base url', 'content url' and 'app index url'
				return that.postFolder(rootPath, oApplication.name, oDiscoveryStatus, oApplication).then(function(aResponse) {
				    
			        var appAtomFeedXml = aResponse[0];
			        
			        // get the xml:base url from the atom feed and save it in the 'discovery status' object.
			        var sXmlBaseValue = oDeploymentUtility.getXmlBaseUrl(appAtomFeedXml);
			        oDiscoveryStatus.xmlBaseValue = sXmlBaseValue;
			        
			        // get the content url of the element and set it in the content urls map
			        var sContentUrl = oDeploymentUtility.getContentUrl(appAtomFeedXml, sXmlBaseValue);
			        contentUrlsMap.root = sContentUrl;
			        
			        // get the application index url from the atom feed and save it in the 'discovery status' object.
			        // If not found it means the selected ABAP system does not provide this functionality 
			        // or some error has occurred.
			        var sAppIndexUrl = oDeploymentUtility.getAppIndexUrl(appAtomFeedXml, sXmlBaseValue);
			        oDiscoveryStatus.appIndexUrl = sAppIndexUrl;
			        
			        var aRemoteFolders = getFolders(oApplication.remoteDocuments);
					// create folders
					return recursivePostFolder(aRemoteFolders, 0, oDiscoveryStatus, oApplication).then(function() {
					    
						// send the other POST requests for all files
						var aRemoteFiles = getFiles(oApplication.remoteDocuments);
						return recursiveFileAction(aRemoteFiles, 0, oDiscoveryStatus, oApplication).then(function() {
						    
                            // check if app index is supported
							if (oDiscoveryStatus.appIndexUrl) {
								return refreshApplicationIndex(oDiscoveryStatus).then(function(response) {
									return handleApplicationIndexResponse(response);
								});
							}
							
							return Q();
						});
					});
				}).catch(function(e) {
				    deployInProgress = false;
				    var errorMessage;
				    if (e.responseText) {
				        // parse the responseText to get the exact error message
				        errorMessage = that.getErrorMessage(e.responseText); 
				    } else {
				        errorMessage = e.message;
				    }
			    	
        			that.context.service.log.error(that.context.i18n.getText("i18n", "DeployToBSPDialog_DeployLogTitle"),
        			             that.context.i18n.getText("i18n", "DeployWizard_FileError2",  [oApplication.name , errorMessage]), [ "user" ]).done();
        			
        			var eToReject = {message:that.context.i18n.getText("i18n", "DeployWizard_FileError2",  [oApplication.name , errorMessage])};
        			// report deployment errors	
			        that.context.service.usagemonitoring.report("deployment", "deploy_to_abap", errorMessage).done();
				    return Q.reject(eToReject);
                });
			}

			throw new Error(that.context.i18n.getText("i18n", "ABAPRepositoryService_DeployFailed_filestoreui5bspNotFound"));
		};
		
		var recursivePostFolder = function(aRemoteFolders, index, discoveryStatus, application) {
		    var sContentUrl;
		    
			if (!index) {
				index = 0;
			}

			if (index < aRemoteFolders.length) {
                
				// get the remote document folder name
				var remoteDocumentName = aRemoteFolders[index].getEntity().getName();
				// get the path of the remote document
				var remoteDocumentFullPath = aRemoteFolders[index].getEntity().getFullPath();
				// get the remote document folder parent
				var remoteDocumentParent = aRemoteFolders[index].getEntity().getParent();
				// get the parent path of the remote document
				var remoteDocumentParentPath = aRemoteFolders[index].getEntity().getParentPath();
				
				if (remoteDocumentParent) {
				    sContentUrl = contentUrlsMap[remoteDocumentParentPath + "/" + remoteDocumentParent];
				    if (!sContentUrl) { // if a folder is created as part of the update process, the contentsUrlMap isn't filled with this data.
				        // but we have its parent name, so we search the new folder's parent content url in all remote documents
				        sContentUrl = that.findParentContentUrl(application, remoteDocumentParent);
				    }
				} else {
				    sContentUrl = contentUrlsMap.root;
				}
                
                //report progress
                reportProgress(remoteDocumentName, currentDeployActionIndex, totalDeployActions);
                currentDeployActionIndex = currentDeployActionIndex + 1;
                
				// create the folder and get its atom feed xml
				return that.postFolder(sContentUrl, remoteDocumentName, discoveryStatus, application).then(function(aResponse) {
				    var appAtomFeedXml = aResponse[0];  
				    
				    // get the content url of the element from the atom feed
			        sContentUrl = oDeploymentUtility.getContentUrl(appAtomFeedXml, discoveryStatus.xmlBaseValue);
			        
			        contentUrlsMap[remoteDocumentFullPath + "/" + remoteDocumentName] = sContentUrl;
				    
					var nextIndex = index + 1;
					return recursivePostFolder(aRemoteFolders, nextIndex, discoveryStatus, application);
				});
			}

			return Q();
		};
		
		var getFileExtension = function(name){
		    var sExtension = "";
			var index = name.lastIndexOf(".");
			if (index > 0) {
				sExtension = name.substr(index + 1);
			}
			return sExtension;
		};
		
		var isBinaryFile = function(name) {
			switch (getFileExtension(name).toLowerCase()) {
			case "jpg":
			case "jpeg":
			case "gif":
			case "ico":
			case "png":
			case "ttf":
			case "zip":
			case "jar":
			case "war":
			case "bmp":
			case "tif":
			case "tiff":
				return true;

			default:
				return false;
			}
		};

		var recursiveFileAction = function(aRemoteFiles, index, discoveryStatus, application, actionType) {
			if (!index) {
				index = 0;
			}
			
			var sContentUrl;
			
            if (!actionType) {
                actionType = Constants.CREATE_ACTION;
            }
            
			if (index < aRemoteFiles.length) {
			    
                // get the remote document (file) name
				var remoteDocumentName = aRemoteFiles[index].getEntity().getName();
				// get the path of the remote document
				var remoteDocumentFullPath = aRemoteFiles[index].getEntity().getFullPath();
				// get the remote document (file) parent
				var remoteDocumentParent = aRemoteFiles[index].getEntity().getParent();
				// get the parent path of the remote document
				var remoteDocumentParentPath = aRemoteFiles[index].getEntity().getParentPath();
				// get the remote document (file) content url
				var remoteDocumentContentUrl = aRemoteFiles[index].getEntity().getContentUrl();
				
				if (actionType === Constants.UPDATE_ACTION) { // if the action is "update", the remote document has its content url from the resourceInfo
				    sContentUrl = remoteDocumentContentUrl;
				} else if (remoteDocumentParent) {
				    sContentUrl = contentUrlsMap[remoteDocumentParentPath + "/" + remoteDocumentParent];
				    if (!sContentUrl) { // if a file is created as part of the update process, the contentsUrlMap isn't filled with this data.
				        // but we have its parent name, so we search the new file's parent content url in all remote documents
				        sContentUrl = that.findParentContentUrl(application, remoteDocumentParent);
				    }
				} else {
				    sContentUrl = contentUrlsMap.root;
				}
				
				//TODO: use isBinary of document 
				var isBinary = isBinaryFile(remoteDocumentName);
                var encoding = "UTF-8";
                
                //report progress
                reportProgress(remoteDocumentName,currentDeployActionIndex,totalDeployActions);
                
                currentDeployActionIndex = currentDeployActionIndex + 1;
				return aRemoteFiles[index].getContent().then(function(content) {
					
					var nextIndex;
					
					if ((typeof content === "string") && content.trim() === "") { //do not deploy empty files but don't fail entire deployment
						that.context.service.log.error(
							that.context.i18n.getText("i18n", "DeployToBSPDialog_DeployLogTitle"),
							that.context.i18n.getText("i18n", "DeployWizard_FileError", [aRemoteFiles[index].getEntity().getName()]), ["user"]).done();
							
						nextIndex = index + 1;
						return recursiveFileAction(aRemoteFiles, nextIndex, discoveryStatus, application);
					}
					
					if (actionType === Constants.UPDATE_ACTION) { // the promise to update the folder using a POST request
					    return putFile(sContentUrl, content, encoding, isBinary, discoveryStatus, application).then(function() {
    						nextIndex = index + 1;
    						return recursiveFileAction(aRemoteFiles, nextIndex, discoveryStatus, application, actionType);
    					});
					} else {// the promise to create the folder using a PUT request
    					return that.postFile(sContentUrl, remoteDocumentName, content,encoding, isBinary, discoveryStatus, application).then(function(aResponse) {
    					    var appAtomFeedXml = aResponse[0];  
        				    // get the content url of the element from the atom feed
        			        sContentUrl = oDeploymentUtility.getContentUrl(appAtomFeedXml, discoveryStatus.xmlBaseValue);
        			        contentUrlsMap[remoteDocumentFullPath + "/" + remoteDocumentName] = sContentUrl;
    					    
    						nextIndex = index + 1;
    						return recursiveFileAction(aRemoteFiles, nextIndex, discoveryStatus, application, actionType);
    					});
					}
				});
			}
			
            deployInProgress = false;
			return Q();
		};
		
		this.findParentContentUrl = function(application, sParentName) {
			var oRemoteDocument;
			for (var n = 0; n < application.remoteDocuments.length; n++) {
				oRemoteDocument = application.remoteDocuments[n];
				if (oRemoteDocument.getEntity().getName() === sParentName) {
					return oRemoteDocument.getEntity().getContentUrl();
				}
			}
		};

		this.postFolder = function(sContentUrl, sName, discoveryStatus, oApplication) {

			var sType = "folder";
			var bIsBinary = false;
			var sDevclass = oApplication.package;
			
			// build the url to create the folder
			var sPostPath;
			
			if (sContentUrl === " ") { // check if this is the root element
			    sPostPath = discoveryStatus.filestore_ui5_bsp + "/" + sContentUrl + "/content";
			} else {
			    sPostPath = discoveryStatus.proxyUrlPrefix + sContentUrl;
			}
			
			//build the parameters for the url
			var oParameters = {};
			oParameters.type = sType;
			oParameters.name = sName;
			oParameters.isBinary = bIsBinary;
			oParameters.devclass = sDevclass;
			
			if (oApplication.transport) {
			    oParameters.corrNr = oApplication.transport;
			}

			if (!oApplication.description) {
				oApplication.description = "";
			}

			// if root - add description parameter
			if (sContentUrl === " ") {
			    oParameters.description = oApplication.description;
			}
			
			// add the parameters to the url
			sPostPath = URI(sPostPath).search(oParameters).toString(); // the 'search' method also encodes the URI components so no need to do it manually

			// send the request
			return Q.sap.ajax({
				type: "POST",
				url: sPostPath,
				headers: {
					"Accept": "*/*",
					"Content-Type": "application/octet-stream",
					"X-CSRF-Token": discoveryStatus.csrfToken
				}
			});
		};

        /*
        * filterBy (optional) - could have a value of an action to filter by i.e. "create"/"update"/"delete"
        */
		var getFolders = function(remoteDocuments,filterBy) {
			var folders = [];
			// go over all remote documents
			jQuery.each(remoteDocuments, function(iIndex, remoteDocument) {
				// check if folder
				if (remoteDocument.getEntity().getType() === "folder") {
				    if (filterBy){
				        if (filterBy === remoteDocument.action) {
				            folders.push(remoteDocument);    
				        }
				    } else {
				        folders.push(remoteDocument);
				    }
				}
			});
			return folders;
		};

       /*
        * filterBy (optional) - could have a value of an action to filter by i.e. "create"/"update"/"delete" or a filter function
        */
		var getFiles = function(remoteDocuments,filterBy) {
            var files;
			if (filterBy){ //  passed value could be a functions
			    if (jQuery.isFunction(filterBy)){
			        files = remoteDocuments.filter(function(remoteDocument){ //filter out non files
			            return (remoteDocument.getEntity().getType() === "file");
			        });
			        return files.filter(filterBy);//filter files using filterBy Function
			    } else {
			          files =  remoteDocuments.filter(function(remoteDocument){//filter out non files
    			        return (remoteDocument.getEntity().getType() === "file"); 
    			      });
    			      return files.filter(function(remoteDocument){ // passes filterBy value should be eq to action
    			        return (remoteDocument.action === filterBy);
    			      });
			    }    
			} else { 
			    return remoteDocuments.filter(function(remoteDocument){//filter out non files
			        return (remoteDocument.getEntity().getType() === "file");
			    });
			}
		};
		
		/*
		* syncActions - array of syncActions
		* type - file / folder
		* filterBy - could have a value of an action to filter by i.e. "create"/"update"/"delete" or a filter function
		* Returns Filtered Actiones
		*/
		var filterActiones = function(syncActions , type , filterBy){
		    var actions;
			if (filterBy){ //  passed value could be a functions
			    if (jQuery.isFunction(filterBy)) {
			        actions = syncActions.filter(function(action){ //filter by type
			            return (action.remoteDocument.getEntity().getType() === type);
			        });
			        return actions.filter(filterBy); //filter actions using filterBy Function
			    } else {
			          actions =  syncActions.filter(function(action){//filter by type
    			        return (action.remoteDocument.getEntity().getType() === type); 
    			      });
    			      return actions.filter(function(action){ // passed filterBy value should be eq to action
    			        return (action.actionType === filterBy);
    			      });
			    }    
			} else { 
			    return syncActions.filter(function(action){//filter by type
			        return (action.remoteDocument.getEntity().getType() === type);
			    });
			}
		};
		
		/*
		* syncActions - array of syncAction
		* type - file / folder
		* filterBy - could have a value of an action to filter by i.e. "create"/"update"/"delete" or a filter function
		*  Returns  filtered Resources Array
		*/
		var getResourcesByAction = function(syncActions , type , filterBy) {
		    var filteredActiones = filterActiones(syncActions , type , filterBy);
		    var resources = [];
		    for (var i = 0; i < filteredActiones.length; i++) {
		        resources.push(filteredActiones[i].remoteDocument);
		    }
		    return resources;
		};

		this.postFile = function(sContentUrl, sName, content, charset, isBinary, discoveryStatus, application) {
		    
			// build the url to create the file
			var sPostFilePath = discoveryStatus.proxyUrlPrefix + sContentUrl;
			
			//build the parameters for the url
			var oParameters = {};
			oParameters.type = "file";
			oParameters.name = sName;
			oParameters.isBinary = isBinary;
			oParameters.devclass = application.package;
			oParameters.charset = charset;
			
			if (application.transport) {
			    oParameters.corrNr = application.transport;
			}

			// add the parameters to the url
			sPostFilePath = URI(sPostFilePath).search(oParameters).toString(); // the 'search' method also encodes the URI components so no need to do it manually
		    
			return Q.sap.ajax({
				type: "POST",
				url: sPostFilePath,
				data: content,
				processData: false,
				headers: {
					"Accept": "*/*",
					"Content-Type": "application/octet-stream",
					"processData": false,
					"X-CSRF-Token": discoveryStatus.csrfToken
				}
			});
		};

        var putFile = function(sContentUrl, content, charset, isBinary, discoveryStatus, application) {
			
			// build the url to create the file
			var sPutFilePath = discoveryStatus.proxyUrlPrefix + sContentUrl;
			
			//build the parameters for the url
			var oParameters = {};
			oParameters.isBinary = isBinary;
			oParameters.charset = charset;
			
			if (application.transport) {
			    oParameters.corrNr = application.transport;
			}

			// add the parameters to the url
			sPutFilePath = URI(sPutFilePath).search(oParameters).toString(); // the 'search' method also encodes the URI components so no need to do it manually
			
			return Q.sap.ajax({
				type: "PUT",
				url: sPutFilePath,
				data: content,
				processData: false,
				headers: {
					"Accept": "*/*",
					"Content-Type": "application/octet-stream",
					"processData": false,
					"X-CSRF-Token": discoveryStatus.csrfToken,
					"If-Match": "*"
				}
			});
		};
		
		this.deleteResource = function(sContentUrl, oDiscoveryStatus, oApplication, bDeleteChildren) {
            deployInProgress = true;
            
            var oParameters = {};
			
			if (bDeleteChildren) {
			    oParameters.deleteChildren = "true";
			}

            if (oApplication.transport) {
		    	oParameters.corrNr = oApplication.transport;
	    	}
	    	
	    	// add the parameters to the url
	    	sContentUrl = URI(sContentUrl).search(oParameters).toString(); // the 'search' method also encodes the URI components so no need to do it manually

			// send the request
			return Q.sap.ajax({
				type: "DELETE",
				url: sContentUrl,
				headers: {
					"Accept": "*/*",
					"Content-Type": "application/octet-stream",
					"X-CSRF-Token": oDiscoveryStatus.csrfToken,
					"If-Match": "*"
				}
			}).then(function(/*response*/) {
			    deployInProgress = false;
                return Q();
            }).catch(function(e) {
                deployInProgress = false;
                return Q(e); 
            });
		};
		
		var reportProgressDelete = function(filename, currentFileIndex, totalFiles) {
		    // report to console
			that.context.service.log.info("Deploy to SAPUI5 ABAP Repository",
				that.context.i18n.getText("i18n", "Command_msg_report_delete",
				[ filename, currentFileIndex, totalFiles ]), ["user"]).done();
		};
		
		var recursiveDeleteResources = function(aRemoteDocuments, index, discoveryStatus, oApplication) {
			if (!index) {
				index = 0;
			}
			
            var bDeleteChildren = false;
            
			if (index < aRemoteDocuments.length) {
			
			    // get the name of the remote document
    			var remoteDocumentName = aRemoteDocuments[index].getEntity().getName();
			        
				if (aRemoteDocuments[index].getEntity().getType() === "folder"){
				    bDeleteChildren = true;
				}
				
				// get the content url of the specific remote document
				var sContentUrl = aRemoteDocuments[index].getEntity().getContentUrl();
				sContentUrl = discoveryStatus.proxyUrlPrefix + sContentUrl;
				
                //report progress
                reportProgressDelete(remoteDocumentName, currentDeployActionIndex ,totalDeployActions);
                currentDeployActionIndex = currentDeployActionIndex + 1;
                
                // delete the resource: send DELETE request to its content url
				return that.deleteResource(sContentUrl, discoveryStatus, oApplication, bDeleteChildren).then(function() {
					var nextIndex = index + 1;
					return recursiveDeleteResources(aRemoteDocuments, nextIndex, discoveryStatus, oApplication);
				});
			}
			
            deployInProgress = false;
			return Q();
		};
		
		
		var getTotaslSyncActionsLength = function(syncActions) {
		    var foldersToUpdate = getResourcesByAction(syncActions,"folder",Constants.UPDATE_ACTION);
		    // we do not send update for folders hence filter out the folders to update actions
		    return syncActions.length - foldersToUpdate.length;
		};
		
		
		this.updateApplication  = function(discoveryStatus, oApplication, syncActions) {
    	    deployInProgress = true;
    	    currentDeployActionIndex = 1;
    	    // get the number of operations for the progress report in the console
    	    totalDeployActions = getTotaslSyncActionsLength(syncActions);
    	    
    	    if (discoveryStatus.filestore_ui5_bsp) {
    	        
	            //get the list of files to delete
        	    var aFileRemoteDocumentsToDelete = getResourcesByAction(syncActions, "file", Constants.DELETE_ACTION);
        	    // delete the files
        	    return recursiveDeleteResources(aFileRemoteDocumentsToDelete, 0, discoveryStatus, oApplication).then(function() {
        	       // get the list of folders to delete
        	       var aFolderRemoteDocumentsToDelete = getResourcesByAction(syncActions,"folder",Constants.DELETE_ACTION);
        	       // delete the folders
        	       return recursiveDeleteResources(aFolderRemoteDocumentsToDelete, 0, discoveryStatus, oApplication).then(function() {
        	           
            	       // recursively iterate over folders and create the ones with "create" action.
            	       var aFolderRemoteDocumentsToCreate = getResourcesByAction(syncActions,"folder",Constants.CREATE_ACTION);
            	       
            	       return getAtomFeedXml(discoveryStatus, oApplication.name).then(function(aResponse) {
            	           var appAtomFeedXml = aResponse[0];
            	           
            	           // get the xml:base url from the atom feed and save it in the 'discovery status' object.
        			       var sXmlBaseValue = oDeploymentUtility.getXmlBaseUrl(appAtomFeedXml);
        			       discoveryStatus.xmlBaseValue = sXmlBaseValue;
        			       
        			       var sContentUrl = oDeploymentUtility.getContentUrl(appAtomFeedXml, sXmlBaseValue);
        			       contentUrlsMap.root = sContentUrl;
        			       
        			       // get the application index url from the atom feed and save it in the 'discovery status' object.
        			       // If not found it means the selected ABAP system does not provide this functionality 
        			       // or some error has occurred.
        			       var sAppIndexUrl = oDeploymentUtility.getAppIndexUrl(appAtomFeedXml, sXmlBaseValue);
        			       discoveryStatus.appIndexUrl = sAppIndexUrl;
        			       
            	           // create the folders
                	       return recursivePostFolder(aFolderRemoteDocumentsToCreate, 0, discoveryStatus, oApplication).then(function() {
                	           // recursively iterate over files and create the ones with "create" action.
                	           var aFileRemoteDocumentsToCreate = getResourcesByAction(syncActions,"file",Constants.CREATE_ACTION);
            			       return recursiveFileAction(aFileRemoteDocumentsToCreate, 0, discoveryStatus, oApplication,Constants.CREATE_ACTION).then(function() {
            			           
            			            // recursively iterate over files and update the once with "update"(put) action  
                			        var aFileRemoteDocumentsToUpdate = getResourcesByAction(syncActions,"file",Constants.UPDATE_ACTION);    
                                    return recursiveFileAction(aFileRemoteDocumentsToUpdate, 0, discoveryStatus, oApplication,Constants.UPDATE_ACTION).then(function() {
                                        
                                        // check if app index is supported
            							if (discoveryStatus.appIndexUrl) {
            								return refreshApplicationIndex(discoveryStatus).then(function(response) {
            									return handleApplicationIndexResponse(response);
            								});
            							}
            			            });
                	           });
            	            });
            	       });
            	    }).catch(function(e) {
    				    deployInProgress = false;
    				    var errorMessage;
            			
            			if (e.responseText) {
            			    // parse the responseText to get the exact error message
    				        errorMessage = that.getErrorMessage(e.responseText); 
    				    } else {
    				        errorMessage = e.message;
    				    }
            			
            			that.context.service.log.error(that.context.i18n.getText("i18n", "DeployToBSPDialog_DeployLogTitle"),
            			             that.context.i18n.getText("i18n", "DeployWizard_FileError2",  [oApplication.name , errorMessage]), [ "user" ]).done();
            			var eToReject = {message:errorMessage};
            			
            			that.context.service.usagemonitoring.report("deployment", "deploy_to_abap", errorMessage).done();
    				    return Q.reject(eToReject);
                    }); 
        	    });
    	  }
		};

		this.getApplications = function(discoveryStatus) {

			if (discoveryStatus.filestore_ui5_bsp) {
				var path = discoveryStatus.filestore_ui5_bsp + "?path";

				return Q.sap.ajax({
					url: path,
					dataType: "xml", 
					cache: false
				}).then(function(response) {
					var applications = [];

					if (response[0] === null) {
						return applications;
					}

					var children = xmlUtil.firstElementChild(response[0]).childNodes;

					for (var i = 0; i < children.length; i++) {
						var entry = children[i];
						if (entry.tagName === "atom:entry") {

							if (entry.hasChildNodes()) {

								var application = {};

								application.id = xmlUtil.getChildNodeValue(entry, "atom:id");
								application.title = xmlUtil.getChildNodeValue(entry, "atom:title");
								application.summary = xmlUtil.getChildNodeValue(entry, "atom:summary");

								applications.push(application);
							}
						}
					}

					return applications;
				});
			}

			throw new Error(that.context.i18n.getText("i18n", "ABAPRepositoryService_DeployFailed_filestoreui5bspNotFound"));
		};

		/*
		 * Get the given project's project.json file and returns the "deploy" block if exists.
		 */
		this.getDeploymentSettings = function(oProjectDoc) {

			if (!oProjectDoc || !oProjectDoc.getEntity()) {
				return null;
			}

			return that.context.service.setting.project.getProjectSettings("deploy", oProjectDoc).then(function(oSetting) {
				if (oSetting) {
					return oSetting;
				} else {
					return null;
				}
			}).fail(function(oError) {
				if (oError.message === "INVALID_JSON_FORMAT") {
					// the project json is not valid
					throw new Error(that.context.i18n.getText("i18n", "Command_invalidProjectJson"));
				} else {
					throw oError;
				}
			});
		};
		
		this.getAppNamespace = function(sAppName) {
			var sNamespace = DEFAULT_NAMESPACE;

			if (sAppName.lastIndexOf("/") === (sAppName.length - 1)) { // remove "/" in the end
				sAppName = sAppName.substring(0, sAppName.length - 1);
			}

			if (sAppName.indexOf("/") === 0) { // remove "/" in the beginning
				sAppName = sAppName.substring(1);
			}

			if (sAppName.lastIndexOf("/") > -1) { // if there is "/" now it means there's a namespace
				var aNames = sAppName.split("/");
				sNamespace = aNames[0];
			}
			
			return sNamespace;
		};
		
		/*
		 * Verify against the backend if the given app is deployed or not,
		 * by extracting the app name from the project.json and sending a request to the backend to get its Atom Feed.
		 * Then if it's deployed, get the application's deployment details.
		 *
		 * If deployed - returns the application's deployment details.
		 * If not deployed - returns undefined.
		 */
		this.getDeploymentInfo = function(oProjectDocument) {
			if (!oProjectDocument) {
				return;
			}
			
			var sAppName;

			/* eslint-disable consistent-return */

			// get the deployed app name from the project.json
			return this.context.service.abaprepository.getDeploymentSettings(oProjectDocument).then(function(oSettings) {
				if (oSettings && oSettings.name && oSettings.destination) { // "deploy" block exists in project.json
					// get the deployed app name
					sAppName = oSettings.name;

					// get all destinations that match to the system name taken from project.json
					// (there's a destination for each usage)
					return that.context.service.destination.getDestination(oSettings.destination).then(function(aDestinations) {
						var oDestination = null;
						// locate the destination with the "dev_abap" usage
						oDestination = _.find(aDestinations, function(oEachDestination) {
							var sUsage = oEachDestination.wattUsage;
							if (sUsage === "dev_abap") {
								return true;
							}
						});

						if (oDestination) {
							var sUrl = oDestination.proxyUrlPrefix + "/sap/bc/adt/filestore/ui5-bsp/objects"; // MK: Hardcoded to save the call for the discovery.xml. We prefer good performance on code stability.
							var oParameters = {};
							oParameters.path = sAppName;
							/* eslint-disable new-cap */
							sUrl = URI(sUrl).search(oParameters).toString(); // the 'search' method also encodes the URI components so no need to do it manually
				    		/* eslint-enable new-cap */
				    		
				    		// send a request to get the application's Atom feed from the backend.
				    		// if exists - the app is deployed
				    		return Q.sap.ajax({
								type: "GET",
								url: sUrl
							}).then(function(aResponse) {
								if (aResponse && aResponse[0]) {
									// the app is deployed! Get its deployment details
									return that.getDeploymentDetails(sAppName, oDestination);
								}
							}).fail(function(oError) {
								// log the error and return undefined as if the app isn't deployed
								var sErrorMessage;
								if (oError.responseText) {
							        // parse the responseText to get the exact error message
							        sErrorMessage = that.getErrorMessage(oError.responseText); 
							    } else {
							        sErrorMessage = oError.message;
							    }
							    
								that.context.service.log.error(that.context.i18n.getText("i18n", "ApplicationStatus_LogTitle"),
				        			that.context.i18n.getText("i18n", "ApplicationStatus_GetAtomFeedFailed",  [sAppName , sErrorMessage]), [ "user" ]).done();
							});
						} else {
							// could not find any destination as mentioned in the project.json.
							// log it and continue as if the application isn't deployed (return undefined)
							that.context.service.log.error(that.context.i18n.getText("i18n", "ApplicationStatus_LogTitle"),
				        			that.context.i18n.getText("i18n", "ApplicationStatus_GetDestination",  [oSettings.destination]), [ "user" ]).done();
						}
					});
				}
			});

			/* eslint-enable consistent-return */
		};
		
		/* 
		 * Sends a request for transportchecks to get the app's package.
		 * Returns an object with the deployed application's name and package.
		 */
		this.getDeploymentDetails = function(sAppName, oDestination) {
			var oDeployedAppInfo;
			
			if (!sAppName || !oDestination) {
				return;
			}

			/* eslint-disable consistent-return */

			return this.context.service.transport.getApplicationInfo(sAppName, oDestination).then(function(oAppInfo) {
				oDeployedAppInfo = oAppInfo;
				oDeployedAppInfo.destination = oDestination.name;
				oDeployedAppInfo.name = sAppName;
				oDeployedAppInfo.package = oAppInfo.packageValue;
				
				return oDeployedAppInfo;
			}).fail(function(oError) {
				if (oError.jqXHR && oError.jqXHR.status && oError.jqXHR.status === 404) {
					// missing transportchecks service - handle app as if deployed to local package
					oDeployedAppInfo = {};
					oDeployedAppInfo.destination = oDestination.name;
					oDeployedAppInfo.name = sAppName;
					oDeployedAppInfo.package = "$TMP"; // same as we do in the deployment flow
					
					return oDeployedAppInfo;
				} else {
					// log the error and return undefined as if the app isn't deployed
					that.context.service.log.error(that.context.i18n.getText("i18n", "ApplicationStatus_LogTitle"),
        				that.context.i18n.getText("i18n", "ApplicationStatus_GetAppInfoFailed",  [sAppName , oError.message]), [ "user" ]).done();
				}
			});

			/* eslint-enable consistent-return */
		};
		
		var reportProgress = function(filename, currentfileIndex, totalFiles) {
		    // report to console
			that.context.service.log.info("Deploy to SAPUI5 ABAP Repository",
				that.context.i18n.getText("i18n", "Command_msg_report",
				[ filename, currentfileIndex, totalFiles ]), ["user"]).done();
		};
		
		this.updateProjectJsonWithDeploy = function(applicationName, projectPath, destination) {
			return that.context.service.filesystem.documentProvider.getDocument(projectPath).then(function(oDocument) {
				var oSetting = {};
				oSetting.destination = destination.name;
				oSetting.name = applicationName;
				return that.context.service.setting.project.setProjectSettings("deploy", oSetting, oDocument);
			});
		};
		
		this.getAtoSettings = function(ato_settings) {
			var path = ato_settings;
			return Q.sap.ajax({
				url: path,
				dataType: "xml", 
				cache: false
			}).then(function(response) {
			    var entry = xmlUtil.firstElementChild(response[0]);
				if (entry.tagName === "ato:settings") {
					var settings = {};
					settings.packageName = entry.getAttribute("developmentPackage");
					settings.prefixName = entry.getAttribute("developmentPrefix");
					settings.operationsType = entry.getAttribute("operationsType");
					settings.isExtensibilityDevSystem = entry.getAttribute("isExtensibilityDevelopmentSystem");
					return settings;
				}
			});
		};
		
		this.parseDependenciesResponse = function(oResponse, sAppNamespace) {
			var aDependencies = [];
			if (oResponse && sAppNamespace && sAppNamespace.length > 0) {
				var oApp = oResponse[sAppNamespace];
				if (oApp) {
					var aAllDependencies = oApp.dependencies;
					if (aAllDependencies && aAllDependencies.length > 0) {
						// extract only the dependencies that has a value in their URL,
						// and aren't the app component itself
						aDependencies = _.remove(aAllDependencies, function(oDependency) {
							return ((oDependency.url.length > 0) && (oDependency.id !== sAppNamespace));
						});
					}
				}
			}
			
			return aDependencies;
		};
		
		var buildDependencyRoute = function(oSystem, oDependency) {
			var sDependencyId = oDependency.id;
			// convert every . to /
			sDependencyId = sDependencyId.split(".").join("/");
			
			var oNewDependency = {
				"path" : "/resources/" + sDependencyId,
				"target" :{
					"type" : "destination",
					"name" : oSystem.name,
					"entryPath" : oDependency.url,
					"preferLocal": true
				},
				"description": sDependencyId + " Reuse Library"
			};
			
			return oNewDependency;
		};
		
		var sendRequestForDependencies = function(oSystem, sAppNamespace) {
			var APP_INDEX_URL = "/sap/bc/ui2/app_index/ui5_app_info"; // Hardcoded because there's no place we can take it from (no discovery)
			
			var sUrl = oSystem.proxyUrlPrefix + APP_INDEX_URL;
			
			var oParameters = {};
			oParameters.id = sAppNamespace; // add the application namespace as a parameter
			if (oSystem.sapClient && oSystem.sapClient.length > 0) {
				// add the sap-client id exists
				oParameters["sap-client"] = oSystem.sapClient;
			}
			
			/* eslint-disable new-cap */
			sUrl = URI(sUrl).search(oParameters).toString();
    		/* eslint-enable new-cap */
    		
    		// send a request to get the application's dependencies from the backend
    		return Q.sap.ajax({
				type: "GET",
				url: sUrl
			});
		};
		
		this.getDependenciesAsNeoappRoutes = function(oSystem, sAppNamespace) {
			var aDependenciesAsNeoappRoutes = [];
			
			if (!oSystem || !sAppNamespace || sAppNamespace.length === 0) {
				return aDependenciesAsNeoappRoutes;
			}
			
			return that.getDependencies(oSystem, sAppNamespace).then(function(aDependencies) {
				var oDependency;
				for (var i = 0 ; i < aDependencies.length ; i++) {
					// build neo-app route out of every dependency
					oDependency = buildDependencyRoute(oSystem, aDependencies[i]);
					aDependenciesAsNeoappRoutes.push(oDependency);
				}
				
				return aDependenciesAsNeoappRoutes;
			});
		};
		
		this.getDependencies = function(oSystem, sAppNamespace) {
			var aDependencies = [];
			
			if (!oSystem || !sAppNamespace || sAppNamespace.length === 0) {
				return aDependencies;
			}
			
			// send a request for the app index service from ABAP
			return sendRequestForDependencies(oSystem, sAppNamespace).then(function(aResponse) {
				if (aResponse && aResponse.length > 0) {
					aDependencies = that.parseDependenciesResponse(aResponse[0], sAppNamespace);
				}
				
				return aDependencies;
			});
		};
	};

	return ABAPRepositoryService;
	/* eslint-enable no-use-before-define */
});