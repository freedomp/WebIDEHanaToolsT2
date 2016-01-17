/** Copyright © 2015 SAP SE or an affiliate company. All rights reserved.**/

define(["sap/hana/cst/common/remote/Request"],

    function(Request) {

        "use strict";

        var BASE_API_URL = "/sap/hana/cst/api";

        var SqlCodeCompletionDAO = {

            getTableViewSuggest: function(sServiceName, schemaName, objectName, context, caller, tunnel) {

                var sURL = BASE_API_URL + "/" + sServiceName + "/catalog/suggest/tablesviews";
                var inputObject = {};
                inputObject.schemaName = schemaName;
                inputObject.objectName = objectName;
                inputObject.context = context;
                var sSapBackPack = JSON.stringify(inputObject);
                return Request.send(sURL, "GET", {
                    headers: {
                        "SapBackPack": sSapBackPack
                    }
                }).then(function(result) {
                    if (caller) {
                        caller(result, tunnel);
                    }
                    return result;

                });
            },

            getTableTypeSuggest: function(sServiceName, schemaName, objectName, context, caller, tunnel) {
                var sURL = BASE_API_URL + "/" + sServiceName + "/catalog/suggest/tabletypes";
                var inputObject = {};
                inputObject.schemaName = schemaName;
                inputObject.objectName = objectName;
                inputObject.context = context;
                var sSapBackPack = JSON.stringify(inputObject);
                return Request.send(sURL, "GET", {
                    headers: {
                        "SapBackPack": sSapBackPack
                    }
                }).then(function(result) {
                    if (caller) {
                        caller(result, tunnel);
                    }
                    return result;

                });
            },

            getTableTypeAndTableSuggest: function(sServiceName, schemaName, objectName, context, caller, tunnel) {
                var sURL = BASE_API_URL + "/" + sServiceName + "/catalog/suggest/tables";
                var inputObject = {
                    schemaName: schemaName,
                    objectName: objectName,
                    context: context
                };
                var sSapBackPack = JSON.stringify(inputObject);
                return Request.send(sURL, "GET", {
                    headers: {
                        "SapBackPack": sSapBackPack
                    }
                }).then(function(result) {
                    if (caller) {
                        caller(result, tunnel);
                    }
                    return result;

                });
            },

            // getTableSuggest: function( schemaName, objectName, context, caller, tunnel) {
            //     var sURL = BASE_API_URL + "/" + sServiceName + "/catalog/suggest/tables";
            //     return this.net.callBackendFunction(sURL, {
            //         schemaName: schemaName,
            //         objectName: objectName,
            //         context: context
            //     }, function(result) {
            //         if (caller) caller(result, tunnel);
            //     });
            // },

            // getSchemaSuggest: function(sServiceName, schemaName, context, caller, tunnel) {
            //     var sURL = BASE_API_URL + "/" + sServiceName + "/catalog/suggest/schemas";

            //     // return this.net.callBackendFunction(sURL, {
            //     //     schemaName: schemaName,
            //     //     context: context
            //     // }, function(result) {
            //     //     if (caller) caller(result, tunnel);
            //     // });
            //     return Request.send(sURL, "GET", null, {
            //         schemaName: schemaName,
            //         context: context
            //     }).then(function(result) {
            //         if (caller) {
            //             caller(result, tunnel);
            //         }
            //         return result; 
            //     });
            // },

            getProcedureSuggest: function(sServiceName, schemaName, objectName, context, caller, tunnel) {
                var sURL = BASE_API_URL + "/" + sServiceName + "/catalog/suggest/procedures";
                var inputObject = {
                    schemaName: schemaName,
                    objectName: objectName,
                    context: context
                };
                var sSapBackPack = JSON.stringify(inputObject);
                return Request.send(sURL, "GET", {
                    headers: {
                        "SapBackPack": sSapBackPack
                    }
                }).then(function(result) {
                    if (caller) {
                        caller(result, tunnel);
                    }
                    return result;
                });
            },

            getFunctionSuggest: function(sServiceName, schemaName, objectName, context, caller, tunnel) {
                var sURL = BASE_API_URL + "/" + sServiceName + "/catalog/suggest/functions";
                var inputObject = {
                    schemaName: schemaName,
                    objectName: objectName,
                    context: context
                };
                var sSapBackPack = JSON.stringify(inputObject);
                return Request.send(sURL, "GET", {
                    headers: {
                        "SapBackPack": sSapBackPack
                    }
                }).then(function(result) {
                    if (caller) {
                        caller(result, tunnel);
                    }
                    return result;

                });
            },

            getSequenceSuggest: function(sServiceName, schemaName, objectName, context, caller, tunnel) {
                var sURL = BASE_API_URL + "/" + sServiceName + "/catalog/suggest/sequences";
                var inputObject = {
                    schemaName: schemaName,
                    objectName: objectName,
                    context: context
                };
                var sSapBackPack = JSON.stringify(inputObject);
                return Request.send(sURL, "GET", {
                    headers: {
                        "SapBackPack": sSapBackPack
                    }
                }).then(function(result) {
                    if (caller) {
                        caller(result, tunnel);
                    }
                    return result;

                });
            },

            getSynonymSuggest: function(sServiceName, schemaName, objectName, context, caller, tunnel) {
                var sURL = BASE_API_URL + "/" + sServiceName + "/catalog/suggest/synonyms";
                var inputObject = {
                    schemaName: schemaName,
                    objectName: objectName,
                    context: context
                };
                var sSapBackPack = JSON.stringify(inputObject);
                return Request.send(sURL, "GET", {
                    headers: {
                        "SapBackPack": sSapBackPack
                    }
                }).then(function(result) {
                    if (caller) {
                        caller(result, tunnel);
                    }
                    return result;

                });
            },

            getTriggerSuggest: function(sServiceName, schemaName, objectName, context, caller, tunnel) {
                var sURL = BASE_API_URL + "/" + sServiceName + "/catalog/suggest/triggers";
                var inputObject = {
                    schemaName: schemaName,
                    objectName: objectName,
                    context: context
                };
                var sSapBackPack = JSON.stringify(inputObject);
                return Request.send(sURL, "GET", {
                    headers: {
                        "SapBackPack": sSapBackPack
                    }
                }).then(function(result) {
                    if (caller) {
                        caller(result, tunnel);
                    }
                    return result;
                });
            },

            getSqlObjectSuggest: function(sServiceName, schemaName, objectName, context, caller, tunnel) {
                var sURL = BASE_API_URL + "/" + sServiceName + "/catalog/suggest/tables";
                var inputObject = {
                    schemaName: schemaName,
                    objectName: objectName,
                    context: context
                };
                var sSapBackPack = JSON.stringify(inputObject);
                return Request.send(sURL, "GET", {
                    headers: {
                        "SapBackPack": sSapBackPack
                    }
                }).then(function(result) {
                    if (caller) {
                        caller(result, tunnel);
                    }
                    return result;
                });
            },

            getSelectableObjects: function(sServiceName, objects, context, caller, tunnel) {
                var sURL = BASE_API_URL + "/" + sServiceName + "/catalog/suggest/selectableobjects";
                var inputObject = {
                    objects: objects,
                    context: context
                };
                var sSapBackPack = JSON.stringify(inputObject);
                return Request.send(sURL, "GET", {
                    headers: {
                        "SapBackPack": sSapBackPack
                    }
                }).then(function(result) {
                    if (caller) {
                        caller(result, tunnel);
                    }
                    return result;
                });
            },

            getColumnsOfTable: function(sServiceName, schemaName, tableName, columnName, type, context, caller, tunnel) {
                var sURL = BASE_API_URL + "/" + sServiceName + "/catalog/suggest/tablecolumns";
                var inputObject = {
                    schemaName: schemaName,
                    tableName: tableName,
                    columnName: columnName,
                    type: type,
                    context: context
                };
                var sSapBackPack = JSON.stringify(inputObject);
                return Request.send(sURL, "GET", {
                    headers: {
                        "SapBackPack": sSapBackPack
                    }
                }).then(function(result) {
                    if (caller) {
                        caller(result, tunnel);
                    }
                    return result;
                });
            },

            getColumnsSuggest: function(sServiceName, aSelectableObjects, columnName, context, caller, tunnel) {
                var sURL = BASE_API_URL + "/" + sServiceName + "/catalog/suggest/columns";
                var inputObject = {
                    columnName: columnName,
                    selectableObjects: aSelectableObjects,
                    context: context
                };
                var sSapBackPack = JSON.stringify(inputObject);
                return Request.send(sURL, "GET", {
                    headers: {
                        "SapBackPack": sSapBackPack
                    }
                }).then(function(result) {
                    if (caller) {
                        caller(result, tunnel);
                    }
                    return result;
                });
            },

            searchSecurityObject: function(inputObject, caller, tunnel) {
                var sServiceName;
                var sURL = BASE_API_URL + "/" + sServiceName + "/catalog/suggest/securityobjects";

                return this.net.callBackendFunction(sURL, inputObject, function(result) {
                    if (caller) {
                        caller(result, tunnel);
                    }
                });
            },

            searchUsers: function(inputObject, caller, tunnel) {
                var sServiceName;
                var sURL = BASE_API_URL + "/" + sServiceName + "/catalog/suggest/users";

                return this.net.callBackendFunction(sURL, inputObject, function(result) {
                    if (caller) {
                        caller(result, tunnel);
                    }
                });
            },

            searchRoles: function(inputObject, caller, tunnel) {
                var sServiceName;
                var sURL = BASE_API_URL + "/" + sServiceName + "/catalog/suggest/roles";

                return this.net.callBackendFunction(sURL, inputObject, function(result) {
                    if (caller) {
                        caller(result, tunnel);
                    }
                });
            },

            getObjectPrivileges: function(inputObject, caller, tunnel) {
                var sServiceName;
                var sURL = BASE_API_URL + "/" + sServiceName + "/catalog/suggest/objectprivileges";

                return this.net.callBackendFunction(sURL, inputObject, function(result) {
                    if (caller) {
                        caller(result, tunnel);
                    }
                });
            },

            getSystemPrivileges: function(inputObject, caller, tunnel) {
                var sServiceName;
                var sURL = BASE_API_URL + "/" + sServiceName + "/catalog/suggest/systemprivileges";

                return this.net.callBackendFunction(sURL, inputObject, function(result) {
                    if (caller) {
                        caller(result, tunnel);
                    }
                });
            },

            getSAMLProviders: function(inputObject, caller, tunnel) {
                var sServiceName;
                var sURL = BASE_API_URL + "/" + sServiceName + "/catalog/suggest/samlproviders";

                return this.net.callBackendFunction(sURL, inputObject, function(result) {
                    if (caller) {
                        caller(result, tunnel);
                    }
                });
            },

            getApplicationPrivileges: function(inputObject, caller, tunnel) {
                var sServiceName;
                var sURL = BASE_API_URL + "/" + sServiceName + "/catalog/suggest/applicationprivileges";

                return this.net.callBackendFunction(sURL, inputObject, function(result) {
                    if (caller) {
                        caller(result, tunnel);
                    }
                });
            },

            getAnalyticalPrivileges: function(inputObject, caller, tunnel) {
                var sServiceName;
                var sURL = BASE_API_URL + "/" + sServiceName + "/catalog/suggest/analyticalprivileges";

                return this.net.callBackendFunction(sURL, inputObject, function(result) {
                    if (caller) {
                        caller(result, tunnel);
                    }
                });
            }
        };
        return SqlCodeCompletionDAO;
    });