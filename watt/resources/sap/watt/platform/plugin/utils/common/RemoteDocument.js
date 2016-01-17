define(function() {

	var RemoteDocument = function(name, type, content, fullPath, parent, contentUrl, parentContentUrl) {

		this.getContent = function() {
			return Q(content);
		};

		this.getEntity = function() {

			return {
				getType : function() {
					return type;
				},

				getName : function() {
					return name;
				},
				
				getFullPath : function() {
					if (fullPath) {
						return fullPath;
					}
					
					return "";
				},
				
				getParentPath : function() {
    				if (fullPath) {
    				    var resPath = fullPath;
    				    var lastSeparatorIndex = fullPath.lastIndexOf("/");
    				    if (lastSeparatorIndex !== -1) {
            		    	resPath = resPath.substring(0,lastSeparatorIndex);
    				    }  
    					return resPath;
    				}
    				
    				return "";
				},
				
				getParent : function() {
				    return parent; // may be undefined
				},
				
				getContentUrl : function() {
				    return contentUrl; // may be undefined
				},
				
				getParentContentUrl : function() {
				    return parentContentUrl; // may be undefined
				},
				
				setParent : function(sParent) {
				    parent = sParent;
				},
				
				setContentUrl : function(sContentUrl) {
				    contentUrl = sContentUrl;
				},
				
				setParentContentUrl : function(sParentContentUrl) {
				    parentContentUrl = sParentContentUrl;
				}
			};
		};
	};

	return RemoteDocument;
});