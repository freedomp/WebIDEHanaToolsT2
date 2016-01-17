/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define(["sap/watt/hanaplugins/editor/plugin/hdbcalculationview/base/modelbase"], function(modelbase){

    var ValidityOperator = function(oValidity, sNewValue, apeModel) {
        return {
            object: oValidity,
            oldValue: oValidity._apeObject.operator,
            newValue: sNewValue,
            apeModel: apeModel,
            oldHighValue : oValidity._apeObject.highValue,
            _operator: function(sOldValue, sNewValue) {
                if (sOldValue !== "BT" && sNewValue === "BT") {
                    this.object.type = "RangeValueFilter";
                    this.object._apeObject.type = "RangeValueFilter";
                    this.object._apeObject.lowValue = this.object._apeObject.value;
                    delete this.object._apeObject.value;
                    this.object._apeObject.highValue = this.oldHighValue;
                    this.object.highValue = this.oldHighValue;
                }
                if (sOldValue === "BT" && sNewValue !== "BT") {
                    this.object.type = "SingleValueFilter";
                    this.object._apeObject.type = "SingleValueFilter";
                    this.object.highValue = null;
                    delete this.object._apeObject.highValue;
                    this.object._apeObject.value = this.object._apeObject.lowValue;
                    delete this.object._apeObject.lowValue;
                }
                this.object.operator = sNewValue;
                this.object._apeObject.operator = sNewValue;
                
                apeModel.checkUpdate();
            },
            

            execute: function(model, events) {
                this._operator(this.oldValue, this.newValue);
                events.push({
                    source: model.analyticPrivilege,
                    type: modelbase.ModelEvents.CHANGED,
                    name: model.analyticPrivilege.name,
                    changed: true
                });
            },
            undo: function(model, events) {
                this._operator(this.newValue, this.oldValue);
                events.push({
                    source: model.analyticPrivilege,
                    type: modelbase.ModelEvents.CHANGED,
                    name: model.analyticPrivilege.name,
                    changed: true
                });
            }

        };
    };




    return ValidityOperator;

});
