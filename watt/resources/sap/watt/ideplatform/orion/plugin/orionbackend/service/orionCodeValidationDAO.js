define(["../dao/CodeValidator", "../dao/File"], function( validatorDAO, fileDAO){
	"use strict";

	var MIN_RETRY_TIMEOUT_SEC = 5;
	var MAX_RETRIES = 10;
	var HTTP_CODE_TOO_MANY_REQUESTS = 429;
	var REQUEST_INTEGRITIY_STATUS = {
		OK:0,
		ERROR:1,
		PARTIAL_ERROR:2
	};


	function getRequestPerformanceParams() {

		var performanceParams = {
			maxRetries: MAX_RETRIES,
			timeout: MIN_RETRY_TIMEOUT_SEC,
			retryCount: 0
		};
		return performanceParams;
	}

	function getWrappedResult(oResult, oStatus, oInfo){
		return {
			result: oResult,
			integrity: {
				status: oStatus,
				info: oInfo
			}
		};
	}

	function validWorkspace(workspaces) {
		//workspaces.Workspaces[0].Id might be 0
		if (workspaces && workspaces.Workspaces[0]){
			if ( !(_.isUndefined(workspaces.Workspaces[0].Id) || _.isUndefined(workspaces.Workspaces[0].Id) ) ) {
				return true;
			}
		}
		return false;
	}


	function validateWorkspaceContent(workspaceProjectsConfig, aProjects, perfParams){
		var that = this;
		return fileDAO.loadWorkspaces()
			.then(function(workspaces){
				if (validWorkspace(workspaces)){
					var workspaceID = workspaces.Workspaces[0].Id;
					if (workspaceID){
						return validatorDAO.validateWorkspaceContent(workspaceID, workspaceProjectsConfig, aProjects )
							.then(function(result){
								that.context.service.usagemonitoring.report("ProblemsView", "SuccessAfterRetries", perfParams.retryCount).done();
								return getWrappedResult(result, REQUEST_INTEGRITIY_STATUS.OK);
							});
					}
				}
			}).fail(function (oError) {
				that.context.service.usagemonitoring.report("ProblemsView", "ServerResponse", oError.status || "no status").done();
				if (oError.status && oError.status == HTTP_CODE_TOO_MANY_REQUESTS) {
					//The request failed due to server limitation
					that.context.service.usagemonitoring.report("ProblemsView", "ServerResponse", HTTP_CODE_TOO_MANY_REQUESTS).done();
					if (perfParams.retryCount <  perfParams.maxRetries){
						perfParams.retryCount++;
						return Q
							.delay(perfParams.timeout*1000)
							.then(function(){
								return validateWorkspaceContent.call(that,workspaceProjectsConfig, aProjects, perfParams);
							});
					}else{
						that.context.service.usagemonitoring.report("ProblemsView", "RejectedAfterMaxRetries", MAX_RETRIES).done();
					}
				}
				that.context.service.log.error(that.context.self.getProxyMetadata().getName(), oError.message, ["user"]).done();
				return getWrappedResult(undefined,REQUEST_INTEGRITIY_STATUS.ERROR,oError.message);
			});
	}


	return {
		codeValidationResponseStatus : function() {
			return _.clone(REQUEST_INTEGRITIY_STATUS);
		},
		validateWorkspaceContent: function(workspaceProjectsConfig, aProjects) {
			return validateWorkspaceContent.call(this, workspaceProjectsConfig, aProjects, getRequestPerformanceParams());
		}


	};

});
