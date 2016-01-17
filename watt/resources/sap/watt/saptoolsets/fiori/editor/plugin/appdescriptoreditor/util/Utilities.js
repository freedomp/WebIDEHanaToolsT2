define(["sap/watt/lib/lodash/lodash"], function(_) {
	"use strict";

	return {
		_convertEnumToMap: function(aEnum) {
			var aInput = aEnum;
			var aResult = [];
			for (var i = 0; i < aInput.length; i++) {
				aResult.push({
					"key": aInput[i],
					"text": aInput[i]
				});
			}
			return aResult;
		},
		
		
		_convertStringToItemArray: function(sValue, sType) {
				var oItem = {};
				oItem.item = { text: sValue, key: sValue };
				oItem.key = oItem.text = sValue;
				oItem.type = sType;
				return oItem;
		},

		_convertObjectToMap: function(obj) {
			jQuery.map(obj, function(oElement, index) {
				oElement.text = oElement;
			});
			return obj;
		},

		_convertObjectItemToMap: function(obj, sType) {
			jQuery.map(obj, function(oElement, index) {
				oElement.item = _.cloneDeep(oElement);
				oElement.type = sType;
			});
			return obj;
		},

		_converMapToItemArray: function(obj, sType) {
			var aResult = [];
			_.forEach(obj, function(oElement, sKey) {
				var oItem = {};
				oItem.name = sKey;
				oItem.item = {};
				oItem.item[sKey] = _.cloneDeep(oElement);
				oItem.type = sType;
				_.merge(oItem, _.cloneDeep(oElement));
				aResult.push(oItem);
			});
			return aResult;
		},
         
		_convertFromManifestObjectCrossNavigationToArray: function(obj) {
			var oNewObj = _.cloneDeep(obj);
			var aResult = [];

			_.forEach(oNewObj, function(oElement, key) {

				if (oElement && oElement.signature && oElement.signature.parameters) {
					var aResult2 = [];
					_.forEach(oElement.signature.parameters, function(parameter, name) {
						var params = _.cloneDeep(parameter);
						params.Name = name;
						aResult2.push(params);
					});
					oElement.signature.parameters = aResult2;
				}
				var oIntent = _.cloneDeep(oElement);
				oIntent.key = key;
				aResult.push(oIntent);
			});
			return aResult;
		}
	};
});