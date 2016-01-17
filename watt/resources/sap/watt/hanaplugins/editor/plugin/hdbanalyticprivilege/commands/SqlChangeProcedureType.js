/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define([
    "sap/watt/hanaplugins/editor/plugin/hdbanalyticprivilege/uimodel/ApeModel"
], function(ApeModel) {
    var SqlChangeProcedureType = function(model, procedureType) {
        var command = {
            _model : model,
            _newProcedureType : procedureType,
            _conditionProcedureName: null,
            _conditionProcedureNameUI: null,
            _conditionProcedureType: null
        };

        command.execute = function(model, events) {
            var apeModel = this._model;
            this._conditionProcedureName = apeModel._apeModel.analyticPrivilege.conditionProcedureName;
            this._conditionProcedureNameUI = apeModel.conditionProcedureName;
            this._conditionProcedureType = apeModel.procedureType;
            //check values
            //oData.procedureType = ApeModel.ProcedureType.REPOSITORY_PROCEDURE;
            apeModel.procedureType = this._newProcedureType;
            apeModel.conditionProcedureName = null;
            apeModel._apeModel.analyticPrivilege.conditionProcedureName = null;

            events.push({
                source: model.analyticPrivilege,
                type: "changed",
                name: model.analyticPrivilege.name,
                changed: true
            });
        };

        command.undo = function(model, events) {
            var apeModel = this._model;
            apeModel._apeModel.analyticPrivilege.conditionProcedureName = this._conditionProcedureName;
            apeModel.conditionProcedureName = this._conditionProcedureNameUI;
            apeModel.procedureType = this._conditionProcedureType;

            events.push({
                source: model.analyticPrivilege,
                type: "changed",
                name: model.analyticPrivilege.name,
                changed: true
            });
        };

        return command;
    };

    return SqlChangeProcedureType;

});
