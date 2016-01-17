 	define({

	decorate : function(oDocument, oEvent) {

		var oProperties = {};
		
		var sRed = require.toUrl("core/core/platform/plugin/decoration/images/red_square.png");
//		var sGreen = require.toUrl("qunit/common/plugin/decoration/images/green_square.png");
//		var sBlue = require.toUrl("qunit/common/plugin/decoration/images/blue_square.png");
//		var sYellow = require.toUrl("qunit/common/plugin/decoration/images/yellow_square.png");


		if (oDocument.getEntity().getName() == "AFolderWithDecorationStyle"){
			oProperties.styleClass = "sapUiTreeNodeDecorationFolderBL";
		}

		if (oDocument.getEntity().getName() == "FileWithPrefix.js"){
			oProperties.prefix = { text : "prefix", styleClass : "sapUiTreeNodePrefixGreen" };
		}
		
		if (oDocument.getEntity().getName() == "FileWithSuffix.js"){
			oProperties.suffix = [{text : "suffix" , styleClass : "sapUiTreeNodeSuffixRedItalic", prio : 0}];
		}
		
		if (oDocument.getEntity().getName() == "FileWithMultipleSuffixes.js"){
			oProperties.suffix = [{text : "suffix1" , styleClass : "sapUiTreeNodeSuffixBlueItalic", prio : 0},
			                      {text : "suffix2" , styleClass : "sapUiTreeNodeSuffixRedItalic", prio : 10},
			                      {text : "suffix3" , styleClass : "sapUiTreeNodeSuffixGreenItalic", prio : 20}];
		}
		
		if (oDocument.getEntity().getName() == "FileWithPrefixAndSuffix.js"){
			oProperties.prefix = { text : "prefix", styleClass : "sapUiTreeNodePrefixRed" };
			oProperties.suffix = [{text : "suffix" , styleClass : "sapUiTreeNodeSuffixGreenItalic", "prio" : 0}];
		}

		
		if (oDocument.getEntity().getName() == "FileWithIconDecorators.js") {
			oProperties.decoratorIconBottomLeft = sRed;
//			oProperties.decoratorIconBottomRight = sGreen;
//			oProperties.decoratorIconTopLeft = sYellow;
//			oProperties.decoratorIconTopRight = sBlue;
		}
		
		return oProperties;

	}
	

});
