/*eslint-disable no-eq-null,eqeqeq,camelcase,max-params,quotes,complexity,max-statements,curly,max-len,no-empty,no-proto,
no-redeclare,radix,no-undef,no-console,valid-jsdoc,no-constant-condition,no-warning-comments*/
define(
    ["rndrt/rnd","commonddl/commonddlUi", "commonddl/commonddlNonUi","hanaddl/backendaccess/MetadataServices","hanaddl/IBaseCdsDdlParserConstants","hanaddl/hanaddlCache"], //dependencies
    function (rnd,commonddlUi,commonddlNonUi,MetadataServices,IBaseCdsDdlParserConstants,Cache) {

        var context = Cache.context;

        var AbstractSemanticCodeCompletionRepositoryAccess = commonddlUi.AbstractSemanticCodeCompletionRepositoryAccess;
        function HanaRepositoryAccess() {

        }
        HanaRepositoryAccess.prototype = Object.create(AbstractSemanticCodeCompletionRepositoryAccess.prototype);
        HanaRepositoryAccess.prototype.project = null;

        HanaRepositoryAccess.HanaRepositoryAccess1 = function() {
            var result = new HanaRepositoryAccess();
            return result;
        };
        HanaRepositoryAccess.HanaRepositoryAccess2 = function(project) {
            var result = new HanaRepositoryAccess();
            result.project = project;
            return result;
        };
        HanaRepositoryAccess.prototype.getProject = function() {
            return this.project;
        };

        function retriggerCoCo(that) {
            if (context) { // is web ide or local scenario?
                var promise = context.service.command.getCommand("intellisence");
                promise.then(function(command) {
                    command.execute();
                });
            }else {
                that.aceEditor.execCommand("startAutocomplete");
            }
        }
        function sortByType(list) {
            list.sort(function(a,b) {
                if (a.mainType && b.mainType) {
                    return a.mainType.localeCompare(b.mainType);
                }
                return 0;
            });
        }
        function validateCursorPosition(that,beforeCursor) {
            if (that.aceEditor != null && that.aceEditor.selection != null) {
                var currentCursor = that.aceEditor.selection.getCursor();
                if (currentCursor.row != beforeCursor.row || currentCursor.column != beforeCursor.column) {
                    return false; //cursor changed in the meantime; don't re-trigger completion
                }
            }
            return true;
        }
        HanaRepositoryAccess.prototype.getCdsTypeNames = function(namePattern) {
            if (HanaRepositoryAccess.lastCdsTypeNames != null) {
                var res = HanaRepositoryAccess.lastCdsTypeNames;
                HanaRepositoryAccess.lastCdsTypeNames = null;
                return res;
            }
            if (HanaRepositoryAccess.cdsTypeNamesRequestCount === undefined){
                HanaRepositoryAccess.cdsTypeNamesRequestCount = 0;
            }
            HanaRepositoryAccess.cdsTypeNamesRequestCount++;
            var that = this;
            var currentCount = HanaRepositoryAccess.cdsTypeNamesRequestCount;
            var beforeCursor = null;
            if (this.aceEditor != null && this.aceEditor.selection != null) {
                beforeCursor = this.aceEditor.selection.getCursor();
            }
            // search for scalar type, structured type, derived type and context
            var runtimeContext = {"mode":[{"main":"RT"}],"type":[{"main":"CDS_SCALAR_TYPE"},{"main":"CDS_STRUCTURED_TYPE"},{"main":"CDS_CONTEXT"},{"main":"CDS_DERIVED_TYPE"}]};
            MetadataServices.searchService.search(namePattern, 'PATTERN', 100, false, false, true, function(data_unit, textStatus) {
                if (validateCursorPosition(that,beforeCursor) === false) {
                    return;
                }
                if (data_unit != null && data_unit.metadata != null) {
                    var names = [];
                    var allNames = [];
                    for (var qq = 0;qq < data_unit.metadata.length;qq++) {
                        var name = data_unit.metadata[qq].objectName;
                        if (allNames.indexOf(name) != -1) {
                            continue; // name already found
                        }
                        allNames.push(name);
                        var ty = data_unit.metadata[qq].mainType;
                        var type = IBaseCdsDdlParserConstants.TYPE_TYPE;
                        if ("CDS_SCALAR_TYPE" === ty || "ScalarType" === ty) {
                            type = IBaseCdsDdlParserConstants.TYPE_TYPE;
                        }else if ("CDS_STRUCTURED_TYPE" === ty || "StructuredType" === ty) {
                            type = IBaseCdsDdlParserConstants.TYPE_TYPE;
                        }else if ("CDS_CONTEXT" === ty || "Context" === ty) {
                            type = IBaseCdsDdlParserConstants.CONTEXT_TYPE;
                        }else if ("CDS_DERIVED_TYPE" === ty || "DerivedType" === ty) {
                            type = IBaseCdsDdlParserConstants.TYPE_TYPE;
                        }
                        names.push({name:name,type:type});
                    }
                    if (that.aceEditor != null && currentCount === HanaRepositoryAccess.cdsTypeNamesRequestCount) { // editor set, re-run code completion and re-use the backend result which we just retrieved
                        HanaRepositoryAccess.lastCdsTypeNames = names;
                        retriggerCoCo(that);
                    }
                }else{ // no data retrieved
                    if (that.aceEditor != null && currentCount === HanaRepositoryAccess.cdsTypeNamesRequestCount) { // editor set, re-run code completion and re-use the backend result which we just retrieved
                        HanaRepositoryAccess.lastCdsTypeNames = [];
                        retriggerCoCo(that);
                    }
                }
            },function() { // on error
                //error handling
                if (validateCursorPosition(that,beforeCursor) === false) {
                    return;
                }
                HanaRepositoryAccess.lastCdsTypeNames = [];
                retriggerCoCo(that);
            },undefined,null,runtimeContext);
            return commonddlNonUi.AbstractDdlParser.INCOMPLETE_SIGNAL;
        };
        HanaRepositoryAccess.prototype.getDataSourceNames = function(namePattern) {
            if (namePattern == null)return null;

            if (HanaRepositoryAccess.lastDataSourceNames != null) {
                var res = HanaRepositoryAccess.lastDataSourceNames;
                HanaRepositoryAccess.lastDataSourceNames = null;
                return res;
            }
            if (HanaRepositoryAccess.dataSourceNamesRequestCount === undefined){
                HanaRepositoryAccess.dataSourceNamesRequestCount = 0;
            }
            HanaRepositoryAccess.dataSourceNamesRequestCount++;
            var that = this;
            var currentCount = HanaRepositoryAccess.dataSourceNamesRequestCount;
            var beforeCursor = null;
            if (this.aceEditor != null && this.aceEditor.selection != null) {
                beforeCursor = this.aceEditor.selection.getCursor();
            }
            if (rnd.Utils.stringStartsWith(namePattern,'"')) {
                namePattern = namePattern.substring(1,namePattern.length);
            }
            if (rnd.Utils.stringEndsWith(namePattern,'"')) {
                namePattern = namePattern.substring(0,namePattern.length - 1);
            }
            // TODO: bug: cannot search for CDS_ENTITY in case insensitive way (we get namePattern in lower case here)
            MetadataServices.searchService.search(namePattern, 'PATTERN', 100, false, false, true, function(data_unit, textStatus) {
                if (validateCursorPosition(that,beforeCursor) === false) {
                    return;
                }
                // we can only access tables/views from same schema - other schemas are not allowed!!!
                if (data_unit != null && data_unit.metadata != null) {
                    var names = [];
                    //sort by mainType with the goal to remove the TABLE names for which an ENTITY exists
                    sortByType(data_unit.metadata);
                    var allNames = [];
                    for (var qq = 0; qq < data_unit.metadata.length; qq++) {
                        // backend doesn't set schema attribute for CDS_ENTITY result entries; but this is not an issue
                        // because CDS allows to consume entities from foreign schema (at least in XS1). And therefore we have
                        // to show all CDS ENTITIES in code completion.
                        if (data_unit.metadata[qq].schema !== undefined && data_unit.metadata[qq].mainType !== "CDS_ENTITY") {
                            if (data_unit.metadata[qq].schema !==  null) {
                                continue;
                            }
                        }
                        var name = data_unit.metadata[qq].objectName;
                        if (allNames.indexOf(name) != -1) {
                            continue; // name already found
                        }
                        allNames.push(name);
                        if (name.indexOf("::") > 0 || name.indexOf(".") > 0) {
                            name = '"' + name + '"';
                        }
                        var ty = data_unit.metadata[qq].mainType;
                        var type = IBaseCdsDdlParserConstants.ENTITY_TYPE;
                        if ("VIEW" === ty) {
                            type = IBaseCdsDdlParserConstants.VIEW_TYPE;
                        }else if ("TABLE" === ty) {
                            type = IBaseCdsDdlParserConstants.TABLE_TYPE;
                        }else if ("SYNONYM" === ty) {
                            type = IBaseCdsDdlParserConstants.SYNONYM_TYPE;
                        }else if ("CDS_ENTITY" === ty) {
                            type = IBaseCdsDdlParserConstants.ENTITY_TYPE;
                        }
                        names.push({name:name,type:type});
                    }
                    if (that.aceEditor != null && currentCount === HanaRepositoryAccess.dataSourceNamesRequestCount) { // editor set, re-run code completion and re-use the backend result which we just retrieved
                        HanaRepositoryAccess.lastDataSourceNames = names;
                        retriggerCoCo(that);
                    }
                }else{ // no data retrieved
                    if (that.aceEditor != null && currentCount === HanaRepositoryAccess.dataSourceNamesRequestCount) { // editor set, re-run code completion and re-use the backend result which we just retrieved
                        HanaRepositoryAccess.lastDataSourceNames = [];
                        retriggerCoCo(that);
                    }
                }
            },function() { // on error
                //error handling
                if (validateCursorPosition(that,beforeCursor) === false) {
                    return;
                }
                HanaRepositoryAccess.lastDataSourceNames = [];
                retriggerCoCo(that);
            },undefined,null);
            return commonddlNonUi.AbstractDdlParser.INCOMPLETE_SIGNAL;
        };
        HanaRepositoryAccess.prototype.getDataSourceType = function(dataSourceName,callback,onError) {
            if (HanaRepositoryAccess.lastDataSourceTypes == null) {
                HanaRepositoryAccess.lastDataSourceTypes = {};
            }
            var cache = HanaRepositoryAccess.lastDataSourceTypes[dataSourceName];
            if (cache != null) {
                if (new Date().getTime() - cache.time < 5 * 60 * 1000) {
                    callback(cache.type);
                    return;
                }
            }
            //TODO: search for cds name with full qualified name is not working
            var n = dataSourceName;
            var ind = n.indexOf("::");
            if (ind > 0) {
                n = n.substring(ind + 2);
            }
            MetadataServices.searchService.search(n/*dataSourceName*/,/*'PATTERN'*/ false, 100, false, /*false*/true, true, function(data_unit, textStatus) {
                    if (data_unit != null && data_unit.metadata != null) {
                        sortByType(data_unit.metadata); // ensure that entities are first in array
                        var possibleMatches = [];
                        for (var qq = 0; qq < data_unit.metadata.length; qq++) {
                            if (data_unit.metadata[qq].mainType != "SYNONYM") {
                                if (data_unit.metadata[qq].objectName === dataSourceName) {
                                    HanaRepositoryAccess.lastDataSourceTypes[dataSourceName] = {type:data_unit.metadata[qq].mainType,time:new Date().getTime()};
                                    callback(data_unit.metadata[qq].mainType);
                                    return;
                                }else{
                                    possibleMatches.push(data_unit.metadata[qq]);
                                }
                            }
                        }
                        if (possibleMatches.length > 0) {
                            callback(possibleMatches[0].mainType,possibleMatches[0].objectName,possibleMatches[0].schema);
                        }else{
                            if (onError !== undefined) {
                                onError();
                            }
                        }
                    }
            },function() { // on error
                if (onError !== undefined) {
                    onError();
                }
            },undefined,null);
        };
        HanaRepositoryAccess.prototype.getColumnNames = function(monitor,cu,dataSourceName,columnNamePattern) {
            if (dataSourceName == null || dataSourceName.length == 0)return null;
            if (rnd.Utils.stringStartsWith(dataSourceName,'"') && rnd.Utils.stringEndsWith(dataSourceName,'"')) {
                dataSourceName = dataSourceName.substring(1,dataSourceName.length - 1);
            }
            if (HanaRepositoryAccess.lastColumnNames != null) {
                var res = HanaRepositoryAccess.lastColumnNames[dataSourceName];
                if (res != null) {
                    if (new Date().getTime() - res.time > 60 * 1000) {
                        //delete cache and re-run backend request
                        delete HanaRepositoryAccess.lastColumnNames[dataSourceName];
                    } else {
                        res.time = new Date().getTime(); // update timestamp
                        var result = res.names;
                        return result;
                    }
                }
            }
            if (HanaRepositoryAccess.columnNamesRequestCount === undefined){
                HanaRepositoryAccess.columnNamesRequestCount = 0;
            }
            HanaRepositoryAccess.columnNamesRequestCount++;
            var that = this;
            var currentCount = HanaRepositoryAccess.columnNamesRequestCount;
            var beforeCursor = null;
            if (this.aceEditor != null && this.aceEditor.selection != null) {
                beforeCursor = this.aceEditor.selection.getCursor();
            }

            var onError = function() {
                if (validateCursorPosition(that,beforeCursor) === false) {
                    return;
                }
                if (HanaRepositoryAccess.lastColumnNames == null) {
                    HanaRepositoryAccess.lastColumnNames = {};
                }
                HanaRepositoryAccess.lastColumnNames[dataSourceName] = {names: [], time: new Date().getTime()};
                retriggerCoCo(that);
            };
            this.getDataSourceType(dataSourceName,function(mainType,objectName) {
                var nameToSearch = dataSourceName;
                if (objectName !== undefined) {
                    nameToSearch = objectName;
                }
                MetadataServices.metadataDetails.getDetails(null, nameToSearch, "RT", "ACTIVE", mainType /*TABLE or "VIEW"*/, "", function(result1) {
                    if (validateCursorPosition(that,beforeCursor) === false) {
                        return;
                    }
                    if (result1 != null && result1.metadata !== undefined && result1.metadata.length > 0) {
                        var names = [];
                        if (result1.metadata[0].data !== undefined) { // get columns for simple table/view
                            var cols = result1.metadata[0].data;
                            for (var i = 0; i < cols.length; i++) {
                                names.push(cols[i].name);
                            }
                        }else if (result1.metadata[0].Artifact !== undefined && result1.metadata[0].Artifact.Components != null) { // get from cds artifact structure
                            for (var i = 0; i < result1.metadata[0].Artifact.Components.length; i++) {
                                var n = result1.metadata[0].Artifact.Components[i].Name;
                                names.push(n);
                            }
                        }
                        if (that.aceEditor != null && currentCount === HanaRepositoryAccess.columnNamesRequestCount) { // editor set, re-run code completion and re-use the backend result which we just retrieved
                            if (HanaRepositoryAccess.lastColumnNames == null) {
                                HanaRepositoryAccess.lastColumnNames = {};
                            }
                            HanaRepositoryAccess.lastColumnNames[dataSourceName] = {names: names, time: new Date().getTime()};
                            retriggerCoCo(that);
                        }
                    }else{ //error scenario
                        onError();
                    }
                },function() { // on error of MetadataServices.metadataDetails.getDetails
                    //error handling
                    onError();
                });
            },function() { // on error of getDataSourceType
                onError();
            });
            return commonddlNonUi.AbstractDdlParser.INCOMPLETE_SIGNAL;
        };
        HanaRepositoryAccess.prototype.getElementProposals = function(monitor,cu,pathNames,scope) {
            return null;
        };
        HanaRepositoryAccess.prototype.getDataSourceTypes = function(monitor,dataSourceNames) {
            return null;
        };
        HanaRepositoryAccess.prototype.resetCache = function() {
        };
        HanaRepositoryAccess.prototype.findAndParseEntity = function(monitor,namePath) {
            return null;
        };
        HanaRepositoryAccess.prototype.getColumnsAndAssociations = function(progressMonitor,compilationUnit,fullyQualifiedPathName,resultColumnNames,resultAssociationNames,resultAssociationTargetEntityNames) {
        };
        HanaRepositoryAccess.prototype.getSelectListEntryType = function(progressMonitor,compilationUnit,fullyQualifiedPathNames) {
            return null;
        };
        return HanaRepositoryAccess;
    }
);
