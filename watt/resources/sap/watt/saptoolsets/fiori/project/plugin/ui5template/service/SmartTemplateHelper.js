define(["sap/watt/lib/lodash/lodash"], function(_) {
	return {

		_callAjax: function(sUrl, sType, sDataType) {
			var that = this;
			var mOptions = {
				type: sType,
				data: null,
				dataType: sDataType
			};
			return Q.sap.ajax(sUrl, mOptions).then(function(aResponse) {
				if (aResponse && aResponse.length > 0) {
					return aResponse[0];
				}
			}).fail(function(oError) {
				that.context.service.log.error(oError.message);
			});
		},

		/**
		 * Writes to i18n all entries that in the given entity array
		 * @param 	{object}		oDocument		a given document object from a project
		 * @param 	{Array}			aEntry			array of i18n entries
		 * @param 	{string}		sTextType		i18n text type
		 * @returns {object}		the property file entry object
		 */
		writeToI18n: function(oDocument, aEntry, sTextType) {
			var aProperties = [];
			if (_.isEmpty(aEntry)) {
				return null;
			}

			if (!sTextType) {
				sTextType = "XTIT";
			}

			for (var i = 0; i < aEntry.length; i++) {
				aProperties.push({
					textType: sTextType,
					key: aEntry[i],
					value: aEntry[i]
				});
			}
			return this.context.service.translation.updatePropertyKeys(undefined, "i18n", aProperties, oDocument);
		},

		/**
		 * Creates new viewExtensions entry under the handler file document
		 *
		 * @param {object}		oDocument			a given document object from a project
		 * @param {string}		sView				view name
		 * @param {string}		sExtensionPoint		extension point name
		 * @param {string}		sEntitySet			entity set name
		 * @param {object}		oExtensionContent	extension point content object
		 * @param {string}		sFacetId			faced id
		 * @param {boolean}		bOverwrite			set true to overwrite controller extensions entry
		 */
		createNewViewExtensionEntry: function(oDocument, sView, sExtensionPoint, sEntitySet, oExtensionContent, sFacetId, bOverwrite) {
			var that = this;
			var oUI5ProjectHandler = this.context.service.ui5projecthandler;
			var sExtensionPointID;

			if (!sExtensionPoint || !sEntitySet) {
				var oError = new Error("Missing parameter for ExtensionPointID");
				oError.name = "missingParamForExtensionPointID";
				throw oError;
			}
			var oViewExtension = {
				extensionType: "sap.ui.viewExtensions",
				view: sView,
				content: {}
			};

			if (sExtensionPoint === "SmartFilterBarControlConfigurationExtension") {
				sExtensionPointID = sExtensionPoint + "|" + sEntitySet;
				oViewExtension.content[sExtensionPointID] = oExtensionContent;
			} else if (sExtensionPoint.indexOf("Facet") > -1) {
				if (sFacetId) {
					sExtensionPointID = sExtensionPoint + "|" + sEntitySet + "|" + sFacetId;
					oViewExtension.content[sExtensionPointID] = oExtensionContent;
				} else {
					var sMsg = that.context.i18n.getText("i18n", "smartTemplateHelper_FacetIdIsNull");
					this.context.service.log.error("SmartTemplateHelper", sMsg, ["user"]).done();
					return;
				}
			}
			return oUI5ProjectHandler.addExtension(oDocument, oViewExtension.extensionType, oViewExtension.view, oViewExtension.content,
				bOverwrite).fail(function(oError) {
				that._handleOverwriteException(oError);
			});
		},

		_handleOverwriteException: function(oError) {
			if (oError.name === "ExtensionExistInHandler") {
				var sMessage = this.context.i18n.getText("i18n", "overwrite_message");
				throw new Error(sMessage);
			} else {
				throw oError;
			}
		},

		/**
		 * Creates new controllerExtensions entry by given View and Controller names under the handler file document
		 *
		 * @param {object}				oDocument			a given document object from a project
		 * @param {string}				sView				view name
		 * @param {string}				sControllerName		controller name
		 * @param {boolean}				bOverwrite			set true to overwrite controller extensions entry
		 */
		createNewControllerExtensionEntry: function(oDocument, sView, sControllerName, bOverwrite) {
			var that = this;
			var oUI5ProjectHandler = this.context.service.ui5projecthandler;
			var oContExtension = {
				extensionType: "sap.ui.controllerExtensions",
				view: sView,
				content: {
					"controllerName": sControllerName
				}
			};

			return oUI5ProjectHandler.addExtension(oDocument, oContExtension.extensionType, oContExtension.view, oContExtension.content,
				bOverwrite).fail(function(oError) {
				that._handleOverwriteException(oError);
			});
		},

		/**
		 * Returns all Facets of the given entity sets under the handler file document
		 * @param 	{object}		oDocument		a given document object from a project
		 * @param 	{Array}			aEntitySet		array of entity sets
		 * @returns {Array}							facets of the given entity sets under the handler file document
		 */
		getFacetsPerEntitySet: function(oDocument, aEntitySet) {

			var that = this;
			var aAnnotations = [];
			if (_.isEmpty(aEntitySet)) {
				return aAnnotations;
			}
			var oUI5projecthandler = this.context.service.ui5projecthandler;

			return oUI5projecthandler.getHandlerDocument(oDocument).then(function(oHandlerDocument) {
				var sHandlerPath = oHandlerDocument.getEntity().getParentPath();
				return oUI5projecthandler.getDataSources(oHandlerDocument).then(function(oDataSources) {
					if (oDataSources && oDataSources.mainService && oDataSources.mainService.settings) {
						var sMetadataPath = sHandlerPath + "/" + oDataSources.mainService.settings.localUri;
						return that._getFileContent(sMetadataPath).then(function(sMetadataContent) {
							if (sMetadataContent) {
								return oUI5projecthandler.getDataSourceAnnotationsByName(oDocument, "mainService").then(function(oAnnotations) {
									if (oAnnotations) {
										var aPromises = [];
										var aAnnotationNames = [];

										for (var sAnnName in oAnnotations) {
											var sAnnLocalUri = sHandlerPath + "/" + oAnnotations[sAnnName].settings.localUri;
											aAnnotationNames.push(sAnnName);
											aPromises.push(that._getFileContent(sAnnLocalUri));
										}

										return Q.all(aPromises).then(function(aAnnFilesContent) {
											for (var i = 0; i < aAnnFilesContent.length; i++) {
												var annTechnicalName = aAnnotationNames[i];
												var annotationsXML = {
													name: annTechnicalName,
													content: aAnnFilesContent[i]
												};
												aAnnotations.push(annotationsXML);
											}
											return that._createMetaModel(sMetadataContent, aAnnotations).then(function(oMetaModel) {
												if (!_.isEmpty(oMetaModel)) {
													return that._getArrayOfEntitysetsWithFacets(oDocument, oMetaModel, aEntitySet, sHandlerPath);
												}
											});
										});
									} else {
										return aAnnotations;
									}
								});
							} else {
								return aAnnotations;
							}
						});
					}
				});
			}).fail(function(oError) {
				var sFailedMsg = that.context.i18n.getText("i18n", "smartTemplateHelper_FailedGetFacetsMsg");
				if (oError) {
					sFailedMsg = oError.message;
				}
				that.context.service.log.error("SmartTemplateHelper", sFailedMsg, ["user"]).done();
				return aAnnotations;
			});
		},

		/**
		 * Validates if template exist under pages according to given document and the project and template name
		 *
		 * @param 	{object}			oDocument		a given document object from a project
		 * @param 	{string}			sTemplateName	template name
		 * @returns {boolean}							true if template exist under pages
		 */
		validateOnSelection: function(oDocument, sTemplateName) {
			var that = this;
			return this.context.service.ui5projecthandler.getAttribute(oDocument, "sap.ui.generic.app").then(function(oGenericAppEntry) {
				if (oGenericAppEntry) {
					return that._searchTemplateInPages(oGenericAppEntry.pages, sTemplateName);
				}
				var oError = new Error();
				oError.name = "TemplateDoesNotExist";
				throw oError;
			});
		},

		_searchTemplateInPages: function(aPages, sTemplateName) {
			if (aPages) {
				for (var iPage = 0; iPage < aPages.length; iPage++) {
					if (aPages[iPage].component && aPages[iPage].component.name === sTemplateName) {
						return true;
					} else {
						return this._searchTemplateInPages(aPages[iPage].pages, sTemplateName);
					}
				}
			}
			var oError = new Error();
			oError.name = "TemplateDoesNotExist";
			throw oError;
		},

		_getArrayOfEntitysetsWithFacets: function(oDocument, oMetaModel, aEntitySet, sHandlerPath) {

			var that = this;
			var iPos = sHandlerPath.indexOf("/", 1);
			sHandlerPath = (iPos > -1) ? sHandlerPath.substr(iPos + 1) + "/" : "";

			return this.context.service.ui5projecthandler.getI18nPath(oDocument).then(function(sI18nPath) {
				var sBundleName = "i18n";

				if (sI18nPath) {
					// save the i18n of the project
					sBundleName = "smartTemplateLan";
					var sBackendSrv = sap.watt.getEnv("orion_server");
					sBackendSrv = sBackendSrv.substr(0, sBackendSrv.length - 1);
					var sLocation = oDocument.getEntity().getBackendData().location + sHandlerPath + sI18nPath;
					that.context.i18n.bundles[sBundleName] = sBackendSrv + sLocation;
				}

				var aFacetsPromises = [];
				var aEntitysetsWithFacetss = [];

				for (var i = 0; i < aEntitySet.length; i++) {
					aFacetsPromises.push(that._getFacetsForEntitySet(oMetaModel, aEntitySet[i].name, sBundleName));
				}

				return Q.all(aFacetsPromises).then(function(aFacetsForEntitySet) {
					for (i = 0; i < aFacetsForEntitySet.length; i++) {
						var oEntitySetFacets = {
							name: aEntitySet[i].name,
							facets: aFacetsForEntitySet[i]
						};
						aEntitysetsWithFacetss.push(oEntitySetFacets);
					}

					return aEntitysetsWithFacetss;
				});
			});

		},

		_getFacetsForEntitySet: function(oMetaModel, sEntitySet, sBundleName) {
			var aFacets = [];
			var sFacetLabel;
			var sEntityType = oMetaModel.getODataEntitySet(sEntitySet).entityType;
			var oDataEntityType = oMetaModel.getODataEntityType(sEntityType);
			var aEntityTypeFacets = oDataEntityType["com.sap.vocabularies.UI.v1.Facets"];
			if(aEntityTypeFacets){
				for (var j = 0; j < aEntityTypeFacets.length; j++) {
					var oFacet = {};
					if (aEntityTypeFacets[j].Label.String) {
						sFacetLabel = this._getFacetLabel(aEntityTypeFacets[j].Label.String, sBundleName);
					}
	
					if (aEntityTypeFacets[j].RecordType.indexOf("CollectionFacet") > -1) {
						oFacet = {
							facetId: aEntityTypeFacets[j].ID.String,
							label: sFacetLabel
						};
						aFacets.push(oFacet);
					} else if (aEntityTypeFacets[j].RecordType.indexOf("ReferenceFacet") > -1) {
						if(aEntityTypeFacets[j].ID && aEntityTypeFacets[j].ID.String) {
							oFacet = {
								facetId: aEntityTypeFacets[j].ID.String,
								label: sFacetLabel
							};
						} else {
							var sAnnPath = aEntityTypeFacets[j].Target.AnnotationPath;
							sAnnPath = sAnnPath.replace("@", "").replace("/", "::").replace("#", "::");
							oFacet = {
								facetId: sAnnPath,
								label: sFacetLabel
							};
						}
						aFacets.push(oFacet);
					}
	
				}
			}
			return aFacets;
		},

		_getFacetLabel: function(sFacetLabel, sBundleName) {

			var sI18n = "i18n>";
			var iPos = sFacetLabel.indexOf(sI18n);

			if (iPos > -1) {
				var sEnd = sFacetLabel.indexOf("}");
				sFacetLabel = sFacetLabel.substr(iPos + sI18n.length, sEnd - iPos - sI18n.length);
				sFacetLabel = this.context.i18n.getText(sBundleName, sFacetLabel);
			}

			return sFacetLabel;
		},

		_createMetaModel: function(sMetadataContent, aAnnotations) {
			var that = this;

			return this.context.service.annotation.mockFiles("", sMetadataContent, aAnnotations).then(function() {
				return that.context.service.annotation.getMetaModel("", aAnnotations).then(function(oMetaModel) {
					return oMetaModel;
				}).fail(
					function() {
						var sFailedMsg = that.context.i18n.getText("i18n", "smartTemplateHelper_MetaModelFailedMsg");
						that.context.service.log.error("SmartTemplateHelper", sFailedMsg, ["user"]).done();
					}).fin(function() {
					that.context.service.mockFileLoader.stopMock();
				});
			});
		},

		_getFileContent: function(sPath) {

			return this.context.service.filesystem.documentProvider.getDocument(sPath).then(function(oDocument) {
				if (oDocument) {
					return oDocument.getContent();
				}
			});
		},

		/**
		 * Returns all entity sets of the given smart template name under the handler file document
		 * @param 	{object}		oDocument				a given document object from a project
		 * @param 	{string}		sSmartTemplateName		Smart Template Name
		 * @returns {Array}			entity sets of the given smart template name under the handler file document
		 */
		getEntitySets: function(oDocument, sSmartTemplateName) {
			var that = this;
			var aEntitySets = [];

			if (oDocument && sSmartTemplateName) {
				return that.context.service.ui5projecthandler.getAttribute(oDocument, "sap.ui.generic.app").then(function(oRoutes) {
					if (oRoutes && oRoutes.pages) {
						that._getEntitySetsFromPage(_.first(oRoutes.pages), sSmartTemplateName, aEntitySets);
					}
					return aEntitySets;
				}).fail(function(oError) {
					that.context.service.log.error("SmartTemplateHelper", oError.message, ["user"]).done();
				});
			}

			return aEntitySets;

		},

		_getEntitySetsFromPage: function(oPageEntity, sSmartTemplateName, aEntitySets) {
			var sName = oPageEntity.component.name.toLowerCase();
			if (sName.indexOf(sSmartTemplateName.toLowerCase()) > -1) {
				var oEntitySet = {
					name: oPageEntity.entitySet
				};
				aEntitySets.push(oEntitySet);
			}

			if (oPageEntity.pages) {
				this._getEntitySetsFromPage(_.first(oPageEntity.pages), sSmartTemplateName, aEntitySets);
			}
		},

		/**
		 * Returns all available extension points of the given smart template name
		 * @param {string}		sSmartTemplateName		Smart Template Name
		 * @returns {Array}		extension points array of the given template
		 */
		getAllExtensionPoints: function(sSmartTemplateName) {

			var sUrl;
			var that = this;

			if (sSmartTemplateName) {
				if (sSmartTemplateName.toLowerCase().indexOf("objectpage") > -1) {
					sUrl = "/smartTemplateGeneration/ObjectPage/view/Details.view.xml";
				} else if (sSmartTemplateName.toLowerCase().indexOf("listreport") > -1) {
					sUrl = "/smartTemplateGeneration/ListReport/view/ListReport.view.xml";
				}
			}
			return this._callAjax(sUrl, "GET", "text").then(function(sViewContent) {
				var aExtensionPoints = [];
				var sFileXmlContent = (new DOMParser()).parseFromString(sViewContent, "text/xml");
				try {
					var aExtPointsInView = jQuery(sFileXmlContent).xpath("//*:ExtensionPoint");
				} catch (oError) {
					that.context.service.log.error("SmartTemplateHelper", oError.message, ["user"]).done();
				}

				if (!_.isEmpty(aExtPointsInView)) {
					for (var i = 0; i < aExtPointsInView.length; i++) {
						var oExtPoint = aExtPointsInView[i];
						var sExtPoint = oExtPoint.getAttribute("name");
						var iPos = sExtPoint.indexOf('|');
						if (iPos > -1) {
							sExtPoint = sExtPoint.substring(0, iPos);
						}
						aExtensionPoints.push({
							name: sExtPoint
						});
					}
				}

				return aExtensionPoints;

			});
		}

	};
});