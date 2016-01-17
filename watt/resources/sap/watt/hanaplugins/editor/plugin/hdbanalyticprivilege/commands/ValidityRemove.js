/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define(["sap/watt/hanaplugins/editor/plugin/hdbcalculationview/base/modelbase"], function(modelbase) {

    var ValidityRemove = function(oModel, oIdxObjMap) {
        return {
            _apeModel: oModel,
            _oIdxObjMap: oIdxObjMap,
            _aValidities: null,
            execute: function(model, events) {
                this._aValidities = [];
                var oData = this._apeModel.getData();
                for (var iIndex in this._oIdxObjMap) {
                    var oObj = this._oIdxObjMap[iIndex];
                    var iIndexModel = oObj._apeObject.$getKeyAttributeValue();
                    var oRem = model.analyticPrivilege.validities.remove(iIndexModel);
                    //TODO rethink
                    for (var j = 0; j < oData.validities.length; j++) {
                        if (oData.validities[j]._index === iIndexModel) {
                            this._aValidities.push(oData.validities[j]);
                            oData.validities.splice(j, 1);
                            break;
                        }
                    }


                }

                this._apeModel.checkUpdate();
                events.push({
                    source: model.analyticPrivilege,
                    type: modelbase.ModelEvents.CHANGED,
                    name: model.analyticPrivilege.name,
                    changed: true
                });
            },
            undo: function(model, events) {
                //TODO
                var oData = this._apeModel.getData();
                for (var key in this._aValidities) {
                    var oVal = this._aValidities[key];
                    oData._apeModel.analyticPrivilege.validities.add(oVal._index, oVal._apeObject);
                    oData.validities.splice(oVal._index, 0, oVal);
                    //_apeObject: cls
                    //_index: 0
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

    return ValidityRemove;

});
