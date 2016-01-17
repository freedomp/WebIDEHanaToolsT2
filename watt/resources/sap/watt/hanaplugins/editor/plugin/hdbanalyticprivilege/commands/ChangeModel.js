/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define(["sap/watt/hanaplugins/editor/plugin/hdbcalculationview/base/modelbase"], function(modelbase) {

    var ChangeModel = function(sNewValue, oContext) {
        var command = {};

        command._oldModel = null;
        command._oldUri = null;
        command._oldAttribute = null;
        command._newAttribute = null;
        command._keyToRemove = null;
        command._nextKey = null;
        
        command.newValue = sNewValue;
        command.path = oContext.sPath;
        command.oContext = oContext;

        command.execute = function(model, events) {
            var aPathParts = this.path.split("/");

            var iIndex1 = parseInt(aPathParts[2]);
            var iRestrictionIndex = this.oContext.oModel.oData.restrictions[iIndex1].restrictionIndex;
            var sOldAttributeName = this.oContext.oModel.oData.restrictions[iIndex1].attributeName;

            var oRestrictions = this.oContext.oModel.oOriginalModel.analyticPrivilege.restrictions;
            var oRestriction = oRestrictions.get(iRestrictionIndex);
            this._oldModel = oRestriction;
            var oFilters = oRestriction.filters;
            
            if(oRestriction.dimensionUri !== undefined){
                this._oldUri = oRestriction.dimensionUri;
                oRestriction.dimensionUri = undefined ;
            }else{
                this._oldUri = oRestriction.originInformationModelUri;
            }
            //at the moment we do not set dimensionUri
            //oRestriction.dimensionUri = that.newValue;
            oRestriction.originInformationModelUri = this.newValue;
            
            this._oldAttribute = oFilters.get(sOldAttributeName);
            this._keyToRemove = sOldAttributeName;
            this._nextKey = oFilters.getNextKey(sOldAttributeName);
            oFilters.get(sOldAttributeName).$remove();

            var oFilterTemplate = {
                attributeName: "select",
                type: "AttributeFilter"
            };
            this._newAttribute = oRestriction.createFilter(oFilterTemplate);
            
            var oData = this.oContext.oModel.oData;
            oData.restrictions = this.oContext.oModel.parseRestrictions(oData._apeModel);
            
            this.oContext.oModel.checkUpdate();
            events.push({
                source: model.analyticPrivilege,
                type: "changed",
                name: model.analyticPrivilege.name,
                changed: true
            });
        };
        
        command.undo = function(model, events){
            
            this._oldModel.originInformationModelUri = this._oldUri;
            this._oldModel.filters.get(this._newAttribute.$getKeyAttributeValue()).$remove();
            this._oldModel.filters.add(this._keyToRemove, this._oldAttribute, this._nextKey);
            
            var oData = this.oContext.oModel.oData;
            oData.restrictions = this.oContext.oModel.parseRestrictions(oData._apeModel);
            this.oContext.oModel.checkUpdate();
            events.push({
                source: model.analyticPrivilege,
                type: "changed",
                name: model.analyticPrivilege.name,
                changed: true
            });
        };
        return command;
    };
    return ChangeModel;
});
