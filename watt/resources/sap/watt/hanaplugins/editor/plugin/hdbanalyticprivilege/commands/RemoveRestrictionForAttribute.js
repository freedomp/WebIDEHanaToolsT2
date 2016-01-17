/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define(["sap/watt/hanaplugins/editor/plugin/hdbcalculationview/base/modelbase"], function(modelbase) {

    var RemoveRestrictionForAttribute = function(oContextArray) {
        var command = {};

        command._oldRestrictionsForAttribute = []; 
        command._oldRestrictedAttributes = [];
        command._oldModels = [];
        command._keysToRemove = [];
        command._nextKeys = [];
        command._filterTypes = [];

        command.contextArray = oContextArray;



        command._remove = function() {
            for (var i = 0; i < this.contextArray.length; i++) {
                var path = this.contextArray[i].sPath;
                var aPathParts = path.split("/");
                var iIndex1 = parseInt(aPathParts[2]);
                var iRestrictionIndex = this.contextArray[i].oModel.oData.restrictions[iIndex1].restrictionIndex;
                var sAttributeName = this.contextArray[i].oModel.oData.restrictions[iRestrictionIndex].attributeName;
                var oRestrictions = this.contextArray[i].oModel.oOriginalModel.analyticPrivilege.restrictions;
                var oFilters = oRestrictions.get(iRestrictionIndex).filters;

                if (aPathParts.length > 3) {
                    var iIndex2 = aPathParts[3];
                    var oRestriction = this.contextArray[i].oModel.oData.restrictions[iIndex1][iIndex2];
                    var sFilterType = oRestriction.type + "s";
                    if (sFilterType === "CatalogProcedureFilters" || sFilterType === "RepositoryProcedureFilters") {
                        this._filterTypes.push("procedureFilters");
                        var procedureFilterIndex = command.contextArray[i].oModel.oData.restrictions[iIndex1][aPathParts[3]].procedureIndex;
                        this._keysToRemove.push(procedureFilterIndex);
                        this._nextKeys.push(oFilters.get(sAttributeName)[this._filterTypes[i]].getNextKey(procedureFilterIndex));
                        this._oldRestrictionsForAttribute.push(oFilters.get(sAttributeName)[this._filterTypes[i]].get(procedureFilterIndex));
                    } else {
                        this._filterTypes.push("valueFilters");
                        var valueFilterIndex = command.contextArray[i].oModel.oData.restrictions[iIndex1][aPathParts[3]].valueFilterIndex;
                        this._keysToRemove.push(valueFilterIndex);
                        this._nextKeys.push(oFilters.get(sAttributeName)[this._filterTypes[i]].getNextKey(valueFilterIndex));
                        this._oldRestrictionsForAttribute.push(oFilters.get(sAttributeName)[this._filterTypes[i]].get(valueFilterIndex));
                    }
                }
            }
            
            for(var j = 0; j < this._oldRestrictionsForAttribute.length; j++){
                this._oldRestrictionsForAttribute[j].$remove();
            }
            var oData = this.contextArray[0].oModel.oData;
            oData.restrictions = this.contextArray[0].oModel.parseRestrictions(oData._apeModel);
            this.contextArray[0].oModel.checkUpdate();

        };

        command.execute = function(model, events) {
            this._remove();
            events.push({
                source: model.analyticPrivilege,
                type: "changed",
                name: model.analyticPrivilege.name,
                changed: true
            });
        };

        command.undo = function(model, events) {
            var oRestrictions = this.contextArray[0].oModel.oOriginalModel.analyticPrivilege.restrictions;
            var path = this.contextArray[0].sPath;
            var aPathParts = path.split("/");
            var iIndex1 = parseInt(aPathParts[2]);
            var iRestrictionIndex = this.contextArray[0].oModel.oData.restrictions[iIndex1].restrictionIndex;
            var sAttributeName = this.contextArray[0].oModel.oData.restrictions[iRestrictionIndex].attributeName;
            var oFilters = oRestrictions.get(iRestrictionIndex).filters;
            for (var i = 0; i < this._oldRestrictionsForAttribute.length; i++) {
                oFilters.get(sAttributeName)[this._filterTypes[i]].add(this._keysToRemove[i], this._oldRestrictionsForAttribute[i], this._nextKeys[i]);
            }
            
            var oData = this.contextArray[0].oModel.oData;
            oData.restrictions = this.contextArray[0].oModel.parseRestrictions(oData._apeModel);
            
            this.contextArray[0].oModel.checkUpdate();

            this._oldRestrictionsForAttribute = [];
            this._oldRestrictedAttributes = [];
            this._oldModels = [];
            this._keysToRemove = [];
            this._nextKeys = [];
            this._filterTypes = [];

            events.push({
                source: model.analyticPrivilege,
                type: "changed",
                name: model.analyticPrivilege.name,
                changed: true
            });
        };

        return command;

    };

    return RemoveRestrictionForAttribute;

});
