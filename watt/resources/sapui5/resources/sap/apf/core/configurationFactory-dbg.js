/*!
 * SAP APF Analysis Path Framework
 * 
 * (c) Copyright 2012-2014 SAP AG. All rights reserved
 */
/*global sap, jQuery*/

(function () {
    'use strict';

    jQuery.sap.declare("sap.apf.core.configurationFactory");
    jQuery.sap.require("sap.apf.core.step");
    jQuery.sap.require("sap.apf.core.request");
    jQuery.sap.require("sap.apf.utils.hashtable");
    jQuery.sap.require("sap.apf.core.binding");
    jQuery.sap.require("sap.apf.core.representationTypes");
    jQuery.sap.require("sap.apf.core.constants");
    jQuery.sap.require('sap.apf.utils.utils');

    /**
     * @private
     * @class This class loads the configuration object, registers its properties and provides getters to receive references or copies of them.
     */
    sap.apf.core.ConfigurationFactory = function (oInject) {
        // Private Variables and functions
        var that = this;
        var idRegistry = new sap.apf.utils.Hashtable(oInject.messageHandler);
        var setItem = function (oItem) {
            oInject.messageHandler.check(oItem !== undefined && oItem.hasOwnProperty("id") !== false, "oItem is undefined or property 'id' is missing", sap.apf.core.constants.message.code.errorCheckConfiguration);
            if (!idRegistry) {
                idRegistry = new sap.apf.utils.Hashtable(oInject.messageHandler);
            }
            var result = idRegistry.setItem(oItem.id, oItem);
            oInject.messageHandler.check((result === undefined), "Configuration includes duplicated identifiers (IDs)", sap.apf.core.constants.message.code.errorCheckConfigurationWarning);
        };
        var getItemsByType = function (type) {
            var aResults = [];
            if (idRegistry.getNumberOfItems() !== 0) {
                idRegistry.each(function (index, element) {
                    if (element.type === type) {
                        aResults.push(element);
                    }
                });
                return aResults;
            }
            oInject.messageHandler.putMessage(oInject.messageHandler.createMessageObject({
                code: "5020"
            }));
            return aResults;
        };

        function loadStep(oStep) {
            if (oStep.type === undefined) {
                oStep.type = "step";
            }
            setItem(oStep);
        }

        function loadSteps(aSteps) {
            oInject.messageHandler.check(aSteps !== undefined && aSteps instanceof Array !== false, "aSteps is missing or not an Array", sap.apf.core.constants.message.code.errorCheckConfiguration);
            aSteps.forEach(function (step) {
                loadStep(step);
            });
        }

        function loadRequest(oRequest) {
            if (oRequest.type === undefined) {
                oRequest.type = "request";
            }
        	if(oRequest.entitySet) {
        		oRequest.entityType = oRequest.entitySet;
        		delete oRequest.entitySet;
        	}
            setItem(oRequest);
        }

        function loadNavigationTarget(navigationTarget) {
        	if (navigationTarget.type  === undefined) {
        		navigationTarget.type = "navigationTarget";
        	}
        	setItem(navigationTarget);
        }
        function loadRequests(aRequests) {
            oInject.messageHandler.check(aRequests !== undefined && aRequests instanceof Array !== false, "aRequests is missing or not an Array", sap.apf.core.constants.message.code.errorCheckConfiguration);
            aRequests.forEach(function (request) {
                loadRequest(request);
            });
        }

        function loadBinding(oBinding) {
            function checkRepresentationForID() {
                var representationRegistry = new sap.apf.utils.Hashtable(oInject.messageHandler);
                oBinding.representations.forEach(function (representation) {
                    //check for existing id
                    if (!(representation.id && typeof representation.id === "string")) {
                        oInject.messageHandler.putMessage(oInject.messageHandler.createMessageObject({
                            code: "5028",
                            aParameters: [ oBinding.id ]
                        }));
                    }
                    //check for duplicated id
                    if (representationRegistry.setItem(representation.id, representation.id)) {
                        oInject.messageHandler.putMessage(oInject.messageHandler.createMessageObject({
                            code: "5029",
                            aParameters: [ oBinding.id ]
                        }));
                    }
                });
            }

            if (oBinding.type === undefined) {
                oBinding.type = "binding";
            }
            oInject.messageHandler.check(oBinding.id !== undefined, "binding has no id");
            oInject.messageHandler.check(oBinding.representations !== undefined && oBinding.representations instanceof Array !== false, "representations for binding " + oBinding.id + " not defined", sap.apf.core.constants.message.code.errorCheckConfiguration);

            checkRepresentationForID();
            setItem(oBinding);
        }

        function loadBindings(aBindings) {
            oInject.messageHandler.check(aBindings !== undefined && aBindings instanceof Array !== false, "aBindings is missing or not an Array", sap.apf.core.constants.message.code.errorCheckConfiguration);
            aBindings.forEach(function (binding) {
                loadBinding(binding);
            });
        }

        function loadNavigationTargets(navigationTargets) {
        	oInject.messageHandler.check(navigationTargets !== undefined && navigationTargets instanceof Array !== false, "navigationTarget is missing or not an Array", sap.apf.core.constants.message.code.errorCheckConfiguration);
        	navigationTargets.forEach(function (navigationTarget) {
        		loadNavigationTarget(navigationTarget);
        	});
        }
        function loadCategory(oCategoryConfig) {
            if (oCategoryConfig.type === undefined) {
                oCategoryConfig.type = "category";
            }
            setItem(oCategoryConfig);
        }

        function loadCategories(aCategories) {
            oInject.messageHandler.check(aCategories !== undefined && aCategories instanceof Array !== false, "aCategories is missing or not an Array", sap.apf.core.constants.message.code.errorCheckConfiguration);
            aCategories.forEach(function (category) {
            	var aSteps = category.steps;
                oInject.messageHandler.check(aSteps !== undefined && aSteps instanceof Array !== false, "steps for category " + category.id + " are missing or not an Array", sap.apf.core.constants.message.code.errorCheckConfiguration);
                aSteps.forEach(function(step){
                	oInject.messageHandler.check(step.type && step.type === "step" && step.id, "step with wrong format assigned to category '" + category.id + "'");
                	oInject.messageHandler.check(that.existsConfiguration(step.id), "step with id '" + step.id + "' which is assigned to category '" + category.id + "' does not exist");
                });
                loadCategory(category);
            });
        }

        function isPredefinedRepresentation(representationTypeId) {
            var result = false;
            var aRepresentationTypes = sap.apf.core.representationTypes();
            aRepresentationTypes.forEach(function (representationTypeConfig) {
                if (representationTypeId === representationTypeConfig.id) {
                    result = true;
                }
            });
            return result;
        }

        function loadRepresentationType(oRepresentationTypeConfig) {
            var representationConstructorCandidate;
            if (oRepresentationTypeConfig.type === undefined) {
                oRepresentationTypeConfig.type = "representationType";
            }
            if (!isPredefinedRepresentation(oRepresentationTypeConfig.id)) {
                representationConstructorCandidate = sap.apf.utils.extractFunctionFromModulePathString(oRepresentationTypeConfig.constructor);
                if (!jQuery.isFunction(representationConstructorCandidate)) {
                    oInject.messageHandler.putMessage(oInject.messageHandler.createMessageObject({code: '5030', parameters: [oRepresentationTypeConfig.id]}));
                }
            }
            setItem(oRepresentationTypeConfig);
        }

        function loadRepresentationTypes(aRepresentationTypes) {
            oInject.messageHandler.check(aRepresentationTypes !== undefined && aRepresentationTypes instanceof Array !== false, "aRepresentationInfo is missing or not an Array", sap.apf.core.constants.message.code.errorCheckConfiguration);
            aRepresentationTypes.forEach(function (representationType) {
                loadRepresentationType(representationType);
            });
        }

        function loadFacetFilter(oFacetFilter) {
            if (oFacetFilter.type === undefined) {
                oFacetFilter.type = "facetFilter";
            }
            that.addObject(oFacetFilter);
        }

        function loadFacetFilters(aFacetFilters) {
            oInject.messageHandler.check(aFacetFilters !== undefined && aFacetFilters instanceof Array !== false, "Facet filter configuration is missing or not an Array", sap.apf.core.constants.message.code.errorCheckConfiguration);
            aFacetFilters.forEach(function (facetFilter) {
                loadFacetFilter.call(that, facetFilter);
            });
        }

        var loadPredefinedRepresentationTypes = function (aRepresentationTypes) {
            loadRepresentationTypes(aRepresentationTypes);
        };
        /**
         * @private
         * @class Step templates are runtime objects, which contain analysis step information based on the analytical content configuration.
         * @name sap.apf.core.configurationFactory~StepTemplate
         */
        function StepTemplate (oStepConfig, oFactory) {
            function getRepresentations(oStepConfig, oConfigurationFactory) {
                var aRepresentations = oConfigurationFactory.getConfigurationById(oStepConfig.binding).representations;
                if (aRepresentations) {
                    return aRepresentations;
                }
                oInject.messageHandler.check(false, 'Binding of step with ID "' + oStepConfig.id + '" does not contain any representations.', sap.apf.core.constants.message.code.errorCheckConfigurationWarning);

            }

            function getRepresentationInfo(oStepConfig, oConfigurationFactory) {
                var aRepresentations;
                var localRepresentationInfo = [];
                if (oStepConfig.binding) {
                    aRepresentations = getRepresentations(oStepConfig, oConfigurationFactory);
                    aRepresentations.forEach(function (representation) {
                        var oRepresentationType = jQuery.extend(true, {}, oConfigurationFactory.getConfigurationById(representation.representationTypeId));
                        oRepresentationType.representationId = representation.id;
                        oRepresentationType.representationLabel = representation.label;
                        oRepresentationType.parameter =  jQuery.extend(true, {}, representation.parameter);
                        localRepresentationInfo.push(oRepresentationType);
                    });
                    return localRepresentationInfo;
                }
                oInject.messageHandler.check(false, 'Step with ID "' + oStepConfig.id + '" does not contain any binding references.',
                    sap.apf.core.constants.message.code.errorCheckConfigurationWarning);
            }

            var oStepTemplate = jQuery.extend(true, {}, oStepConfig);
            var aRepresentationInfo = getRepresentationInfo(oStepConfig, oFactory);
            delete oStepTemplate.request;
            delete oStepTemplate.binding;
            delete oStepTemplate.thumbnail;
            delete oStepTemplate.longTitle;
            /**
             * @memberOf StepTemplate
             * @description Contains 'stepTemplate'
             * @returns {string}
             */
            oStepTemplate.type = "stepTemplate";

            /**
             * @private
             * @function
             * @memberOf sap.apf.core.configurationFactory~StepTemplate
             * @name sap.apf.core.configurationFactory~StepTemplate#getRepresentationInfo
             * @description Returns all representation information that is configured for the step.
             * @returns {object[]}
             */
            oStepTemplate.getRepresentationInfo = function () {
                var aReprInfo = jQuery.extend(true, [], aRepresentationInfo); // clone deep
                aReprInfo.forEach(function (info) {
                    delete info.id;
                    delete info.type;
                    delete info.constructor;
                });
                return aReprInfo;
            };

            return oStepTemplate;
        }
        // Private Func
        // Constructor functions
        var Category = function (oCategoryConfig, context) {
        	var that = this;
            this.type = oCategoryConfig.type;
            this.id = oCategoryConfig.id;
            this.label = oCategoryConfig.label;
            this.stepTemplates = [];
            oCategoryConfig.steps.forEach(function(stepReference){
            	var step = context.getConfigurationById(stepReference.id);
            	that.stepTemplates.push(new StepTemplate(step, context));
            });
            return this;
        };
        var Thumbnail = function (oThumbnailConfig, oFactory) { // oFactory needed when accessing object of configurationFactory!
            this.type = "thumbnail";
            if (oThumbnailConfig === undefined) {
                return this;
            }
            this.leftUpper = oFactory.createLabel(oThumbnailConfig.leftUpper);
            this.rightUpper = oFactory.createLabel(oThumbnailConfig.rightUpper);
            this.leftLower = oFactory.createLabel(oThumbnailConfig.leftLower);
            this.rightLower = oFactory.createLabel(oThumbnailConfig.rightLower);
            this.altTitle = oFactory.createLabel(oThumbnailConfig.altTitle);
            return this;
        };
        /**
         * @private
         * @description Creates and returns a new thumbnail object.
         * @param oThumbnailConfig
         * @return Object
         */
        this.createThumbnail = function (oThumbnailConfig) {
            return new Thumbnail(oThumbnailConfig, this);
        };
        function Label (oLabelConfig) {
            this.type = "label";
            this.kind = oLabelConfig.kind;
            if (this.kind === "text") {
                this.file = oLabelConfig.file;
                this.key = oLabelConfig.key;
            } else if (this.kind === "property") {
                this.property = oLabelConfig.property;
            } else if (this.kind === "sapLabel") {
                this.labelOf = oLabelConfig.labelOf;
            }
        }
        /**
         * @private
         * @param oLabelConfig
         * @return {Object|undefined} New Object of type Label
         */
        this.createLabel = function (oLabelConfig) {
            return new Label(oLabelConfig, this);
        };
        // Public Func
        /**
         * @private
         * @description Loads all properties of the input configuration object, which can also include custom error texts.
         * Note: For a request object in oConfiguration.requests, the property entityType is deprecated. Instead of entityType, the property entitySet shall be used. 
         * @param oConfiguration configuration object
         */
        this.loadConfig = function (oConfiguration) {
            idRegistry = new sap.apf.utils.Hashtable(oInject.messageHandler);
            if(oConfiguration.applicationTitle) {
            	idRegistry.setItem('applicationTitle', oConfiguration.applicationTitle);
            }
            
           	var inject = { constructor : { hashtable      : sap.apf.utils.Hashtable},
     			           instance :    { messageHandler : oInject.messageHandler}};
            sap.apf.utils.migrateConfigToCategoryStepAssignment(oConfiguration, inject);	
        	
            var aRepresentationTypes = sap.apf.core.representationTypes();
            loadPredefinedRepresentationTypes(aRepresentationTypes);
            loadSteps(oConfiguration.steps);
            loadCategories(oConfiguration.categories);
            loadRequests(oConfiguration.requests);
            loadBindings(oConfiguration.bindings);
            if (oConfiguration.representationTypes) {
                loadRepresentationTypes(oConfiguration.representationTypes);
            }
            if (oConfiguration.facetFilters) {
                loadFacetFilters.call(this, oConfiguration.facetFilters);
            }
            if (oConfiguration.navigationTargets) {
            	loadNavigationTargets(oConfiguration.navigationTargets);
            }
        };
        /**
         * @private
         * @description Adds an object to the configuration factory
         * @param {object} configurationObject - Must contain valid values for 'type'-property and 'id'.
         * Further properties are type specific.
         * @returns undefined
         */
        this.addObject = function (configurationObject) {
            if(!sap.apf.core.constants.configurationObjectTypes.hasOwnProperty(configurationObject.type)) {
//            if (!(configurationObject.type in sap.apf.core.constants.configurationObjectTypes)) {
                oInject.messageHandler.putMessage(oInject.messageHandler.createMessageObject({
                    code: "5033",
                    aParams: [configurationObject.type]
                }));
            }
            if (!(configurationObject.property)) {
                oInject.messageHandler.putMessage(oInject.messageHandler.createMessageObject({
                    code: "5034"
                }));
            }
            idRegistry.setItem(configurationObject.id, configurationObject);
        };
        /**
         * @private
         * @description Returns a reference of a configuration object. Not a copy.
         * @param sId
         * @returns Object
         */
        this.getConfigurationById = function (sId) {
            return idRegistry.getItem(sId);
        };

        /**
         * @private
         * @description Returns true, if configuration object exists.
         * @param sId
         * @returns {boolean}
         */
        this.existsConfiguration = function (sId) {
            return idRegistry.hasItem(sId);
        };

        /**
         * @private
         * @description Returns service documents
         * @returns {Array}
         */
        this.getServiceDocuments = function () {
            var aRequestItems = getItemsByType("request");
            var aServiceDocuments = [];
            aRequestItems.forEach(function (item) {
                aServiceDocuments.push(item.service);
            });
            return sap.apf.utils.eliminateDuplicatesInArray(oInject.messageHandler, aServiceDocuments);
        };

        /**
         * @private
         * @description Returns the navigation targets. Currently no parameters are supported.
         * @returns Array of navigation targets
         */
        this.getNavigationTargets = function() {
        	var navigationTargets = getItemsByType("navigationTarget");
        	return jQuery.extend(true, [], navigationTargets);
        };
        /**
         * @private
         * @description Returns new step templates created from all step configuration objects, containing static information only.
         *      Note that a step config object is used to create an object of type stepTemplate as well as a runtime object of type step.
         * @returns Array of objects
         */
        this.getStepTemplates = function () {
            var aItems = getItemsByType("step");
            var aStepTemplates = [];
            aItems.forEach(function (item, stepConfig) {
                aStepTemplates[stepConfig] = new StepTemplate(item, that);
            });
            return aStepTemplates;
        };
        /**
         * @private
         * @description Returns array of cloned facet filter configurations
         * @returns Array of objects
         */
        this.getFacetFilterConfigurations = function () {
            var facetFilters = getItemsByType("facetFilter");
            var resolvedFunction;
            facetFilters = jQuery.extend(true, [], facetFilters);
            facetFilters.forEach(function (facetFilter) {
                if (facetFilter.preselectionFunction) {
                    resolvedFunction = sap.apf.utils.extractFunctionFromModulePathString(facetFilter.preselectionFunction);
                    if (!jQuery.isFunction(resolvedFunction)) {
                        oInject.messageHandler.putMessage(oInject.messageHandler.createMessageObject({code: '5035', parameters: [facetFilter.id]}));
                        facetFilter.preselectionFunction = undefined;
                    } else {
                        facetFilter.preselectionFunction = resolvedFunction;
                    }
                }
            });
            return facetFilters;
        };
        /**
         * @private
         * @description Returns new category objects of all loaded category configuration objects.
         * @returns Array
         */
        this.getCategories = function () {
            var aItems = getItemsByType("category");
            var aCategories = [];
            aItems.forEach(function (item, inx) {
                aCategories[inx] = new Category(item, that);
            });
            return aCategories;
        };
        /**
         * @private
         * @description Creates and returns a new step object from its specified configuration object.
         * @param sStepId Identifies the configuration object. If the step id is not known an error will be thrown.
         * @param {string} [sRepresentationId] the representation, that shall be selected
         * @returns Object
         */
        this.createStep = function (sStepId, sRepresentationId) {
            var oStepConfig = this.getConfigurationById(sStepId);
            oInject.messageHandler.check((oStepConfig !== undefined && oStepConfig.type === "step"), "Error - referenced object is undefined or has not type step", sap.apf.core.constants.message.code.errorCheckConfiguration);
            oInject.messageHandler.check(sap.apf.core.Step !== undefined, "Step must be defined ", sap.apf.core.constants.message.code.errorCheckConfiguration);
            oInject.messageHandler.check(typeof sap.apf.core.Step === "function", "Step must be Ctor function");
            return new sap.apf.core.Step(oInject.messageHandler, oStepConfig, this, sRepresentationId);
        };
        /**
         * @private
         * @description Creates and returns a new binding object, by the identified configuration object.
         * @param sBindingId Identifies the configuration object. If the id is not known an error will be thrown.
         * @param oTitle Short title, type label.
         * @param oLongTitle Long title, type label
         * @param {string} [sRepresentationId] the representation, that shall be selected
         * @returns {Object}
         */
        this.createBinding = function (sBindingId, oTitle, oLongTitle, sRepresentationId) {
            var oBindingConfig = this.getConfigurationById(sBindingId);
            oInject.messageHandler.check((oBindingConfig !== undefined && oBindingConfig.type === "binding"), "Error - oBindingConfig is undefined or has not type binding", sap.apf.core.constants.message.code.errorCheckConfiguration);
            oBindingConfig.oTitle = oTitle;
            oBindingConfig.oLongTitle = oLongTitle;
            return new sap.apf.core.Binding(oInject, oBindingConfig, this, sRepresentationId);
        };
        /**
         * @private
         * @description Creates and returns a new request object.
         * Note: For the request object, the property entityType is deprecated. Instead of entityType, the property entitySet shall be used. 
         * @param {String|Object} request - Request id or request object. If the step id is not known an error will be thrown.
         * @param {Object} request.type {String}
         * @param {Object} request.id {String}
         * @param {Object} request.service {String}
         * @param {Object} request.entitySet}
         * @returns {Object|undefined}
         */
        this.createRequest = function (request) {
        	if(request.entitySet) { // robustness: runtime only handles entityTypes internally -> set entitySet to entityType
        		request.entityType = request.entitySet;
        		delete request.entitySet;
        	}
            var oMessageObject;
            var oRequestConfig;
            function getUniqueId() {
                var date = new Date();
                return Math.random() * date.getTime();
            }
            if (typeof request === "string") {
                oRequestConfig = that.getConfigurationById(request);
                if (!(oRequestConfig !== undefined && oRequestConfig.type === "request")) {
                    oMessageObject = oInject.messageHandler.createMessageObject({
                        code: "5004",
                        aParameters: [ request ]
                    });
                    oInject.messageHandler.putMessage(oMessageObject);
                    return undefined;
                }
            } else {
                oRequestConfig = request;
                oInject.messageHandler.check(oRequestConfig.type && oRequestConfig.type === "request" &&
                        oRequestConfig.service && oRequestConfig.entityType,
                    'Wrong request configuration when creating a new request');
                if (!oRequestConfig.id) {
                    oRequestConfig.id = getUniqueId();
                    setItem(oRequestConfig);
                }

            }
            return new sap.apf.core.Request(oInject, oRequestConfig);
        };

       
        if (oInject.constructor.registryProbe) {
            this.getRegistry = function () {
                return new oInject.constructor.registryProbe(idRegistry);
            };
        }
    };
}());
