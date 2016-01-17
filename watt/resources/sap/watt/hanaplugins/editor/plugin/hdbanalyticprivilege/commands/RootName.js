/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define(["sap/watt/hanaplugins/editor/plugin/hdbcalculationview/base/modelbase"], function(modelbase){
    var RootName = function(oObject, oValue){
        
        return {
            
            _object : oObject,
            _value : oValue,
            _oldValue : oObject.name,
            execute : function(model, events){
                this._object.name = this._value;
                this._object._apeModel.analyticPrivilege.name = this._value;
                events.push({
                    source: model.analyticPrivilege,
                    type: modelbase.ModelEvents.CHANGED,
                    name: model.analyticPrivilege.name,
                    changed: true
                });
            },
            undo : function(model, events){
                this._object.name = this._oldValue;
                this._object._apeModel.analyticPrivilege.name = this._oldValue;
                events.push({
                    source: model.analyticPrivilege,
                    type: modelbase.ModelEvents.CHANGED,
                    name: model.analyticPrivilege.name,
                    changed: true
                });
            }
            
        };
    };
    
    return RootName;
    
});
