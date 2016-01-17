/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define(["sap/watt/hanaplugins/editor/plugin/hdbcalculationview/base/modelbase",
"sap/watt/hanaplugins/editor/plugin/hdbanalyticprivilege/sql/SQLRenderer",
"sap/watt/hanaplugins/editor/plugin/hdbanalyticprivilege/uimodel/ApeModel"
], function(modelbase, SQLRenderer, ApeModel) {

        var SqlAttributesToWhereSql = function(oModel, oEditor) {
            var command = {};
            command._model = oModel;
            command._restrictions = null;
            command._restrictionsUI = null;
            command._validities = null;
            command._validitiesUI = null;
            command._whereType = null;
            command._sqlEditorUndoManager = null;
            command._aceEditor = oEditor;
            command._aceSession = oEditor.getAceSession();
            
            // command._aceUndoManager = oEditor.getAceSession().getUndoManager();
            
            command.execute = function(model, events) {
                var oData = this._model.getData();
                
                this._whereType = oData.whereType;
                //oData.whereType = ApeModel.WhereType.WHERE_SQL;
                
                var whereSql = SQLRenderer.renderWhereClause(command._model);
                oData.whereSql = whereSql;
                oData._apeModel.analyticPrivilege.whereSql = whereSql;

                
                oData.whereType = ApeModel.WhereType.WHERE_SQL;
                this._restrictions = oData._apeModel.analyticPrivilege.restrictions;
                this._restrictionsUI = oData.restrictions;
                this._validities = oData._apeModel.analyticPrivilege.validities;
                this._validitiesUI = oData.validities; 
                this._sqlEditorUndoManager = oData._sqlEditorUndoManager;
                
                oData._apeModel.analyticPrivilege.restrictions = undefined;
                oData.restrictions = undefined;
                oData._apeModel.analyticPrivilege.validities = undefined;
                oData.validities = undefined;
                
                oData._listenToUndoStackChangedEvents = false;
                this._aceSession.setValue(whereSql);
                //replace saved undomanager with new one to avoid a reset after resetting the ace session value while undo
                this._aceSession.setUndoManager(this._aceEditor.createUndoManager());
                
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
                
                oData._apeModel.analyticPrivilege.restrictions = this._restrictions;
                oData.restrictions = this._restrictionsUI;
                oData._apeModel.analyticPrivilege.validities = this._validities;
                oData.validities = this._validitiesUI;
                oData._sqlEditorUndoManager = this._sqlEditorUndoManager;
                
                
                oData.whereSql = undefined;
                oData._apeModel.analyticPrivilege.whereSql = undefined;
                oData._listenToUndoStackChangedEvents = false;
                
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

    return SqlAttributesToWhereSql;
});
