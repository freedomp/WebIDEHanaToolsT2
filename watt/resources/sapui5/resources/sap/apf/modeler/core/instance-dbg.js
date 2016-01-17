/*!
 * SAP APF Analysis Path Framework
 *
 * (c) Copyright 2012-2014 SAP SE. All rights reserved
 */
/*global sap, OData, jQuery*/


jQuery.sap.declare("sap.apf.modeler.core.instance");

(function () {
    'use strict';

    jQuery.sap.require("sap.ui.thirdparty.datajs");
    jQuery.sap.require("sap.apf.utils.hashtable");
    jQuery.sap.require('sap.apf.core.constants');
    jQuery.sap.require('sap.apf.core.messageHandler');  
    jQuery.sap.require('sap.apf.core.sessionHandler');
    jQuery.sap.require('sap.apf.core.representationTypes');
    jQuery.sap.require("sap.apf.core.entityTypeMetadata");
    jQuery.sap.require("sap.apf.core.configurationFactory");
    jQuery.sap.require("sap.apf.core.utils.uriGenerator");
    jQuery.sap.require("sap.apf.core.metadata");
    jQuery.sap.require("sap.apf.core.metadataFacade");
    jQuery.sap.require("sap.apf.core.metadataProperty");
    jQuery.sap.require('sap.apf.core.messageDefinition');
    jQuery.sap.require("sap.apf.core.metadataFactory");
    jQuery.sap.require('sap.apf.core.odataProxy');
    jQuery.sap.require('sap.apf.core.ajax');
    jQuery.sap.require('sap.apf.core.odataRequest');
    jQuery.sap.require('sap.apf.modeler.core.messageDefinition');
    jQuery.sap.require('sap.apf.modeler.core.textHandler');
    jQuery.sap.require('sap.apf.modeler.core.textPool');
    jQuery.sap.require('sap.apf.modeler.core.applicationHandler');
    jQuery.sap.require('sap.apf.modeler.core.configurationHandler');
    jQuery.sap.require('sap.apf.modeler.core.configurationEditor');
    jQuery.sap.require("sap.apf.modeler.core.step");
    jQuery.sap.require("sap.apf.modeler.core.facetFilter");
    jQuery.sap.require("sap.apf.modeler.core.navigationTarget");
    jQuery.sap.require("sap.apf.modeler.core.elementContainer");
    jQuery.sap.require("sap.apf.modeler.core.representation");
    jQuery.sap.require("sap.apf.modeler.core.configurationObjects");
    jQuery.sap.require("sap.apf.modeler.core.elementContainer");
    jQuery.sap.require("sap.apf.utils.parseTextPropertyFile");
    jQuery.sap.require("sap.apf.modeler.core.lazyLoader");
    jQuery.sap.require("sap.apf.modeler.core.registryWrapper");
    jQuery.sap.require("sap.apf.utils.startParameter");
    
    /**
     * @class Minimal core object that provides services for error handling, access to ajax/odata and text resources
     * @param {object} persistenceConfiguration Configuration of the persistence service
     * @param {object} inject Constructors, instances and functions, that shall be used
     */
    sap.apf.modeler.core.Instance = function(persistenceConfiguration, inject) {

        var that = this;

        var	ApplicationHandler, 
            ConfigurationHandler,
            ConfigurationEditor,
            ConfigurationObjects,
            ConfigurationFactory,
            Step,
            FacetFilter,
            NavigationTarget,
            Representation,
            ElementContainer,
            Hashtable,
            RegistryProbe,
        	Metadata,
			EntityTypeMetadata,
			MetadataFacade,
			MetadataProperty,
			MetadataFactory,
			LazyLoader,
			StartParameter,
            textHandler,
            messageHandler,
            sessionHandler,
            startParameter,
            persistenceProxy,
            metadataFactory,
            injectForFollowUp,
            injectMetadataFactory,
            injectLazyLoader,
            fnOdataRequestWrapper,
            fnAjax,
            fnLoadApplicationHandler,
            fnLoadConfigurationHandler,
            lazyLoaderForApplicationHandler,
            lazyLoaderForConfigurationHandler,
            actionsPerSemanticObjectHashTable,
            allAvailableSemanticObjects;


        //constructors
        ApplicationHandler = (inject && inject.constructor && inject.constructor.applicationHandler) || sap.apf.modeler.core.ApplicationHandler;
        ConfigurationHandler = (inject && inject.constructor && inject.constructor.configurationHandler) || sap.apf.modeler.core.ConfigurationHandler;
        ConfigurationEditor = (inject && inject.constructor && inject.constructor.configurationEditor) || sap.apf.modeler.core.ConfigurationEditor;
        ConfigurationObjects = (inject && inject.constructor && inject.constructor.configurationObjects) || sap.apf.modeler.core.ConfigurationObjects;
        ConfigurationFactory = (inject && inject.constructor && inject.constructor.configurationFactory) || sap.apf.core.ConfigurationFactory;
        ElementContainer = (inject && inject.constructor && inject.constructor.elementContainer) || sap.apf.modeler.core.ElementContainer;
        Step = (inject && inject.constructor && inject.constructor.step) || sap.apf.modeler.core.Step;
        FacetFilter = (inject && inject.constructor && inject.constructor.facetFilter) || sap.apf.modeler.core.FacetFilter;
        NavigationTarget = (inject && inject.constructor && inject.constructor.navigationTarget) || sap.apf.modeler.core.NavigationTarget;
        Representation = (inject && inject.constructor && inject.constructor.representation) || sap.apf.modeler.core.Representation;
        Hashtable = (inject && inject.constructor && inject.constructor.hashtable) || sap.apf.utils.Hashtable;
        RegistryProbe = (inject && inject.constructor && inject.constructor.registryProbe) || sap.apf.modeler.core.RegistryWrapper;
        LazyLoader = (inject && inject.constructor && inject.constructor.LazyLoader) || sap.apf.modeler.core.LazyLoader;
        Metadata = (inject && inject.constructor && inject.constructor.metadata) || sap.apf.core.Metadata;
        EntityTypeMetadata = (inject && inject.constructor && inject.constructor.entityTypeMetadata) || sap.apf.core.EntityTypeMetadata;
        MetadataFacade = (inject && inject.constructor && inject.constructor.metadataFacade) || sap.apf.core.MetadataFacade;
        MetadataProperty = (inject && inject.constructor && inject.constructor.metadataProperty) || sap.apf.core.MetadataProperty;
        MetadataFactory = (inject && inject.constructor && inject.constructor.metadataFactory) || sap.apf.core.MetadataFactory;
        StartParameter = (inject && inject.constructor && inject.constructor.startParameter) || sap.apf.utils.StartParameter;
        //instances
        if (inject && inject.constructor && inject.constructor.textHandler) {
            textHandler = new inject.constructor.textHandler();
        } else {
            textHandler = new sap.apf.modeler.core.TextHandler();
        }

        if (inject && inject.constructor && inject.constructor.messageHandler) {
            messageHandler = new inject.constructor.messageHandler(true);
        } else {
            messageHandler = new sap.apf.core.MessageHandler(true);
        }

        messageHandler.setTextResourceHandler(textHandler);
        messageHandler.loadConfig(sap.apf.core.messageDefinition);
        messageHandler.loadConfig(sap.apf.modeler.core.messageDefinition);
        messageHandler.activateOnErrorHandling(true);

        //precondition for persistence proxy
        startParameter = new StartParameter(inject && inject.instances && inject.instances.component);
        
        /**
         * @see sap.apf.utils.startParameter
         */
        this.getStartParameterFacade = function () {
            return startParameter;
        };
        
        injectForFollowUp = {
            instance : {
                messageHandler : messageHandler,
                coreApi : that
            }
        };

       
        if (inject && inject.constructor && inject.constructor.persistenceProxy) {
            persistenceProxy = new inject.constructor.persistenceProxy(persistenceConfiguration, injectForFollowUp);
        } else {
            persistenceProxy = new sap.apf.core.OdataProxy(persistenceConfiguration, injectForFollowUp);
        }

        //TODO Apply one consistent inject object concept also in sessionHandler
        if (inject && inject.constructor && inject.constructor.sessionHandler) {
            sessionHandler = new inject.constructors.sessionHandler(injectForFollowUp.instance);
        } else {
            sessionHandler = new sap.apf.core.SessionHandler(injectForFollowUp.instance);
        }

        //TODO Apply one consistent inject object concept also in MetadataFactory	
        injectMetadataFactory = {
            entityTypeMetadata : sap.apf.core.EntityTypeMetadata,
            hashtable : Hashtable,
            metadata : sap.apf.core.Metadata,
            metadataFacade : sap.apf.core.MetadataFacade,
            metadataProperty : sap.apf.core.MetadataProperty,
            messageHandler : messageHandler,
            coreApi : that,
            datajs : OData,
        	configurationFactory : { // Fake configurationFactory needed for getEntityTypeMetadata()
                getServiceDocuments : function() {
        			return [persistenceConfiguration.serviceRoot];
        		}
            },
            deactivateFatalError : true
        };

        metadataFactory = new sap.apf.core.MetadataFactory(injectMetadataFactory);
        
        // Lazy loader inject
        injectLazyLoader = {
        		constructor : { hashtable      : Hashtable },
        		instance    : { messageHandler : messageHandler}
        };

        //functions
        fnOdataRequestWrapper = (inject && inject.functions && inject.functions.odataRequestWrapper) || sap.apf.core.odataRequestWrapper;
        fnAjax = (inject && inject.functions && inject.functions.ajax) || sap.apf.core.ajax;
        

		//core interface
		/**
		 * @see sap.apf.core.ajax
		 */
		this.ajax = function(oSettings) {
			return fnAjax(oSettings);
		};

		/**
		 * @see sap.apf.core.odataRequestWrapper
		 */
		this.odataRequest = function(oRequest, fnSuccess, fnError, oBatchHandler) {
			fnOdataRequestWrapper(messageHandler, oRequest, fnSuccess, fnError, oBatchHandler);
		};
		
		/**
		 * @see sap.apf.core.checkForTimeout
		 */
		this.checkForTimeout = function(oServerResponse) {
			var messageObject = sap.apf.core.utils.checkForTimeout(oServerResponse);
			// up to now, the error handling was hard coded in checkForTimeout
			if (messageObject) {
				messageHandler.putMessage(messageObject);
			}
			return messageObject;
		};
		/**
		 * @see sap.apf.core.MetadataFactory#getEntityTypeMetadata
		 */
		this.getEntityTypeMetadata = function(sAbsolutePathToServiceDocument, sEntityType) {
			return metadataFactory.getEntityTypeMetadata(sAbsolutePathToServiceDocument, sEntityType);
		};
		/**
		 * @see sap.apf.core.SessionHandler#getXsrfToken
		 */
		this.getXsrfToken = function(sServiceRootPath) {
			return sessionHandler.getXsrfToken(sServiceRootPath);
		};
		/**
		 * @description Returns the instance of the UriGenerator. For internal core using only.
		 */
		this.getUriGenerator = function() {
			return sap.apf.core.utils.uriGenerator;
		};
		/**
		 * @description Returns text
		 * @param {string} sRessourceKey - Key of the message in the Ressourcefile
		 * @param {string[]} [aParameters] - Parameter for placeholder replacement in the message bundle
		 * @returns {string}
		 */
		this.getText = function(sRessourceKey, aParameters) {
			return textHandler.getText(sRessourceKey, aParameters);
		};
		/**
		 * @see sap.apf#putMessage for api definition.
		 * @see sap.apf.core.MessageHandler#putMessage for implementation.
		 */
		this.putMessage = function(oMessage) {
			return messageHandler.putMessage(oMessage);
		};
		/**
		 * @see sap.apf.core.MessageHandler#check
		 */
		this.check = function(bExpression, sMessage, sCode) {
			return messageHandler.check(bExpression, sMessage, sCode);
		};

		/**
		 * @see sap.apf#createMessageObject for api definition.
		 * @see sap.apf.core.MessageHandler#createMessageObject
		 */
		this.createMessageObject = function(config) {
			return messageHandler.createMessageObject(config);
		};
		/**
		 * @see sap.apf.core.MessageHandler#setMessageCallback
		 */
		this.setCallbackForMessageHandling = function(fnCallback) {
			messageHandler.setMessageCallback(fnCallback);
		};
		/**
         * @private
         * @function
         * @name sap.apf.modeler.core.instance#importTexts
         * @description Receives a string containing text property file for an existing application. Loads the texts and saves them.
         * @param {string} textFileString stringified property file
         * @param {functio({undefined|messageObject})} callbackImport Called after import of text file finished. Contains success        
         */
		this.importTexts = function(textFileString, callbackImport) {
			var messageObject;
			var i;
			var len;
			var textFileInformation;
			var applicationId;

			function loadTexts(existingTexts, metadata, messageObject) {
				var injectTextPool;
				var textPool;

				if (messageObject) {
					callbackImport(messageObject);
				} else {
					injectTextPool = {
						instance : {
							messageHandler : messageHandler,
							persistenceProxy : persistenceProxy
						},
						constructor : {
							hashtable : Hashtable
						}
					};
					textPool = new sap.apf.modeler.core.TextPool(injectTextPool, applicationId, existingTexts);
					textPool.addTextsAndSave(textFileInformation.TextElements, callbackImport, applicationId);
				}

			}
			function callbackApplicationHandler(applicationHandler, msgObject) {
				if (msgObject) {
					callbackImport(msgObject);
					return;
				}
				var messageObject;
				var application = applicationHandler.getApplication(applicationId);
				if (!application) {
					messageObject = messageHandler.createMessageObject({
						code : 11021
					});
					callbackImport(messageObject);
					return;

				}

				if (lazyLoaderForConfigurationHandler && lazyLoaderForConfigurationHandler.getId() === applicationId) {					
					lazyLoaderForConfigurationHandler.getInstance().getTextPool().addTextsAndSave(textFileInformation.TextElements, callbackImport, applicationId);
				} else {
					var filterApplication = new sap.apf.core.utils.Filter(messageHandler, 'Application', 'eq', applicationId);
					var filterLanguage = new sap.apf.core.utils.Filter(messageHandler, 'Language', 'eq', sap.apf.core.constants.developmentLanguage);
					filterLanguage.addAnd(filterApplication);
					persistenceProxy.readCollection("texts", loadTexts, undefined, undefined, filterLanguage, true);
				}	
			}

			textFileInformation = sap.apf.utils.parseTextPropertyFile(textFileString, {
				instance : {
					messageHandler : messageHandler
				}
			});
			if (textFileInformation.Messages.length > 0) {

				messageObject = messageHandler.createMessageObject({
					code : 11020
				});
				len = textFileInformation.Messages.length;
				for(i = 0; i < len - 1; i++) {
					textFileInformation.Messages[i + 1].setPrevious(textFileInformation.Messages[i]);

				}
				messageObject.setPrevious(textFileInformation.Messages[len - 1]);
				callbackImport(messageObject);
			} else {
				applicationId = textFileInformation.Application;
				this.getApplicationHandler(callbackApplicationHandler);
			}
		};
		/**
         * @private
         * @function
         * @name sap.apf.modeler.core.instance#importConfiguration
         * @description Receives a string containing analytical configuration and assigned modeler administration data. Contents are saved implicitly. 
         * @param {string} configuration JSON format defined by exportConfiguration method 
         * @param {function(<tbd after alignment, which collision information should be provided>)} callbackConfirmOverwrite Called if configuration contains an already existing configurationID 
         * @param {function(configuration, metadata, messageObject)} callbackImport Called after configuration is saved. Returns configurationID in success case
         */
		this.importConfiguration = function(configuration, callbackConfirmOverwrite, callbackImport) {
            var configObject = JSON.parse(configuration);
            var configHeader = configObject.configHeader;
            var applicationId;
            
            if(!guidsAreValid(configObject, callbackImport)){
            	return;
            }
            
            this.getApplicationHandler(callbackApplicationHandler);

            function guidsAreValid(configObject, callbackImport){
            	var messageObjects = [],
            	    guidsAreValid = true,
            	    textKeys;
            	if(!sap.apf.utils.isValidGuid(configObject.configHeader.Application)){
            		messageObjects.push( messageHandler.createMessageObject({
					        				code : 11037,
					        				aParameters : [ configObject.configHeader.Application ]
					        			}));
            		guidsAreValid = false;
            	}
            	if(!sap.apf.utils.isValidGuid(configObject.configHeader.AnalyticalConfiguration)){
            		messageObjects.push( messageHandler.createMessageObject({
					        				code : 11038,
					        				aParameters : [ configObject.configHeader.AnalyticalConfiguration ]
					        			}));
            		guidsAreValid = false;
            	}
            	textKeys = sap.apf.modeler.core.ConfigurationObjects.getTextKeysFromConfiguration(configObject);
            	textKeys.forEach(function(textKey){
            		var hashTab = new Hashtable(messageHandler);
            		if(!hashTab.hasItem(textKey)){
            			hashTab.setItem(textKey, textKey);
            			if(!sap.apf.utils.isValidGuid(textKey)){
                    		messageObjects.push( messageHandler.createMessageObject({
        					        				code : 11039,
        					        				aParameters : [ textKey ]
        					        			}));
                    		guidsAreValid = false;
                    	}
            		}
            	});
            	if(guidsAreValid){
                	return guidsAreValid;	
            	}
            	messageObjects.forEach(function(messageObject, itemNumber, messageObjects){
            		if(itemNumber){
            			messageObject.setPrevious(messageObjects[itemNumber - 1]);
            		}
            	});
            	callbackImport(configuration, undefined, messageObjects[messageObjects.length - 1]);
            	return guidsAreValid;
            }
                        
            function callbackApplicationHandler(applicationHandler, messageObject){
            	
            	if (messageObject) {
            		callbackImport(undefined, undefined, messageObject);
            		return;
            	}
                var appExists = false;
                var appList = applicationHandler.getList();
                applicationId = configHeader.Application;
                appList.forEach(function(app){
                   if(app.Application === configHeader.Application){
                       appExists = true;
                   }
                });

                if(appExists){
                    that.getConfigurationHandler(configHeader.Application, callbackConfigurationHandler);
                }else{
                    var appObject = {
                        ApplicationName : configHeader.ApplicationName,
                        SemanticObject : configHeader.SemanticObject
                    };
                    applicationHandler.setAndSave(appObject, callbackSetAndSave, configHeader.Application, true);
                }
            }
            function callbackSetAndSave(ApplicationId, metadata, messageObject){
            	
            	if (messageObject) {
            		callbackImport(undefined, undefined, messageObject);
            		return;
            	}
                that.getConfigurationHandler(configHeader.Application, callbackConfigurationHandler);
            }
            function callbackConfigurationHandler(configurationHandler, messageObject){
            	
            	if (messageObject) {
            		callbackImport(undefined, undefined, messageObject);
            		return;
            	}
                var analyticalContent = jQuery.extend({}, configObject, true);
                delete analyticalContent.configHeader;
                var configExists = false;
                var configList = configurationHandler.getList();
                configList.forEach(function(config){
                    if(config.AnalyticalConfiguration === configHeader.AnalyticalConfiguration){
                        configExists = true;
                    }
                });
                if(configExists){
                    callbackConfirmOverwrite(callbackOverwrite, callbackCreateNew);
                }else{
                    configurationHandler.setConfiguration({AnalyticalConfigurationName: configHeader.AnalyticalConfigurationName}, configHeader.AnalyticalConfiguration);
                    var configurationToLoad = {
                        id: configHeader.AnalyticalConfiguration,
                        creationDate: configHeader.CreationUTCDateTime,
                        lastChangeDate: configHeader.LastChangeUTCDateTime,
                        content: analyticalContent
                    };
                    configurationHandler.loadConfiguration(configurationToLoad, callbackLoadConfiguration);
                }
                function callbackOverwrite(){
                    configurationHandler.setConfiguration({AnalyticalConfigurationName: configHeader.AnalyticalConfigurationName}, configHeader.AnalyticalConfiguration);
                    var configurationToLoad = {
                        updateExisting : true,
                        id: configHeader.AnalyticalConfiguration,
                        creationDate: configHeader.CreationUTCDateTime,
                        lastChangeDate: configHeader.LastChangeUTCDateTime,
                        content: analyticalContent
                    };
                    configurationHandler.loadConfiguration(configurationToLoad, callbackLoadConfiguration);
                }
                function callbackCreateNew(){
                    var tempId = configurationHandler.setConfiguration({AnalyticalConfigurationName: configHeader.AnalyticalConfigurationName});
                    var configuration = {
                    		id: tempId, 
                        content: analyticalContent
                    };
                    configurationHandler.loadConfiguration(configuration, callbackLoadConfiguration);
                }
            }
            function callbackLoadConfiguration(configEditor, messageObject) {
            	if (messageObject) {
            		callbackImport(undefined, undefined, messageObject);
            		return;
            	}
                configEditor.save(callbackImport);
            }
           
		};
		/**
         * @private
         * @function
         * @name sap.apf.modeler.core.instance#getApplicationHandler
         * @description Application Handler which manages the applications of the APF Configuration Modeler
         * @param {function(sap.apf.modeler.core.ApplicationHandler, sap.apf.core.MessageObject)} initCallback Function is called after ApplicationHandler is initialized 
         */
		this.getApplicationHandler = function(initCallback) {
			var fnLoadApplicationHandler;
			
			if(!lazyLoaderForApplicationHandler) {
				fnLoadApplicationHandler = (inject && inject.functions && inject.functions.loadApplicationHandler) || loadApplicationHandler;
				lazyLoaderForApplicationHandler = new LazyLoader(injectLazyLoader, fnLoadApplicationHandler);
			}
			
			lazyLoaderForApplicationHandler.asyncGetInstance("ApplicationHandlerId", initCallback);
			
	        function loadApplicationHandler(id, callbackAfterLoad){
	        	 new ApplicationHandler({
	                   instance: {
	                       messageHandler: messageHandler,
	                       persistenceProxy: persistenceProxy
	                   },
	                   constructor: {
	                       hashtable: Hashtable
	                   },
	                   functions: {
							resetConfigurationHandler : resetConfigurationHandler
	                   }
	                   }, setInitializedApplicationHandler);
				function setInitializedApplicationHandler(applicationHandler, messageObject) {
				  callbackAfterLoad(id, applicationHandler, messageObject);
				}
			    function resetConfigurationHandler(application){
			    	if (lazyLoaderForConfigurationHandler && lazyLoaderForConfigurationHandler.getId() === application){
			    		lazyLoaderForConfigurationHandler.getInstance().removeAllConfigurations( );
			    		lazyLoaderForConfigurationHandler.reset();
			    	}
			    }
	        }
		       
		};
	
		/**
         * @private
         * @function
         * @name sap.apf.modeler.core.instance#getConfigurationHandler
         * @description Configuration Handler which manages the configurations of the APF Configuration Modeler
         * @param {string} applicationId
         * @param {function(sap.apf.modeler.core.ConfigurationHandler, sap.apf.core.MessageObject)} callback Function is called after ConfigurationHandler is initialized
         */
		this.getConfigurationHandler = function(applicationId, callback) {
			
			if(!lazyLoaderForConfigurationHandler){
				fnLoadConfigurationHandler = (inject && inject.functions && inject.functions.loadConfigurationHandler) || loadConfigurationHandler;
				lazyLoaderForConfigurationHandler = new LazyLoader(injectLazyLoader, fnLoadConfigurationHandler);
			}
			
            lazyLoaderForConfigurationHandler.asyncGetInstance(applicationId, callback);
            
            function loadConfigurationHandler(applicationId, callbackAfterLoad, oldConfigurationHandler){

    			var filterApplication = new sap.apf.core.utils.Filter(messageHandler, 'Application', 'eq', applicationId);
    			var filterLanguage = new sap.apf.core.utils.Filter(messageHandler, 'Language', 'eq', sap.apf.core.constants.developmentLanguage);
    			filterLanguage.addAnd(filterApplication);

    			var requestConfigurations = [];
    			var selectList = [ "AnalyticalConfiguration", "AnalyticalConfigurationName", "Application", "CreatedByUser", "CreationUTCDateTime", "LastChangeUTCDateTime", "LastChangedByUser" ];
    			requestConfigurations.push({
    				entitySetName : "configuration",
    				filter : filterApplication,
    				selectList : selectList
    			});
    			requestConfigurations.push({
    				entitySetName : 'texts',
    				filter : filterLanguage
    			});

    			persistenceProxy.readCollectionsInBatch(requestConfigurations, initTextPoolAndConfigurationHandler, true);
    			
            	function initTextPoolAndConfigurationHandler(data, messageObject) {

    				var textPool, injectTextPool;
    				var existingAnalyticalConfigurations;
    				var existingTexts;
    				var configurationHandler = oldConfigurationHandler;
    				
    				if (messageObject) {
    					callbackAfterLoad(applicationId, undefined, messageObject);
    				} else {
    					existingAnalyticalConfigurations = data[0];
    					existingTexts = data[1];
    					injectTextPool = {
    							instance : {
    								messageHandler : messageHandler,
    								persistenceProxy : persistenceProxy
    							},
    							constructor : {
    								hashtable : Hashtable
    							}
    					};
    					textPool = new sap.apf.modeler.core.TextPool(injectTextPool, applicationId, existingTexts);

    					if (!configurationHandler) {
    						configurationHandler = new ConfigurationHandler({
    							instance : {
    								messageHandler : messageHandler,
    								persistenceProxy : persistenceProxy,
    								datajs : OData,
    								coreApi : that, 
    								metadataFactory : metadataFactory
    							},
    							constructor : {
    								configurationEditor: ConfigurationEditor,
    								configurationFactory: ConfigurationFactory, 
    								configurationObjects: ConfigurationObjects,
    				        		elementContainer: ElementContainer,
    				        		entityTypeMetadata : EntityTypeMetadata,
                                    facetFilter : FacetFilter,
                                    navigationTarget : NavigationTarget,
    				        		hashtable: Hashtable,
                                    representation: Representation,
                                    registryProbe: RegistryProbe,
                                    step: Step,
    								lazyLoader : LazyLoader
    							}, 
    							functions : {
    								getApplication : lazyLoaderForApplicationHandler.getInstance().getApplication
    							}
    						});
    					}
    					configurationHandler.setApplicationIdAndContext(applicationId, existingAnalyticalConfigurations, textPool);
    					callbackAfterLoad(applicationId, configurationHandler, messageObject);
    				}
    			}
            }
		};
		
		/**
         * @private
         * @function
         * @name sap.apf.modeler.core.instance#getUnusedTextKeys
         * @description Return all unused text keys from the text pool for a certain application 
         * 				application handler needs to be initialized
         * 				only text key usages form the saved configuration data for the application is considered
         * 				unsaved usages are not considered as usages
         * @param {string} applicationId
         * @param {function({Array}, {sap.apf.core.MessageObject})} callback function is called after text keys have been identified
         */
		this.getUnusedTextKeys = function(applicationId, callbackAfterGetUnused) {
			var injectForConfObj = { instance :    {messageHandler   : messageHandler,
			    	                             	persistenceProxy : persistenceProxy},
			    	                 constructor : {hashtable        : Hashtable} };
			var configurationObject = new ConfigurationObjects(injectForConfObj);
					
			var usedTextKeys         = null,
		        messageObject        = null,
		        configurationHandler = null;
			
			// first asynchronous operation: getTextKeysFromAllConfigurations 
			configurationObject.getTextKeysFromAllConfigurations(applicationId, function(textKeys, messageObj){
				 if(messageObject){
					 return;
				 }
				 usedTextKeys  = textKeys;
				 messageObject = messageObj;
				 if(messageObj || configurationHandler){
					 finalizeProcessing(); 
				 }
			 });
			 
			// second asynchronous operation: getConfigurationHandler
			 this.getConfigurationHandler(applicationId, function(confHandler, messageObj){
				 if(messageObject){
					 return;
				 }
				 configurationHandler = confHandler;
				 messageObject        = messageObj;
				 if(messageObj || usedTextKeys){
					 finalizeProcessing(); 
				 }
			 });
			 
			// finalize after both asynchronous operations finished or after first error occurred
			function finalizeProcessing(){
				var unusedTextKeys = [];
			  	if(messageObject){
			   		callbackAfterGetUnused(undefined, messageObject);
			   		return;
			   	}
			  	configurationHandler.getTextPool().getTextKeys().forEach(function(textKey){
			  		if(!usedTextKeys.hasItem(textKey)){
			  			unusedTextKeys.push(textKey);
			  		}
			  	});
			  	callbackAfterGetUnused(unusedTextKeys, undefined);
			 }
				 
		};
		
		/**
         * @private
         * @function
         * @name sap.apf.modeler.core.instance#resetConfigurationHandler
         * @description Reset the configuration handler instance 
         */
		this.resetConfigurationHandler = function( ) {
			if(lazyLoaderForConfigurationHandler){
				lazyLoaderForConfigurationHandler.reset();
			}
		};

		/**
         * @private
         * @function
         * @name sap.apf.modeler.core.instance#getRepresentationTypes
         * @description Return the available representation types 
         */
		 this.getRepresentationTypes = function() {
	        	var origRepresentationTypes = sap.apf.core.representationTypes();
	        	var represenationTypes = [];
	        	jQuery.extend(true, represenationTypes, origRepresentationTypes );
	        	return represenationTypes;  	
	     };
	      
	     /**
	         * @private
	         * @function
	         * @name sap.apf.modeler.core.instance#getAllAvailableSemanticObjects
	         * @description Returns all available semantic objects with id and text by callback function
	         * @param {function(semanticObjects, sap.apf.core.MessageObject)} fnCallback The first argument of the callback function is filled 
	         * with tuples with property id and text of the semantic objects. The second argument is filled in case of errors with 
	         * a messageObject of type sap.apf.core.MessageObject. 
	         */
	     this.getAllAvailableSemanticObjects = function(fnCallback) {
	    	 function returnSemanticObjects(oData, results) { 
	    		 allAvailableSemanticObjects = oData.results;
	    		 fnCallback(oData.results, undefined);
	    	 }
	    	 function returnErrors (oError) { 
	    		 var messageObject;
	    		 if (oError.messageObject) {
	    			 messageObject = oError.messageObject;
	    		 } else {
	    			messageObject = messageHandler.createMessageObject({ code : "11041"});
	    		 }
	    		 fnCallback([], messageObject);
	    	 }
	    	 
	    	 if (allAvailableSemanticObjects) {	    		
	    		 fnCallback(allAvailableSemanticObjects, undefined);
	    		 return;
	    	 }
	    	 var request = {
	    			 requestUri : "/sap/opu/odata/UI2/INTEROP/SemanticObjects?$format=json&$select=id,text",
	    			 method : "GET",
	    			 headers : { "x-csrf-token" : sessionHandler.getXsrfToken("/sap/opu/odata/UI2/INTEROP/SemanticObjects")}
	    	 };
	    	 that.odataRequest(request, returnSemanticObjects, returnErrors);
	     };
	     
	     /**
	         * @private
	         * @function
	         * @name sap.apf.modeler.core.instance#getSemanticActions
	         * @description Returns all available semantic actions for given object with id and text by callback function
	         * @param {string} semanticObject Technical name of a semantic object
	         * @returns promise The argument of the done function is filled 
	         * with array semanticActions (tuples with property id and text of the semantic actions) and semanticObject with id and text. 
	         * Example: { semanticActions : [  { id: "action1", text : "someDescription" }, ...], semanticObject : { id : "someId, text: "objectDescription" }}
	         * The callback function of fail receives as argument the message object!
	         */
	     this.getSemanticActions = function(semanticObject) {
    		 
    		 var cachedSemanticActions;
    		 var deferred = jQuery.Deferred();
    		 
    		 if (!actionsPerSemanticObjectHashTable) {
    			 actionsPerSemanticObjectHashTable = new Hashtable(messageHandler);
    		 }
    		 cachedSemanticActions = actionsPerSemanticObjectHashTable.getItem(semanticObject);
    		 if (cachedSemanticActions) {
    			 
    			 deferred.resolve(cachedSemanticActions);
    			 return deferred.promise();
    		 }
    		 
    		 that.getAllAvailableSemanticObjects(returnActionsWithObject);
    		 
    		 return deferred.promise();
    		 
    		 function returnActionsWithObject(semanticObjects, messageObject) {
    			 
    			 if (messageObject) {
    				 deferred.reject(messageObject);
    				 return;
    			 }
    			 
    			 var navigationService = sap.ushell && sap.ushell.Container && sap.ushell.Container.getService("CrossApplicationNavigation");
        		 var semanticObjectProperties;
        		 var i;
        		 
        		 if (!navigationService) {
        			 deferred.reject(messageHandler.createMessageObject({ code : "5038"}));
        			 return;
        		 }
        		 
        		 for (i = 0; i < semanticObjects.length; i++) {
        			if (semanticObjects[i].id === semanticObject) {
        				semanticObjectProperties = semanticObjects[i];
        				break;
        			}
        		 }
        		 navigationService.getSemanticObjectLinks(semanticObject, undefined, true, inject.instances.component, undefined)
     		 	.done(	function(aIntents) { 
     		 				var semanticActions = [];
     		 			
     		 				aIntents.forEach(function(intentDefinition){
     		 					var actionWithParameters = intentDefinition.intent.split("-");
     		 					var action = actionWithParameters[1].split("?");
     		 					var action = action[0].split("~");
     		 					semanticActions.push({ id : action[0], text  : intentDefinition.text });
     		 				});
     		 				actionsPerSemanticObjectHashTable.setItem(semanticObject, {semanticObject : semanticObjectProperties, semanticActions : semanticActions });
     		 				deferred.resolve({semanticObject : semanticObjectProperties, semanticActions : semanticActions });
     		 	}).fail(function() { 
     		 		deferred.reject(  messageHandler.createMessageObject({ code : "11042"}));
     		 	});
    		 }
    		 
	     };
// -----------------------------------------------------------------------------------------------------		
	    if (inject && inject.probe) {
            //noinspection JSHint,JSLint
            new inject.probe({
                constructor: {
                    applicationHandler: ApplicationHandler,
                    configurationHandler: ConfigurationHandler,
                    configurationEditor: ConfigurationEditor,
                    configurationObjects: ConfigurationObjects,
                    configurationFactory: ConfigurationFactory,
					metadataFactory: MetadataFactory,
					metadata: Metadata,
					entityTypeMetadata : EntityTypeMetadata,
					metadataFacade: MetadataFacade,
					metadataProperty: MetadataProperty,
                    step: Step,
                    facetFilter: FacetFilter,
                    navigationTarget: NavigationTarget,
                    representation: Representation,
                    elementContainer: ElementContainer,
                    hashtable: Hashtable,
                    lazyLoader: LazyLoader,
                    registryProbe: RegistryProbe
                },
                textHandler: textHandler,
                messageHandler: messageHandler,
                sessionHandler: sessionHandler,
                persistenceProxy : persistenceProxy,
                metadataFactory : metadataFactory,
                injectForFollowUp: injectForFollowUp,
                injectMetadataFactory: injectMetadataFactory,
                fnOdataRequestWrapper: fnOdataRequestWrapper,
                ajax : fnAjax,
                odataRequestWrapper: fnOdataRequestWrapper
			});
		}
		
	};

}());
