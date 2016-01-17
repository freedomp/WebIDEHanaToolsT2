/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define(["sap/watt/hanaplugins/editor/plugin/hdbanalyticprivilege/uimodel/ApePropertyBinding",
    "sap/watt/hanaplugins/editor/plugin/hdbanalyticprivilege/uimodel/ApeListBinding",
    "sap/watt/hanaplugins/editor/plugin/hdbanalyticprivilege/uimodel/ApeTreeBinding",
    "sap/watt/hanaplugins/editor/plugin/hdbcalculationview/viewmodel/ModelProxyResolver"
], function(ApePropertyBinding, ApeListBinding, ApeTreeBinding, ModelProxyResolver) {
    //jQuery.sap.require("sap.watt.ideplatform.plugin.aceeditor.control.lib.ace-noconflict.ace");
    jQuery.sap.require("sap.ui.model.ClientModel");
    var ClientModel = sap.ui.model.ClientModel;
    var ApeModel = ClientModel.extend("sap.watt.hanaplugins.editor.plugin.hdbanalyticprivilege.uimodel.ApeModel", {

        _maxUiIndexAttributes: 0,
        _maxUiIndexFilters: 0,

        constructor: function(oModel, oContext) {
            this.oOriginalModel = oModel;
            ClientModel.apply(this, arguments);
            this.setData(this._parseApe(oModel, oContext));
        },

        metadata: {
            publicMethods: [] 
        },

        events: {

        }

    });

    ApeModel.WhereType = {
        "RESTRICTION": 0,
        "WHERE_SQL": 1,
        "CONDITION_PROCEDURE_NAME": 2

    };

    ApeModel.ProcedureType = {
        "CATALOG_PROCEDURE": "CATALOG_PROCEDURE",
        "REPOSITORY_PROCEDURE": "REPOSITORY_PROCEDURE"
    };

    ApeModel.prototype.setData = function(oData, bMerge) {
        if (bMerge) {
            this.oData = jQuery.extend(true, {}, this.oData, oData);
        } else {
            this.oData = oData;
        }
        this.checkUpdate();
    };

    ApeModel.prototype.bindProperty = function(sPath, oContext, mParameters) {
        var oBinding = new ApePropertyBinding(this, sPath, oContext, mParameters);
        return oBinding;
    };

    ApeModel.prototype.bindList = function(sPath, oContext, aSorters, aFilters, mParameters) {
        var oBinding = new ApeListBinding(this, sPath, oContext, aSorters, aFilters, mParameters);
        return oBinding;
    };

    ApeModel.prototype.bindTree = function(sPath, oContext, aFilters, mParameters) {
        var oBinding = new ApeTreeBinding(this, sPath, oContext, aFilters, mParameters);
        return oBinding;
    };

    ApeModel.prototype.getProperty = function(sPath, oContext) {
        return this._getObject(sPath, oContext);

    };

    ApeModel.prototype.setProperty = function(sPath, oValue, oContext) {
        var oData1 = this._getObject(sPath, oContext);
        var sContextPath = oContext ? oContext.sPath : "";
        var oObject = this._getObject(sContextPath, oContext);
        if (oObject) {
            this.checkUpdate();
        }
    };

    ApeModel.prototype._getObject = function(sPath, oContext) {
        var oNode = this.oData;
        if (oContext instanceof sap.ui.model.Context) {
            oNode = this._getObject(oContext.getPath());
        } else if (oContext) {
            oNode = oContext;
        }
        if (!sPath) {
            return oNode;
        }
        var aParts = sPath.split("/"),
            iIndex = 0;
        if (!aParts[0]) {
            // absolute path starting with slash
            oNode = this.oData;
            iIndex++;
        }
        while (oNode && aParts[iIndex]) {
            oNode = oNode[aParts[iIndex]];
            iIndex++;
        }
        return oNode;
    };
    ApeModel.prototype.createValidityWrapper = function(oApeVal, iIndex) {
        return {
            _index: iIndex,
            _apeObject: oApeVal,
            highValue: oApeVal.highValue,
            lowValue: oApeVal.lowValue ? oApeVal.lowValue : oApeVal.value,
            operator: oApeVal.operator,
            type: oApeVal.type,
            including: oApeVal.including
        };
    };

    ApeModel.prototype.createRestrictionWrapper = function(oApeVal, oApeFilterVal, iIndex2) {

        var dimensionName = oApeVal.dimensionUri;
        var modelName = oApeVal.originInformationModelUri;
        var that = this;
        //		    oApeVal.filters.foreach(function(oApeFilterVal, iIndex2) {
        var technicalName = "";

        if (dimensionName !== undefined) {
            technicalName = dimensionName;
        } else if (modelName !== undefined) {
            technicalName = modelName;
        }

        var oFilterVal = {
            index: iIndex2,
            dimensionUri: oApeVal.dimensionUri,
            originInformationModelUri: oApeVal.originInformationModelUri,
            attributeName: oApeFilterVal.attributeName,
            technicalName: technicalName + "$" + oApeFilterVal.attributeName
        };

        var iFilterCount = 0;
        if (oApeFilterVal.valueFilters !== undefined) {
            oApeFilterVal.valueFilters.foreach(function(oApeValueFilterVal, iIndex3) {
                if (oApeValueFilterVal.uiIndex === undefined) {
                    $.extend(oApeValueFilterVal, {
                        uiIndex: that._maxUiIndexFilters
                    });
                    that._maxUiIndexFilters++;
                }
            
                var oValueFilterVal = that.createValueFilterWrapper(oApeValueFilterVal, iIndex3, iFilterCount);
                //oFilterVal["v" + iIndex3] = oValueFilterVal;
                oFilterVal[iFilterCount] = oValueFilterVal;
                iFilterCount++;
            });
        }

        if (oApeFilterVal.procedureFilters !== undefined) {
            oApeFilterVal.procedureFilters.foreach(function(oApeProcedureFilterVal, iIndex4) {
                var sFilterType = oApeProcedureFilterVal.type;
                if (sFilterType === undefined) {
                    if (oApeProcedureFilterVal.procedureName.indexOf("\"") === 0) {
                        sFilterType = "CatalogProcedureFilter";
                    } else {
                        sFilterType = "RepositoryProcedureFilter";
                    }
                    $.extend(oApeProcedureFilterVal, {
                        type: sFilterType
                    });
                }
                if (oApeProcedureFilterVal.uiIndex === undefined) {
                    $.extend(oApeProcedureFilterVal, {
                        uiIndex: that._maxUiIndexFilters
                    });
                    that._maxUiIndexFilters++;
                }
                
                var sOperator = oApeProcedureFilterVal.operator;
                var bIncluding = oApeProcedureFilterVal.including;
                
                if(sOperator === "EQ" && bIncluding === false){
                    sOperator = "NE";
                }else if(sOperator === "CP" && bIncluding === false){
                    sOperator = "NCP";
                }
                
                var oProcedureFilterVal = {

                    //index: "p" + iIndex4,
                    index: iFilterCount, 
                    procedureIndex: iIndex4,
                    type: sFilterType,
                    operator: sOperator,
                    value: oApeProcedureFilterVal.procedureName,
                    uiIndex: oApeProcedureFilterVal.uiIndex

                };
                //oFilterVal["p" + iIndex4] = oProcedureFilterVal;
                oFilterVal[iFilterCount]  = oProcedureFilterVal;
                
                iFilterCount++;
            });
        }

        oFilterVal.count = iFilterCount;

        var aFilterArray = [];
        for (var filter in oFilterVal) {
            if (oFilterVal[filter] !== undefined && oFilterVal[filter].uiIndex !== undefined) {
                aFilterArray.push(oFilterVal[filter]);
                delete oFilterVal[filter];
            }
        }
        aFilterArray.sort(function(a, b) {
            return a.uiIndex - b.uiIndex;
        });

        for (filter in aFilterArray) {
            oFilterVal[aFilterArray[filter].uiIndex] = aFilterArray[filter];
        }
        return oFilterVal;
    };

    ApeModel.prototype.createValueFilterWrapper = function(oApeValueFilterVal, iIndex3, iFilterIndex) {
        var operator = null;
        if (oApeValueFilterVal.operator === "NL") {
            if (oApeValueFilterVal.including === "true") {
                operator = "NU";
            } else {
                operator = "NL";
            }
        } else if (oApeValueFilterVal.operator === "EQ"){
            if (oApeValueFilterVal.including === "true") {
                operator = "EQ";
            } else {
                operator = "NE";
            }
        }else{
            operator = oApeValueFilterVal.operator;
        }
        var oValueFilterVal = {
            //index: "v" + iIndex3
            index: iFilterIndex, 
            valueFilterIndex: iIndex3,
            type: "valueFilter",
            operator: operator,
            including: oApeValueFilterVal.including,
            value: oApeValueFilterVal.value,
            lowValue: oApeValueFilterVal.lowValue,
            highValue: oApeValueFilterVal.highValue,
            uiIndex: oApeValueFilterVal.uiIndex
        };
        return oValueFilterVal;
    };

    ApeModel.prototype.parseRestrictions = function(oApeModel) {
        var that = this;
        var oRestrictions = {};

        var apeRestrictions = oApeModel.analyticPrivilege.restrictions;
        var restrictionCounter = 0;
        apeRestrictions.foreach(function(oApeVal, iIndex) {
            oApeVal.filters.foreach(function(oApeFilterVal, iIndex2) {
                var oFilterVal = that.createRestrictionWrapper(oApeVal, oApeFilterVal, iIndex);
                oFilterVal.restrictionIndex = iIndex;

                if (oApeFilterVal.uiIndex === undefined) {
                    $.extend(oApeFilterVal, {
                        uiIndex: that._maxUiIndexAttributes
                    });
                    that._maxUiIndexAttributes++;
                }
                oFilterVal.index = oApeFilterVal.uiIndex;

                oRestrictions[restrictionCounter] = oFilterVal;
                restrictionCounter++;
            });
        });

        oRestrictions.length = restrictionCounter;

        var aRestrictionArray = [];
        for (var restriction in oRestrictions) {
            if (oRestrictions[restriction] !== undefined && oRestrictions[restriction].index !== undefined) {
                aRestrictionArray.push(oRestrictions[restriction]);
                delete oRestrictions[restriction];
            }
        }
        aRestrictionArray.sort(function(a, b) {
            return a.index - b.index;
        });

        for (var oRestriction in aRestrictionArray) {
            oRestrictions[aRestrictionArray[oRestriction].index] = aRestrictionArray[oRestriction];
        }

        return oRestrictions;
    };

    ApeModel.prototype.parseSecuredModels = function(oWattModel, oContext) {
        var aSecuredModels = [];
        var apeSecuredModels = oWattModel.analyticPrivilege.securedModels;
        var apeSecuredModelUris = apeSecuredModels.modelUris;

        apeSecuredModelUris.foreach(function(oApeSecuredModelUri, iIndex) {
            var oSecuredModel = {
                index: iIndex,
                modelUri: oApeSecuredModelUri.uriString,
                dimensions: [],
                metadata: {}
            };

            var entity = null;
            var callbackresults = function() {
                var elements = entity.elements;
                var dimensions = [];
                oSecuredModel.metadata = elements;

                var sModelUri = oSecuredModel.modelUri;
                var aUriParts = sModelUri.split("/");
                var sModelType = aUriParts[2];
                for (var j = 0; j < elements.size(); j++) {
                	
                	// Code for Repo 1 XS 1 
                    /*if (elements.getAt(j).sharedDimension !== undefined) {
                        var sharedDimensionName = elements.getAt(j).sharedDimension;
                        var aDimUriParts = sharedDimensionName.split("::");
                        var sPackagename = aDimUriParts[0];
                        var sDimensionName = aDimUriParts[1];
                        var sDimensionType = null;
                        if (sModelType === "calculationviews") {
                            sDimensionType = "calculationviews";
                        } else {
                            sDimensionType = "attributeviews";
                        }

                        var sDimensionUri = "/" + sPackagename + "/" + sDimensionType + "/" + sDimensionName;
                        if (dimensions.indexOf(elements.getAt(j).sharedDimension) < 0) {
                            dimensions.push(sDimensionUri);
                        }

                    }*/
                	
                	// Code for Repo 2 XS advanced
                	
                	if (elements.getAt(j).sharedDimension !== undefined) {
                		 var sharedDimensionName = elements.getAt(j).sharedDimension;
                		 if (dimensions.indexOf(elements.getAt(j).sharedDimension) < 0) {
                             dimensions.push(sharedDimensionName);
                         }
                	}
                    
                    
                }

                oSecuredModel.dimensions = dimensions;
            };

//            var aUriParts = oSecuredModel.modelUri.split("/");
//            var sPackageName = aUriParts[1];
//            var sType = aUriParts[2].substring(0, aUriParts[2].length - 1).toUpperCase();
//            var sDataSourceName = aUriParts[3];
            
            var sDataSourceName = oSecuredModel.modelUri;

            entity = oWattModel.createEntity({
                name: sDataSourceName,
                id:sDataSourceName,
                type: "CALCULATIONVIEW",
                isProxy: true
            });
            entity.isProxy = true;

            ModelProxyResolver.ProxyResolver.resolve(oWattModel, oContext, callbackresults);

            aSecuredModels.push(oSecuredModel);
        });
        return aSecuredModels;

    };

    ApeModel.prototype.parseValidities = function(oApe) {
        // validities
        var that = this;
        var aValidities = [];
        var apeValidities = oApe.analyticPrivilege.validities;
        apeValidities.foreach(function(oApeVal, iIndex) {
            aValidities.push(that.createValidityWrapper(oApeVal, iIndex));
        });
        return aValidities;

    };

    ApeModel.prototype._parseProcedureType = function(sName) {
        var result;
        if (typeof sName === "string" && sName.length > 0 && sName.indexOf("::") === -1) {
            result = ApeModel.ProcedureType.CATALOG_PROCEDURE;
        } else {
            result = ApeModel.ProcedureType.REPOSITORY_PROCEDURE;
        }

        return result;
    };

    ApeModel.prototype._parseApe = function(oWattModel, oContext) {
        // basis
        var allInformationModels = oWattModel.analyticPrivilege.securedModels.allInformationModels;
        var oData = {
            "_apeModel": oWattModel,
            "_apeContext": oContext,
            "_undoManager": oWattModel.$getUndoManager(),
            "_listenToUndoStackChangedEvents" : false,
            "label": oWattModel.analyticPrivilege.label,
            "name": oWattModel.analyticPrivilege.name,
            "privilegeType": oWattModel.analyticPrivilege.privilegeType,
            "allInformationModels": (allInformationModels && allInformationModels === "true") ? true : false,
            "securedModels": this.parseSecuredModels(oWattModel, oContext)
        };

        if (oWattModel.analyticPrivilege.conditionProcedureName) {
            $.extend(oData, {
                "whereType": ApeModel.WhereType.CONDITION_PROCEDURE_NAME,
                "conditionProcedureName": oWattModel.analyticPrivilege.conditionProcedureName,
                "procedureType": this._parseProcedureType(oData.conditionProcedureName)
            });
        } else if (oWattModel.analyticPrivilege.whereSql) {
            $.extend(oData, {
                "whereType": ApeModel.WhereType.WHERE_SQL,
                "whereSql": oWattModel.analyticPrivilege.whereSql
            });
        } else {
            $.extend(oData, {
                "whereType": ApeModel.WhereType.RESTRICTION,
                "validities": this.parseValidities(oWattModel),
                "restrictions": this.parseRestrictions(oWattModel)
            });
        }

        return oData; 
    };

    ApeModel.prototype.isList = function(sPath, oContext) {
        var sAbsolutePath = this.resolve(sPath, oContext);
        return jQuery.isArray(this._getObject(sAbsolutePath));
    };

    return ApeModel;

});
