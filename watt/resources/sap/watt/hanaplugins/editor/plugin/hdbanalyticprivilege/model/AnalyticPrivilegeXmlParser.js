/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define(["sap/watt/hanaplugins/editor/plugin/hdbcalculationview/base/common", 
        "sap/watt/hanaplugins/editor/plugin/hdbcalculationview/base/XmlReader", 
        "sap/watt/hanaplugins/editor/plugin/hdbcalculationview/sharedmodel/sharedmodel",
        "./AnalyticPrivilegeModel"], 
function(common, XmlReader, sharedmodel, analyticPrivilegeModel) {
    "use strict";

    var Util = common.Util;

    var AnalyticPrivilegeXmlParser = {

        parseAnalyticPrivilege: function(xmlDocument, model, fixMixedLineEndings, forceLineEndings) {

            var reader = new XmlReader(xmlDocument, fixMixedLineEndings, forceLineEndings);
            reader.moveDown().moveTo("analyticPrivilege", sharedmodel.NameSpace.PRIVILEGE);

            // skip schemaVersion, will be defaulted by the renderer  
            var schemaVersion = reader.consumeAttribute("schemaVersion");
            
            var analyticPrivilegeAttributes = reader.buildAttributes({
                id : "{id}",
                privilegeType : "{privilegeType}"
            });
            var analyticPrivilegeSkippedNodes = reader.skippedNodes;

            reader.moveDown();
            
            sharedmodel.parseDescriptions(reader, analyticPrivilegeAttributes);
            
            var analyticPrivilege = model.createAnalyticPrivilege(analyticPrivilegeAttributes, analyticPrivilegeSkippedNodes);
            
            this.parseSecuredModels(reader, analyticPrivilege);

            while (reader.tryMoveTo("validity")) {
                var validityValueFilter = sharedmodel.parseValueFilter(reader);
                analyticPrivilege.validities.add(validityValueFilter); 
                reader.next();
            }
            
            // conditionProcedureName OR restriction OR  whereSQL
            if (reader.tryMoveTo("conditionProcedureName")){
                analyticPrivilege.conditionProcedureName = reader.consumeContent();
                reader.next();
            }
            
            if (reader.tryMoveTo("whereSql")){
                analyticPrivilege.whereSql = reader.consumeContent();
                reader.next();
            }

            while (reader.tryMoveTo("restriction")) {
                var restrictionSkippedNodes = reader.skippedNodes;
                //attributes for restrictions are only known at the end (the tags come after the filters) 
                var restrictionAttributes = reader.buildAttributes();
                var restrictionfilters = [];
                var skippedNodesArray = [];
                this.parseFiltersAndRestrictionAttributes(reader, restrictionAttributes, restrictionfilters, skippedNodesArray);
                //the deprecated attribute logialOperator is not known in the model therefore handled by skipped nodes
                var restriction = analyticPrivilege.createRestriction(restrictionAttributes, restrictionSkippedNodes); 
                // add restriction filters
                for(var i = 0; i < restrictionfilters.length; i++){
                    restriction.filters.add(restrictionfilters[i]);
                }
                // add the skipped nodes of dimensionUri, attributeName and originInformationModelUri
                for(var j = 0; j < skippedNodesArray.length; j++){
                    restriction.$addSkippedNodes(skippedNodesArray[j]);
                }
                reader.next();
            }

            reader.moveUp();
            return reader.documentProperties;
        },

        parseSecuredModels: function(reader, analyticPrivilege) {
            
            reader.moveTo("securedModels");
            var securedModelsAttributes = reader.buildAttributes({
                allInformationModels: "{allInformationModels}"
            });
            var securedModelsSkippedNodes = reader.skippedNodes;
            var securedModels = analyticPrivilege.createSecuredModels(securedModelsAttributes, securedModelsSkippedNodes);


            if (reader.tryMoveDown()) {
                while (reader.tryMoveTo("modelUri")) {
                    var modelUriSkippedNodes = reader.skippedNodes;
                    securedModels.createOrMergeModelUri(reader.consumeContent(), modelUriSkippedNodes); 
                    reader.next();
                }
                reader.moveUp();
            }
            reader.next();
        },
        
        parseFiltersAndRestrictionAttributes : function(reader, restrictionAttributes, restrictionfilters, skippedNodesArray) {
            var mapFilterType = function(value) {  
                return reader.removePrefix(sharedmodel.NameSpace.PRIVILEGE, value);
            };
            //there must be at least one restriction
            reader.moveDown();
            while (reader.tryMoveTo("filter")) {
                var filterSkippedNodes = reader.skippedNodes;
                var filterAttributes = reader.buildAttributes({
                    attributeName: "{attributeName}",
                    type: Util.createXsiSelector("type", mapFilterType)
                });
                // create filter directly and add to array
                var filter = new analyticPrivilegeModel.Filter(filterAttributes, filterSkippedNodes);
                restrictionfilters.push(filter);
                //value & procedure fiters
                if (reader.tryMoveDown()){
                    while (reader.tryMoveTo("valueFilter")) {
                        var valueFilter = sharedmodel.parseValueFilter(reader);
                        filter.valueFilters.add(valueFilter); 
                        reader.next();
                    }
                    while (reader.tryMoveTo("procedureFilter")) {
                        var procedureFilterSkippedNodes = reader.skippedNodes;
                        var procedureFilterAttributes = reader.buildAttributes({
                            operator: "{operator}",
                            procedureName: "{procedureName}"
                        });
                        filter.createProcedureFilter(procedureFilterAttributes, procedureFilterSkippedNodes); 
                        reader.next();
                    }
                    reader.moveUp();
                }
                reader.next();
            }
            //restriction attributes 
            if (reader.tryMoveTo("dimensionUri")){
                restrictionAttributes.dimensionUri = reader.consumeContent();
                //collect the skipped nodes for adding them to the Restriction instance later
                skippedNodesArray.push(reader.skippedNodes);
                reader.next();
            }
            if (reader.tryMoveTo("attributeName")){
                restrictionAttributes.attributeName = reader.consumeContent();
                skippedNodesArray.push(reader.skippedNodes);
                reader.next();
            }
            if (reader.tryMoveTo("originInformationModelUri")){
                restrictionAttributes.originInformationModelUri = reader.consumeContent();
                skippedNodesArray.push(reader.skippedNodes);
                reader.next();
            }
            reader.moveUp();
        }
        
    };

    return AnalyticPrivilegeXmlParser;
    
});
