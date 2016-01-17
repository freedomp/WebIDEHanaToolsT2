/** Copyright © 2015 SAP SE or an affiliate company. All rights reserved.**/

define([], function() {

    "use strict";

    var MAX_ENTRIES = 1000;

    // var MATCH_ALL = false;
    var bUserPreventBind = false;
    var bNeedToBind = true;
    var DbContent = function(context) {
        this.context = context;
        this._oContext = null;
        this._oSqlcodecompletionDAO = this.context.service.sqlcodecompletionDAO;
    };

    DbContent.prototype = jQuery.extend(DbContent.prototype, {

        _checkIfSqlCodeCompletionDAOService: function() {
            if (!this._oSqlcodecompletionDAO || bUserPreventBind) {
                console.log("The sqlcodecompletionDAO service not available for the sql auto complete");
                return false;
            }
            return true;
        },

        _handleError: function(error) {
            var that = this;
            if (that._isJSON(error.responseText)) {
                error = JSON.parse(error.responseText);
                if (error.errorCode === 406 && bNeedToBind && !bUserPreventBind) {
                    bNeedToBind = false;
                    that.currentServiceName = error.serviceName;
                    var msg = this.context.i18n.getText("msg_binding", [error.serviceName]);
                    var title = this.context.i18n.getText("tit_hrrt");
                    var lbOk = this.context.i18n.getText("lb_ok");
                    that.fnCallbackConfirm = function() {
                        that.oDialog.setBusy(true);
                        that.context.service.xs2CtrlDAO.bindToHDIServiceByName(that.currentServiceName).then(function(result) {
                            if (result.errorCode) {
                                console.error(result.message);
                            }
                            that.oDialog.close();
                        }, function(err) {
                            bNeedToBind = true;
                            that.oDialog.close();
                        });
                    };
                    this.oDialog = new sap.ui.commons.Dialog({
                        title: title,
                        resizable: false,
                        keepInWindow: true,
                        modal: true,
                        width: '500px',
                        height: '250px'
                    });
                    var oMatrix = new sap.ui.commons.layout.MatrixLayout({
                        width: '100%',
                        layoutFixed: false
                    });

                    var oLabel = new sap.ui.commons.TextView({
                        text: msg
                    });
                    oLabel.setWrapping(true);

                    oMatrix.createRow(new sap.ui.commons.Label({
                        text: ""
                    }));
                    oMatrix.createRow(oLabel);

                    that.oButtonOK = new sap.ui.commons.Button({
                        tooltip: lbOk,
                        text: lbOk,
                        press: that.fnCallbackConfirm.bind(this)
                    });

                    that.oDialog.addContent(oMatrix);
                    that.oDialog.addButton(this.oButtonOK);

                    this.oDialog.open();

                    var result = {};
                    result.errorCode = 406;
                    result.message = error.message;
                    return result;
                }

            }
        },

        _isJSON: function(oItem) {
            oItem = typeof oItem !== "string" ? JSON.stringify(oItem) : oItem;

            try {
                oItem = JSON.parse(oItem);
            } catch (e) {
                return false;
            }

            if (typeof oItem === "object" && oItem !== null) {
                return true;
            }

            return false;
        },

        //===============================
        // Get schemas
        //===============================
        // computeSchemaProposals: function(oContext, oSettings) {
        //     this._oContext = oContext;
        //     if (this._oContext.schemaName === "%") {
        //         oSettings = oSettings || {};

        //         if (!this._checkIfSqlCodeCompletionDAOService()) {
        //             return false;
        //         }

        //         this._oContext = oContext;
        //         var sPrefix = this._checkPlaceHolder(this._oContext.prefix);
        //         sPrefix = sPrefix.toUpperCase();
        //         sPrefix = this._decoratePrefix(sPrefix, oSettings);
        //         var sServiceName = this._oContext.currentService;
        //         return this._oSqlcodecompletionDAO.getSchemaSuggest(sServiceName, sPrefix, this._selectContext()).then(function(result) {
        //             if (!result.errorCode) {
        //                 return result.schemas;
        //             }
        //         });
        //     }
        // },

        // computeTableSuggest: function(oContext, oSettings) {
        //     if (!this._checkIfSqlCodeCompletionDAOService()) {
        //         return false;
        //     }

        //     this._oContext = oContext;
        //     var sPrefix = this._checkPlaceHolder(this._oContext.prefix);
        //     sPrefix = sPrefix.toUpperCase();
        //     sPrefix = this._decoratePrefix(sPrefix, oSettings);
        //     var sSchemaName = this._oContext.schemaName.toUpperCase();
        //     return this._oSqlcodecompletionDAO.getTableSuggest(sSchemaName, "%" + sPrefix + "%", this._selectContext()).then(function(result) {
        //         if (!result.errorCode) {
        //             return result.suggestList;
        //         }
        //     });
        // },

        //===============================
        // Get table and view
        //===============================
        computeTableViewSuggest: function(oContext, oSettings) {
            var that = this;
            if (!this._checkIfSqlCodeCompletionDAOService()) {
                return false;
            }
            oSettings = oSettings || {};

            this._oContext = oContext;
            var sPrefix = this._checkPlaceHolder(this._oContext.prefix);
            sPrefix = sPrefix.toUpperCase();
            sPrefix = this._decoratePrefix(sPrefix, oSettings);

            var sSchemaName = this._oContext.currentSchema ? this._oContext.currentSchema.toUpperCase() : this._oContext.currentSchema;
            var sServiceName = this._oContext.currentService;
            if (!sServiceName) {
                return [];
            }
            return this._oSqlcodecompletionDAO.getTableViewSuggest(sServiceName, sSchemaName, sPrefix, this._selectContext()).then(function(result) {
                if (!result.errorCode) {
                    return result.suggestList;
                }
            }, function(error) {
                return that._handleError(error);
            });
        },

        //===============================
        // Get table type
        //===============================
        computeTableTypeSuggest: function(oContext, oSettings) {
            var that = this;
            if (!this._checkIfSqlCodeCompletionDAOService()) {
                return false;
            }
            oSettings = oSettings || {};

            this._oContext = oContext;
            var sPrefix = this._checkPlaceHolder(this._oContext.prefix);
            sPrefix = sPrefix.toUpperCase();
            sPrefix = this._decoratePrefix(sPrefix, oSettings);

            var sSchemaName = this._oContext.currentSchema ? this._oContext.currentSchema.toUpperCase() : this._oContext.currentSchema;
            var sServiceName = this._oContext.currentService;
            if (!sServiceName) {
                return [];
            }
            return this._oSqlcodecompletionDAO.getTableTypeSuggest(sServiceName, sSchemaName, sPrefix, this._selectContext()).then(function(result) {
                if (!result.errorCode) {
                    return result.suggestList;
                }
            }, function(error) {
                return that._handleError(error);
            });
        },

        //===============================
        // Get table type and table
        //===============================
        computeTableTypeAndTableSuggest: function(oContext, oSettings) {
            var that = this;
            if (!this._checkIfSqlCodeCompletionDAOService()) {
                return false;
            }
            oSettings = oSettings || {};

            this._oContext = oContext;
            var sPrefix = this._checkPlaceHolder(this._oContext.prefix);
            sPrefix = sPrefix.toUpperCase();
            sPrefix = this._decoratePrefix(sPrefix, oSettings);

            var sSchemaName = this._oContext.currentSchema ? this._oContext.currentSchema.toUpperCase() : this._oContext.currentSchema;
            var sServiceName = this._oContext.currentService;
            if (!sServiceName) {
                return [];
            }
            return this._oSqlcodecompletionDAO.getTableTypeAndTableSuggest(sServiceName, sSchemaName, sPrefix, this._selectContext()).then(function(result) {
                if (!result.errorCode) {
                    return result.suggestList;
                }
            }, function(error) {
                return that._handleError(error);
            });
        },

        //===============================
        // Get columns in a table, view, synonym
        //===============================
        computeColumnsOfTableSuggest: function(oContext, oSettings) {
            var that = this;
            if (!this._checkIfSqlCodeCompletionDAOService()) {
                return false;
            }
            oSettings = oSettings || {};

            this._oContext = oContext;
            var sPrefix = this._checkPlaceHolder(this._oContext.prefix);
            sPrefix = sPrefix.toUpperCase();
            sPrefix = this._decoratePrefix(sPrefix, oSettings);
            var sObjectName = this._oContext.objectName.toUpperCase();
            var sObjectType = this._oContext.objectType.toUpperCase();
            var sSchemaName = this._oContext.currentSchema ? this._oContext.currentSchema.toUpperCase() : this._oContext.currentSchema;
            var sServiceName = this._oContext.currentService;
            if (!sServiceName) {
                return [];
            }
            return this._oSqlcodecompletionDAO.getColumnsOfTable(sServiceName, sSchemaName, sObjectName, sPrefix, sObjectType, this._selectContext()).then(function(result) {
                if (!result.errorCode) {
                    return result.columns;
                }
            }, function(error) {
                return that._handleError(error);
            });
        },

        //===============================
        // Get all columns
        //===============================
        computeColumnsSuggest: function(oContext, oSettings) {
            var that = this;
            if (!this._checkIfSqlCodeCompletionDAOService()) {
                return false;
            }
            oSettings = oSettings || {};

            this._oContext = oContext;
            var sPrefix = this._checkPlaceHolder(this._oContext.prefix);
            sPrefix = sPrefix.toUpperCase();
            sPrefix = this._decoratePrefix(sPrefix, oSettings);

            var aSelectableObjects = this._oContext.selectableObjects;
            if (!aSelectableObjects || aSelectableObjects.length === 0) {
                return false;
            }
            var sServiceName = this._oContext.currentService;
            if (!sServiceName) {
                return [];
            }
            return this._oSqlcodecompletionDAO.getColumnsSuggest(sServiceName, aSelectableObjects, sPrefix, this._selectContext()).then(function(result) {
                if (!result.errorCode) {
                    return result.columns;
                }
            }, function(error) {
                return that._handleError(error);
            });
        },

        //===============================
        // Get procedure
        //===============================
        computeProcedureSuggest: function(oContext, oSettings) {
            var that = this;
            if (!this._checkIfSqlCodeCompletionDAOService()) {
                return false;
            }
            oSettings = oSettings || {};

            this._oContext = oContext;
            var sPrefix = this._checkPlaceHolder(this._oContext.prefix);
            sPrefix = sPrefix.toUpperCase();
            sPrefix = this._decoratePrefix(sPrefix, oSettings);

            var sSchemaName = this._oContext.currentSchema ? this._oContext.currentSchema.toUpperCase() : this._oContext.currentSchema;
            var sServiceName = this._oContext.currentService;
            if (!sServiceName) {
                return [];
            }
            return this._oSqlcodecompletionDAO.getProcedureSuggest(sServiceName, sSchemaName, sPrefix, this._selectContext()).then(function(result) {
                if (!result.errorCode) {
                    return result.stuff;
                }
            }, function(error) {
                return that._handleError(error);
            });
        },

        //===============================
        // Get function
        //===============================
        computeFunctionSuggest: function(oContext, oSettings) {
            var that = this;
            if (!this._checkIfSqlCodeCompletionDAOService()) {
                return false;
            }
            oSettings = oSettings || {};

            this._oContext = oContext;
            var sPrefix = this._checkPlaceHolder(this._oContext.prefix);
            sPrefix = sPrefix.toUpperCase();
            sPrefix = this._decoratePrefix(sPrefix, oSettings);

            var sSchemaName = this._oContext.currentSchema ? this._oContext.currentSchema.toUpperCase() : this._oContext.currentSchema;
            var sServiceName = this._oContext.currentService;
            if (!sServiceName) {
                return [];
            }
            return this._oSqlcodecompletionDAO.getFunctionSuggest(sServiceName, sSchemaName, sPrefix, this._selectContext()).then(function(result) {
                if (!result.errorCode) {
                    return result.stuff;
                }
            }, function(error) {
                return that._handleError(error);
            });
        },

        //===============================
        // Get sequence
        //===============================
        computeSequenceSuggest: function(oContext, oSettings) {
            var that = this;
            if (!this._checkIfSqlCodeCompletionDAOService()) {
                return false;
            }
            oSettings = oSettings || {};

            this._oContext = oContext;
            var sPrefix = this._checkPlaceHolder(this._oContext.prefix);
            sPrefix = sPrefix.toUpperCase();
            sPrefix = this._decoratePrefix(sPrefix, oSettings);

            var sSchemaName = this._oContext.currentSchema ? this._oContext.currentSchema.toUpperCase() : this._oContext.currentSchema;
            var sServiceName = this._oContext.currentService;
            if (!sServiceName) {
                return [];
            }
            return this._oSqlcodecompletionDAO.getSequenceSuggest(sServiceName, sSchemaName, sPrefix, this._selectContext()).then(function(result) {
                if (!result.errorCode) {
                    return result.stuff;
                }
            }, function(error) {
                return that._handleError(error);
            });
        },

        //===============================
        // Get trigger
        //===============================
        computeTriggerSuggest: function(oContext, oSettings) {
            var that = this;
            if (!this._checkIfSqlCodeCompletionDAOService()) {
                return false;
            }
            oSettings = oSettings || {};

            this._oContext = oContext;
            var sPrefix = this._checkPlaceHolder(this._oContext.prefix);
            sPrefix = sPrefix.toUpperCase();
            sPrefix = this._decoratePrefix(sPrefix, oSettings);

            var sSchemaName = this._oContext.currentSchema ? this._oContext.currentSchema.toUpperCase() : this._oContext.currentSchema;
            var sServiceName = this._oContext.currentService;
            if (!sServiceName) {
                return [];
            }
            return this._oSqlcodecompletionDAO.getTriggerSuggest(sServiceName, sSchemaName, sPrefix, this._selectContext()).then(function(result) {
                if (!result.errorCode) {
                    return result.stuff;
                }
            }, function(error) {
                return that._handleError(error);
            });
        },

        //===============================
        // Get all synonyms
        //===============================
        computeSynonymSuggest: function(oContext, oSettings) {
            var that = this;
            if (!this._checkIfSqlCodeCompletionDAOService()) {
                return false;
            }
            oSettings = oSettings || {};

            this._oContext = oContext;
            var sPrefix = this._checkPlaceHolder(this._oContext.prefix);
            sPrefix = sPrefix.toUpperCase();
            sPrefix = this._decoratePrefix(sPrefix, oSettings);

            var sSchemaName = this._oContext.currentSchema ? this._oContext.currentSchema.toUpperCase() : this._oContext.currentSchema;
            var sServiceName = this._oContext.currentService;
            if (!sServiceName) {
                return [];
            }
            return this._oSqlcodecompletionDAO.getSynonymSuggest(sServiceName, sSchemaName, sPrefix, this._selectContext()).then(function(result) {
                if (!result.errorCode) {
                    return result.stuff;
                }
            }, function(error) {
                return that._handleError(error);
            });
        },

        //===============================
        // Get all table, view, sequence, procedure, function, trigger, synonyms, source
        //===============================
        computeSqlObjectSuggest: function(oContext, oSettings) {
            var that = this;
            if (!this._checkIfSqlCodeCompletionDAOService()) {
                return false;
            }
            oSettings = oSettings || {};

            this._oContext = oContext;
            var sPrefix = this._checkPlaceHolder(this._oContext.prefix);
            sPrefix = sPrefix.toUpperCase();
            sPrefix = this._decoratePrefix(sPrefix, oSettings);

            var sSchemaName = this._oContext.currentSchema ? this._oContext.currentSchema.toUpperCase() : this._oContext.currentSchema;
            var sServiceName = this._oContext.currentService;
            if (!sServiceName) {
                return [];
            }
            return this._oSqlcodecompletionDAO.getSqlObjectSuggest(sServiceName, sSchemaName, sPrefix, this._selectContext()).then(function(result) {
                if (!result.errorCode) {
                    return result.objects;
                }
            }, function(error) {
                return that._handleError(error);
            });
        },

        // computeOrtherStuffSuggestInSchema: function(oContext) {
        //     if (!this._checkIfSqlCodeCompletionDAOService()) {
        //         return false;
        //     }
        //     this._oContext = oContext;
        //     var sPrefix = this._checkPlaceHolder(this._oContext.prefix);
        //     sPrefix = sPrefix.toUpperCase();
        //     var sCurSchema = this._oSqlcodecompletionDAO.getEntity().getCurrentSchema();
        //     return this._oSqlcodecompletionDAO.getOrtherStuffSuggestInSchema(sCurSchema, "%" + sPrefix + "%", this._selectContext()).then(function(result) {
        //         if (!result.errorCode) {
        //             return result.stuff;
        //         }
        //     });
        // },

        //===============================
        // Get both user and role
        //===============================
        computeSecurityObjectSuggest: function(oContext, oSettings) {
            var that = this;
            if (!this._checkIfSqlCodeCompletionDAOService()) {
                return false;
            }
            oSettings = oSettings || {};

            this._oContext = oContext;
            var sPrefix = this._checkPlaceHolder(this._oContext.prefix);
            sPrefix = sPrefix.toUpperCase();
            sPrefix = this._decoratePrefix(sPrefix, oSettings);

            var inputObject = {};
            inputObject.objectName = sPrefix;
            inputObject.maxEntries = MAX_ENTRIES;
            inputObject.context = this._selectContext();
            var sServiceName = this._oContext.currentService;
            if (!sServiceName) {
                return [];
            }
            return this._oSqlcodecompletionDAO.searchSecurityObject(sServiceName, inputObject).then(function(result) {
                if (!result.errorCode) {
                    return result.objects;
                }
            }, function(error) {
                return that._handleError(error);
            });
        },

        //===============================
        // Get all users
        //===============================
        computeUserSuggest: function(oContext, oSettings) {
            var that = this;
            if (!this._checkIfSqlCodeCompletionDAOService()) {
                return false;
            }
            oSettings = oSettings || {};

            this._oContext = oContext;
            var sPrefix = this._checkPlaceHolder(this._oContext.prefix);
            sPrefix = sPrefix.toUpperCase();
            sPrefix = this._decoratePrefix(sPrefix, oSettings);

            var inputObject = {};
            inputObject.userName = sPrefix;
            inputObject.maxEntries = MAX_ENTRIES;
            inputObject.context = this._selectContext();
            var sServiceName = this._oContext.currentService;
            if (!sServiceName) {
                return [];
            }
            return this._oSqlcodecompletionDAO.searchUsers(sServiceName, inputObject).then(function(result) {
                if (!result.errorCode) {
                    return result.users;
                }
            }, function(error) {
                return that._handleError(error);
            });
        },

        //===============================
        // Get all roles
        //===============================
        computeRoleSuggest: function(oContext, oSettings) {
            var that = this;
            if (!this._checkIfSqlCodeCompletionDAOService()) {
                return false;
            }
            oSettings = oSettings || {};

            this._oContext = oContext;
            var sPrefix = this._checkPlaceHolder(this._oContext.prefix);
            sPrefix = sPrefix.toUpperCase();
            sPrefix = this._decoratePrefix(sPrefix, oSettings);

            var inputObject = {};
            inputObject.roleName = sPrefix;
            inputObject.maxEntries = MAX_ENTRIES;
            inputObject.context = this._selectContext();
            var sServiceName = this._oContext.currentService;
            if (!sServiceName) {
                return [];
            }
            return this._oSqlcodecompletionDAO.searchRoles(sServiceName, inputObject).then(function(result) {
                if (!result.errorCode) {
                    return result.roles;
                }
            }, function(error) {
                return that._handleError(error);
            });
        },

        //===============================
        // Get object privilege like DROP, CREATE ANY, INSERT, SELECT, UPDATE, DELETE, EXECUTE, DEDUG, ALTER
        //===============================
        computeObjectPrivilegeSuggest: function(oContext, oSettings) {
            var that = this;
            if (!this._checkIfSqlCodeCompletionDAOService()) {
                return false;
            }
            oSettings = oSettings || {};

            this._oContext = oContext;
            var sPrefix = this._checkPlaceHolder(this._oContext.prefix);
            sPrefix = sPrefix.toUpperCase();
            sPrefix = this._decoratePrefix(sPrefix, oSettings);

            var inputObject = {};
            inputObject.privilegeName = sPrefix;
            inputObject.maxEntries = MAX_ENTRIES;
            inputObject.context = this._selectContext();
            var sServiceName = this._oContext.currentService;
            if (!sServiceName) {
                return [];
            }
            return this._oSqlcodecompletionDAO.getObjectPrivileges(sServiceName, inputObject).then(function(result) {
                if (!result.errorCode) {
                    return result.objects;
                }
            }, function(error) {
                return that._handleError(error);
            });
        },

        //===============================
        // Get system privilege like AUDIT AMDIN, BACK UP, INIFILE ADMIN
        //===============================
        computeSystemPrivilegeSuggest: function(oContext, oSettings) {
            var that = this;
            if (!this._checkIfSqlCodeCompletionDAOService()) {
                return false;
            }
            oSettings = oSettings || {};

            this._oContext = oContext;
            var sPrefix = this._checkPlaceHolder(this._oContext.prefix);
            sPrefix = sPrefix.toUpperCase();
            sPrefix = this._decoratePrefix(sPrefix, oSettings);

            var inputObject = {};
            inputObject.sysName = sPrefix;
            inputObject.maxEntries = MAX_ENTRIES;
            inputObject.context = this._selectContext();
            var sServiceName = this._oContext.currentService;
            if (!sServiceName) {
                return [];
            }
            return this._oSqlcodecompletionDAO.getSystemPrivileges(sServiceName, inputObject).then(function(result) {
                if (!result.errorCode) {
                    return result.systems;
                }
            }, function(error) {
                return that._handleError(error);
            });
        },

        // replaced by computeObjectPrivilegeSuggest in template config file
        // computeSchemaPrivilegeSuggest: function(oContext) {
        // if (!this._checkIfSqlCodeCompletionDAOService()) {
        //     return false;
        // }
        // this._oContext = oContext;
        // var sPrefix = this._checkPlaceHolder(this._oContext.prefix);
        // sPrefix = sPrefix.toUpperCase();
        // var inputObject = {};
        // inputObject.providerName = "%" + sPrefix + "%";
        // inputObject.maxEntries = MAX_ENTRIES;
        // inputObject.context = this._selectContext()
        // return this._oSqlcodecompletionDAO.getSAMLProviders(null, inputObject).then(function(result) {
        //     if (!result.errorCode) {
        //         return result.objects;
        //     }
        // });
        // },

        //===============================
        // Get SAML Providers
        //===============================
        computeSAMLProviderSuggest: function(oContext, oSettings) {
            var that = this;
            if (!this._checkIfSqlCodeCompletionDAOService()) {
                return false;
            }
            oSettings = oSettings || {};

            this._oContext = oContext;
            var sPrefix = this._checkPlaceHolder(this._oContext.prefix);
            sPrefix = sPrefix.toUpperCase();
            sPrefix = this._decoratePrefix(sPrefix, oSettings);

            var inputObject = {};
            inputObject.providerName = sPrefix;
            inputObject.maxEntries = MAX_ENTRIES;
            inputObject.context = this._selectContext();
            var sServiceName = this._oContext.currentService;
            if (!sServiceName) {
                return [];
            }
            return this._oSqlcodecompletionDAO.getSAMLProviders(sServiceName, inputObject).then(function(result) {
                if (!result.errorCode) {
                    return result.apps;
                }
            }, function(error) {
                return that._handleError(error);
            });
        },

        //===============================
        // Get Application privileges like sap.hana.ide::Catalog
        //===============================
        computeApplicationPrivilegeSuggest: function(oContext, oSettings) {
            var that = this;
            if (!this._checkIfSqlCodeCompletionDAOService()) {
                return false;
            }
            oSettings = oSettings || {};

            this._oContext = oContext;
            var sPrefix = this._checkPlaceHolder(this._oContext.prefix);
            sPrefix = sPrefix.toUpperCase();
            sPrefix = this._decoratePrefix(sPrefix, oSettings);

            var inputObject = {};
            inputObject.appName = sPrefix;
            inputObject.maxEntries = MAX_ENTRIES;
            inputObject.context = this._selectContext();
            var sServiceName = this._oContext.currentService;
            if (!sServiceName) {
                return [];
            }
            return this._oSqlcodecompletionDAO.getApplicationPrivileges(sServiceName, inputObject).then(function(result) {
                if (!result.errorCode) {
                    return result.apps;
                }
            }, function(error) {
                return that._handleError(error);
            });
        },

        //===============================
        // Get Analytical privileges
        //===============================
        computeAnalyticalPrivielgeSuggest: function(oContext, oSettings) {
            var that = this;
            if (!this._checkIfSqlCodeCompletionDAOService()) {
                return false;
            }
            oSettings = oSettings || {};

            this._oContext = oContext;
            var sPrefix = this._checkPlaceHolder(this._oContext.prefix);
            sPrefix = sPrefix.toUpperCase();
            sPrefix = this._decoratePrefix(sPrefix, oSettings);

            var inputObject = {};
            inputObject.name = sPrefix;
            inputObject.maxEntries = MAX_ENTRIES;
            inputObject.context = this._selectContext();
            var sServiceName = this._oContext.currentService;
            if (!sServiceName) {
                return [];
            }
            return this._oSqlcodecompletionDAO.getAnalyticalPrivileges(sServiceName, inputObject).then(function(result) {
                if (!result.errorCode) {
                    return result.privileges;
                }
            }, function(error) {
               return that._handleError(error);
            });
        },

        _checkPlaceHolder: function(sPrefix) {
            switch (sPrefix) {
                case "<schema>":
                case "<schema_name>":
                case "<table>":
                case "<table_name>":
                case "<view>":
                case "<procedure>":
                case "<proc_name>":
                case "<function>":
                case "<trigger>":
                case "<synonym>":
                case "<sequence>":
                    return "%";

                default:
                    return sPrefix;
            }
        },

        _selectContext: function() {
            var oContext = {
                prefix: this._oContext.prefix,
                preText: this._oContext.preText,
                name: this._oContext.name,
                currentSchema: this._oContext.currentSchema
            };
            return oContext;
        },

        _decoratePrefix: function(sPrefix, oSettings) {
            oSettings = oSettings || {};
            var bMatchAll = oSettings.matchAll || false;
            if (bMatchAll) {
                sPrefix = "%" + sPrefix + "%";
            } else {
                sPrefix = sPrefix + "%";
            }
            return sPrefix;
        }
    });
    return DbContent;
});