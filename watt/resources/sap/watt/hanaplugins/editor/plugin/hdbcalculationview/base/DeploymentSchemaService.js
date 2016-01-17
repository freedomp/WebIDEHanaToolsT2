/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define(["./FullQualifiedName"],function(FullQualifiedName) {
    "use strict";
	var SYS_BIC = "_SYS_BIC";
	var FQNAME_PARAM = "$FQName$";
   
    var deploymentSchema = {
        getDeploymentSchemaName: function(context, objectFQName, callback) {
			var deploymentSchemaList;
			var aStatements = [];
			var stmt = "SELECT * FROM _SYS_BI.BIMC_CONFIGURATION WHERE NAME IN ('DEPLOYMENT_SCHEMA', 'DEPLOYMENT_SCHEMA_" + FQNAME_PARAM + "') ORDER BY NAME DESC";
			var fqNameObj = FullQualifiedName.createByFqName(objectFQName);
			stmt = stmt.replace(FQNAME_PARAM, fqNameObj.getFullQualifiedName());
			var pstmt = encodeURI(stmt);
			aStatements.push({
				statement: pstmt,
				type: "SELECT"
			});
			var setting = {
                        maxResultSize: 20,
                        includePosColumn: "false"
            };
            var callbackResult = function(result) {
                        if (result && result.responses && result.responses[0].result && result.responses[0].result.entries) {
                            deploymentSchemaList = result.responses[0].result.entries;
                            callback(deploymentSchemaList);
                        } else {
                            callback(SYS_BIC);
                        }
                    };
			
			//context.service.catalogDAO.sqlMultiExecute(aStatements, setting, callbackResult).done();
        }
    };

    return {
        deploymentSchema: deploymentSchema
    };
});
