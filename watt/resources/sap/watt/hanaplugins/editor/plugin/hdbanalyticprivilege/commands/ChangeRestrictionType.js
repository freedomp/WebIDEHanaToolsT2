/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define(["sap/watt/hanaplugins/editor/plugin/hdbcalculationview/base/modelbase"], function(modelbase) {
    var ChangeRestrictionType = function(sNewValue, oContext, treeTable, comboBox) {
        var command = {};

        command._oldType = null;
        command._oldOperator = null;
        command._oldValue = null;
        command._oldRestrictionIndex = null;

        command._oldFilter = null;
        command._newFilter = null;
        command._keyToRemove = null;
        command._nextKey = null;

        command.newValue = sNewValue;
        command.path = oContext.sPath;
        command.context = oContext;

        command.aPathParts = command.path.split("/");
        if (command.aPathParts.length > 3) {
            command.iIndex1 = parseInt(command.aPathParts[2]);
            //command.iIndex2 = parseInt(command.aPathParts[3].slice(1));
            command.iIndex2 = parseInt(command.aPathParts[3]);
            command.iRestrictionIndex = command.context.oModel.oData.restrictions[command.iIndex1].restrictionIndex;
            command.sAttributeName = command.context.oModel.oData.restrictions[command.iIndex1].attributeName;
            command.sFilterType = command.context.oModel.oData.restrictions[command.iIndex1][command.aPathParts[3]].type;

            command.oRestrictions = command.context.oModel.oOriginalModel.analyticPrivilege.restrictions;
            command.oFilters = command.oRestrictions.get(command.iRestrictionIndex).filters;
            command.oValueFilters = command.oFilters.get(command.sAttributeName).valueFilters;
            command.oProcedureFilters = command.oFilters.get(command.sAttributeName).procedureFilters;

            if (command.sFilterType === "valueFilter") {
                command.valueFilterIndex = command.context.oModel.oData.restrictions[command.iIndex1][command.aPathParts[3]].valueFilterIndex;
                command.oldValue = command.oValueFilters.get(command.valueFilterIndex).type;
            } else {
                command.procedureFilterIndex = command.context.oModel.oData.restrictions[command.iIndex1][command.aPathParts[3]].procedureIndex;
                command.oldValue = command.oProcedureFilters.get(command.procedureFilterIndex).type;
            }
        }


        command._type = function(sOldValue, sNewValue) {

            var oldValue = sOldValue;

            if (oldValue !== "CatalogProcedureFilter" && sNewValue === "CatalogProcedureFilter") {

                var oOldFilter = null;
                var oFilter = this.oFilters.get(this.sAttributeName);

                if (oldValue === "SingleValueFilter" || oldValue === "RangeValueFilter") {
                    this._keyToRemove = this.valueFilterIndex;
                    oOldFilter = this.oValueFilters.get(this.valueFilterIndex);
                    this._nextKey = this.oValueFilters.getNextKey(this.valueFilterIndex);
                    this.oValueFilters.get(this.valueFilterIndex).$remove();
                } else {
                    this._keyToRemove = this.procedureFilterIndex;
                    oOldFilter = this.oProcedureFilters.get(this.procedureFilterIndex);
                    this._nextKey = this.oProcedureFilters.getNextKey(this.procedureFilterIndex);
                    this.oProcedureFilters.get(this.procedureFilterIndex).$remove();
                }

                this._oldFilter = oOldFilter;

                var aProcedureFilterTemplate = {
                    procedureName: "select",
                    operator: "EQ",
                    uiIndex: oOldFilter.uiIndex,
                    type: "CatalogProcedureFilter"
                };

                this._newFilter = oFilter.createProcedureFilter(aProcedureFilterTemplate);
                //this.oProcedureFilters.add(oFilter);
            } else if (oldValue !== "RepositoryProcedureFilter" && sNewValue === "RepositoryProcedureFilter") {
                var oOldFilter = null;
                var oFilter = this.oFilters.get(this.sAttributeName);

                if (oldValue === "SingleValueFilter" || oldValue === "RangeValueFilter") {
                    this._keyToRemove = this.valueFilterIndex;
                    oOldFilter = this.oValueFilters.get(this.valueFilterIndex);
                    this._nextKey = this.oValueFilters.getNextKey(this.valueFilterIndex);
                    this.oValueFilters.get(this.valueFilterIndex).$remove();
                } else {
                    this._keyToRemove = this.procedureFilterIndex;
                    oOldFilter = this.oProcedureFilters.get(this.procedureFilterIndex);
                    this._nextKey = this.oProcedureFilters.getNextKey(this.procedureFilterIndex);
                    this.oProcedureFilters.get(this.procedureFilterIndex).$remove();
                }

                this._oldFilter = oOldFilter;
                var aProcedureFilterTemplate = {
                    procedureName: "select",
                    operator: "EQ",
                    uiIndex: oOldFilter.uiIndex,
                    type: "RepositoryProcedureFilter"
                };

                this._newFilter = oFilter.createProcedureFilter(aProcedureFilterTemplate);
            } else if (sNewValue === "valueFilter" && sOldValue !== "SingleValueFilter" && sOldValue !== "RangeValueFilter") {

                var oFilter = this.oFilters.get(this.sAttributeName);
                var oProcedureFilter = this.oProcedureFilters.get(this.procedureFilterIndex);

                this._keyToRemove = this.procedureFilterIndex;
                this._nextKey = this.oProcedureFilters.getNextKey(this.procedureFilterIndex);
                this.oProcedureFilters.get(this.procedureFilterIndex).$remove();

                this._oldFilter = oProcedureFilter;

                var aValueFilterTemplate = {
                    value: "select",
                    operator: "EQ",
                    including: "true",
                    uiIndex: oProcedureFilter.uiIndex,
                    type: "SingleValueFilter"
                };

                this._newFilter = oFilter.createValueFilter(aValueFilterTemplate);
            }

            var oData = this.context.oModel.oData;
            oData.restrictions = this.context.oModel.parseRestrictions(oData._apeModel);
        };

        command.execute = function(model, events) {
            if (this.aPathParts.length > 3) {
                this._type(this.oldValue, this.newValue);

                this.context.oModel.checkUpdate(true);
                events.push({
                    source: model.analyticPrivilege,
                    type: modelbase.ModelEvents.CHANGED,
                    name: model.analyticPrivilege.name,
                    changed: true
                });

                //The testcases do only work on the model, no ui update is needed
                if (treeTable !== undefined && treeTable !== null) {
                    comboBox.focus();
                    comboBox.applyFocusInfo(comboBox.getFocusInfo());
                    comboBox.rerender();
                    comboBox.updateBindings();
                    treeTable.rerender();
                }

            }
        };

        command.undo = function(model, events) {
            if (this._oldFilter.type === "CatalogProcedureFilter" || this._oldFilter.type === "RepositoryProcedureFilter") {
                this.oValueFilters.get(this._newFilter.$getKeyAttributeValue()).$remove();
                this.oProcedureFilters.add(this._keyToRemove, this._oldFilter, this._nextKey);
            } else {
                this.oProcedureFilters.get(this._newFilter.$getKeyAttributeValue()).$remove();
                this.oValueFilters.add(this._keyToRemove, this._oldFilter, this._nextKey);
            }
            var oData = this.context.oModel.oData;
            oData.restrictions = this.context.oModel.parseRestrictions(oData._apeModel);

            this.context.oModel.checkUpdate(true);

            events.push({
                source: model.analyticPrivilege,
                type: modelbase.ModelEvents.CHANGED,
                name: model.analyticPrivilege.name,
                changed: true
            });

            if (treeTable !== undefined && treeTable !== null) {
                comboBox.focus();
                comboBox.applyFocusInfo(comboBox.getFocusInfo());
                comboBox.rerender();
                comboBox.updateBindings();
                treeTable.rerender();
            }
        };

        return command;

    };
    return ChangeRestrictionType;
});
