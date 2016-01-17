/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define(["sap/watt/hanaplugins/editor/plugin/hdbcalculationview/base/modelbase"], function(modelbase) {

    var AddRestrictionForAttribute = function(oModel, iIndex, sAttributeName) {
        var command = {};
        command._oModel = oModel;
        command._newValueFilter = null;
        command._attribute = null;
        
        command.execute = function(model, events) {

                var iIndex1 = iIndex;
                var oData = this._oModel.getData();
                var iRestrictionIndex = oData.restrictions[iIndex1].restrictionIndex;
                var iRestrictionCount = oData.restrictions[iIndex1].count;
               
                var oFilter = oModel.oOriginalModel.analyticPrivilege.restrictions.get(iRestrictionIndex).filters.get(sAttributeName);
                this._attribute = oFilter;
                
                var oFilterTemplate = {
                    type: "SingleValueFilter",
                    operator: "EQ",
                    value: "",
                    including: "true",
                    uiIndex: iRestrictionCount
                };
                
                var oValueFilter = oFilter.createValueFilter(oFilterTemplate);
                this._newValueFilter = oValueFilter;
                
                oData.restrictions = this._oModel.parseRestrictions(oData._apeModel);
                this._oModel.checkUpdate();
                    events.push({
                        source: model.analyticPrivilege,
                        type: modelbase.ModelEvents.CHANGED,
                        name: model.analyticPrivilege.name,
                        changed: true
                    });
            };
            command.undo = function(model, events) {
                this._attribute.valueFilters.get(this._newValueFilter.$getKeyAttributeValue()).$remove();
                
                var oData = this._oModel.getData();
                oData.restrictions = this._oModel.parseRestrictions(oData._apeModel);
                this._oModel.checkUpdate();

                events.push({
                    source: model.analyticPrivilege,
                    type: modelbase.ModelEvents.CHANGED,
                    name: model.analyticPrivilege.name,
                    changed: true
                });
            };
        return command;
    };

    return AddRestrictionForAttribute;
});
