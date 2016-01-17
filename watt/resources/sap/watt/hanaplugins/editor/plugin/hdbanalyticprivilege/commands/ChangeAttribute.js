/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define(["sap/watt/hanaplugins/editor/plugin/hdbcalculationview/base/modelbase"], function(modelbase) {

    var ChangeAttribute = function(sNewValue, oContext, sOrigin, bIsPartOfDimension) {

        var command = {};
        command._oldAttribute = null;
        command._oldOrigin = null;
        command._oldOriginIsPartOfDimension = false;
        command._keyToRemove = null;
        command._nextKey = null;
        command.newValue = sNewValue;
        command.path = oContext.sPath;
        command.context = oContext;

        command.aPathParts = command.path.split("/");
        command.iIndex1 = parseInt(command.aPathParts[2]);
        command.iRestrictionIndex = command.context.oModel.oData.restrictions[command.iIndex1].restrictionIndex;

        command.sAttributeName = command.context.oModel.oData.restrictions[command.iIndex1].attributeName;

        command.oRestrictions = command.context.oModel.oOriginalModel.analyticPrivilege.restrictions;
        command.oRestriction = command.oRestrictions.get(command.iRestrictionIndex);
        command.oFilters = command.oRestrictions.get(command.iRestrictionIndex).filters;

        command._attribute = function(sOldValue, sNewValue) {

            this._oldAttribute = this.oFilters.get(this.sAttributeName);
            if(this.oRestriction.dimensionUri !== undefined){
                this._oldOrigin = this.oRestriction.dimensionUri; 
                this._oldOriginIsPartOfDimension = true;
            }else{
                this._oldOrigin = this.oRestriction.originInformationModelUri;
            }
            
            this._keyToRemove = this.sAttributeName;
            this._nextKey = this.oFilters.getNextKey(this.sAttributeName);
            this.oFilters.get(this.sAttributeName).$remove();

            var oFilterTemplate = {
                attributeName: sNewValue,
                type: "AttributeFilter",
                uiIndex: this._oldAttribute.uiIndex 
            };
            this.oRestriction.createFilter(oFilterTemplate); 
            this.oRestriction.attributeName = sNewValue;
            if(bIsPartOfDimension === true){
                this.oRestriction.dimensionUri = sOrigin;
                this.oRestriction.originInformationModelUri = undefined;
            }else{
                this.oRestriction.dimensionUri = undefined;  
                this.oRestriction.originInformationModelUri = sOrigin; 
            }
            var oData = this.context.oModel.oData;
            oData.restrictions = this.context.oModel.parseRestrictions(oData._apeModel);
            this.context.oModel.checkUpdate();
        };

        command.execute = function(model, events) {
            this._attribute(this.oldValue, this.newValue);
            events.push({
                source: model.analyticPrivilege,
                type: "changed",
                name: model.analyticPrivilege.name,
                changed: true
            });
        };

        command.undo = function(model, events) {
            this.oRestriction.filters.get(sNewValue).$remove();
            this.oRestriction.filters.add(this._keyToRemove, this._oldAttribute, this._nextKey);
            if(this._oldOriginIsPartOfDimension){
                this.oRestriction.dimensionUri = this._oldOrigin;
                this.oRestriction.originInformationModelUri = undefined; 
            }else{
                this.oRestriction.dimensionUri = this._oldOrigin; 
                this.oRestriction.originInformationModelUri = undefined; 
            }
            var oData = this.context.oModel.oData;
            oData.restrictions = this.context.oModel.parseRestrictions(oData._apeModel);
            this.context.oModel.checkUpdate();
            
            events.push({
                source: model.analyticPrivilege,
                type: "changed",
                name: model.analyticPrivilege.name,
                changed: true
            });
        };
        
        return command;
    };
    return ChangeAttribute;
});
