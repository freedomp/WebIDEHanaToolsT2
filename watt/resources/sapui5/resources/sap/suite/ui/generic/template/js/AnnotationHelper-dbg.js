(function () {
	"use strict";
	jQuery.sap.require("sap.ui.model.odata.AnnotationHelper");
	jQuery.sap.require("sap.ui.comp.smartfield.SmartField");

	jQuery.sap.declare("sap.suite.ui.generic.template.js.AnnotationHelper");

	sap.suite.ui.generic.template.js.AnnotationHelper = {

		formatWithExpandSimple: function (oInterface, oDataField) {
			var aExpand = [], sExpand;
			var oMetaModel = oInterface.getModel();

			// TODO: check with UI2 if helper to get entity type can be used
			var aMatches = /^(\/dataServices\/schema\/\d+\/entityType\/\d+)(?:\/|$)/.exec(oInterface.getPath());
			if (aMatches && aMatches.length && aMatches[0]) {
				var oEntityTypeContext = oMetaModel.getProperty(aMatches[0]);
				var sNamespace = oMetaModel.getODataEntityContainer().namespace;
				var oEntityType = oMetaModel.getODataEntityType(sNamespace + '.' + oEntityTypeContext.name);

				// check if expand is needed
				if (oDataField && oDataField.Path) {
					sExpand = sap.suite.ui.generic.template.js.AnnotationHelper._getNavigationPrefix(oMetaModel, oEntityType, oDataField.Path);
					if (sExpand) {
						aExpand.push(sExpand);
					}

				} else if (oDataField && oDataField.Apply && oDataField.Apply.Name === "odata.concat") {
					oDataField.Apply.Parameters.forEach(function (oParameter) {
						if (oParameter.Type === "Path") {
							sExpand = sap.suite.ui.generic.template.js.AnnotationHelper._getNavigationPrefix(oMetaModel, oEntityType, oParameter.Value);
							if (sExpand) {
								if (aExpand.indexOf(sExpand) === -1) {
									aExpand.push(sExpand);
								}
							}
						}
					});
				}

				if (aExpand.length > 0) {
					// we analyze a facet that is part of the root context
					// set expand to expand data bag
					var oPreprocessorsData = oInterface.getSetting("preprocessorsData");
					if (oPreprocessorsData) {
						var aRootContextExpand = oPreprocessorsData.rootContextExpand || [];
						for (var j = 0; j < aExpand.length; j++) {
							if (aRootContextExpand.indexOf(aExpand[j]) === -1) {
								aRootContextExpand.push(aExpand[j]);
							}
						}
						oPreprocessorsData.rootContextExpand = aRootContextExpand;
					}

				}
			}

			return sap.ui.model.odata.AnnotationHelper.format(oInterface, oDataField);
		},

		formatWithExpand : function(oInterface, oDataField, oEntitySet){
			sap.suite.ui.generic.template.js.AnnotationHelper.getNavigationPathWithExpand(oInterface, oDataField, oEntitySet);

			oInterface = oInterface.getInterface(0);
			return sap.ui.model.odata.AnnotationHelper.format(oInterface, oDataField);
		},

		_getNavigationPrefix: function (oMetaModel, oEntityType, sProperty) {
			var sExpand = "";
			var aParts = sProperty.split("/");

			if (aParts.length > 1){
				for (var i = 0; i < (aParts.length - 1); i++){
					var oAssociationEnd = oMetaModel.getODataAssociationEnd(oEntityType, aParts[i]);
					if (oAssociationEnd){
						oEntityType = oMetaModel.getODataEntityType(oAssociationEnd.type);
						if (sExpand){
							sExpand = sExpand + "/";
						}
						sExpand = sExpand + aParts[i];
					} else {
						return sExpand;
					}
				}
			}

			return sExpand;
		},

		getNavigationPathWithExpand: function (oInterface, oContext, oEntitySetContext) {
			oInterface = oInterface.getInterface(0);
			var aDependents = [], aExpand = [], oFacetContent, aFacetContent = [];
			var oMetaModel = oInterface.getModel();
			var oEntitySet = oMetaModel.getODataEntitySet(oEntitySetContext.name || '');
			var sResolvedPath = sap.ui.model.odata.AnnotationHelper.resolvePath(oMetaModel.getContext(oInterface.getPath()));

			var sNavigationPath = sap.ui.model.odata.AnnotationHelper.getNavigationPath(oInterface, oContext);
			var sNavigationProperty = sNavigationPath.replace("{", "").replace("}", "");
			if (sNavigationProperty) {
				// from now on we need to set the entity set to the target
				var oEntityType = oMetaModel.getODataEntityType(oEntitySet.entityType);
				var oAssociationEnd = oMetaModel.getODataAssociationSetEnd(oEntityType, sNavigationProperty);
				if (oAssociationEnd && oAssociationEnd.entitySet) {
					oEntitySet = oMetaModel.getODataEntitySet(oAssociationEnd.entitySet);
				}
			} else {
				var oEntityType = oMetaModel.getODataEntityType(oEntitySetContext.entityType);
			}
			if (sResolvedPath) {
				aFacetContent = oMetaModel.getObject(sResolvedPath);
			}

			aFacetContent = aFacetContent.Data || aFacetContent;

			var fnGetDependents = function (sProperty, bIsValue) {
				var sExpand = sap.suite.ui.generic.template.js.AnnotationHelper._getNavigationPrefix(oMetaModel, oEntityType, sProperty);
				if (sExpand){
					// check if already in expand array - if not yet add it
					if (aExpand.indexOf(sExpand) === -1) {
						aExpand.push(sExpand);
					}
				}
				if (bIsValue) {
					try {
						aDependents = sap.ui.comp.smartfield.SmartField.getSupportedAnnotationPaths(oMetaModel, oEntitySet, sProperty, true) || [];
					} catch (e) {
						aDependents = [];
					}
					for (var i = 0; i < aDependents.length; i++) {
						if (aExpand.indexOf(aDependents[i]) === -1) {
							aExpand.push(aDependents[i]);
						}
					}
				}
			};

			var fnAnalyzeApplyFunctions = function (oParameter) {
				if (oParameter.Type === "LabeledElement") {
					fnGetDependents(oParameter.Value.Path);
				} else if (oParameter.Type === "Path") {
					fnGetDependents(oParameter.Value);
				}
			};

			for (var i = 0; i < aFacetContent.length; i++) {
				oFacetContent = aFacetContent[i];

				if (oFacetContent.Value && oFacetContent.Value.Path) {
					fnGetDependents(oFacetContent.Value.Path, true);
				}

				if (oFacetContent.Value && oFacetContent.Value.Apply && oFacetContent.Value.Apply.Name === "odata.concat") {
					oFacetContent.Value.Apply.Parameters.forEach(fnAnalyzeApplyFunctions);
				}

				if (oFacetContent.Action && oFacetContent.Action.Path) {
					fnGetDependents(oFacetContent.Action.Path);
				}

				if (oFacetContent.Target && oFacetContent.Target.Path) {
					fnGetDependents(oFacetContent.Target.Path);
				}

				if (oFacetContent.SemanticObject && oFacetContent.SemanticObject.Path) {
					fnGetDependents(oFacetContent.SemanticObject.Path);
				}

				if (oFacetContent.Url && oFacetContent.Url.Path) {
					fnGetDependents(oFacetContent.Url.Path);
				}

				if (oFacetContent.Url && oFacetContent.Url.Apply && oFacetContent.Url.Apply.Parameters) {
					oFacetContent.Url.Apply.Parameters.forEach(fnAnalyzeApplyFunctions);
				}


				if (oFacetContent.UrlContentType && oFacetContent.UrlContentType.Path) {
					fnGetDependents(oFacetContent.UrlContentType.Path);
				}

			}

			if (aFacetContent.name) {
				fnGetDependents(aFacetContent.name, true);
			}

			if (aExpand.length > 0) {
				if (sNavigationProperty === "") {
					// we analyze a facet that is part of the root context
					// set expand to expand data bag
					var oPreprocessorsData = oInterface.getSetting("preprocessorsData");
					if (oPreprocessorsData) {
						var aRootContextExpand = oPreprocessorsData.rootContextExpand || [];
						for (var j = 0; j < aExpand.length; j++) {
							if (aRootContextExpand.indexOf(aExpand[j]) === -1) {
								aRootContextExpand.push(aExpand[j]);
							}
						}
						oPreprocessorsData.rootContextExpand = aRootContextExpand;
					}
				} else {
					// add expand to navigation path
					sNavigationPath = "{ path : '" + sNavigationProperty + "', parameters : { expand : '" + aExpand.join(',') + "'} }";
				}
			}

			return sNavigationPath;

		},

		isSelf: function (sPath) {
			if (sPath === undefined || (sPath && sPath.indexOf('@') === 0 && sPath.indexOf('/') === -1)) {
				return true;
			}
			return false;
		},
		// Needed for analytics fragments
		number: function (val) {
			if (!val) {
				return NaN;
			} else if (val.Decimal) {
				return +val.Decimal;
			} else if (val.Path) {
				return '{' + val.Path + '}';
			} else {
				return NaN;
			}
		},
		// Needed for analytics fragments
		formatColor: (function () {
			function formatVal(val) {
				if (!val) {
					return NaN;
				} else if (val.Decimal) {
					return val.Decimal;
				} else if (val.EnumMember) {
					return '\'' + val.EnumMember + '\'';
				} else if (val.Path) {
					return '${' + val.Path + '}';
				} else {
					return NaN;
				}
			}

			function formatCriticality(oDataPoint) {
				var criticality = oDataPoint.Criticality;

				return '{= ' + formatVal(criticality) + ' === \'UI.CriticalityType/Negative\' ? \'Error\' : ' + formatVal(criticality) + '=== \'UI.CriticalityType/Critical\' ? \'Critical\' : \'Good\'}';
			}

			function formatCriticalityCalculation(oDataPoint) {
				var value = formatVal(oDataPoint.Value);
				var oCriticalityCalc = oDataPoint.CriticalityCalculation;

				return '{= (' + value + ' < ' + formatVal(oCriticalityCalc.DeviationRangeLowValue) + ' || ' + value + ' > ' + formatVal(oCriticalityCalc.DeviationRangeHighValue) + ') ? \'Error\' : (' + value
					+ ' < ' + formatVal(oCriticalityCalc.ToleranceRangeLowValue) + ' || ' + value + ' > ' + formatVal(oCriticalityCalc.ToleranceRangeHighValue) + ') ? \'Critical\' : \'Good\'}';
			}

			return function (oDataPoint) {
				if (oDataPoint.Criticality) {
					return formatCriticality(oDataPoint);
				} else if (oDataPoint.CriticalityCalculation) {
					return formatCriticalityCalculation(oDataPoint);
				}
			};
		})(),
		createP13N: function (oContextSet, oContextProp, oDataField) {
			var sP13N = "", aAdditionalProperties = [];
			if (oDataField.Value.Path) {
				sP13N = '\\{"columnKey":"' + oDataField.Value.Path + '", "leadingProperty":"' + oDataField.Value.Path;
			} else if (oDataField.Value.Apply && oDataField.Value.Apply.Name === "odata.concat") {
				oDataField.Value.Apply.Parameters.forEach(function (oParameter) {
					if (oParameter.Type === "Path") {
						if (!sP13N) {
							sP13N = '\\{"columnKey":"' + oParameter.Value + '", "leadingProperty":"' + oParameter.Value;
						} else {
							aAdditionalProperties.push(oParameter.Value);
						}
					}
				});
			}
			// get Navigation Prefix
			var oMetaModel = this.getModel("meta");
			if (oMetaModel){
				var oEntityType = oMetaModel.getODataEntityType(oContextSet.entityType);
				if (oEntityType){
					var sNavigation = sap.suite.ui.generic.template.js.AnnotationHelper._getNavigationPrefix(oMetaModel, oEntityType, oDataField.Value.Path);
					if (sNavigation){
						sNavigation = sNavigation + "/";
					}
				}
			}
			if (oContextProp["com.sap.vocabularies.Common.v1.Text"]) {
				aAdditionalProperties.push(sNavigation + oContextProp["com.sap.vocabularies.Common.v1.Text"].Path);
			}
			if (oContextProp["Org.OData.Measures.V1.ISOCurrency"]) {
				aAdditionalProperties.push(sNavigation + oContextProp["Org.OData.Measures.V1.ISOCurrency"].Path);
			}
			if (oContextProp["Org.OData.Measures.V1.Unit"]) {
				aAdditionalProperties.push(sNavigation + oContextProp["Org.OData.Measures.V1.Unit"].Path);
			}
			if ((oDataField["RecordType"] === "com.sap.vocabularies.UI.v1.DataFieldWithUrl") && oDataField.Url && oDataField.Url.Apply && oDataField.Url.Apply.Parameters) {
				oDataField.Url.Apply.Parameters.forEach(function (oParameter) {
					if (oParameter.Type === "LabeledElement") {
						aAdditionalProperties.push(sNavigation + oParameter.Value.Path);
					}
				});
			}
			if (aAdditionalProperties.length > 0) {
				var sAdditionalProperties = "";
				aAdditionalProperties.forEach(function (oProperty) {
					if (sAdditionalProperties) {
						sAdditionalProperties = sAdditionalProperties + ",";
					}
					sAdditionalProperties = sAdditionalProperties + oProperty;
				});
				sP13N += '", "additionalProperty":"' + sAdditionalProperties;
			}
			var bNotSortable = false;
			if (oContextSet["Org.OData.Capabilities.V1.SortRestrictions"] && oContextSet["Org.OData.Capabilities.V1.SortRestrictions"].NonSortableProperties) {
				var aNonSortableProperties = oContextSet["Org.OData.Capabilities.V1.SortRestrictions"].NonSortableProperties;
				for (var i = aNonSortableProperties.length - 1; i >= 0; i--) {
					if (aNonSortableProperties[i].PropertyPath === oDataField.Value.Path) {
						bNotSortable = true;
						break;
					}
				}
			}
			if (!bNotSortable) {
				sP13N += '", "sortProperty":"' + oContextProp.name;
			}
			var bNotFilterable = false;
			if (oContextSet["Org.OData.Capabilities.V1.FilterRestrictions"]) {
				if (oContextSet["Org.OData.Capabilities.V1.FilterRestrictions"].Filterable !== 'false') {
					if (oContextSet["Org.OData.Capabilities.V1.FilterRestrictions"].NonFilterableProperties) {
						var aNonFilterableProperties = oContextSet["Org.OData.Capabilities.V1.FilterRestrictions"].NonFilterableProperties;
						for (var j = aNonFilterableProperties.length - 1; j >= 0; j--) {
							if (aNonFilterableProperties[j].PropertyPath === oDataField.Value.Path) {
								bNotFilterable = true;
								break;
							}
						}
					}
				} else {
					bNotFilterable = true;
				}
			}
			if (!bNotFilterable) {
				sP13N += '", "filterProperty":"' + oContextProp.name;
			}
			return sP13N + '" \\}';
		},
		getEntitySetOfPath: function (oContext) {
			var sContextPath = "", vRawValue = oContext.getObject(), sAnnotationPath = null, sNavigationProperty = null, oAssociationEnd = null, oEntityType = null, oModel = oContext.getModel(), sEntitySet = null, aSchema = [], nSchemaIndex = null, aEntityContainer = null;

			var aMatches = /^(\/dataServices\/schema\/\d+\/entityType\/\d+)(?:\/|$)/.exec(oContext.getPath());
			if (aMatches) {
				if (vRawValue.hasOwnProperty("AnnotationPath")) {
					sAnnotationPath = vRawValue.AnnotationPath;
					if (sAnnotationPath.indexOf('/') > -1) {
						sNavigationProperty = sAnnotationPath.split("/")[0];
						oEntityType = oContext.getObject(aMatches[1]);
						// aNavigationProperties = oEntityType.navigationProperty;
						// for (var i = 0, len = aNavigationProperties.length; i < len; i++) {
						// if (aNavigationProperties[i].name === sNavigationProperty) {
						// //sContextPath = aMatches[1] + "/navigationProperty/" + i;
						oAssociationEnd = oModel.getODataAssociationEnd(oEntityType, sNavigationProperty);
						// Find the associationSet
						aSchema = oContext.getObject('/dataServices/schema');
						jQuery.each(aSchema, function (sindex, oSchema) {
							aEntityContainer = oSchema.entityContainer;
							jQuery.each(aEntityContainer, function (index, oEntityContainer) {
								jQuery.each(oEntityContainer.associationSet, function (index, oAssociationSet) {
									jQuery.each(oAssociationSet.end, function (index, oEnd) {
										if (oEnd.role === oAssociationEnd.role) {
											sEntitySet = oEnd.entitySet;
											nSchemaIndex = sindex;
											return false;
										}
									});
									if (sEntitySet) {
										return false;
									}
								});
								if (sEntitySet) {
									return false;
								}
							});
							if (sEntitySet) {
								return false;
							}
						});
						if (sEntitySet) {
							// Saved the entity container from the scheme that hat the association set
							// ignoring that an assoicationset from one scheme may point to an entity set
							// of another
							jQuery.each(aEntityContainer, function (index, oEntityContainer) {
								jQuery.each(oEntityContainer.entitySet, function (jndex, oEntitySet) {
									if (oEntitySet.name === sEntitySet) {
										sContextPath = '/dataServices/schema/' + nSchemaIndex + '/entityContainer/' + index + '/entitySet/' + jndex;
										return false;
									}
								});
								if (sContextPath) {
									return false;
								}
							});
						}
					}
				}
			}
			return sContextPath ? sContextPath : undefined;
		},
		hasActions: function (Par) {
			for (var i = 0; i < Par.length; i++) {
				if (Par[i].RecordType === "com.sap.vocabularies.UI.v1.DataFieldForAction" || Par[i].RecordType === "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation") {
					return true;
				}
			}
		},
		getSortOrder: function (Par) {
			var str = '';
			for (var i = 0; i < Par.length; i++) {
				if (!str) {
					str = Par[i].Property.PropertyPath;
				} else {
					str = str + ', ' + Par[i].Property.PropertyPath;
				}
				if (Par[i].Descending) {
					str = str + ' ' + Par[i].Descending.Bool;
				}
			}
			return str;
		},
		replaceSpecialCharsInId: function (sId) {
			if (sId.indexOf(" ") >= 0) {
				jQuery.sap.log.error("Annotation Helper: Spaces are not allowed in ID parts. Please check the annotations, probably something is wrong there.");
			}
			return sId.replace("@", "").replace("/", "::").replace("#", "::");
		},
		getStableIdPartFromDataField: function (oDataField) {
			var sPathConcat = "", sIdPart = "";
			if (oDataField.RecordType && oDataField.RecordType === "com.sap.vocabularies.UI.v1.DataFieldForAction") {
				return sap.suite.ui.generic.template.js.AnnotationHelper.replaceSpecialCharsInId(oDataField.Action.String);
			} else if (oDataField.RecordType && oDataField.RecordType === "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation") {
				if (oDataField.SemanticObject.String) {
					sIdPart = sap.suite.ui.generic.template.js.AnnotationHelper.replaceSpecialCharsInId(oDataField.SemanticObject.String);
				} else if (oDataField.SemanticObject.Path) {
					sIdPart = sap.suite.ui.generic.template.js.AnnotationHelper.replaceSpecialCharsInId(oDataField.SemanticObject.Path);
				}
				if (oDataField.Action && oDataField.Action.String) {
					sIdPart = sIdPart + "::" + sap.suite.ui.generic.template.js.AnnotationHelper.replaceSpecialCharsInId(oDataField.Action.String);
				} else if (oDataField.Action && oDataField.Action.Path) {
					sIdPart = sIdPart + "::" + sap.suite.ui.generic.template.js.AnnotationHelper.replaceSpecialCharsInId(oDataField.Action.Path);
				}
				return sIdPart;
			} else if (oDataField.Value && oDataField.Value.Path) {
				return sap.suite.ui.generic.template.js.AnnotationHelper.replaceSpecialCharsInId(oDataField.Value.Path);
			} else if (oDataField.Value && oDataField.Value.Apply && oDataField.Value.Apply.Name === "odata.concat") {
				for (var i = 0; i < oDataField.Value.Apply.Parameters.length; i++) {
					if (oDataField.Value.Apply.Parameters[i].Type === "Path") {
						if (sPathConcat) {
							sPathConcat = sPathConcat + "::";
						}
						sPathConcat = sPathConcat + sap.suite.ui.generic.template.js.AnnotationHelper.replaceSpecialCharsInId(oDataField.Value.Apply.Parameters[i].Value);
					}
				}
				return sPathConcat;
			} else {
				// In case of a string or unknown property
				jQuery.sap.log.error("Annotation Helper: Unable to create a stable ID. Please check the annotations.");
			}
		},
		getStableIdPartFromDataPoint: function (oDataPoint) {
			var sPathConcat = "";
			if (oDataPoint.Value && oDataPoint.Value.Path) {
				return sap.suite.ui.generic.template.js.AnnotationHelper.replaceSpecialCharsInId(oDataPoint.Value.Path);
			} else if (oDataPoint.Value && oDataPoint.Value.Apply && oDataPoint.Value.Apply.Name === "odata.concat") {
				for (var i = 0; i < oDataPoint.Value.Apply.Parameters.length; i++) {
					if (oDataPoint.Value.Apply.Parameters[i].Type === "Path") {
						if (sPathConcat) {
							sPathConcat = sPathConcat + "::";
						}
						sPathConcat = sPathConcat + sap.suite.ui.generic.template.js.AnnotationHelper.replaceSpecialCharsInId(oDataPoint.Value.Apply.Parameters[i].Value);
					}
				}
				return sPathConcat;
			} else {
				// In case of a string or unknown property
				jQuery.sap.log.error("Annotation Helper: Unable to create stable ID derived from annotations.");
			}
		},
		getStableIdPartFromFacet: function (oFacet) {
			if (oFacet.RecordType && oFacet.RecordType === "com.sap.vocabularies.UI.v1.CollectionFacet") {
				if (oFacet.ID && oFacet.ID.String) {
					return oFacet.ID.String;
				} else {
					// If the ID is missing a random value is returned because a duplicate ID error will be thrown as soon as there is
					// more than one form on the UI.
					jQuery.sap.log.error("Annotation Helper: Unable to create a stable ID. You have to set an ID at all collection facets.");
					return Math.floor((Math.random() * 99999) + 1).toString();
				}
			} else if (oFacet.RecordType && oFacet.RecordType === "com.sap.vocabularies.UI.v1.ReferenceFacet") {
				return sap.suite.ui.generic.template.js.AnnotationHelper.replaceSpecialCharsInId(oFacet.Target.AnnotationPath);
			} else {
				jQuery.sap.log.error("Annotation Helper: Unable to create a stable ID. Please check the facet annotations.");
				return Math.floor((Math.random() * 99999) + 1).toString();
			}
		},
		extensionPointBeforeFacetExists: function (sEntitySet, oFacet, oManifestExtend) {
			var sExtensionPointId = "BeforeFacet|" + sEntitySet + "|" + sap.suite.ui.generic.template.js.AnnotationHelper.getStableIdPartFromFacet(oFacet);
			if (oManifestExtend['sap.suite.ui.generic.template.ObjectPage.view.Details'][sExtensionPointId]) {
				return "true";
			} else {
				return "";
			}
		},
		extensionPointAfterFacetExists: function (sEntitySet, oFacet, oManifestExtend) {
			var sExtensionPointId = "AfterFacet|" + sEntitySet + "|" + sap.suite.ui.generic.template.js.AnnotationHelper.getStableIdPartFromFacet(oFacet);
			if (oManifestExtend['sap.suite.ui.generic.template.ObjectPage.view.Details'][sExtensionPointId]) {
				return "true";
			} else {
				return "";
			}
		},
		getExtensionPointBeforeFacetTitle: function (sEntitySet, oFacet, oManifestExtend) {
			var sExtensionPointId = "BeforeFacet|" + sEntitySet + "|" + sap.suite.ui.generic.template.js.AnnotationHelper.getStableIdPartFromFacet(oFacet);
			var oExtension = oManifestExtend['sap.suite.ui.generic.template.ObjectPage.view.Details'][sExtensionPointId];
			if (oExtension &&  oExtension['sap.ui.generic.app'] && oExtension['sap.ui.generic.app'].title) {
				return oExtension['sap.ui.generic.app'].title;
			}
		},
		getExtensionPointAfterFacetTitle: function (sEntitySet, oFacet, oManifestExtend) {
			var sExtensionPointId = "AfterFacet|" + sEntitySet + "|" + sap.suite.ui.generic.template.js.AnnotationHelper.getStableIdPartFromFacet(oFacet);
			var oExtension = oManifestExtend['sap.suite.ui.generic.template.ObjectPage.view.Details'][sExtensionPointId];
			if (oExtension &&  oExtension['sap.ui.generic.app'] && oExtension['sap.ui.generic.app'].title) {
				return oExtension['sap.ui.generic.app'].title;
			}
		},
		getRepeatIndex: function (oValue) {
			if (oValue && oValue.getPath()) {
				return parseInt(oValue.getPath().substring(oValue.getPath().lastIndexOf("/") + 1), 10) + 1;
			} else {
				jQuery.sap.log.error("Annotation Helper: Unable to get index.");
			}
		},
		getColumnListItemType: function (oListEntitySet, aSubPages) {
			var sType = "Inactive";
			if (oListEntitySet.name && aSubPages && aSubPages.length > 0) {
				aSubPages.forEach(function (oSubPage) {
					if (oListEntitySet.name === oSubPage.entitySet) {
						sType = "Navigation";
					}
				});
			}
			return sType;
		},
		getEntityTypesForFormPersonalization: function (oInterface, oFacet, oEntitySetContext) {
			oInterface = oInterface.getInterface(0);
			var aEntityTypes = [];
			var oMetaModel = oInterface.getModel();
			var oEntitySet = oMetaModel.getODataEntitySet(oEntitySetContext.name || '');
			var aFacets = [];
			if (oFacet.RecordType === "com.sap.vocabularies.UI.v1.CollectionFacet" && oFacet.Facets) {
				aFacets = oFacet.Facets;
			} else if (oFacet.RecordType === "com.sap.vocabularies.UI.v1.ReferenceFacet") {
				aFacets.push(oFacet);
			}
			aFacets.forEach(function (oFacet) {
				var sNavigationProperty;
				if (oFacet.Target && oFacet.Target.AnnotationPath && oFacet.Target.AnnotationPath.indexOf("/") > 0) {
					sNavigationProperty = oFacet.Target.AnnotationPath.split("/")[0];
					var oEntityType = oMetaModel.getODataEntityType(oEntitySet.entityType);
					var oAssociationEnd = oMetaModel.getODataAssociationSetEnd(oEntityType, sNavigationProperty);
					if (oAssociationEnd && oAssociationEnd.entitySet) {
						oEntitySet = oMetaModel.getODataEntitySet(oAssociationEnd.entitySet);
						if (aEntityTypes.indexOf(oEntitySet.entityType.split(".")[1]) === -1) {
							aEntityTypes.push(oEntitySet.entityType.split(".")[1]);
						}
					}
				} else {
					if (aEntityTypes.indexOf(oEntitySetContext.entityType.split(".")[1]) === -1) {
						aEntityTypes.push(oEntitySetContext.entityType.split(".")[1]);
					}
				}
			});
			return aEntityTypes.join(", ");
		}

	};
	sap.suite.ui.generic.template.js.AnnotationHelper.getRepeatIndex.requiresIContext = true;
	sap.suite.ui.generic.template.js.AnnotationHelper.formatWithExpand.requiresIContext = true;
	sap.suite.ui.generic.template.js.AnnotationHelper.formatWithExpandSimple.requiresIContext = true;
	sap.suite.ui.generic.template.js.AnnotationHelper.getNavigationPathWithExpand.requiresIContext = true;
	sap.suite.ui.generic.template.js.AnnotationHelper.getEntityTypesForFormPersonalization.requiresIContext = true;
})();
