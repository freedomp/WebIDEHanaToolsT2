// Copyright (c) 2009-2014 SAP SE, All Rights Reserved
/**
 * @fileOverview This file contains miscellaneous utility functions.
 */

(function () {
    "use strict";
    /*global dispatchEvent, document, jQuery, localStorage, sap */

    // ensure that sap.ushell exists
    jQuery.sap.declare("sap.ovp.cards.AnnotationHelper");

    sap.ovp.cards.AnnotationHelper = {};
    sap.ovp.cards.AnnotationHelper.formatFunctions = {count: 0};

    function getCacheEntry(iContext, sKey){
        if (iContext.getSetting){
            var oCache = iContext.getSetting("_ovpCache");
            return oCache[sKey];
        }
        return undefined;
    }

    function setCacheEntry(iContext, sKey, oValue){
        if (iContext.getSetting){
            var oCache = iContext.getSetting("_ovpCache");
            oCache[sKey] = oValue;
        }
    }

    function criticality2state(criticality){
        var sState = "None";
        if (criticality && criticality.EnumMember){
            var val = criticality.EnumMember;
            if (endsWith(val, 'Negative')) {
                sState = "Error";
            } else if (endsWith(val, 'Critical')) {
                sState = "Warning";
            } else if (endsWith(val, 'Positive')) {
                sState = "Success";
            }
        }
        return sState;
    }

    function endsWith(sString, sSuffix){
        return sString.indexOf(sSuffix, sString.length - sSuffix.length) !== -1;
    }

    function generateCriticalityCalculationFormatFunc(criticalityCalculation){
        return function(value){
            value = parseInt(value, 10);
            var sDirection = criticalityCalculation.ImprovementDirection.EnumMember;
            var oCriticality = {};
            if (endsWith(sDirection, "Minimize")){
                var iDeviation = criticalityCalculation.DeviationRangeHighValue.Int;
                var iTolerance = criticalityCalculation.ToleranceRangeHighValue.Int;
                if (value <= iTolerance){
                    oCriticality.EnumMember = "Positive";
                } else if (value > iDeviation){
                    oCriticality.EnumMember = "Negative";
                } else {
                    oCriticality.EnumMember = "Critical";
                }
            } else if (endsWith(sDirection, "Maximize")){
                var iDeviation = parseInt(criticalityCalculation.DeviationRangeLowValue.Int, 10);
                var iTolerance = parseInt(criticalityCalculation.ToleranceRangeLowValue.Int, 10);
                if (value >= iTolerance){
                    oCriticality.EnumMember = "Positive";
                } else if (value < iDeviation){
                    oCriticality.EnumMember = "Negative";
                } else {
                    oCriticality.EnumMember = "Critical";
                }
            } else if (endsWith(sDirection, "Target")){
                var iDeviationLow = criticalityCalculation.DeviationRangeLowValue.Int;
                var iDeviationHigh = criticalityCalculation.DeviationRangeHighValue.Int;
                var iToleranceLow = criticalityCalculation.ToleranceRangeLowValue.Int;
                var iToleranceHigh = criticalityCalculation.ToleranceRangeHighValue.Int;
                if (value >= iToleranceLow && value <= iToleranceHigh){
                    oCriticality.EnumMember = "Positive";
                } else if (value < iDeviationLow || value > iDeviationHigh){
                    oCriticality.EnumMember = "Negative";
                } else {
                    oCriticality.EnumMember = "Critical";
                }
            }

            return criticality2state(oCriticality);
        };
    }

    function getSortedDataFields(iContext, aCollection){
        var sCacheKey = iContext.getPath() + "-DataFields-Sorted";
        var aSortedFields = getCacheEntry(iContext, sCacheKey);
        if (!aSortedFields){
            var aDataPoints = getSortedDataPoints(iContext, aCollection);
            var aDataPointsValues = aDataPoints.map(function(oDataPoint){return oDataPoint.Value.Path; });
            var aSortedFields = aCollection.filter(function(item){
                if (item.RecordType === "com.sap.vocabularies.UI.v1.DataField" && aDataPointsValues.indexOf(item.Value.Path) === -1){
                    return true;
                }
                return false;
            });
            sortCollectionByImportance(aSortedFields);
            setCacheEntry(iContext, sCacheKey, aSortedFields);
        }
        return aSortedFields;
    }

    function getSortedDataPoints(iContext, aCollection){
        var sCacheKey = iContext.getPath() + "-DataPoints-Sorted";
        var aSortedFields = getCacheEntry(iContext, sCacheKey);
        if (!aSortedFields){
            var aSortedFields = aCollection.filter(function(item){
                if (item.RecordType === "com.sap.vocabularies.UI.v1.DataFieldForAnnotation"
                    &&
                    item.Target.AnnotationPath.match(/@com.sap.vocabularies.UI.v1.DataPoint.*/)){
                    return true;
                }
                return false;
            });
            sortCollectionByImportance(aSortedFields);
            for (var i = 0; i < aSortedFields.length; i++){
                var sTarget = aSortedFields[i].Target.AnnotationPath.slice(1);
                var sEntityTypePath = iContext.getPath().substr(0, iContext.getPath().lastIndexOf("/") + 1);
                var sPath = sEntityTypePath + sTarget;
                aSortedFields[i] = iContext.getModel().getProperty(sPath);
            }
            setCacheEntry(iContext, sCacheKey, aSortedFields);
        }
        return aSortedFields;
    }

    function getSortedActions(iContext, aCollection) {
        var sCacheKey = iContext.getPath() + "-Actions-Sorted";
        var aSortedActions = getCacheEntry(iContext, sCacheKey);
        if (!aSortedActions){
            var aSortedActions = filterAndSortActions(aCollection);
            setCacheEntry(iContext, sCacheKey, aSortedActions);
        }
        return aSortedActions;
    }


    function filterAndSortActions(aCollection){
        var aSortedActions = aCollection.filter(function(item){
            return item.RecordType === "com.sap.vocabularies.UI.v1.DataFieldForAction";
        });
        sortCollectionByImportance(aSortedActions);
        return aSortedActions;
    }

    function filterAndSortIntentBasedNavigation(aCollection){
        var aSortedActions = aCollection.filter(function(item){
            return item.RecordType === "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation";
        });
        sortCollectionByImportance(aSortedActions);
        return aSortedActions;
    }

    function getImportance(oDataField){
        var sImportance;
        if (oDataField["com.sap.vocabularies.UI.v1.Importance"]){
            sImportance = oDataField["com.sap.vocabularies.UI.v1.Importance"].EnumMember;
        }
        return  sImportance;
    }

    function sortCollectionByImportance(aCollection){
        aCollection.sort(function (a, b) {
            var aImportance = getImportance(a),
                bImportance = getImportance(b);

            if (aImportance === bImportance){
                return 0;
            }

            if (aImportance === "com.sap.vocabularies.UI.v1.ImportanceType/High"){
                return -1;
            } else if (bImportance === "com.sap.vocabularies.UI.v1.ImportanceType/High"){
                return 1;
            } else if (aImportance === "com.sap.vocabularies.UI.v1.ImportanceType/Medium"){
                return -1;
            } else if (bImportance === "com.sap.vocabularies.UI.v1.ImportanceType/Medium"){
                return 1;
            } else if (aImportance === "com.sap.vocabularies.UI.v1.ImportanceType/Low") {
                return -1;
            } else if (bImportance === "com.sap.vocabularies.UI.v1.ImportanceType/Low"){
                return 1;
            }
            return -1;
        });
        return aCollection;
    }

    function formatDataField(iContext, aCollection, index) {
        var item = getSortedDataFields(iContext, aCollection)[index];

        if (item){
            return sap.ui.model.odata.AnnotationHelper.format(iContext, item.Value);
        }
        return "";
    }

    function getDataFieldName(iContext, aCollection, index) {
        var item = getSortedDataFields(iContext, aCollection)[index];

        if (item){
            return item.Label.String;
        }
        return "";
    }

    function getDataPointName(iContext, aCollection, index) {
        var item = getSortedDataPoints(iContext, aCollection)[index];

        if (item && item.Title) {
            return item.Title.String;
        }
        return "";
    }

    function formatDataPoint(iContext, aCollection, index) {
        var item = getSortedDataPoints(iContext, aCollection)[index];

        if (item){
            return sap.ui.model.odata.AnnotationHelper.format(iContext, item.Value);
        }
        return "";
    }

    function formatDataPointState(iContext, aCollection, index) {
        var aDataPoints = getSortedDataPoints(iContext, aCollection);
        var sState = "None";

        if (aDataPoints.length > index){
            var item = aDataPoints[index];
            if (item.Criticality){
                sState = criticality2state(item.Criticality);
            } else if (item.CriticalityCalculation){
                var sFormattedPath = sap.ui.model.odata.AnnotationHelper.format(iContext, item.Value);
                var sPath = sFormattedPath.match(/path *: *'.*?',/g);
                if (sPath){
                    var fFormatFunc = generateCriticalityCalculationFormatFunc(item.CriticalityCalculation);
                    sap.ovp.cards.AnnotationHelper.formatFunctions.count++;
                    var fName = "formatCriticalityCalculation" + sap.ovp.cards.AnnotationHelper.formatFunctions.count;
                    sap.ovp.cards.AnnotationHelper.formatFunctions[fName] = fFormatFunc;
                    sState = "{" + sPath + " formatter: 'sap.ovp.cards.AnnotationHelper.formatFunctions." + fName + "'}";
                }
            }
        }

        return sState;
    }


    /*
     * This formatter method parses the List-Card List's items aggregation path in the Model.
     * The returned path may contain also sorter definition (for the List) sorting is defined
     * appropriately via respected Annotations.
     *
     * @param iContext
     * @param itemsPath
     * @returns List-Card List's items aggregation path in the Model
     */
    sap.ovp.cards.AnnotationHelper.formatItems = function(iContext, oEntitySet) {
        var oSettings = iContext.getSetting('ovpCardProperties').oData;

        // check for sorting annotation on the entity set
        var oSortAnnotationCollection = oEntitySet["com.sap.vocabularies.Common.v1.SortOrder"];
        var bSort = false, oSortOrder, sSortBy, sSortOrder, bSortOrderDesc, sSorterValue;

        // If sorting is enabled by Configuration
        if (oSettings.sortBy){
            // If sorting is enabled by card configuration
            bSort = true;
            sSorterValue = "";
            sSortBy = oSettings.sortBy;
            if (oSettings.sortOrder) {
                if (oSettings.sortOrder.toLowerCase() === 'descending') {
                    bSortOrderDesc = true;
                } else {
                    bSortOrderDesc = false;
                }
            } else {
                bSortOrderDesc = true;
            }

            sSorterValue = "{path: '" + sSortBy + "',descending: " + bSortOrderDesc + "}";

        } else if (oSortAnnotationCollection) {

            // If sorting is enabled by Annotations
            bSort = true;
            sSorterValue = "";
            oSortOrder;
            for (var i = 0; i < oSortAnnotationCollection.length; i++) {
                oSortOrder = oSortAnnotationCollection[i];
                sSortBy = oSortOrder.Property.PropertyPath;
                sSortOrder = oSortOrder.Descending ? oSortOrder.Descending.Value : 'false';
                sSorterValue = sSorterValue + "{path: '" + sSortBy + "',descending: " + sSortOrder + "},";
            }
            sSorterValue = sSorterValue.substring(0, sSorterValue.length - 1); // trim the last ','
        }

        // the result String - the path binding, length and sorter if exists for the list items aggregation
        var result = "{path: '/" + oEntitySet.name + "', length: 5";
        if (bSort) {
            result = result + ", sorter: [" + sSorterValue + "]";
        }
        result = result + "}";


        // returning the parsed path for the List's items-aggregation binding
        return result;
    };

    sap.ovp.cards.AnnotationHelper.formatUrl = function(iContext, sUrl) {
        if (sUrl.charAt(0) === '/' || sUrl.indexOf("http") === 0){
            return sUrl;
        }
        var sBaseUrl = iContext.getModel().getProperty("/baseUrl");
        if (sBaseUrl){
            return sBaseUrl + "/" + sUrl;
        }
        return sUrl;
    };

    sap.ovp.cards.AnnotationHelper.getDataPointsCount = function(iContext, aCollection) {
        var aDataPoints = getSortedDataPoints(iContext, aCollection);
        return aDataPoints.length;
    };

    sap.ovp.cards.AnnotationHelper.getFirstDataPointValue = function(iContext, aCollection) {
        return sap.ovp.cards.AnnotationHelper.getDataPointValue(iContext, aCollection, 0);
    };

    sap.ovp.cards.AnnotationHelper.getSecondDataPointValue = function(iContext, aCollection) {
        return sap.ovp.cards.AnnotationHelper.getDataPointValue(iContext, aCollection, 1);
    };

    sap.ovp.cards.AnnotationHelper.getDataPointValue = function(iContext, aCollection, index) {
        var aDataPoints = getSortedDataPoints(iContext, aCollection),
            oDataPoint = aDataPoints[index];

        if (oDataPoint && oDataPoint.Value && oDataPoint.Value.Path) {
            return oDataPoint.Value.Path;
        }
        return "";
    };

    sap.ovp.cards.AnnotationHelper.getFirstDataFieldName = function(iContext, aCollection) {
        return getDataFieldName(iContext, aCollection, 0);
    };

    sap.ovp.cards.AnnotationHelper.getSecondDataFieldName = function(iContext, aCollection) {
        return getDataFieldName(iContext, aCollection, 1);
    };

    sap.ovp.cards.AnnotationHelper.getThirdDataFieldName = function(iContext, aCollection) {
        return getDataFieldName(iContext, aCollection, 2);
    };

    sap.ovp.cards.AnnotationHelper.formatFirstDataFieldValue = function(iContext, aCollection) {
        return formatDataField(iContext, aCollection, 0);
    };

    sap.ovp.cards.AnnotationHelper.formatSecondDataFieldValue = function(iContext, aCollection) {
        return formatDataField(iContext, aCollection, 1);
    };

    sap.ovp.cards.AnnotationHelper.formatThirdDataFieldValue = function(iContext, aCollection) {
        return formatDataField(iContext, aCollection, 2);
    };

    sap.ovp.cards.AnnotationHelper.formatFourthDataFieldValue = function(iContext, aCollection) {
        return formatDataField(iContext, aCollection, 3);
    };

    sap.ovp.cards.AnnotationHelper.formatFifthDataFieldValue = function(iContext, aCollection) {
        return formatDataField(iContext, aCollection, 4);
    };

    sap.ovp.cards.AnnotationHelper.formatSixthDataFieldValue = function(iContext, aCollection) {
        return formatDataField(iContext, aCollection, 5);
    };

    sap.ovp.cards.AnnotationHelper.getFirstDataPointName = function(iContext, aCollection) {
        return getDataPointName(iContext, aCollection, 0);
    };

    sap.ovp.cards.AnnotationHelper.getSecondDataPointName = function(iContext, aCollection) {
        return getDataPointName(iContext, aCollection, 1);
    };

    sap.ovp.cards.AnnotationHelper.getThirdDataPointName = function(iContext, aCollection) {
        return getDataPointName(iContext, aCollection, 2);
    };

    sap.ovp.cards.AnnotationHelper.formatFirstDataPointValue = function(iContext, aCollection) {
        return formatDataPoint(iContext, aCollection, 0);
    };

    sap.ovp.cards.AnnotationHelper.formatSecondDataPointValue = function(iContext, aCollection) {
        return formatDataPoint(iContext, aCollection, 1);
    };

    sap.ovp.cards.AnnotationHelper.formatThirdDataPointValue = function(iContext, aCollection) {
        return formatDataPoint(iContext, aCollection, 2);
    };

    sap.ovp.cards.AnnotationHelper.formatFirstDataPointState = function(iContext, aCollection) {
        return formatDataPointState(iContext, aCollection, 0);
    };

    sap.ovp.cards.AnnotationHelper.formatSecondDataPointState = function(iContext, aCollection) {
        return formatDataPointState(iContext, aCollection, 1);
    };

    sap.ovp.cards.AnnotationHelper.formatThirdDataPointState = function(iContext, aCollection) {
        return formatDataPointState(iContext, aCollection, 2);
    };

    /**
     *
     * @param iContext
     * @returns 0 for false - there are no actions for this context
     *          1 for true - there are actions for this context
     *          does not return actual boolean - so we won't need to parse the result in the xml
     */
    sap.ovp.cards.AnnotationHelper.hasActions = function (iContext, aCollection) {
        var sortedActions = getSortedActions(iContext, aCollection);
        if (!sortedActions || sortedActions.length < 1) {
            return 0;
        }
        return 1;
    };

    /**
     *
     * @param aActions - collection of dataFields
     * @returns collection of actions only, sorted by 'Importance'
     */
    sap.ovp.cards.AnnotationHelper.getFilteredSortedActions = function(aRecords) {
        var actions = filterAndSortActions(aRecords);
        return actions;
    };

    sap.ovp.cards.AnnotationHelper.getFilteredSortedIntentNavigations = function (aRecords) {
        var intents = filterAndSortIntentBasedNavigation(aRecords);
        return intents;
    };

    sap.ovp.cards.AnnotationHelper.isFirstDataPointPercentageUnit = function(iContext, aCollection) {
        var oDataPoint = getSortedDataPoints(iContext, aCollection)[0];

        if (oDataPoint && oDataPoint.Value && oDataPoint.Value.Path){
            var sEntityTypePath = iContext.getPath().substr(0, iContext.getPath().lastIndexOf("/") + 1);
            var oModel = iContext.getModel();
            var oEntityType = oModel.getProperty(sEntityTypePath);
            var oProperty = oModel.getODataProperty(oEntityType, oDataPoint.Value.Path);
            if (oProperty && oProperty["Org.OData.Measures.V1.Unit"]){
                return oProperty["Org.OData.Measures.V1.Unit"].String === "%";
            }
        }
        return false;
    };

    sap.ovp.cards.AnnotationHelper.resolveEntityTypePath = function (oAnnotationPathContext) {
        var sAnnotationPath = oAnnotationPathContext.getObject();
        var oModel = oAnnotationPathContext.getModel();
        var oMetaModel = oModel.getProperty("/metaModel");
        var oEntitySet = oMetaModel.getODataEntitySet(oModel.getProperty("/entitySet"));
        var oEntityType = oMetaModel.getODataEntityType(oEntitySet.entityType);
        sAnnotationPath = oEntityType.$path + "/" + sAnnotationPath;
        return oMetaModel.createBindingContext(sAnnotationPath);
    };

    // formatter functions declaration for obtaining iContext object at runtime
    sap.ovp.cards.AnnotationHelper.getFirstDataFieldName.requiresIContext = true;
    sap.ovp.cards.AnnotationHelper.getSecondDataFieldName.requiresIContext = true;
    sap.ovp.cards.AnnotationHelper.getThirdDataFieldName.requiresIContext = true;
    sap.ovp.cards.AnnotationHelper.formatFirstDataFieldValue.requiresIContext = true;
    sap.ovp.cards.AnnotationHelper.formatSecondDataFieldValue.requiresIContext = true;
    sap.ovp.cards.AnnotationHelper.formatThirdDataFieldValue.requiresIContext = true;
    sap.ovp.cards.AnnotationHelper.formatFourthDataFieldValue.requiresIContext = true;
    sap.ovp.cards.AnnotationHelper.formatFifthDataFieldValue.requiresIContext = true;
    sap.ovp.cards.AnnotationHelper.formatSixthDataFieldValue.requiresIContext = true;
    sap.ovp.cards.AnnotationHelper.getDataPointsCount.requiresIContext = true;
    sap.ovp.cards.AnnotationHelper.getFirstDataPointName.requiresIContext = true;
    sap.ovp.cards.AnnotationHelper.getSecondDataPointName.requiresIContext = true;
    sap.ovp.cards.AnnotationHelper.getThirdDataPointName.requiresIContext = true;
    sap.ovp.cards.AnnotationHelper.formatFirstDataPointValue.requiresIContext = true;
    sap.ovp.cards.AnnotationHelper.formatSecondDataPointValue.requiresIContext = true;
    sap.ovp.cards.AnnotationHelper.formatThirdDataPointValue.requiresIContext = true;
    sap.ovp.cards.AnnotationHelper.formatFirstDataPointState.requiresIContext = true;
    sap.ovp.cards.AnnotationHelper.formatSecondDataPointState.requiresIContext = true;
    sap.ovp.cards.AnnotationHelper.formatThirdDataPointState.requiresIContext = true;
    sap.ovp.cards.AnnotationHelper.formatItems.requiresIContext = true;
    sap.ovp.cards.AnnotationHelper.formatUrl.requiresIContext = true;
    sap.ovp.cards.AnnotationHelper.hasActions.requiresIContext = true;
    sap.ovp.cards.AnnotationHelper.getFirstDataPointValue.requiresIContext = true;
    sap.ovp.cards.AnnotationHelper.getSecondDataPointValue.requiresIContext = true;
    sap.ovp.cards.AnnotationHelper.isFirstDataPointPercentageUnit.requiresIContext = true;
}());
