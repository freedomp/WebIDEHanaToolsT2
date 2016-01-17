/*global define*/
define([], function() {
	"use strict";

	return {
		id: "XML_METADATA_MEDIA_SRC_WITHOUT_FORMATTER",
		category: "Fiori Architectural Guidelines Error",
		path: "//ns:UploadCollectionItem[@url]",
		errorMsg: "Use a formatter to generate absolute __metadata/media_src URLs",
		validate: function(report, path, nodes){
			var result = [];
//			console.log("validating (" + this.id + ")");
			for(var i = 0; i < nodes.length; i++){
				var node = nodes[i];
				if(node){
					var url = node.getAttribute("url");
					if(url.indexOf("formatter") === -1
							&& (url.indexOf("__metadata.media_src") > -1 || url.indexOf("__metadata/media_src") > -1 )){
						result.push(node);
					}
				}
			}
			return result;
		}
	};
});
