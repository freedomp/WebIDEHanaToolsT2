/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define(["sap/watt/hanaplugins/editor/plugin/hdbcalculationview/base/modelbase"], function(modelbase) {
    var ValidityAdd = function(oModel) {
        return {
            _apeModel: oModel,
            _apeValidity: null,
            execute: function(model, events) {
                var oData = this._apeModel.getData();
                if (!this._apeValidity) {
                    var oDate = new Date();
                    var iMonth = oDate.getMonth() + 1;
                    var sMonth = iMonth < 10 ? "0" + iMonth : "" + iMonth;
                    var sDay = oDate.getDate() < 10 ? "0" + oDate.getDate() : "" + oDate.getDate();
                    var sDate = oDate.getFullYear() + "-" + sMonth + "-" + sDay;

                    var oValidityTemplate = {
                        operator: "EQ",
                        including: "true",
                        type: "SingleValueFilter",
                        value: sDate
                    };
                    var oValidity = model.analyticPrivilege.createValidity(oValidityTemplate);
                    this._apeValidity = this._apeModel.createValidityWrapper(oValidity, oValidity.$$defaultKeyValue);
                }

                oData.validities.push(this._apeValidity);
                this._apeModel.checkUpdate();

                events.push({
                    source: model.analyticPrivilege,
                    type: modelbase.ModelEvents.CHANGED,
                    name: model.analyticPrivilege.name,
                    changed: true
                });

            },
            undo: function(model, events) {
                model.analyticPrivilege.validities.remove(this._apeValidity._index);
                var oData = this._apeModel.getData();
                for (var i = 0; i < oData.validities.length; i++) {
                    if (oData.validities[i]._index === this._apeValidity._index) {
                        oData.validities.splice(i, 1);
                        break;
                    }
                }

                this._apeModel.checkUpdate();
                events.push({
                    source: model.analyticPrivilege,
                    type: modelbase.ModelEvents.CHANGED,
                    name: model.analyticPrivilege.name,
                    changed: true
                });

            }
        };
    };

    return ValidityAdd;

});
