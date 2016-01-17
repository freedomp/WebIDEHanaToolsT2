define([], function() {
	"use strict";

	return {
		isAvailable: function() {
			var that = this;
			return this.context.service.selection.assertNotEmpty().then(function(aSelection) {
				var oDocument = aSelection[0].document;
				var sPomXMLPath = oDocument.getEntity().getFullPath() + "/" + "pom.xml";
				var sGruntFilePath = oDocument.getEntity().getFullPath() + "/" + "Gruntfile.js";
				return Q.spread([that.context.service.ui5projecthandler.getHandlerFilePath(oDocument),
                             that.context.service.document.getDocumentByPath(sPomXMLPath),
                             that.context.service.document.getDocumentByPath(sGruntFilePath)], function(sHandlerFilePath, oPomXMLDocument,
					oGruntfileDocument) {
					if (sHandlerFilePath && !oPomXMLDocument && !oGruntfileDocument) {
						return true;
					} else {
						return false;
					}
				}).fail(function() {
					return false; //Not a Fiori project
				});
			});
		},

		isEnabled: function() {
			return true;
		}
	};

});
