/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define(["sap/watt/hanaplugins/editor/plugin/hdbcalculationview/base/modelbase"], function(modelbase) {
    var AddAttribute = function(oModel, sAttributeName, sOrigin, bIsPartOfDimension) {
        var command = {};
        command._oModel = oModel;
        command._apeRestriction = null;
        command._existingRestriction = null;
        command._newFilter = null;
        command.oRestrictions = command._oModel.oOriginalModel.analyticPrivilege.restrictions;

        command.execute = function(model, events) {

            var oRestrictionTemplate = null;

            if (this._oModel.oData.privilegeType !== "SQL_ANALYTIC_PRIVILEGE") {
                for (var i = 0; i < this.oRestrictions.size(); i++) {
                    if (this.oRestrictions.getAt(i).dimensionUri === sOrigin && bIsPartOfDimension === true) {
                        this._existingRestriction = this.oRestrictions.getAt(i);
                    }
                }
            }

            if (bIsPartOfDimension === true && this._oModel.oData.privilegeType !== "SQL_ANALYTIC_PRIVILEGE") { 
                oRestrictionTemplate = {
                    dimensionUri: sOrigin
                };
            } else {
                oRestrictionTemplate = {
                    originInformationModelUri: sOrigin,
                    attributeName: sAttributeName
                };
            }

            var oFilterTemplate = {
                attributeName: sAttributeName,
                type: "AttributeFilter"
            };

            if (this._existingRestriction !== null) {
                this._newFilter = this._existingRestriction.createFilter(oFilterTemplate);
            } else {
                this._apeRestriction = model.analyticPrivilege.createRestriction(oRestrictionTemplate);
                this._newFilter = this._apeRestriction.createFilter(oFilterTemplate);
            }

            //var oFilter = this._apeRestriction.createFilter(oFilterTemplate);
            var oData = this._oModel.getData();

            oData.restrictions = this._oModel.parseRestrictions(oData._apeModel);
            this._oModel.checkUpdate();

            events.push({
                source: model.analyticPrivilege,
                type: "changed",
                name: model.analyticPrivilege.name,
                changed: true
            });
        };
        command.undo = function(model, events) {
            if (this._apeRestriction !== null) {
                this.oRestrictions.get(this._apeRestriction.$getKeyAttributeValue()).$remove();
            } else {
                this._existingRestriction.get(this._newFilter.$getKeyAttributeValue()).$remove();
            }

            var oData = this._oModel.getData();
            oData.restrictions = this._oModel.parseRestrictions(oData._apeModel);
            this._oModel.checkUpdate();

            events.push({
                source: model.analyticPrivilege,
                type: "changed",
                name: model.analyticPrivilege.name,
                changed: true
            });
        };
        return command;
    };

    return AddAttribute;
});
