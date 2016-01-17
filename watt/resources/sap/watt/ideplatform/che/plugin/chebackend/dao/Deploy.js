define(["../io/Request"], function (Request) {
    "use strict";
    var Build = {
        /** 
         * @private
         * @memberOf sap.watt.uitools.chebackend.dao.Build
         * @type {sap.watt.uitools.chebackend.io.Request}
         */
        _io: Request,
        //TODO: need to connect, login, logout to Che, or can it be assumed that File.js takes care of this?
        //TODO: consider using HATEAOS instead of constructing urls.

        /** Initiates a build process on the Che server
         * @memberOf sap.watt.uitools.chebackend.dao.Build
         * @param {string} sWorkspaceId The ID (not name) of the workspace in which the project resides
         * @param {string} sPayload The ID of the project to build
         * @return {Promise} a deferred promise that will provide the build's ID
         */
        doDeploy: function (sWorkspaceId, sPayload) {
            var mtaUrl = "/mta/" + sWorkspaceId + "/build";
            var jsonPayload = JSON.parse(sPayload);
            return this._io.send(mtaUrl, "POST", {}, jsonPayload);
        },
        doCancelBuild: function (sWorkspaceId, sBuildId) {
            var cancelBuildUrl = "/builder/" + sWorkspaceId + "/cancel/" + sBuildId;
            return this._io.send(cancelBuildUrl, "POST", {}, {});
        },
        doSetupBuild: function (sProjectName, sWorkspaceId) {
            //TODO: Ugly hack. Remove once setup of build is moved to server side
            var setupBuildUrl = '/admin/hanabuilder/setup?serviceName=Demo-Hana';
            var data = {};
            data.project = sProjectName;
            data.workspace = sWorkspaceId;
            return Request.send(setupBuildUrl, "POST", {}, data);

        },
        doGetBuilders: function (sWorkspaceId) {
            var buildersUrl = "/builder/" + sWorkspaceId + "/builders";
            return this._io.send(buildersUrl, "GET", {}, {});
        },
        getTask: function (oTask) {
            if (oTask) {
                var sBuildStatusUrl = "/builder/" + oTask.workspaceId + "/status/" + oTask.taskId;
                return this._io.send(sBuildStatusUrl, "GET");
            } else {
                throw new Error("Missing params");

            }
        }

    };

    return Build;

});
