/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define(["sap/watt/hanaplugins/editor/plugin/hdbcalculationview/base/modelbase"], function(modelbase) {
    var ValidityIncluding = function(oValidity, sNewValue) {
        return {
            object: oValidity,
            oldValue: oValidity._apeObject.including,
            newValue: sNewValue,
            execute: function(model, events) {
                this.object.including = this.newValue;
                this.object._apeObject.including = this.newValue;
                events.push({
                    source: model.analyticPrivilege,
                    type: modelbase.ModelEvents.CHANGED,
                    name: model.analyticPrivilege.name,
                    changed: true
                });
            },
            undo: function(model, events) {
                this.object.including = this.oldValue;
                this.object._apeObject.including = this.oldValue;
                events.push({
                    source: model.analyticPrivilege,
                    type: modelbase.ModelEvents.CHANGED,
                    name: model.analyticPrivilege.name,
                    changed: true
                });
            }
        };
    };

    return ValidityIncluding;

});
