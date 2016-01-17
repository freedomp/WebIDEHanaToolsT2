/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define(["sap/watt/hanaplugins/editor/plugin/hdbcalculationview/base/modelbase", // relative path ../../analytics... doesn't work here
        "sap/watt/hanaplugins/editor/plugin/hdbcalculationview/sharedmodel/sharedmodel",
        "sap/watt/hanaplugins/editor/plugin/hdbcalculationview/viewmodel/model"
    ],
    function(modelbase, sharedmodel, viewmodel) {
        "use strict";

        var AbstractModelClass = modelbase.AbstractModelClass;
        var ModelCollection = modelbase.ModelCollection;
        var ModelException = modelbase.ModelException;
        var ObjectAlreadyExistsException = modelbase.ObjectAlreadyExistsException;
        var AttributeMissingException = modelbase.AttributeMissingException;
        var InvalidAttributeException = modelbase.InvalidAttributeException;
        
        /** 
         * @enum {string} PrivilegeType
         */
        var PrivilegeType = {
            SQL_ANALYTIC_PRIVILEGE : "SQL_ANALYTIC_PRIVILEGE",
            ANALYTIC_PRIVILEGE : "ANALYTIC_PRIVILEGE",
            NONE : "NONE"
        };
        
        /**
         * @class AnalyticPrivilegeModel
         */
        var AnalyticPrivilegeModel = modelbase.AbstractModel.extend("AnalyticPrivilegeModel", {

            $features: {
                containments: {
                    "analyticPrivilege": {},
                    "_entities": {
                        isMany: true
                    }
                }
            },

            createAnalyticPrivilege: function(attributes, skippedNodes) {
                var analyticPrivilege = new AnalyticPrivilege(attributes, skippedNodes);
                this.analyticPrivilege = analyticPrivilege;
                return analyticPrivilege;
            },
            
            createEntity: function(attributes, skippedNodes) {
                var entity = new viewmodel.Entity(attributes, skippedNodes);
                var key = entity.$getKeyAttributeValue();
                if (this._entities.get(key)) {
                    entity.$rename(this._entities.getUniqueKey(key));
                }
                this._entities.add(entity);
                return entity;
            }

        });

        /**
         * @class - AnalyticPrivilege
         * @property {string} name
         * @property {string} privilegeType @enum PrivilegeType 
         */
        var AnalyticPrivilege = AbstractModelClass.extend("AnalyticPrivilege", {

            $features: {
                keyAttribute: "name",
                containments: {
                    "securedModels": {},
                    "validities": {
                        isMany: true
                    },
                    "restrictions": {
                        isMany: true
                    }
                }
            },

            $init: function() {
            	this.getName();
                if (!this.name) throw new AttributeMissingException(this, "name");
            },

            //Merge not required
            createSecuredModels: function(attributes, skippedNodes) {
                this.securedModels = new SecuredModels(attributes, skippedNodes);
                return this.securedModels;
            },

            addSecuredModel: function(modelUri) {
                this.securedModels.createOrMergeModelUri(modelUri);
            },

            createValidity: function(attributes, skippedNodes) {
                var validityValueFilter = new sharedmodel.ValueFilter(attributes, skippedNodes);
                this.validities.add(validityValueFilter);
                return validityValueFilter;
            },

            createRestriction: function(attributes, skippedNodes) {
                var restriction = new Restriction(attributes, skippedNodes);
                this.restrictions.add(restriction);
                return restriction;
            },
            getName: function(){
				//var name;
				if(this.id && this.id.indexOf('::') > -1){				
					var id_parts = this.id.split('::');					
					if (id_parts && id_parts.length === 2 && id_parts[1]) {
						this.name = id_parts[1];
					}
				}else if(this.id){
					this.name = this.id;
				}
				return this.name;
			},

        });


        /**
         * @class SecuredModels
         * @property {boolean} allInformationModels : privilege is applicable for all information models
         */
        var SecuredModels = AbstractModelClass.extend("SecuredModels", {

            $features: {
                containments: {
                    "modelUris": {
                        isMany: true
                    }
                }
            },

            createOrMergeModelUri: function(modelUriString, skippedNodes) {
                var modelUri = this.modelUris.get(modelUriString);
                if (modelUri) {
                    modelUri.$setAttributes({
                        "uriString": modelUriString
                    }, skippedNodes);
                } else {
                    modelUri = new RepositoryUri({
                        "uriString": modelUriString
                    }, skippedNodes);
                    this.modelUris.add(modelUri);
                }
                return modelUri;
            }
        });

        /**
         * @class RepositoryUri
         * @property {sring} uriString : the URI as string - e.g. "/mini/analyticviews/MINI_C3"
         */
        var RepositoryUri = AbstractModelClass.extend("RepositoryUri", {
            $features: {
                keyAttribute: "uriString"
            },

            $init: function() {
                if (!this.uriString) throw new AttributeMissingException(this, "uriString");
            }
        });

        /**
         * @class Restriction
         * @property {string}   dimensionUri                :the dimension the restrictions is applied to
         * @property {string}   attributeName               :the local (private) attribute the restriction is applied to
         * @property {string}   originInformationModelUri   :The InformatationModel the local attribute was taken from. This model is only used in the
                                                             editor to provide value help. 
         */
        var Restriction = AbstractModelClass.extend("Restriction", {

            $features: {
                containments: {
                    "filters": {
                        isMany: true
                    }
                }
            },

            $init: function() {
                //if (!this.dimensionUri && !this.attributeName) throw new AttributeMissingException(this, "dimensionUri or attributeName");
            },

            createFilter: function(attributes, skippedNodes) {
                var filter = new Filter(attributes, skippedNodes);
                this.filters.add(filter);
                return filter;
            }
        });

        /**
         * @class Filter
         * @property {string}   attributeName     the attribute the filter is applied to
         * @property {string}   type              xsi:type @enum FilterType
         */
        var Filter = AbstractModelClass.extend("Filter", {

            $features: {
                keyAttribute: "attributeName",
                containments: {
                    "valueFilters": {
                        isMany: true
                    },
                    "procedureFilters": {
                        isMany: true
                    }
                }
            },

            $init: function() {
                if (!this.attributeName) throw new AttributeMissingException(this, "attributeName");
                if (!this.type) throw new AttributeMissingException(this, "type");
            },

            createValueFilter: function(attributes, skippedNodes) {
                var valueFilter = new sharedmodel.ValueFilter(attributes, skippedNodes);
                this.valueFilters.add(valueFilter);
                return valueFilter;
            },

            createProcedureFilter: function(attributes, skippedNodes) {
                var procedureFilter = new ProcedureFilter(attributes, skippedNodes);
                this.procedureFilters.add(procedureFilter);
                return procedureFilter;
            }
        });

        /** 
         * @enum {string} FilterType
         */
        var ValueFilterType = {
            ATTRIBUTE_FILTER: "AttributeFilter",
            HIERARCHY_FILTER: "HierarchyFilter"
        };

        /**
         * @class ProcedureFilter
         * @property {string}   operator  @enum ValueFilterOperator
         * @property {string}   procedureName: full qualifed name of the procedure
         */
        var ProcedureFilter = AbstractModelClass.extend("ProcedureFilter", {

            $init: function() {
                // if (!this.operator) throw new AttributeMissingException(this, "operator");
                // if (!this.procedureName) throw new AttributeMissingException(this, "procedureName");
            }
        });

        /**
         * @class EmptyModelClass
         * Only used for storing skipped nodes
         */
        var EmptyModelClass = AbstractModelClass.extend("EmptyModelClass", {});

        return {
            AnalyticPrivilegeModel: AnalyticPrivilegeModel,
            AnalyticPrivilege: AnalyticPrivilege,
            SecuredModels: SecuredModels,
            RepositoryUri: RepositoryUri,
            Restriction: Restriction,
            Filter: Filter,
            ProcedureFilter: ProcedureFilter,
            EmptyModelClass: EmptyModelClass,
            PrivilegeType: PrivilegeType
        };
    });
