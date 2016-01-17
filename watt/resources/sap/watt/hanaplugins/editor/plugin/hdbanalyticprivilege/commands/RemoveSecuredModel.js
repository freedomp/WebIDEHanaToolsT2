/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define(["sap/watt/hanaplugins/editor/plugin/hdbcalculationview/base/modelbase"], function(modelbase) {

    var RemoveSecuredModel = function(oContextArray) {

        var command = {};

        command._removedUris = [];
        command._keysToRemove = [];
        command._nextKeys = [];

        command.contextArray = oContextArray;
        command.contextArray.reverse();

        if (oContextArray.length > 0) {
            command.oSecuredModels = oContextArray[0].oModel.oOriginalModel.analyticPrivilege.securedModels;
            command.aSecuredModels = oContextArray[0].oModel.oData.securedModels;
            command.oRestrictions = oContextArray[0].oModel.oOriginalModel.analyticPrivilege.restrictions;
        }
        command.aRemovedRestrictions = [];
        command.aIndicesToRemove = [];
        command.aNextKeys = [];

        command._remove = function() {
            var that = this;

            for (var i = 0; i < this.contextArray.length; i++) {
                var bRestrictionsAffected = false;

                var currentContext = that.contextArray[i];
                var path = currentContext.sPath;
                var aPathParts = path.split("/");
                var iIndex1 = parseInt(aPathParts[2]);

                var modelUri = this.oSecuredModels.modelUris.getAt(iIndex1).uriString;
                this._keysToRemove.push(modelUri);
                this._nextKeys.push(this.oSecuredModels.modelUris.getNextKey(modelUri));
                this._removedUris.push(this.oSecuredModels.modelUris.get(modelUri));

                var securedModel = this.aSecuredModels[i];
                var dimensions = securedModel.dimensions;
                
                if(this.oRestrictions){
                this.oRestrictions.foreach(function(oRestriction) {

                    if (oRestriction.originInformationModelUri === modelUri || oRestriction.dimensionUri === modelUri || dimensions.indexOf(oRestriction.dimensionUri) >= 0) {
                        that.aRemovedRestrictions.push(that.oRestrictions.get(oRestriction.$getKeyAttributeValue()));
                        that.aIndicesToRemove.push(oRestriction.$getKeyAttributeValue());
                        that.aNextKeys.push(that.oRestrictions.getNextKey(oRestriction.$getKeyAttributeValue()));
                        bRestrictionsAffected = true;
                    }
                });
              }
            }

            for (var j = this._removedUris.length - 1; j >= 0; j--) {
                this._removedUris[j].$remove();
            }

            if (bRestrictionsAffected) {
                for (var i = that.aRemovedRestrictions.length - 1; i >= 0; i--) {
                    that.aRemovedRestrictions[i].$remove();
                }
                var oData = currentContext.oModel.oData;
                oData.restrictions = currentContext.oModel.parseRestrictions(oData._apeModel);
                currentContext.oModel.checkUpdate();
            }

            var oData = this.contextArray[0].oModel.oData;
            oData.securedModels = this.contextArray[0].oModel.parseSecuredModels(this.contextArray[0].oModel.oOriginalModel, oData, this.contextArray[0]);

            this.contextArray[0].oModel.checkUpdate();

        };

        command.execute = function(model, events) {
            this._remove();
            events.push({
                source: model.analyticPrivilege,
                type: "changed",
                name: model.analyticPrivilege.name,
                changed: true 
            });
        };

        command.undo = function(model, events) {

            for (var i = 0; i < this._removedUris.length; i++) {
                this.oSecuredModels.modelUris.add(this._keysToRemove[i], this._removedUris[i], this._nextKeys[i]);
            }


            if (this.aRemovedRestrictions.length > 0) {
                for (var i = 0; i < this.aRemovedRestrictions.length; i++) {
                    this.oRestrictions.add(this.aIndicesToRemove[i], this.aRemovedRestrictions[i], this.aNextKeys[i]);
                }

                var oData = this.contextArray[0].oModel.oData;
                oData.restrictions = this.contextArray[0].oModel.parseRestrictions(oData._apeModel);

                this.contextArray[0].oModel.checkUpdate();
                this.aIndicesToRemove = [];
                this.aNextKeys = [];
                this.aRemovedRestrictions = [];
            }

            var oData = this.contextArray[0].oModel.oData;
            oData.securedModels = this.contextArray[0].oModel.parseSecuredModels(this.contextArray[0].oModel.oOriginalModel, oData, this.contextArray[0]);
            this.contextArray[0].oModel.checkUpdate();
            this._keysToRemove = [];
            this._removedUris = [];
            this._nextKeys = [];

            events.push({
                source: model.analyticPrivilege,
                type: "changed",
                name: model.analyticPrivilege.name,
                changed: true
            });
        };

        return command;

    };

    return RemoveSecuredModel;
});
