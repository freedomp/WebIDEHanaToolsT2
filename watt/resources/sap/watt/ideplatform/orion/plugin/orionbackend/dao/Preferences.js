define([ "../io/Request" ], function(Request) {
	"use strict";
	var Preferences = {

		/** 
		 * @private
		 * @memberOf sap.watt.ideplatform.orion.orionbackend.dao.Preferences
		 * @type {sap.watt.ideplatform.orion.orionbackend.io.Request}
		 */
		_io : Request,

		/** 
		 * Location string for orion preference nodes
		 * @private
		 * @memberOf sap.watt.ideplatform.orion.orionbackend.dao.Preferences
		 * @type {string}
		 */
		_sPrefLocation : "/prefs/user/",

		/** 
		 * Creates location postfix string from optional preference node and attribute
		 * @private
		 * @memberOf sap.watt.ideplatform.orion.orionbackend.dao.Preferences
		 * @return {string}
		 */
		_buildUrl : function(sNode, sKey) {

			var sResult = this._sPrefLocation;
			if (sNode) {
				sResult += sNode;
			} else {
				sResult += "defaults";
			}
			if (sKey) {
				sResult += "?key=" + sKey;
			}
			return sResult;

		},

		/* Returns the preference settings of a preference node or specific attribute
		 * @see http://wiki.eclipse.org/Orion/Server_API/Preference_API#Obtaining_a_single_preference_value
		 * @see http://wiki.eclipse.org/Orion/Server_API/Preference_API#Obtaining_a_preference_node
		 * @memberOf sap.watt.ideplatform.orion.orionbackend.dao.Preferences
		 * @param {string} sNode The name of a preference node
		 * @param {string} [sKey] An optional name of a specific preference attribute 
		 * @return {Promise} a deferred promise that will provide the preference content as JSON object
		 */
		read : function(sNode, sKey) {
			return this._io.send(this._buildUrl(sNode, sKey)).then(function(oResult) {
				// Orion does not set content type properly
				if (oResult) {
					if (jQuery.type(oResult) === "string") {
						return JSON.parse(oResult);	
					} else {
						return oResult;
					}
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
		 * @memberOf sap.watt.ideplatform.orion.orionbackend.dao.Preferences
		 * @param {string} sNode The name of a preference node
		 * @param {string|object} A JSON representation of the preferences to write
		 */
		writePreferenceNode : function(sNode, oJSON) {

			var mHeader = {
				headers : {
					"Content-Type" : "application/json"
				}
			};
			return this._io.send(this._buildUrl(sNode, null), "PUT", mHeader, oJSON);

		},

		/** Writes a single preference atribute
		 * @see http://wiki.eclipse.org/Orion/Server_API/Preference_API#Change_a_single_preference
		 * @memberOf sap.watt.ideplatform.orion.orionbackend.dao.Preferences
		 * @param {string} sNode The name of a preference node
		 * @param {string} sKey The name of preference attribute
		 * @param {string} sValue The value of preference attribute
		 */
		writePreferenceAtribute : function(sNode, sKey, sValue) {

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
		 * @memberOf sap.watt.ideplatform.orion.orionbackend.dao.Preferences
		 * @param {string} sNode The name of a preference node
		 * @param {string} [sKey] An optional name of a specific preference attribute 
		 */
		remove : function(sNode, sKey) {
			return this._io.send(this._buildUrl(sNode, sKey), "DELETE");
		}

	};

	return Preferences;

});