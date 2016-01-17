/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define(["sap/watt/hanaplugins/editor/plugin/hdbcalculationview/base/modelbase"], function(modelbase){
    var RootAllInformationModels = function(oObject, oValue){
        
        return {
            
            _object : oObject,
            _value : oValue,
            _oldValue : oObject.allInformationModels,
            execute : function(model, events){
                this._object.allInformationModels = this._value;
                this._object._apeModel.analyticPrivilege.securedModels.allInformationModels = this._value ? "true" : "false";
                events.push({
                    source: model.analyticPrivilege,
                    type: modelbase.ModelEvents.CHANGED,
                    name: model.analyticPrivilege.name,
                    changed: true
                });
            },
            undo : function(model, events){
                this._object.allInformationModels = this._oldValue;
                this._object._apeModel.analyticPrivilege.securedModels.allInformationModels = this._oldValue ? "true" : "false";
                events.push({
                    source: model.analyticPrivilege,
                    type: modelbase.ModelEvents.CHANGED,
                    name: model.analyticPrivilege.name,
                    changed: true
                });
            }
            
        };
    };
    
    return RootAllInformationModels;
    
});
