/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define(["sap/watt/hanaplugins/editor/plugin/hdbcalculationview/base/modelbase"], function(modelbase){
    var RootLabel = function(oObject, oValue){
        
        return {
            
            _object : oObject,
            _value : oValue,
            _oldValue : oObject.label,
            execute : function(model, events){
                this._object.label = this._value;
                this._object._apeModel.analyticPrivilege.label = this._value;
                events.push({
                    source: model.analyticPrivilege,
                    type: modelbase.ModelEvents.CHANGED,
                    name: model.analyticPrivilege.name,
                    changed: true
                });
            },
            undo : function(model, events){
                this._object.label = this._oldValue;
                this._object._apeModel.analyticPrivilege.label = this._oldValue;
                events.push({
                    source: model.analyticPrivilege,
                    type: modelbase.ModelEvents.CHANGED,
                    name: model.analyticPrivilege.name,
                    changed: true
                });
            }
            
        };
    };
    
    return RootLabel;
    
});
