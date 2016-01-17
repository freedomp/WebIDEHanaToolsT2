/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define(["sap/watt/hanaplugins/editor/plugin/hdbcalculationview/sharedmodel/sharedmodel"], function(sharedmodel) {
    
    var ValueFilterOperator = sharedmodel.ValueFilterOperator;
    
    
    var SQLRenderer = function(){
        
    };
    
    SQLRenderer.prototype.renderWhereClause = function(oApeModel){
        this._validityCounter = 0;
        this._restrictionCounter = 0;
        this._filterCounter = 0;
        this._filterCounterTotal = 0;
        this._valueFilterCounter = 0;
        this._valueFilterCounterTotal = 0;
        
        var result = "";
        var model = oApeModel.getData()._apeModel;
        
        var oRestrictions = model.analyticPrivilege.restrictions;
        var sRestrictions = this._renderRestrictions(oRestrictions);
        var oValidities = model.analyticPrivilege.validities;
        var sValidities = this._renderValidities(oValidities);
        
        result += sRestrictions;
        result += (this._filterCounterTotal > 0 && this._validityCounter > 0) ? "\r\nAND ":"";
        result += sValidities;
        
        return result;
        
    };
    
    SQLRenderer.prototype._renderValidities = function(oValidities){
        var that = this;
        var result = "";
        var dayStart = " 00:00:00.000";
        var dayEnd = " 23:59:59.999";
        
        oValidities.foreach(function(oValidity, iIndex) {
            that._validityCounter++;
            
            if(that._validityCounter++ > 1){
                result += "\r\nAND ";
            }
        
            if (oValidity.including === "false") {
                result += "(NOT CURRENT_DATE ";
            } else {
                result += "(CURRENT_DATE ";
            }
            
            switch (oValidity.operator){
                case ValueFilterOperator.BETWEEN:
                    result += "BETWEEN ";
                    result += "'" + oValidity.lowValue + dayStart + "'";
                    result += " AND ";
                    result += "'" + oValidity.highValue + dayEnd + "'";
                    break;
                case ValueFilterOperator.EQUAL:
                    result += "BETWEEN ";
                    result += "'" + oValidity.value + dayStart + "'";
                    result += " AND ";
                    result += "'" + oValidity.value + dayEnd + "'";
                    break;      
                case ValueFilterOperator.GREATER_EQUAL:
                    result += ">= ";
                    result += "'" + oValidity.value + dayStart + "'";
                    break;
                case ValueFilterOperator.GREATER_THAN:
                    result += "> ";
                    result += "'" + oValidity.value + dayEnd + "'";
                    break;
                case ValueFilterOperator.LESS_EQUAL:
                    result += "<= ";
                    result += "'" + oValidity.value + dayEnd + "'";
                    break;  
                case ValueFilterOperator.LESS_THAN:
                    result += "< ";
                    result += "'" + oValidity.value + dayStart + "'";
                    break;
                default:
                    throw {
                        message : "operator in validity not supported",
                        validity : oValidity
                    };
            }
  
            result += ") ";
        });
        return result;
    };
    
    SQLRenderer.prototype._renderRestrictions = function(oRestrictions){
        var that = this;
        var result = "";
        oRestrictions.foreach(function(oRestriction, iIndex) {
            that._restrictionCounter++;
            
            if(that._restrictionCounter > 1){
                result += "\r\nAND ";
            }
            that._filterCounter = 0;
            oRestriction.filters.foreach(function(oFilter, iIndex2) {
                that._filterCounter++;
                that._filterCounterTotal++;
                
                if(that._filterCounter > 1){
                    result += " AND (";
                }else {
                    result += "(";
                }
                
                switch(oFilter.type){
                    case "AttributeFilter":
                        //TODO Some demo attribute filters have procedur filters. check if this is valid
                        console.log("ProcedureFilters ignored for "+oFilter.attributeName);
                        result += that._renderAttributeFilters(oFilter.attributeName, oFilter.valueFilters);
                        break;
                    case "ProcedureFilter":
                        result += that._renderProcedureFilters(oFilter.attributeName, oFilter.procedureFilters);
                        break;
                }
                
                result += ")";
            });
            
        });
        return result;
    };
    
    SQLRenderer.prototype._renderAttributeFilters = function(sAttribute, oAttributeFilters){
        var result = "";
        var that = this;
        that._valueFilterCounter = 0;
        //attribute filter a.k.a. value filter
        var attrFilterCount = oAttributeFilters.count();
        oAttributeFilters.foreach(function(oAttrFilter, iIndex){
            
            that._valueFilterCounter++;
            that._valueFilterCounterTotal++;

            if(that._valueFilterCounter > 1){
                result += " OR ";
            }
            if(attrFilterCount > 1){
                result += "(";
            }
            switch(oAttrFilter.operator){
                case ValueFilterOperator.BETWEEN:
                    result += oAttrFilter.including !== "false" ? "" : "NOT ";
                    result += "\"" + sAttribute + "\" ";
                    result += "BETWEEN ";
                    result += "'" + oAttrFilter.lowValue + "'";
                    result += " AND ";
                    result += "'" + oAttrFilter.highValue + "'";
                    break;
                case ValueFilterOperator.EQUAL:
                    result += oAttrFilter.including !== "false" ? "" : "NOT ";
                    result += "\"" + sAttribute + "\" ";
                    result += "= ";
                    result += "'" + oAttrFilter.value + "'";
                    break;      
                case ValueFilterOperator.GREATER_EQUAL:
                    result += oAttrFilter.including !== "false" ? "" : "NOT ";
                    result += "\"" + sAttribute + "\" ";
                    result += ">= ";
                    result += "'" + oAttrFilter.value + "'";
                    break;
                case ValueFilterOperator.GREATER_THAN:
                    result += oAttrFilter.including !== "false" ? "" : "NOT ";
                    result += "\"" + sAttribute + "\" ";
                    result += "> ";
                    result += "'" + oAttrFilter.value + "'";
                    break;
                case ValueFilterOperator.LESS_EQUAL:
                    result += oAttrFilter.including !== "false" ? "" : "NOT ";
                    result += "\"" + sAttribute + "\" ";
                    result += "<= ";
                    result += "'" + oAttrFilter.value + "'";
                    break;  
                case ValueFilterOperator.LESS_THAN:
                    result += oAttrFilter.including !== "false" ? "" : "NOT ";
                    result += "\"" + sAttribute + "\" ";
                    result += "< ";
                    result += "'" + oAttrFilter.value + "'";
                    break; 
                case ValueFilterOperator.IN:
                    result += oAttrFilter.including !== "false" ? "" : "NOT ";
                    result += "\"" + sAttribute + "\" ";
                    result += "IN ";
                    result += "(" + oAttrFilter.value + ")";
                    break; 
                case ValueFilterOperator.CONTAINS_PATTERN:
                    result += oAttrFilter.including !== "false" ? "" : "NOT ";
                    result += "\"" + sAttribute + "\" ";
                    result += "LIKE ";
                    var like = oAttrFilter.value.replace(/\*/g,"%");
                    result += "'" + like + "'";
                    break; 
                case ValueFilterOperator.IS_NULL:
                    result += "\"" + sAttribute + "\" ";
                    result += "IS ";
                    result += oAttrFilter.including !== "false" ? "" : "NOT ";
                    result += "NULL ";
                    break;
                default:
                    throw {
                        message : "operator in filter not supported",
                        attribute : sAttribute,
                        filter : oAttrFilter
                    };
                
            }
            if(attrFilterCount > 1){
                result += ")";
            }
        });

        return result;
    };
    
    SQLRenderer.prototype._renderProcedureFilters = function(sAttribute, oProcedureFilters){
        
        throw {
            message : "ProcedureFilters are not supported",
            attribute : sAttribute,
            procedureFilters : oProcedureFilters
        };
    };
    
    return new SQLRenderer();
});
