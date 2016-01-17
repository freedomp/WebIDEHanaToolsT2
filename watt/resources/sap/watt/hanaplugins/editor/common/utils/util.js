define(["sap/watt/ideplatform/che/plugin/chebackend/dao/File","sap/watt/ideplatform/che/plugin/chebackend/service/XS2ServicesDAO"], function(FileService,XS2ServicesDAO) {
    return {
    	/*
    	 * fCallBack: requires a function to call back after success fully getting namespace 
    	 * oDocument: document object to read the file path or folder path.
    	 * 
    	 * */
    	
        getNamespaceWithDocument: function(fCallback, oDocument) {
            if (oDocument) {
            	var names;
            	 if(oDocument.getType() === "file"){
            	   var fullName = oDocument.getEntity().getBackendData().getContentUrl();
                   names = fullName.split("/");
            	 }else{
            	 var folderPath = folderDocument.getEntity().getBackendData().getProjectUrl();
                 var locationUrl = folderDocument.getEntity().getBackendData().getLocationUrl();
                 var projectPath = folderPath.substring(0,folderPath.indexOf(locationUrl));
                 var fullFilePath = projectPath + "/file" + locationUrl;
                 names = fullFilePath.split("/");
            	 }
            	 
                var srcFolderPath;
                if (names && names.length > 2) {
                    for (var i = 1; i < (names.length - 1); i++) {
                        if (names[i] !== "src") {
                            if (srcFolderPath){
                                srcFolderPath = srcFolderPath + "/" + names[i];
                            }else{
                                srcFolderPath = names[i];
                            }
                        } else {
                            srcFolderPath = srcFolderPath + "/" + names[i];
                        }
                    }
                }
                if(srcFolderPath){
                try{
                var result = FileService.readFileContent(srcFolderPath + "/.hdinamespace", false).then(function(result) {
                    var namespace = JSON.parse(result).name;
                    fCallback(namespace);
                    
                }).done();
                }catch(e){
                	var x = e;
                 }
                }
            }
        },
        /*
    	 * fCallBack: requires a function to call back after success fully getting namespace 
    	 * sFullPath: full path of a file. 
    	 * 
    	 * */
        getNamespaceWithFileFullPath:function(fCallback, sFullPath){
            if (sFullPath) {
                var names = sFullPath.split("/");
                var srcFolderPath;
                if (names.length > 2) {
                    for (var i = 1; i < (names.length - 1); i++) {
                        if (names[i] !== "src") {
                            if (srcFolderPath){
                                srcFolderPath = srcFolderPath + "/" + names[i];
                            }else{
                                srcFolderPath = names[i];
                            }
                        } else {
                            srcFolderPath = srcFolderPath + "/" + names[i];
                        }
                    }
                }
                if(srcFolderPath){
                try{
                var result = FileService.readFileContent(srcFolderPath + "/.hdinamespace", false).then(function(result) {
                    var namespace = JSON.parse(result).name;
                    fCallback(namespace);
                    
                }).done();
                }catch(e){
                	var x = e;
                 }
                }
            }
        },
        /*	oDocument: file document
         *  context:  editor context which should have  XS2ServicesDAO service
         *  fCallBack: call back function with service name 
         *  Service name only for the module of type Hana DB .
         *   
         * 
         * */
        getServiceName:function(oDocument,context,fCallBack){
        	var serviceName;
        	if(oDocument && context){
        	      oDocument.getProject().then(function(project){
        	       serviceName = context.service.chebackend.XS2ServicesDAO.getAllRequireServices(project.getEntity().getFullPath()).then(function(services){
        			if(fCallBack){
        				if(services && services.length >0){
        					var serviceName;
        				 for(var i = 0 ; i < services.length ; i++){
        				       if(services[i].resourceType == "com.sap.xs.hdi-container"){
        				    	   serviceName = services[i].xsaName;
                		        break;
        				       }
        				 }
        				 fCallBack(serviceName);
        				}else{
        					fCallBack();
        				}
                	}
        		});     
        	      })
        	}
        }
        
    };
});