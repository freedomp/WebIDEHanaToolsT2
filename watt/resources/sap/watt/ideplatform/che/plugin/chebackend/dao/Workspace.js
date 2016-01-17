define([ "../io/Request" ], function(Request) {
	"use strict";
	var Workspace = {
			
		_oModifyAttributesQueue : new Q.sap.Queue(),
					
        /** Sets an attribute on selected workspace 
		 * @memberOf sap.watt.uitools.chebackend.dao.Workspace
	     * @param {string} sWorkspaceId The ID (not name) of the workspace in which the project resides
	     * @param {string} sKey Attribute key
		 * @param {string} sValue Attribute value
		 * @return {Promise} a deferred promise that will provide a workspace object
		*/
		updateWorkspaceAttribute: function(sWorkspaceId, sKey, sValue) {
			var mAttributes = {};
			mAttributes[sKey] = sValue;
			return this.updateWorkspaceAttributes(sWorkspaceId, mAttributes);
		},
		
		/** Sets attributes on selected workspace 
		 * @memberOf sap.watt.uitools.chebackend.dao.Workspace
	     * @param {string} sWorkspaceId The ID (not name) of the workspace in which the project resides
	     * @param {object} mAttributes Attributes map
	     * @return {Promise} a deferred promise that will provide a workspace object
		*/
		updateWorkspaceAttributes: function(sWorkspaceId, mAttributes) {
			var oData = {
				attributes: mAttributes
			};
			return this._oModifyAttributesQueue.next(function() {
				return Request.send("/workspace/" + sWorkspaceId, "POST", {}, oData);
			});
		},
		
		/** Returns a workspace by it's id
		 * @memberOf sap.watt.uitools.chebackend.dao.Workspace
	     * @param {string} sWorkspaceId The ID (not name) of the workspace in which the project resides
	     * @return {Promise} a deferred promise that will provide a workspace object
		*/
		getWorkspaceById: function(sWorkspaceId) {
			return Request.send("/workspace/" + sWorkspaceId);
		},
		
		/** Deletes a workspace attribute 
		 * @memberOf sap.watt.uitools.chebackend.dao.Workspace
	     * @param {string} sWorkspaceId The ID (not name) of the workspace in which the project resides
	     * @param {string} sKey Attribute key
		*/
		deleteWorkspaceAttribute: function(sWorkspaceId, sKey) {
			return this._oModifyAttributesQueue.next(function() {
				return Request.send("/workspace/" + sWorkspaceId + "/" + "attribute?name=" + sKey, "DELETE");
			});	
		},
		
		/** Clear all attributes of a given workspace  
		 * @memberOf sap.watt.uitools.chebackend.dao.Workspace
	     * @param {string} sWorkspaceId The ID (not name) of the workspace in which the project resides
		*/
		clearWorkspaceAttributes: function(sWorkspaceId) {
			var that = this;
			return this.getWorkspaceById(sWorkspaceId).then(function(oWorkspace) {
				var aDeletePromises = [];
				jQuery.each(oWorkspace.attributes, function(sKey, sValue) {
					aDeletePromises.push(that.deleteWorkspaceAttribute(sWorkspaceId, sKey));
				});
				return Q.all(aDeletePromises);
			});
		}
				
	};

	return Workspace;

});