/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define([
    "sap/watt/hanaplugins/editor/plugin/hdbanalyticprivilege/uimodel/ApeModel"
], function(ApeModel) {
    var SqlChangeProcedureName = function(model, findResult) {
        var command = {
            _model : model,
            _findResult : findResult,
            _oldProcedureName: null,
            _oldProcedureType: null
        };

        command.execute = function(model, events) {
            console.log("SqlChangeProcedureName execute");
            var apeModel = this._model;
            var oData = apeModel.getData();
            this._oldProcedureName = oData.conditionProcedureName;
            this._oldProcedureType = oData.procedureType;
            var results = this._findResult;
            var procedureName;
            if (results && results !== null) {
                for (var i = 0; i < results.length; i++) {
                    var prop = results[i];
                    
                    if (prop.packageName !== undefined) {
                        oData.procedureType = ApeModel.ProcedureType.REPOSITORY_PROCEDURE;
                        procedureName = prop.packageName + "::" + prop.name;
                        oData.conditionProcedureName = procedureName;
                        oData._apeModel.analyticPrivilege.conditionProcedureName = procedureName;
                    } else if (prop.schemaName !== undefined) {
                        oData.procedureType = ApeModel.ProcedureType.CATALOG_PROCEDURE;
//                        procedureName = "\"" + prop.schemaName + "\"." + prop.name;
                        procedureName = prop.name;
                        oData.conditionProcedureName = procedureName;
                        oData._apeModel.analyticPrivilege.conditionProcedureName = procedureName;
                    }
                }
            }
            
            apeModel.checkUpdate();
            events.push({
                source: model.analyticPrivilege,
                type: "changed",
                name: model.analyticPrivilege.name,
                changed: true
            });
        };

        command.undo = function(model, events) {
            console.log("SqlChangeProcedureName undo");
            var apeModel = this._model;
            var oData = apeModel.getData();
            oData.conditionProcedureName = this._oldProcedureName;
            oData._apeModel.analyticPrivilege.conditionProcedureName = this._oldProcedureName;
            
            oData.procedureType = this._oldProcedureType;
            apeModel.checkUpdate();
            events.push({
                source: model.analyticPrivilege,
                type: "changed",
                name: model.analyticPrivilege.name,
                changed: true
            });
        };

        return command;
    };

    return SqlChangeProcedureName;

});
