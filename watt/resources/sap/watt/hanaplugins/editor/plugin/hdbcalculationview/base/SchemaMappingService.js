/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define(function() {
    "use strict";
    var schemaMappingList;
    var packageDefaultSchemaList;
    var getParentPackage = function(packageName) {
        var parentPackage;
        var lastIndex = packageName.lastIndexOf(".");
        if (lastIndex !== -1) {
            parentPackage = packageName.substring(0, lastIndex);
        } else {
            parentPackage = "";
        }
        return parentPackage;
    };
    var schemaMapping = {
        getSchemaMapping: function(context, callback) {
            if (context) {
                if (!schemaMappingList) {
                    var aStatements = [];
                    var stmt = 'SELECT * FROM _SYS_BI.M_SCHEMA_MAPPING'; //WHERE AUTHORING_SCHEMA=(?)
                    var pstmt = encodeURI(stmt);
                    aStatements.push({
                        statement: pstmt,
                        type: "SELECT"
                    });
                    var setting = {
                        maxResultSize: 20,
                        includePosColumn: "false"
                    };

                    /*context.service.catalogDAO.sqlMultiExecute(aStatements, setting, function(result) {
                        if (result && result.responses) {
                            schemaMappingList = result.responses[0].result.entries;
                            callback(schemaMappingList);
                        } else {
                            callback(undefined);
                        }
                    }).done();*/
                } else {
                    callback(schemaMappingList);
                }

            } else {
                callback(undefined);
            }
        },

        getPhysicalSchema: function(authoringSchema, context, callback) {
            if (context) {
                this.getSchemaMapping(context, function(results) {
                    if (results) {
                        var found = false;
                        var phySchema;
                        for (var i = 0; i < results.length; i++) {
                            var obj = results[i];
                            if (obj[0] === authoringSchema) {
                                found = true;
                                phySchema = obj[1];
                                break;
                            }
                        }
                        if (found) {
                            callback(phySchema);
                        } else {
                            callback(authoringSchema);
                        }
                    } else {
                        callback(authoringSchema);
                    }
                });

            } else {
                callback(authoringSchema);
            }
        },

        getPackageDefaultSchemaList: function(context, callback) {
            if (context) {
                if (!packageDefaultSchemaList) {
                    var aStatements = [];
                    var stmt = 'SELECT * FROM _SYS_BI.M_PACKAGE_DEFAULT_SCHEMA';
                    var pstmt = encodeURI(stmt);
                    aStatements.push({
                        statement: pstmt,
                        type: "SELECT"
                    });
                    var setting = {
                        maxResultSize: 50,
                        includePosColumn: "false"
                    };

                    /*context.service.catalogDAO.sqlMultiExecute(aStatements, setting, function(result) {
                        if (result && result.responses[0].result.entries) {
                            packageDefaultSchemaList = result.responses[0].result.entries;
                            callback(packageDefaultSchemaList);
                        } else {
                            callback(undefined);
                        }
                    }).done();*/
                } else {
                    callback(packageDefaultSchemaList);
                }

            } else {
                callback(undefined);
            }
        },

        getPackageDefaultSchema: function(packageName, context, callback) {
            if (context) {
                var that = this;
                this.getPackageDefaultSchemaList(context, function(result) {
                    if (result) {
                        var rs = result;
                        var defaultSchema = [];
                        var found = false;
                        for (var i = 0; i < rs.length; i++) {
                            var obj = rs[i];
                            // Exact match
                            // Check for entries that matches to the package name exactly
                            if (obj[0] === packageName) {
                                found = true;
                                defaultSchema.push(obj[1]);
                            }
                        }
                        if (found && defaultSchema.length > 0) {
                            callback(defaultSchema);
                        } else {
                            if (packageName !== "") {
                                var parentPackage = getParentPackage(packageName);
                                if (parentPackage || parentPackage === "") {
                                    that.getPackageDefaultSchema(parentPackage, context, callback);
                                } else {
                                    callback(undefined);
                                }
                            } else {
                                callback(undefined);
                            }
                        }
                    } else {
                        callback(undefined);
                    }
                });
            } else {
                callback(undefined);
            }
        },

        getAuthoringSchema: function(physicalSchema, context, callback) {
            if (context) {
                this.getSchemaMapping(context, function(results) {
                    if (results) {
                        var found = false;
                        var authSchema;
                        for (var i = 0; i < results.length; i++) {
                            var obj = results[i];
                            if (obj[1] === physicalSchema) {
                                found = true;
                                authSchema = obj[0];
                                break;
                            }
                        }
                        if (found) {
                            callback(authSchema);
                        } else {
                            callback(physicalSchema);
                        }
                    } else {
                        callback(physicalSchema);
                    }
                });

            } else {
                callback(physicalSchema);
            }
        },

        getAuthoringSchemas: function(physicalSchemas, context, callback) {
            var phySchemas = [];
            for (var i = 0; i < physicalSchemas.length; i++) {
                phySchemas.push({
                    authoringSchema: physicalSchemas[i],
                    physicalSchema: physicalSchemas[i]
                })
            };
            if (context) {
                var authSchemas = [];
                this.getSchemaMapping(context, function(results) {
                    if (results) {
                        var schemaObject;
                        for (var j = 0; j < physicalSchemas.length; j++) {
                            var found = false;
                            for (var i = 0; i < results.length; i++) {
                                var obj = results[i];
                                if (obj[1] === physicalSchemas[j]) {
                                    found = true;
                                    schemaObject = {
                                        authoringSchema: obj[0],
                                        physicalSchema: obj[1]
                                    };
                                    break;
                                }
                            }
                            if (found) {
                                authSchemas.push(schemaObject);
                            } else {
                                authSchemas.push({
                                    authoringSchema: physicalSchemas[j],
                                    physicalSchema: physicalSchemas[j]
                                });
                            }
                        }
                        if (authSchemas.length > 0) {
                            callback(authSchemas);
                        } else {
                            callback(phySchemas);
                        }
                    } else {
                        callback(phySchemas);
                    }
                });

            } else {
                callback(phySchemas);
            }
        },

        getAuthoringSchemaByPackage: function(physicalSchema, packageName, context, callback) {
            var that = this;
            if (context) {
                var authSchema = [];
                // Get authoring schema from schemaMapping table
                this.getAuthoringSchema(physicalSchema, context, function(authoringSchema) {
                    authSchema.push(authoringSchema);
                    if (!packageName) {
                        callback(authSchema);
                    }
                });
                // Get package default schema from package specific schema table
                if (packageName) {
                    this.getPackageDefaultSchema(packageName, context, function(results) {
                        if (!results) {
                            callback(authSchema);
                        } else {
                            var defaultSchema = [];
                            for (var i = 0; i < results.length; i++) {
                                that.getPhysicalSchema(results[i], context, function(phySchema) {
                                    if (phySchema && phySchema === physicalSchema) {
                                        defaultSchema.push(results[i]);
                                    }
                                });
                            }
                            var matchingList = [];
                            if (defaultSchema && defaultSchema.length > 0) {
                                if (defaultSchema.length === 1) {
                                    callback(defaultSchema);
                                } else {
                                    for (var i = 0; i < defaultSchema.length; i++) {
                                        if (defaultSchema[i] === authSchema[0]) {
                                            matchingList.push(defaultSchema[i]);
                                        }
                                    }

                                    if (matchingList && matchingList.length > 0) {
                                        callback(matchingList);
                                    } else {
                                        callback(authSchema);
                                    }
                                }
                            } else {
                                callback(authSchema);
                            }
                        }
                    });
                }
            } else {
                callback(undefined);
            }
        },

        deriveAuthoringSchemaFor: function(physicalSchema, packageName, context, callback) {
            if (context) {
                this.getAuthoringSchemaByPackage(physicalSchema, packageName, context, function(authSchemaList) {
                    if (authSchemaList) {
                        if (authSchemaList.length === 0) {
                            callback(physicalSchema);
                        } else if (authSchemaList.length === 1) {
                            callback(authSchemaList[0]);
                        } else if (authSchemaList.length > 1) {
                            callback(packageName);
                        }
                    } else {
                        callback(physicalSchema);
                    }
                });

            } else {
                callback(physicalSchema);
            }
        }
    };

    return {
        schemaMapping: schemaMapping
    };
});
