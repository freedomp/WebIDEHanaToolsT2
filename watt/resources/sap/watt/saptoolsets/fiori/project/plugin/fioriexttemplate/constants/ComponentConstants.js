define({

	constants : {
		"components" : {
			"initModel" : {

				"Common" : {
					"fiori" : {
						"extensionCommon" : {}
					}
				},

				"ExtendController" : {
					"extensionCommon" : {
						"customizationId" : "sap.ui.controllerExtensions",
						"resourceSuffix" : ".controller.js",
						"resourceTypeName" : "controllerName"
					},
					"extendController" : {
						"parentMethodHeaders" : {},
						"resourceSuffix" : {},
						"parentControllerContent" : {}
					}
				},

				"ExtendView" : {
					"extensionCommon" : {
						"customizationId" : "sap.ui.viewExtensions",
						"resourceSuffix" : ".fragment.xml",
						"resourceTypeName" : "fragmentName"
					},
					"extendView" : {}
				},

				"HideControl" : {
					"extensionCommon" : {
						"customizationId" : "sap.ui.viewModifications"
					}
				},

				"ReplaceView" : {
					"extensionCommon" : {
						"customizationId" : "sap.ui.viewReplacements",
						"resourceSuffix" : ".view.xml",
						"resourceTypeName" : "viewName"
					},
					"replaceView" : {
						"parentAttributesPrefix" : {},
						"parentAttributesSuffix" : {},
						"parentViewContent" : {}
					}
				}
			}
		}
	}
});
