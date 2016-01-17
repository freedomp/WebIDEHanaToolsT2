/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define(["sap/watt/hanaplugins/editor/plugin/hdbcalculationview/base/modelbase"], function(modelbase) {
    var RestrictionOperator = function(sNewOperator, oContext) {
        var command = {};
        command._newOperator = sNewOperator;
        command._oldOperator = null;
        command._oldValue = null;
         
        command.path = oContext.sPath;
        command.context = oContext;
        command.aPathParts = command.path.split("/");
        command.iIndex1 = parseInt(command.aPathParts[2]);
        if (command.aPathParts.length > 3) {
            command.iIndex2 = parseInt(command.aPathParts[3]);
            command.iRestrictionIndex = command.context.oModel.oData.restrictions[command.iIndex1].restrictionIndex;
            command.sAttributeName = command.context.oModel.oData.restrictions[command.iIndex1].attributeName;
            command.sFilterType = command.context.oModel.oData.restrictions[command.iIndex1][command.aPathParts[3]].type + "s";
            command.oRestrictions = command.context.oModel.oOriginalModel.analyticPrivilege.restrictions;
            command.oFilters = command.oRestrictions.get(command.iRestrictionIndex).filters;
            command.oValueFilters = command.oFilters.get(command.sAttributeName).valueFilters;
            command.oProcedureFilters = command.oFilters.get(command.sAttributeName).procedureFilters; 

            if (command.sFilterType === "valueFilters") {
                command.valueFilterIndex = command.context.oModel.oData.restrictions[command.iIndex1][command.aPathParts[3]].valueFilterIndex;
                command._oldOperator = command.oValueFilters.get(command.valueFilterIndex).operator; 
                command._oldValue = command.oValueFilters.get(command.valueFilterIndex).value;
            } else {
                command.sFilterType = "procedureFilters";
                command.procedureFilterIndex = command.context.oModel.oData.restrictions[command.iIndex1][command.aPathParts[3]].procedureIndex; 
                command._oldOperator = command.oProcedureFilters.get(command.procedureFilterIndex).operator;
                command._oldValue = command.oProcedureFilters.get(command.procedureFilterIndex).procedureName;
            }
        }
        
        /*modelbase.ModelEvents.registerEventTypes(command.context.oModel.oOriginalModel.analyticPrivilege.constructor, {
            operatorchanged: "operatorchanged" 
        });*/

        command._operator = function(sOldValue, sNewValue) {
            if(this.sFilterType === "valueFilters"){
                var oRestriction = this.oFilters.get(this.sAttributeName)[this.sFilterType].get(this.valueFilterIndex) ;
            }else{
                var oRestriction = this.oFilters.get(this.sAttributeName)[this.sFilterType].get(this.procedureFilterIndex);
            }
            

            if (this._oldOperator !== "BT" && this._oldOperator !== "IN" && (sNewValue === "BT" || sNewValue === "IN")) {
                
                if(this.sFilterType === "valueFilters"){
                    this.oFilters.get(this.sAttributeName)[this.sFilterType].get(this.valueFilterIndex).value = "";
                    this.oFilters.get(this.sAttributeName)[this.sFilterType].get(this.valueFilterIndex).type = "RangeValueFilter";
                }
                
            }
            if ((this._oldOperator === "BT" || this._oldOperator === "IN") && sNewValue !== "BT" && sNewValue !== "IN") {
                if(this.sFilterType === "valueFilters"){
                    oRestriction.value = "";
                    oRestriction.type = "SingleValueFilter";
                    oRestriction.highValue = null;
                    oRestriction.lowValue = null;
                }
            }

            if (sNewValue === "NL") {
               if(this.sFilterType === "valueFilters"){
                    oRestriction.value = "";
                    oRestriction.including = "false";
               }
            }
            
            if (this._oldOperator !== "NU" && sNewValue === "NU") {
               if(this.sFilterType === "valueFilters"){
                    oRestriction.value = "";
                    oRestriction.including = "true";
                    sNewValue = "NL";
               }
            }
            
            if (sNewValue === "EQ") {
               if(this.sFilterType === "valueFilters"){
                    oRestriction.value = "";
                    oRestriction.including = "true";
               }
            }
            
            if (this._oldOperator !== "NE" && sNewValue === "NE") {
               if(this.sFilterType === "valueFilters"){
                    oRestriction.value = "";
                    oRestriction.including = "false";
                    sNewValue = "EQ";
               }
            }
            
            if (sNewValue === "CP") {
               if(this.sFilterType === "valueFilters"){
                    oRestriction.value = "";
                    oRestriction.including = "true";
               }
            }
            
            if (this._oldOperator !== "NCP" && sNewValue === "NCP") {
               if(this.sFilterType === "valueFilters"){
                    oRestriction.value = "";
                    oRestriction.including = "false";
                    sNewValue = "CP";
               }
            }
            
            
            
            oRestriction.operator = sNewValue;
            var oData = this.context.oModel.oData;
            oData.restrictions = this.context.oModel.parseRestrictions(oData._apeModel);
            
            //this.context.oModel.checkUpdate();
        };
        
        command.execute = function(model, events) {
            if (this.aPathParts.length > 3) {
                this._operator(this._oldOperator, this._newOperator);
                events.push({
                    source: model.analyticPrivilege,
                    type: modelbase.ModelEvents.CHANGED,
                    name: model.analyticPrivilege.name,
                    changed: true
                });
            }
        };
        command.undo = function(model, events) {
            if(this.sFilterType === "valueFilters"){
                var oRestriction = this.oFilters.get(this.sAttributeName)[this.sFilterType].get(this.valueFilterIndex) ;
            }else{
                var oRestriction = this.oFilters.get(this.sAttributeName)[this.sFilterType].get(this.procedureFilterIndex);
            }
            oRestriction.operator = this._oldOperator;
            if(this.sFilterType === "valueFilters"){
                oRestriction.value = this._oldValue;
            }else{
                oRestriction.procedureName = this._oldValue;
            }
            
            var oData = this.context.oModel.oData;
            oData.restrictions = this.context.oModel.parseRestrictions(oData._apeModel);
            
            this.context.oModel.checkUpdate();
            
            events.push({
                    source: model.analyticPrivilege,
                    type: modelbase.ModelEvents.CHANGED,
                    name: model.analyticPrivilege.name,
                    changed: true
            });
        };


        return command;
    };

    return RestrictionOperator;

});
