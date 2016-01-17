/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define([
        "hanaddl/hanaddlNonUi",
        "commonddl/commonddlNonUi",
        ],
        function(hanaddlNonUi, commonddlNonUi) {
	"use strict";

	var ImpactAnalysis = {
			getImpactAnalysisForCDS : function(cdsDocument){
				var entitiesNameArray = [];
				var namespace;
				var parserFactoryApi = hanaddlNonUi.DdlParserFactoryApi;

				var version = parserFactoryApi.versionsFactory.versionLast;
				var resolver = parserFactoryApi.createResolver(version,"/watt/resources/sap/watt/hanaplugins/editor/plugin/hdbdd");
				var parser = parserFactoryApi.createParser(version);

				var astModel = parser.parseAndGetAst2(resolver, cdsDocument);
				var statements = astModel.statements;
				for (var stmtCount = 0; stmtCount < statements.length; stmtCount++) {
					var stmt = statements[stmtCount];
					if (stmt instanceof commonddlNonUi.NamespaceDeclarationImpl) {
						namespace = stmt.getName();
					}
					else if (stmt instanceof commonddlNonUi.EntityDeclarationImpl) {
						entitiesNameArray.push({"entityName" : namespace + "::" + stmt.getName()});
					}
					else if (stmt instanceof commonddlNonUi.ContextDeclarationImpl) {
						var currentNamePath = namespace + "::" + stmt.getName();
						this.getChildEntities(entitiesNameArray, stmt, currentNamePath);
					}
				}
				
				//alert(entitiesNameArray);
				return entitiesNameArray;
			},

			getChildEntities : function(entitiesNameArray, parentContext, currentNamePath){
				var statements = parentContext.statements;
				if (statements) {
					for (var stmtCount = 0; stmtCount < statements.length; stmtCount++) {
						var stmt = statements[stmtCount];
						if (stmt instanceof commonddlNonUi.EntityDeclarationImpl) {
							entitiesNameArray.push({"entityName" :currentNamePath + "." + stmt.getName()});
						} else if(stmt instanceof commonddlNonUi.ContextDeclarationImpl){
							var namePath = currentNamePath + "." + stmt.getName();
							this.getChildEntities(entitiesNameArray, stmt, namePath);
						}
					}
				}
				return entitiesNameArray;
			}
	};

	return {
		ImpactAnalysis: ImpactAnalysis,
	};
});