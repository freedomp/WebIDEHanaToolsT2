/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define(["sap/watt/hanaplugins/editor/plugin/hdbcalculationview/base/modelbase"], function(modelbase){

    var ValidityFrom = function(oValidity, sNewValue) {
        return {
            object: oValidity,
            oldLowValue: oValidity._apeObject.lowValue,
            oldValue: oValidity._apeObject.value,
            newValue: sNewValue,

            execute: function(model, events) {

                this.object.lowValue = this.newValue;

                if (this.object.type === "RangeValueFilter") {
                    this.object._apeObject.lowValue = this.newValue;
                } else {
                    this.object._apeObject.value = this.newValue;
                }
                events.push({
                    source: model.analyticPrivilege,
                    type: modelbase.ModelEvents.CHANGED,
                    name: model.analyticPrivilege.name,
                    changed: true
                });
            },
            undo: function(model, events) {

                this.object.lowValue = this.oldValue;

                if (this.object.type === "RangeValueFilter") {
                    this.object._apeObject.lowValue = this.oldLowValue;
                } else {
                    this.object._apeObject.value = this.oldValue;
                }
                events.push({
                    source: model.analyticPrivilege,
                    type: modelbase.ModelEvents.CHANGED,
                    name: model.analyticPrivilege.name,
                    changed: true
                });
            }
        };
    };

    return ValidityFrom;

});
