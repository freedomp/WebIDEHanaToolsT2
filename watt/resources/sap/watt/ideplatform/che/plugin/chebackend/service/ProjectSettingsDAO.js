define(["sap/watt/lib/lodash/lodash", "../io/Request", "../dao/Project"], function (_, Request, oProjectDao) { 
	"use strict";
	
	var _oSetQueue = new Q.sap.Queue();
	
	return {
		
		set: function(sAttributeName, oAttributeValue, oDocument) {
			var that = this;
			
			return _oSetQueue.next(function() {
				var aPromises = [];
				
				aPromises.push(oProjectDao.getProjectTypes());
				aPromises.push(oDocument.getProject());
				
				return Q.spread(aPromises, function(aCheProjectTypes, oProjectDocument) {
					var oProjectMetadata = oProjectDocument.getProjectMetadata();
				    if (oProjectMetadata && oProjectMetadata.type) {
				        var nCheTypeIndex = _.findIndex(aCheProjectTypes, function(oCheProjectType) {
	                        return oCheProjectType.id === oProjectMetadata.type;
	                    });
	                     
	                    if (oProjectDao.isProjectTypeAttribute(sAttributeName, aCheProjectTypes[nCheTypeIndex])) {
	                        // set project type attribute value
	                        return that._setAttributeArrayValue(oProjectMetadata, sAttributeName, oAttributeValue, true, oProjectDocument);
	                    }
	                    // get generic attribute value
	                    var oGenericWebIdeAttributeValue = oProjectMetadata.attributes[oProjectDao.GENERIC_ATTRIBUTE_NAME];
	                    if (oGenericWebIdeAttributeValue) {
	                    	var oGenericValue = JSON.parse(oGenericWebIdeAttributeValue);
		    	            oGenericValue = oGenericValue || {};
		    	            oGenericValue[sAttributeName] = oAttributeValue;
		    	            
		    			    return that._setAttributeArrayValue(oProjectMetadata, oProjectDao.GENERIC_ATTRIBUTE_NAME, oGenericValue, false, oProjectDocument);
	                    }
	                    
	                    var oAttribute = {};
	                    oAttribute[sAttributeName] = oAttributeValue; 
	                    return that._setAttributeArrayValue(oProjectMetadata, oProjectDao.GENERIC_ATTRIBUTE_NAME, oAttribute, false, oProjectDocument);
				    }
				});
			});
		},

        _setAttributeArrayValue : function(oProjectMetadata, sKey, oValue, bProjectTypeAttribute, oProjectDocument) {
			var data = {
			    "type": oProjectMetadata.type,
	            "attributes": oProjectMetadata.attributes
	        };
	        
	        if (bProjectTypeAttribute) {
	            data.attributes[sKey] = oValue; // must be an array value
	        } else {
	            data.attributes[sKey] = [JSON.stringify(oValue)];
	        }
			
			return oProjectDocument.updateProject(data);
		},
		
        _getProjectMetadata : function(oDocument) {
        	return oDocument.getProject().then(function(oProjectDocument) {
        		return oProjectDocument.getProjectMetadata();
        	});
        },

		get: function(sAttributeName, oDocument) {
			var that = this;
			
			return this._getProjectMetadata(oDocument).then(function(oProjectMetadata) {
			    if (oProjectMetadata) {
			    	if (oProjectMetadata && oProjectMetadata.attributes) {
			    		var aAttributesKeys = Object.keys(oProjectMetadata.attributes);
				        var nAttributeIndex = _.findIndex(aAttributesKeys, function(oAttributeKey) {
	                        return oAttributeKey === sAttributeName;
	                    });
	                     
	                    if (nAttributeIndex === -1) {
	                    	return that._getAttributeValue(oProjectMetadata, sAttributeName, false);
	                    } 
	                    
	                    return that._getAttributeValue(oProjectMetadata, sAttributeName, true);
			    	}
			    }
			});
		},
		
		_getAttributeValue : function(oProjectMetadata, sKey, isProjectTypeAttribute) {
		    if (isProjectTypeAttribute) {
		        return oProjectMetadata.attributes[sKey];
		    } 
		    
	        var aCommonSettingsAttributeValue = oProjectMetadata.attributes[oProjectDao.GENERIC_ATTRIBUTE_NAME];
	        if (aCommonSettingsAttributeValue && aCommonSettingsAttributeValue.length !== 0) {
	            // get first item from the array 
	            var sValue = aCommonSettingsAttributeValue[0];
	            var oValue = JSON.parse(sValue);
	            return oValue[sKey];
	        }
		}
	};
});
