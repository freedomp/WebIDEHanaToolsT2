/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define(["sap/watt/hanaplugins/editor/plugin/hdbcalculationview/base/modelbase"], function(modelbase) {

    var ChangeRestrictionValue = function(sNewValue, oContext) {
        var command = {};

        command.newValue = sNewValue;
        command.path = oContext.sPath;
        command.context = oContext;
        command.object = oContext.getObject();

        var aPathParts = command.path.split("/");
        command.iIndex1 = parseInt(aPathParts[2]);
        command.iIndex2 = parseInt(aPathParts[3]);
        command.iRestrictionIndex = command.context.oModel.oData.restrictions[command.iIndex1].restrictionIndex;
        command.oRestriction = command.context.oModel.oData.restrictions[command.iIndex1][aPathParts[3]];

        command.sAttributeName = command.context.oModel.oData.restrictions[command.iIndex1].attributeName;
        command.sFilterType = command.oRestriction.type + "s";

        command.oRestrictions = command.context.oModel.oOriginalModel.analyticPrivilege.restrictions;
        command.oFilters = command.oRestrictions.get(command.iRestrictionIndex).filters;
        command.oValueFilters = command.oFilters.get(command.sAttributeName).valueFilters;
        command.oProcedureFilters = command.oFilters.get(command.sAttributeName).procedureFilters;

        if (command.sFilterType === "valueFilters") {
            command.valueFilterIndex = command.context.oModel.oData.restrictions[command.iIndex1][aPathParts[3]].valueFilterIndex;
            if(command.object.operator === "BT"){
                command.oldValue = [command.oValueFilters.get(command.valueFilterIndex).lowValue, command.oValueFilters.get(command.valueFilterIndex).highValue];
                
            }else{
                command.oldValue = command.oValueFilters.get(command.valueFilterIndex).value;
            }
        } else {
            command.procedureFilterIndex = command.context.oModel.oData.restrictions[command.iIndex1][aPathParts[3]].procedureIndex; 
            command.oldValue = command.oProcedureFilters.get(command.procedureFilterIndex).procedureName;
        }

        command._value = function(sOldValue, sNewValue) {
            
            if(this.oRestriction.type === "CatalogProcedureFilter" || this.oRestriction.type === "RepositoryProcedureFilter"){
                this.oFilters.get(this.sAttributeName).procedureFilters.get(this.procedureFilterIndex).procedureName = sNewValue;
                this.oRestriction.value = sNewValue;
            }else{
                var oValueFilter = this.oFilters.get(this.sAttributeName).valueFilters.get(this.valueFilterIndex);
                if(this.object.operator === "BT"){
                    var aValues = sNewValue;
                    var oLowValue = aValues[0];
                    var oHighValue = aValues[1];
                    this.object.lowValue = oLowValue;
                    this.object.highValue = oHighValue;
                    this.object.value = undefined;
                    oValueFilter.lowValue = oLowValue;
                    oValueFilter.highValue = oHighValue;
                    oValueFilter.value = undefined;
                }else{
                    this.object.lowValue =  undefined;
                    this.object.highValue =  undefined;
                    this.object.value = sNewValue;
                    oValueFilter.lowValue =  undefined;
                    oValueFilter.highValue =  undefined;
                    oValueFilter.value = sNewValue;
                }
            }
            this.context.oModel.checkUpdate();
        };

        command.execute = function(model, events) {
            this._value(this.oldValue, this.newValue);
            events.push({
                source: model.analyticPrivilege,
                type: "changed",
                name: model.analyticPrivilege.name,
                changed: true
            });
        };

        command.undo = function(model, events) {
            this._value(this.newValue, this.oldValue);
            
            events.push({
                source: model.analyticPrivilege,
                type: "changed",
                name: model.analyticPrivilege.name,
                changed: true
            });
        };
        
        return command;
    };
    return ChangeRestrictionValue;
});
