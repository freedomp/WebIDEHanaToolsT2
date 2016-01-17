/*global define*/
define([], function() {
	"use strict";
	function buildPath(){
		return "//ui:FileUpload[@uploadEnabled='true']" + "|//ui:AddPicture";
	}




	return {
		id: "XML_UPLOAD_IN_VIEW",
		category: "Security Error",
		path: buildPath(),
		errorMsg: "Uploaded files shall be sent to VSI 2.0 before stored on DB.",
		validate: function(report, path, nodes){
			var result = [];
//			console.log("validating (" + this.id + ")");
			for(var i = 0; i < nodes.length; i++){
				var node = nodes[i];
				if(node){
					result.push(node);
				}
			}
			return result;
		}
	};
});
