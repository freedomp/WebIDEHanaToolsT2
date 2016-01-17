
// see http://requirejs.org/docs/node.html#nodeModules
if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}


define(["../lib/lodash/lodash"], function (_) {
    "use strict";

    /**
     * @param mAllServices {Object.<string, Proxy>} The Services Proxies to check
     *
     * @return {Promise.<string, Array.<string>>} a Promise for a map between a Service's name and the missing methods names for that service
     *         for services which have no missing methods no key will exist in said map. this means that if no issues have been detected
     *         an "empty" map will be returned.
     */
    function checkAllMethodsOnInterfaceImplemented_forAll(mAllServices) {

        function getProxyImpl(oProxy) {
            return oProxy._getImpl().then(function (oImplProxy) {
                return oImplProxy._getImpl();
            });
        }

        var mServiceNameToInterfaceAndImplPromise = _.mapValues(mAllServices, function (oServiceProxy) {
            return {
                expectedInterface: oServiceProxy._oInterface,
                actualImplPromise: getProxyImpl(oServiceProxy)
            };
        });


        var aAllImplPromises = _.map(mServiceNameToInterfaceAndImplPromise, function (oInterfaceAndImplPromise) {
            return oInterfaceAndImplPromise.actualImplPromise;
        });

        return Q.all(aAllImplPromises).then(function (aActualImpls) {
            var i = 0;
            var mServiceNameToInterfaceAndRealImpl = _.mapValues(mServiceNameToInterfaceAndImplPromise, function (oInterfaceAndImplPromise) {
                return {
                    expectedInterface: oInterfaceAndImplPromise.expectedInterface,
                    actualImpl: aActualImpls[i++] // replace the promise with the actual implementation
                };
            });

            var mServiceNameToUnimplementedMethods = _.mapValues(mServiceNameToInterfaceAndRealImpl, function (oInterfaceAndRealImpl) {
                return checkAllMethodsOnInterfaceImplemented(oInterfaceAndRealImpl);
            });


            var mfilterdWithoutValidServices = _.omit(mServiceNameToUnimplementedMethods, function (aUnImplementedMethods) {
                return _.isEmpty(aUnImplementedMethods);
            });

            return mfilterdWithoutValidServices;
        });
    }

    /**
     * @param oInterfaceAndImpl
     *          {{expectedInterface: Interface,
     *            actualImpl: ?}}
     *        The interface definition to match against
     *
     * @return {Array.<string>} A vector made up of the names of the interface methods missing their implementation
     */
    function checkAllMethodsOnInterfaceImplemented(oInterfaceAndImpl) {
        var oExpectedInterface = oInterfaceAndImpl.expectedInterface;
        var oActualImpl = oInterfaceAndImpl.actualImpl;
        var aAllExpectedMethods = _getAllMethodsInterfaceDeclares(oExpectedInterface);
        var aAllActualFunctionNames = _.functions(oActualImpl);

        var aUnImplementedMethods = _.difference(aAllExpectedMethods, aAllActualFunctionNames);
        return aUnImplementedMethods;
    }

    /**
     * @param oTargetInterface {Interface} The interface definition to match against
     *
     * @return {Array.<string>} A vector made up of the names of all the methods the interface declares
     */
    function _getAllMethodsInterfaceDeclares(oTargetInterface) {
        // assumption : _mInterfaces contains all the interfaces targetInterface extends, even if those are indirect
        var aAllMethodsDeclaredArrs = _.map(oTargetInterface._mInterfaces, function (oExtendedInterface) {
            return _.keys(_.omit(oExtendedInterface.methods, function(vMethodValue) {
                // If method has default return value we don't need to check it
                return vMethodValue.returns && vMethodValue.returns.hasOwnProperty("default");
            }));
        });

        var aAllMethodsDeclared = _.union(_.flatten(aAllMethodsDeclaredArrs));
        return aAllMethodsDeclared;
    }

    /**
     * @param oPluginMetaDataToCheck {?} the "json" definition of a plugin
     * @param vSchemaInfo {Array.<string> | Array.<Object> } vector of all the provided services names or
     *        a vector of all existing plugins metadata
     * @param {Array.<string>} [aServicesAssumingProvided] Array of services assuming as provided
     * 
     * @return {Array.<string>} a vector of service names which are required by oPluginMetaDataToCheck
     *         but are not provided by the vector of aAllPluginsMetaData
     */
    function checkMissingRequiredServices(oPluginMetaDataToCheck, vSchemaInfo, aServicesAssumingProvided) {
        var providedServiceNames = [];
        //if (_.isEmpty(vSchemaInfo)) {
            // do nothing but we must make this check because _.first([]) --> []
        //}
        if (_.isString(_.first(vSchemaInfo))) {
            providedServiceNames = vSchemaInfo;
        } else if (_.isObject(_.first(vSchemaInfo))) {
            providedServiceNames = _getAllProvidedServices(vSchemaInfo);
        }

        if (aServicesAssumingProvided) {
            providedServiceNames = _.union(providedServiceNames, aServicesAssumingProvided);
        }

        var bHasRequiredServices = _hasRequiredServices(oPluginMetaDataToCheck);
        var aRequired = bHasRequiredServices ? oPluginMetaDataToCheck.requires.services : [];

        return _.difference(aRequired, providedServiceNames);
    }

    /**
     * @param aAllPluginsMetaData {Array.<Object>} vector of  "json" definitions of a plugins
     *
     * @return {Array.<string>} a vector of all the provided service names by the input plugin definitions
     */
    function _getAllProvidedServices(aAllPluginsMetaData) {
        var aAllProvidedArrs = _.map(aAllPluginsMetaData, function (oPluginMetaData) {
            var hasProvidedServices = _hasProvidedServices(oPluginMetaData);
            return hasProvidedServices ? _.keys(oPluginMetaData.provides.services) : [];
        });

        return _.unique(_.flatten(aAllProvidedArrs));
    }

    /**
     *
     * @param oPluginMetaData {?} the "json" definition of a plugin
     *
     * @return {Array.<string>} a vector of service names which are configured by the plugin, but are not required
     *         either explicitly (in required section) or implicitly due to being provided by the plugin
     *         if not issues detected an empty array will be returned
     */
    function checkConfiguredServicesWhichAreNotRequiredOrProvided(oPluginMetaData) {
        if (!_hasConfiguredServices(oPluginMetaData)) {
            return [];
        }

        var bHasRequiredServices = _hasRequiredServices(oPluginMetaData);

        var hasProvidedServices = _hasProvidedServices(oPluginMetaData);

        var aRequired = bHasRequiredServices ? oPluginMetaData.requires.services : [];
        var aProvided = hasProvidedServices ? _.keys(oPluginMetaData.provides.services) : [];

        var aConfiguredFullName = _.keys(oPluginMetaData.configures.services);
        var aConfiguredName = _.map(aConfiguredFullName, function (sFullName) {
            return sFullName.split(":")[0];
        });

        var aConfiguredButNotRequired = _.reject(aConfiguredName, function (sConfiguredServiceName) {
            return _.contains(aRequired, sConfiguredServiceName);
        });

        var aConfiguredButNotProvided = _.reject(aConfiguredName, function (sConfiguredServiceName) {
            return _.contains(aProvided, sConfiguredServiceName);
        });

        return _.intersection(aConfiguredButNotRequired, aConfiguredButNotProvided);
    }

    /**
     * @param obj {object}
     * @return {boolean}
     */
    function _hasConfiguredServices(obj) {
        return _.isObject(obj.configures) && _.isObject(obj.configures.services);
    }

    /**
     * @param obj {object}
     * @return {boolean}
     */
    function _hasProvidedServices(obj) {
        return _.isObject(obj.provides) && _.isObject(obj.provides.services);
    }

    /**
     * @param obj {object}
     * @return {boolean}
     */
    function _hasRequiredServices(obj) {
        return _.isObject(obj.requires) && _.isArray(obj.requires.services);
    }

    return {
        checkAllMethodsOnInterfaceImplemented_forAll: checkAllMethodsOnInterfaceImplemented_forAll,
        checkAllMethodsOnInterfaceImplemented: checkAllMethodsOnInterfaceImplemented,
        checkConfiguredServicesWhichAreNotRequiredOrProvided: checkConfiguredServicesWhichAreNotRequiredOrProvided,
        checkMissingRequiredServices: checkMissingRequiredServices
    };

});