/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define(["sap/watt/hanaplugins/editor/plugin/hdbcalculationview/base/modelbase"], function(modelbase) {

	var RemoveRestrictedAttribute = function(oContextArray) {
		var command = {};

		command._oldRestrictedAttributes = [];
		command._oldModels = [];
		command._attrKeysToRemove = [];
		command._nextAttrKeys = [];
		command._modelKeysToRemove = [];
		command._nextModelKeys = [];
		command._restrictionIndices = [];
		command._modelRestrictionIndices = [];

		command.contextArray = oContextArray;
		command._oldRestrictions = [];

		command._remove = function() {

			var oRestrictions = this.contextArray[0].oModel.oOriginalModel.analyticPrivilege.restrictions;
			for (var j = 0; j < oRestrictions.size(); j++) {
				this._oldRestrictions.push(oRestrictions.getAt(j));
			}

			for (var i = 0; i < this.contextArray.length; i++) {

				var path = this.contextArray[i].sPath;

				var aPathParts = path.split("/");
				var iIndex1 = parseInt(aPathParts[2]);
				var iRestrictionIndex = this.contextArray[i].oModel.oData.restrictions[iIndex1].restrictionIndex;

				var sAttributeName = this.contextArray[i].oModel.oData.restrictions[iIndex1].attributeName;
				if (oRestrictions.get(iRestrictionIndex)) {
					var oFilters = oRestrictions.get(iRestrictionIndex).filters;
					this._restrictionIndices.push(iRestrictionIndex);
					this._oldRestrictedAttributes.push(oFilters.get(sAttributeName));
					this._attrKeysToRemove.push(sAttributeName);
					this._nextAttrKeys.push(oFilters.getNextKey(sAttributeName));

					oFilters.get(sAttributeName).$remove();
					if (oFilters.size() === 0) {
						this._modelRestrictionIndices.push(iRestrictionIndex);
						this._oldModels.push(oRestrictions.get(iRestrictionIndex));
						this._modelKeysToRemove.push(iRestrictionIndex);
						this._nextModelKeys.push(oRestrictions.getNextKey(iRestrictionIndex));
						oRestrictions.get(iRestrictionIndex).$remove();
					}
				}
			}

			var oData = this.contextArray[0].oModel.oData;
			oData.restrictions = this.contextArray[0].oModel.parseRestrictions(oData._apeModel);

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
			var oRestrictions = this.contextArray[0].oModel.oOriginalModel.analyticPrivilege.restrictions;

			if (this._oldModels.length > 0) {
				for (var i = 0; i < this._oldModels.length; i++) {
					var modelRestrictionIndex = this._modelRestrictionIndices[i];

					//über attribute loopen, restrictionIndices vergleichen (wie unten)
					for (var a = 0; a < this._oldRestrictedAttributes.length; a++) {
						if (modelRestrictionIndex === this._restrictionIndices[a]) {
							this._oldModels[i].filters.add(this._attrKeysToRemove[a], this._oldRestrictedAttributes[a], this._nextAttrKeys[a]);
						}
					}
					oRestrictions.add(this._modelKeysToRemove[i], this._oldModels[i], this._nextModelKeys[i]);
				}
			} else if (this._oldRestrictedAttributes.length > 0) {
				for (var i = 0; i < this._oldRestrictedAttributes.length; i++) {
					if (this._modelRestrictionIndices.indexOf(this._restrictionIndices[i] < 0)) {
						var oFilters = oRestrictions.get(this._restrictionIndices[i]).filters;
						oFilters.add(this._attrKeysToRemove[i], this._oldRestrictedAttributes[i], this._nextAttrKeys[i]);
					}
				}
			}

			var oData = this.contextArray[0].oModel.oData;
			oData.restrictions = this.contextArray[0].oModel.parseRestrictions(oData._apeModel);

			this.contextArray[0].oModel.checkUpdate();

			this._oldRestrictedAttributes = [];
			this._oldModels = [];
			this._attrKeysToRemove = [];
			this._nextAttrKeys = [];
			this._modelKeysToRemove = [];
			this._nextModelKeys = [];
			this._restrictionIndices = [];

			events.push({
				source: model.analyticPrivilege,
				type: "changed",
				name: model.analyticPrivilege.name,
				changed: true
			});
		};

		return command;
	};

	return RemoveRestrictedAttribute;

});
