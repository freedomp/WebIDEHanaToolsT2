define([ "../io/Request" ], function(Request) {
	"use strict";
	var Preferences = {

		/** 
		 * @private
		 * @memberOf sap.watt.uitools.chebackend.dao.Preferences
		 * @type {sap.watt.uitools.chebackend.io.Request}
		 */
		_io : Request,

		/** 
		 * Location string for orion preference nodes
		 * @private
		 * @memberOf sap.watt.uitools.chebackend.dao.Preferences
		 * @type {string}
		 */
		_sPrefLocation : "/profile/prefs",

		/** 
		 * Creates location postfix string from optional preference node and attribute
		 * @private
		 * @memberOf sap.watt.uitools.chebackend.dao.Preferences
		 * @return {string}
		 */
		_buildUrl : function(sNode, sKey) {

			var sResult = this._sPrefLocation;
//			if (!!sNode) {
//				sResult += sNode;
//			} else {
//				sResult += "defaults";
//			}
//			if (sKey) {
//				sResult += "?key=" + sKey;
//			}
			return sResult;

		},

		// avoids double quoting
		_identityStringify: function(value) {
			if (typeof value === "object") {
				return JSON.stringify(value);
			}
			// primitive type
			return value;
		},

		_buildPostData : function (sNode,oJSON){
			var body = {};
			if (oJSON) {
				// flatten objects in a 'node/key: value' form
				if (typeof oJSON === "object") {
					var aKeys = Object.keys(oJSON);
					for (var i = 0; i < aKeys.length; i++) {
						var value = oJSON[aKeys[i]];
						// { key: "value" }  -->  sNode/key: "value"
						body[sNode + "/" + aKeys[i]] = this._identityStringify(value);
					}
				} else {
					body[sNode] = this._identityStringify(oJSON);
				}
			} else {
				// remove node
				body[sNode] = null;
			}
			return body;
		},

		// Transforms a given JSon like this
		//   { prefix/node/key: "value" }   ->   { prefix: {node/key : "value" } }
		_splitAlongFirstSegment : function(oJson){
			var mResult = {};
			if (oJson) {
				var aKeys = Object.keys(oJson);
				for (var i=0; i<aKeys.length; i++) {
					var oKey = aKeys[i];
					var iSplitPoint = oKey.indexOf('/');
					if (iSplitPoint > -1 ) {
						var sBase = oKey.substring(0, iSplitPoint);
						mResult[sBase] = mResult[sBase] || {};
						var skey = oKey.substring(iSplitPoint+1, oKey.length);
						var value = oJson[oKey];
						try {
							mResult[sBase][skey] = JSON.parse(value);
						} catch (e) {
							mResult[sBase][skey] = value;
						}
					}
				}
			}
			return mResult;
		},

		/* Returns the preference settings of a preference node or specific attribute
		 * @see http://wiki.eclipse.org/Orion/Server_API/Preference_API#Obtaining_a_single_preference_value
		 * @see http://wiki.eclipse.org/Orion/Server_API/Preference_API#Obtaining_a_preference_node
		 * @memberOf sap.watt.uitools.chebackend.dao.Preferences
		 * @param {string} sNode The name of a preference node
		 * @param {string} [sKey] An optional name of a specific preference attribute 
		 * @return {Promise} a deferred promise that will provide the preference content as JSON object
		 */
		read : function(sNode, sKey) {
			var that = this;
			return this._io.send(this._sPrefLocation).then(function(oResult) {
				if (oResult) {
					// transform { watt/node/key: "value" }   ->   { watt: {node/key : "value" } }
					var result = that._splitAlongFirstSegment(oResult);
					// return just the second level as expected by pref. service
					return result[sNode];
				}
				return oResult;
			}, function(oError) {
				if (oError.status == 404){
					return null;
				}
				throw oError;
			});
		},

		/** Writes a complete preference node
		 * @see http://wiki.eclipse.org/Orion/Server_API/Preference_API#Change_an_entire_preference_node
		 * @memberOf sap.watt.uitools.chebackend.dao.Preferences
		 * @param {string} sNode The name of a preference node
		 * @param {string|object} A JSON representation of the preferences to write
		 */
		writePreferenceNode : function(sNode, oJSON) {

			var mHeader = {
				headers : {
					"Content-Type" : "application/json"
				}
			};
			
			return this._io.send(this._sPrefLocation, "POST", mHeader, this._buildPostData(sNode,oJSON));

		},

		/** Writes a single preference atribute
		 * @see http://wiki.eclipse.org/Orion/Server_API/Preference_API#Change_a_single_preference
		 * @memberOf sap.watt.uitools.chebackend.dao.Preferences
		 * @param {string} sNode The name of a preference node
		 * @param {string} sKey The name of preference attribute
		 * @param {string} sValue The value of preference attribute
		 */
		writePreferenceAtribute : function(sNode, sKey, sValue) {
			//NOT IMPLE IN CHE
			var sContent = "key=" + sKey + "&value=" + sValue;
			var mHeader = {
				headers : {
					"Content-Type" : "application/x-www-form-urlencoded"
				}
			};
			return this._io.send(sLocation, "PUT", mHeader, sContent);

		},

		/* Delete a complete preference node or a specific attribute within that node
		 * @see http://wiki.eclipse.org/Orion/Server_API/Preference_API#Delete_a_single_preference
		 * @see ttp://wiki.eclipse.org/Orion/Server_API/Preference_API#Delete_an_entire_preference_node
		 * @memberOf sap.watt.uitools.chebackend.dao.Preferences
		 * @param {string} sNode The name of a preference node
		 * @param {string} [sKey] An optional name of a specific preference attribute 
		 */
		remove : function(sNode, sKey) {
			var node = sKey ? (sNode + "/" + sKey) : sNode;
			return this.writePreferenceNode(node, null);
		}

	};

	return Preferences;

});
