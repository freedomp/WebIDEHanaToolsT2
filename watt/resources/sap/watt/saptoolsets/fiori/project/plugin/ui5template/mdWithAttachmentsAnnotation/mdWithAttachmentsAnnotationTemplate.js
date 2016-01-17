define(["sap/watt/lib/lodash/lodash", "sap/watt/platform/plugin/utils/xml/XmlUtil"], function(_, xmlUtil) {

	// private methods
	function _getParamValue(collectionRecord) {
		var collectionRecordValue = collectionRecord ? collectionRecord.Value : null;
		var collectionRecordValuePath = collectionRecordValue ? collectionRecordValue.Path : null;
		return collectionRecordValuePath ? collectionRecordValuePath : null;
	}

	function _getRecordXMLValue(recordNode) {
		var valuePropNode = xmlUtil.getChildByAttrNameVal(recordNode, "Property",
			"Value")[0];
		return xmlUtil.getAttribute(valuePropNode, "Path");
	}

	function _initClaimsParameters(params) {
		params.NumericAttribute.value = {name: null};
		params.UnitsAttribute.value = {name: null};
		params.StatusAttribute.value = {name: null};
		params.DateAttribute.value = {name: null};
		params.Attribute1.value = {name: null};
		params.Attribute2.value = {name: null};
		params.DateFormAttribute.value = {name: null};
		params.NumberFormAttribute.value = {name: null};
		params.TextFormAttribute.value = {name: null};
	}

	function _populateIDsParams(modelAppCollection, modelClaimsProcessParams) {
		var aAppCollectionProps = modelAppCollection.value.elements;
		var aAppCollectionKey = _.find(aAppCollectionProps, function (aAppCollectionProp) {
			return aAppCollectionProp.isKey;
		});
		modelClaimsProcessParams.IDAttribute.value = aAppCollectionKey ? {name: aAppCollectionKey.name}: {name: ""};
		var aAttachmentCollectionProps = modelClaimsProcessParams.AttachmentCollection.value.elements;
		var aAttachmentCollectionKey = _.find(aAttachmentCollectionProps, function (aAttachmentCollectionProp) {
			return aAttachmentCollectionProp.isKey;
		});
		modelClaimsProcessParams.AttachmentID.value = aAttachmentCollectionKey ? {name: aAttachmentCollectionKey.name}: {name: ""};
	}

	function _populateMasterValues(annotationCollection, params) {
		if (!annotationCollection || _.isEmpty(annotationCollection)) {
			console.log("Annotation collection in empty or not existed");
		} else {
			params.NumericAttribute.value = {name: _getParamValue(annotationCollection[0])};
			params.UnitsAttribute.value = {name: _getParamValue(annotationCollection[1])};
			params.StatusAttribute.value = {name: _getParamValue(annotationCollection[2])};
			params.DateAttribute.value = {name: _getParamValue(annotationCollection[3])};
			params.Attribute1.value = {name: _getParamValue(annotationCollection[4])};
			params.Attribute2.value = {name: _getParamValue(annotationCollection[5])};
		}
	}

	function _populateDetailsValues(annotationCollection, params) {
		if (!annotationCollection || _.isEmpty(annotationCollection)) {
			console.log("Annotation collection in empty or not existed");
		} else {
			params.DateFormAttribute.value = {name: _getParamValue(annotationCollection[0])};
			params.NumberFormAttribute.value = {name: _getParamValue(annotationCollection[1])};
			params.TextFormAttribute.value = {name: _getParamValue(annotationCollection[2])};
		}
	}

	function _populateXMLMasterValues(annotationCollectionNode, params) {
		if (!annotationCollectionNode || _.isEmpty(annotationCollectionNode.children)) {
			console.log("XML Annotation collection in empty or not existed");
		} else {
			var annoRecords = annotationCollectionNode.children;
			params.NumericAttribute.value = {name: _getRecordXMLValue(annoRecords[0])};
			params.UnitsAttribute.value = {name: _getRecordXMLValue(annoRecords[1])};
			params.StatusAttribute.value = {name: _getRecordXMLValue(annoRecords[2])};
			params.DateAttribute.value = {name: _getRecordXMLValue(annoRecords[3])};
			params.Attribute1.value = {name: _getRecordXMLValue(annoRecords[4])};
			params.Attribute2.value = {name: _getRecordXMLValue(annoRecords[5])};
		}
	}

	function _populateXMLDetailsValues(annotationCollectionNode, params) {
		if (!annotationCollectionNode || _.isEmpty(annotationCollectionNode.children)) {
			console.log("XML Annotation collection in empty or not existed");
		} else {
			var annoRecords = annotationCollectionNode.children;
			params.DateFormAttribute.value = {name: _getRecordXMLValue(annoRecords[0])};
			params.NumberFormAttribute.value = {name: _getRecordXMLValue(annoRecords[1])};
			params.TextFormAttribute.value = {name: _getRecordXMLValue(annoRecords[2])};
		}
	}

	function _handleMetaModelAnnotation(model, sAppCollectionEntityType, modelClaimsProcessParams) {
		var oAppCollectionEntityType = model.metaModel.getODataEntityType(sAppCollectionEntityType);
		modelClaimsProcessParams.ItemTitle.value = {
			name: _getParamValue(oAppCollectionEntityType["com.sap.vocabularies.UI.v1.HeaderInfo"].Title)
		};

		//master
		var aIndentification = oAppCollectionEntityType ?
			oAppCollectionEntityType["com.sap.vocabularies.UI.v1.Identification"] : null;
		_populateMasterValues(aIndentification, modelClaimsProcessParams);

		//details
		var aEditableFields = oAppCollectionEntityType ?
			oAppCollectionEntityType["com.sap.vocabularies.UI.v1.FieldGroup#EditableForm"] : null;
		var aEditableFieldsData = aEditableFields ? aEditableFields.Data : null;
		_populateDetailsValues(aEditableFieldsData, modelClaimsProcessParams);
	}

	function _handleAnnotationXML(modelAnnotationsXMLContent, modelClaimsProcessParams, sAppCollectionEntityType) {
		var modelAnnotationsXML = xmlUtil.stringToXml(modelAnnotationsXMLContent);
		var schemaNode = modelAnnotationsXML.getElementsByTagName("Schema")[0];
		var serviceAnnotations = xmlUtil.getChildByAttrNameVal(schemaNode, "Target",
			sAppCollectionEntityType)[0];
		var aHeaderInfoNode = xmlUtil.getChildByAttrNameVal(serviceAnnotations, "Term",
			"com.sap.vocabularies.UI.v1.HeaderInfo")[0];
		var pTitleNode = aHeaderInfoNode.getElementsByTagName("PropertyValue")[2];

		modelClaimsProcessParams.ItemTitle.value = {
			name: _getRecordXMLValue(pTitleNode.children[0])
		};

		//master
		var aIndentificationNode = xmlUtil.getChildByAttrNameVal(serviceAnnotations, "Term",
			"com.sap.vocabularies.UI.v1.Identification")[0];
		_populateXMLMasterValues(aIndentificationNode.getElementsByTagName("Collection")[0],
			modelClaimsProcessParams);

		//details
		var aEditableFieldsNode = xmlUtil.getChildByAttrNameVal(serviceAnnotations, "Qualifier",
			"EditableForm")[0];
		_populateXMLDetailsValues(aEditableFieldsNode.getElementsByTagName("Collection")[0],
			modelClaimsProcessParams);
	}

	// public methods
	return {
		configWizardSteps: function (oServiceCatalogStep, oAnnotationsStep, oTemplateCustomizationStep, oOfflineStep) {
			oOfflineStep.setOptional(true);
			return [oServiceCatalogStep, oAnnotationsStep, oTemplateCustomizationStep, oOfflineStep];
		},

		onBeforeTemplateGenerate: function (templateZip, model) {
		    try {
    			if (!model.smpOffline) {
    				templateZip.remove("offline.js.tmpl");
    			}
    
    			var modelClaimsProcessParams = model.claimProcessing.parameters;
    			_initClaimsParameters(modelClaimsProcessParams);
    
    			var modelAppCollection = modelClaimsProcessParams.AppCollection;
    			if (modelAppCollection.value) {
    				var sAppCollectionEntityType = modelAppCollection.value.entityType;
    				modelClaimsProcessParams.MasterTitle.value = modelAppCollection.value.name;
    				var modelAnnotationsXMLContent = model.annotations[0] ? model.annotations[0].content : null;
    
    				// Set the IDs attributes from the Key property of the collections
    				_populateIDsParams(modelAppCollection, modelClaimsProcessParams);
    
    				// UI5 snapshot use-case
    				if (model.metaModel) {
    					_handleMetaModelAnnotation(model, sAppCollectionEntityType, modelClaimsProcessParams);
    				}
    				// Another use-case - parse annotation xml
    				else if(modelAnnotationsXMLContent) {
    					_handleAnnotationXML(modelAnnotationsXMLContent, modelClaimsProcessParams, sAppCollectionEntityType);
    				}
    			}
		    }
			catch(err) {
				throw new Error(this.context.i18n.getText("i18n", "annotation_not_supported")); 
			} 

			return [templateZip, model];
		},

		onAfterGenerate: function (projectZip, model) {
		}
	};
});