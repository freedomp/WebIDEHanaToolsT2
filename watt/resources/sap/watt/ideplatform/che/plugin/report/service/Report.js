define([],function() {
	
	"use strict";
	
	return {
		
		startOperation : function(sComponent, sOperation) {	
		
			sComponent = sComponent || "<Component>";
			sOperation = sOperation || "<Operation>";
			var that = this;
			var message = that.context.i18n.getText("i18n", "report_operation_started", sOperation);
			return Q.all([
				that.context.service.usernotification.liteInfo(message),
				that.context.service.log.info(sComponent, message, ["user"])
			]);
		},
		
		endOperationWithSuccess : function(sComponent, sOperation) {		
			
			sComponent = sComponent || "<Component>";
			sOperation = sOperation || "<Operation>";
			var that = this;
			var message = that.context.i18n.getText("i18n", "report_operation_ended_with_success", sOperation);
			return Q.all([
				that.context.service.usernotification.liteInfo(message),
				that.context.service.log.info(sComponent, message, ["user"])
			]);
		},
		
		endOperationWithFailure : function(sComponent, sOperation, sError) {	
			
			sComponent = sComponent || "<Component>";
			sOperation = sOperation || "<Operation>";
			var that = this;
			var message = that.context.i18n.getText("i18n", "report_operation_ended_with_failure_refer_to_log", sOperation);
			return Q.all([
				that.context.service.usernotification.alert(message),
				that._printErrorLog(sComponent, sOperation, sError)
			]);	
		},
		
		_printErrorLog : function(sComponent, sOperation, sError) {
			
			var that = this;
			var separatorLine = "------------------------------------------------------------------";
			return that.context.service.log.info(sComponent, separatorLine, ["user"]).then(function() {
				var message = that.context.i18n.getText("i18n", "report_operation_start_of_log", sOperation);
				return that.context.service.log.info(sComponent, message, ["user"]);
			}).then(function() {
				return that.context.service.log.error(sComponent, "[ERROR]: " + sError, ["user"]);
			}).then(function() {
				var message = that.context.i18n.getText("i18n", "report_operation_end_of_log", sOperation);
				return that.context.service.log.info(sComponent, message, ["user"]);
			}).then(function() {
				return that.context.service.log.info(sComponent, separatorLine, ["user"]);
			}).then(function() {
				var message = that.context.i18n.getText("i18n", "report_operation_ended_with_failure", sOperation);
				return that.context.service.log.info(sComponent, message, ["user"]);
			});
		}
		
	};
});