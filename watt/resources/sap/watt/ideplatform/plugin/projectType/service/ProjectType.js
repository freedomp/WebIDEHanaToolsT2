define(function() {
	"use strict";

    function ProjectTypeService() {
        this._oDao = null;
    }

    ProjectTypeService.prototype.configure = function (mConfig){
        if (mConfig && mConfig.dao) {
            this._oDao = mConfig.dao.service;
            return this._oDao.initProjectType(mConfig);
        }
        throw new Error("ProjectType dao service must be defined");
    };

    ProjectTypeService.prototype.getAllTypes = function () {
        return this._oDao.getAllTypes();
    };

    ProjectTypeService.prototype.getType = function (sProjectTypeID) {
        return this._oDao.getType(sProjectTypeID);
    };

    ProjectTypeService.prototype.getIncludedTypes = function (sProjectTypeID) {
       return this._oDao.getIncludedTypes(sProjectTypeID);
    };

    ProjectTypeService.prototype.getProjectTypes = function (oTargetDocument){
        return this._oDao.getProjectTypes(oTargetDocument);
    };

    ProjectTypeService.prototype.getProjectTypesPerCategories = function (oTargetDocument){
        return this._oDao.getProjectTypesPerCategories(oTargetDocument);
    };
     
    ProjectTypeService.prototype.addProjectTypes = function(oTargetDocument, aProjectTypeIDs) {
        var that = this;
        return this._oDao.addProjectTypes(oTargetDocument, aProjectTypeIDs).then(function(ProjectTypesUpdatedParameters){
            // Fire the event
            return that._fireProjectTypesUpdated(ProjectTypesUpdatedParameters);
        });
    };

    ProjectTypeService.prototype.removeProjectTypes = function (oTargetDocument, aProjectTypeIDs) {
        var that = this;
        return this._oDao.removeProjectTypes(oTargetDocument, aProjectTypeIDs).then(function(ProjectTypesUpdatedParameters){
            // Fire the event
            return that._fireProjectTypesUpdated(ProjectTypesUpdatedParameters);
        });
    };


    ProjectTypeService.prototype.setProjectTypes = function (oTargetDocument, aProjectTypeIDs) {
        var that = this;
        return this._oDao.setProjectTypes(oTargetDocument, aProjectTypeIDs).then(function(ProjectTypesUpdatedParameters){
            // Fire the event
            return that._fireProjectTypesUpdated(ProjectTypesUpdatedParameters);
        });
    };


    ProjectTypeService.prototype.updateDecorations = function(oEvent){
        var oProjectDocument = oEvent.params.projectDocument;
        this.context.service.decoration.updateDecorations(oProjectDocument, false, oEvent);
    };

    // Fire update event if anything changed (project types were added or removed) or forced
    ProjectTypeService.prototype._fireProjectTypesUpdated = function (ProjectTypesUpdatedParameters) {
        if (ProjectTypesUpdatedParameters && (ProjectTypesUpdatedParameters.bForce || ProjectTypesUpdatedParameters.aAddedTypes.length > 0 || ProjectTypesUpdatedParameters.aRemovedTypes.length > 0)) {
            var that = this;
            return ProjectTypesUpdatedParameters.oTargetDocument.getProject().then(function (oProject) {
                return that.context.event.fireProjectTypesUpdated({
                    "projectDocument": oProject,
                    "added": ProjectTypesUpdatedParameters.aAddedTypes,
                    "removed": ProjectTypesUpdatedParameters.aRemovedTypes
                });
            });
        }

        return Q();
    };

	return new ProjectTypeService();
});