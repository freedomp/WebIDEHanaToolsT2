define(["../io/Request"], function(Request){
	"use strict";
	var CodeValidator = {

		validateWorkspaceContent : function(workspaceID, config, aProjects){
			var header = {
				headers: {
					"Content-Type" : "application/json"
				}
			};
			return Request.send("validateWorkspaceContent", "POST", header,
				{"type": "workspace", "workspaceId": workspaceID, "configuration" : config, "projects": aProjects});
		}
	};
	return CodeValidator;
});
