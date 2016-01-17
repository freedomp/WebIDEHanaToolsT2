sap.ui.define(['jquery.sap.global'],
	function(jQuery) {
		'use strict';
            
        function getProperty(sPath, oBinding) {
			var oModel = oBinding.getModel(),
				sResolvedPath // resolved binding path (not relative anymore!)
					= oModel.resolve(oBinding.getPath(), oBinding.getContext()),
					aParts = sResolvedPath.split("/"), // parts of binding path (between slashes)
					aProperties,
					oProperty;

			if (aParts[0] === "" && aParts[1] === "dataServices" && aParts[2] === "schema") {
				aParts.splice(6, aParts.length - 6);
				aParts.push("property");
				aProperties = oModel.getProperty(aParts.join("/"));

				jQuery.each(aProperties, function (i, oProperty0) {
					if (oProperty0.name === sPath) {
						oProperty = oProperty0;
						return false; //break
					}
				});
			}
			return oProperty;
		}

		function getPropertyAnnotation(sPath, oBinding, sAnnotationName) {
			var oProperty = getProperty(sPath, oBinding);

			return oProperty && oProperty[sAnnotationName];
		}

		function isSemantics(oControl, vRawValue, sExpectedSemantics) {
			if (vRawValue && vRawValue.hasOwnProperty("Path")) {
				return sExpectedSemantics === getPropertyAnnotation(vRawValue.Path,
					oControl.currentBinding(), "sap:semantics");
			}
		}

		/**
		 * The Field helper which can act as a formatter in XML template views.
		 *
		 * @private
		 */
		return {
		   
			getTargetAsNavigationProperty: function (vRawValue) {
				var aParts = vRawValue.AnnotationPath.split("/");
				return "{" + (aParts.length > 1 ? aParts[0] : "") + "}";
			},
	
			resolveTargetPath: function (oContext) {
				var vRawValue = oContext.getObject(),
					aParts = oContext.getPath().split("/");
				if (vRawValue && vRawValue.Path
					&& aParts[0] === "" && aParts[1] === "dataServices" && aParts[2] === "schema") {
					// go to "/dataServices/schema/<i>/entityType/<j>/property/<k>"
					aParts.splice(6, aParts.length - 6);
					aParts.push("property");
					jQuery.each(oContext.getProperty(aParts.join("/")), function (k, oProperty) {
						if (oProperty.name === vRawValue.Path) {
							aParts.push(k);
							return false; //break
						}
					});
					return aParts.join("/");
				}
			},
			isSemanticsEmail: function (vRawValue) {
				return isSemantics(this, vRawValue, "email");
			},
			isSemanticsTel: function (vRawValue) {
				return isSemantics(this, vRawValue, "tel");
			}
		};
	}, true);
