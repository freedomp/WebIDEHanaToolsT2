define(["../io/Request", "sap/watt/lib/lodash/lodash"], function (Request, _) {

	"use strict";

    var Project = {
    	GENERIC_ATTRIBUTE_NAME : "sap.watt.common.setting",

        getProjectTypes: function () {
            return Request.send("/project-type", "GET");
        },

        /**
         * Adds a project to a workspace.
         *
         * @memberOf sap.watt.uitools.chebackend.dao.File
         * @param {string}
         *            sUrl The workspace location
         * @param {string}
         *            sProjectName the human-readable name of the project
         * @param {string}
         *            sServerPath The optional path of the project on the server.
         * @param {boolean}
         *            bCreate If true, the project is created on the server file system if it doesn't already exist
         */
        createProject: function (sUrl, oProjectData) {
          var url = sUrl + "?name=" + oProjectData.name;

          var data = {
              "generatorDescription": {
                  "options": oProjectData.generatorDescription.options
              },
              "name": oProjectData.name,
              "visibility": "public",
              "runners": null,
              "builders": {
                  "configs": {},
                  "default": null
              },
              "mixins": oProjectData.mixinTypes,
              "type": oProjectData.type,
              "description": null
          };

          var that = this;
          return this.getProjectTypes().then(function(aCheTypes) {
              var nCheTypeIndex = _.findIndex(aCheTypes, function(oCheType) {
                  return oCheType.id === oProjectData.type;
              });

              if (nCheTypeIndex === -1) {
                  // primary project type is not found
                  return null;
              }

              data.attributes = that._transformAttributes(oProjectData.attributes, aCheTypes[nCheTypeIndex]);

              return Request.send(url, "POST", {}, data);
          });
        },

        isProjectTypeAttribute : function(sAttributeName, oCheProjectType) {
            var aAttributeDescriptors = oCheProjectType.attributeDescriptors;
            for (var i = 0; i < aAttributeDescriptors.length; i++) {
                if (aAttributeDescriptors[i].name === sAttributeName) {
                    return true;
                }
            }

            return false;
        },

        // "attributes": "Map[string,List[string]]",
        _transformAttributes : function(oProjectAttributes, oCheProjectType) {
            var that = this;

            if (_.isPlainObject(oProjectAttributes)) {
                // get attribute names
            	var aAttributeNames = _.keys(oProjectAttributes);
            	_.forEach(aAttributeNames, function(sAttributeName) {
            	    // get attribute value
            		var oAttributeValue = oProjectAttributes[sAttributeName];

            		// if attribute does not belong to the type store its value in a generic attribute
            		if (!that.isProjectTypeAttribute(sAttributeName, oCheProjectType)) {
            		    // transform value to string array
            		    var oAttribute = {};
            		    oAttribute[sAttributeName] = oAttributeValue;
            		    if (!oProjectAttributes[that.GENERIC_ATTRIBUTE_NAME]) {
            		    	oProjectAttributes[that.GENERIC_ATTRIBUTE_NAME] = [];
            		    }
            		    oProjectAttributes[that.GENERIC_ATTRIBUTE_NAME].push(JSON.stringify(oAttribute));
            		    // remove attribute name from the result object
            		    delete oProjectAttributes[sAttributeName];
            		}
            	});

            	return oProjectAttributes;
            }

            return {};
        },

        updateProject : function(sWorkspaceId, sProjectPath, data) {
	        return Request.send("/project/" + sWorkspaceId + sProjectPath, "PUT", {}, data);
		},

		getProjectMetadata : function(sWorkspaceId, sProjectName) {
			return Request.send("/project/" + sWorkspaceId + "/" + sProjectName, "GET");
		}
    };

    return Project;
});