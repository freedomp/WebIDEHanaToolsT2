/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define(["sap/watt/hanaplugins/editor/plugin/hdbcalculationview/base/modelbase",
"sap/watt/hanaplugins/editor/plugin/hdbanalyticprivilege/sql/SQLRenderer",
"sap/watt/hanaplugins/editor/plugin/hdbanalyticprivilege/model/AnalyticPrivilegeModel",
"sap/watt/hanaplugins/editor/plugin/hdbanalyticprivilege/uimodel/ApeModel"
], function(modelbase, SQLRenderer, AnalyticPrivilegeModel, ApeModel) {
        var SqlDynamicToWhereSql = function(oModel, oEditor) {
            var command = {};
            command._model = oModel;
            command._restrictions = null;
            command._restrictionsUI = null;
            command._validities = null;
            command._validitiesUI = null;
            command._whereSql = null;
            command._whereSqlUI = null;
            command._conditionProcedureName = null;
            command._conditionProcedureNameUI = null;
            command._conditionProcedureType = null;
            command._whereType = null;
            command._aceEditor = oEditor;
            command._aceSession = oEditor.getAceSession();
            command._aceUndoManager = oEditor.getAceSession().getUndoManager();
            
            command.execute = function(model, events) {

                var oData = this._model.getData();
                
                this._whereType = oData.whereType;
                oData.whereType = ApeModel.WhereType.WHERE_SQL;
                
                this._conditionProcedureName = oData._apeModel.analyticPrivilege.conditionProcedureName;
                this._conditionProcedureNameUI = oData.conditionProcedureName;
                this._conditionProcedureType = oData.procedureType;

                this._restrictions = oData._apeModel.analyticPrivilege.restrictions;
                this._restrictionsUI = oData.restrictions;              
                
                oData._apeModel.analyticPrivilege.whereSql = "";
                oData.whereSql = "";
                oData._listenToUndoStackChangedEvents = false;
                
                
                oData._apeModel.analyticPrivilege.restrictions = undefined;
                oData.restrictions = undefined;
                
                oData._apeModel.analyticPrivilege.conditionProcedureName = undefined;
                oData.conditionProcedureName = undefined;

                oData.procedureType = undefined;
                
                this._model.setData(oData);
                
                events.push({
                    source: model.analyticPrivilege,
                    type: "changed",
                    name: model.analyticPrivilege.name,
                    changed: true
                });
                
            };
            
            command.undo = function(model, events) {
                var oData = this._model.getData();
                
                oData.whereType = this._whereType;
                oData._apeModel.analyticPrivilege.whereSql = undefined;
                oData.whereSql = undefined;

                oData._apeModel.analyticPrivilege.restrictions = this._restrictions;
                oData.restrictions = this._restrictionsUI;   
                
                oData._apeModel.analyticPrivilege.conditionProcedureName = this._conditionProcedureName;
                oData.conditionProcedureName = this._conditionProcedureNameUI;
                oData.procedureType = this._conditionProcedureType;
                this._model.setData(oData);
                
                events.push({
                    source: model.analyticPrivilege,
                    type: "changed",
                    name: model.analyticPrivilege.name,
                    changed: true
                });
            };
            return command;
        };

    return SqlDynamicToWhereSql;
});
