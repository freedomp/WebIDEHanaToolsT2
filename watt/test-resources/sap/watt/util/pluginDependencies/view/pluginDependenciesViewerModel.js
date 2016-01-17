/**
 * Created by I058684 on 05/01/2015.
 */
define(["sap/watt/core/Core", "sap/watt/core/PluginRegistry"], function (Core, PluginRegistry) {
    "use strict";
    return {
        getData : function getData(configJsonFilePath, completeConfigJson) {
            var data = Q.defer();
            Core.getService().then(function (coreService) {
                coreService.attachEventOnce("allPluginsStarted", function () {
                    // Get the config service
                    var oConfig = PluginRegistry.$getServiceRegistry().get("config");

                    // Load all plugins from config.json file
                    loadPluginsFromConfig(configJsonFilePath).then(function (loadedPlugins) {
                        loadPluginsFromConfig(completeConfigJson).then(function () {
                            var actualData = createData(
                                _.mapValues(PluginRegistry._mRegistry, function (value, key) {
                                    return PluginRegistry.get(key);
                                }),
                                loadedPlugins || []);

                            data.resolve({ plugins : actualData.plugins, services : actualData.services});
                        });
                    }).done();

                    function loadPluginsFromConfig(configFilePath) {
                        if (!configFilePath) {
                            return Q();
                        }
                        return oConfig.load(configFilePath).then(function (mConfig) {
                            return PluginRegistry._registerPlugins(mConfig.plugins, false, mConfig.pluginExtensions).then(function (aPlugins) {
                                // Register services
                                var loadedPlugins = {};
                                for (var pluginName in PluginRegistry._mRegistry) {
                                    loadedPlugins[PluginRegistry.get(pluginName).name] = true;
                                }
                                return loadedPlugins;
                            });
                        });
                    }
                });
            });

            return data.promise;

            function createData(pluginsMetadata, loadedPlugins) {
                /**
                 * @type {{[string] : {
                 *  providedByPlugins : [string],
                 *  loadedProvidingPlugins : [string]
                 * }}}
                 */
                var services = {};

                /**
                 * @type {{[string] : {
                 *  name : string,
                 *  isLoaded : boolean,
                 *  providedServices : [string],
                 *  requiredServices : [string]
                 * }}}
                 */
                var plugins = {};

                // Go over the plugins and for each plugin add the plugin data and its services
                for (var pluginName in pluginsMetadata) {
                    var pluginData = {};
                    var plugin = pluginsMetadata[pluginName];
                    pluginData.name = plugin.name;
                    pluginData.isLoaded = pluginData.name in loadedPlugins;
                    pluginData.requiredServices = plugin.requires.services;
                    pluginData.providedServices = Object.keys(plugin.provides.services);
                    pluginData.providedServices.forEach(function (serviceName) {
                        var serviceData = services[serviceName] || { providedByPlugins : [], loadedProvidingPlugins : [] };
                        services[serviceName] = serviceData;
                        serviceData.providedByPlugins.push(pluginData.name);
                        if (pluginData.isLoaded) {
                            serviceData.loadedProvidingPlugins.push(pluginData.name);
                        }
                    });

                    plugins[pluginData.name] = pluginData;
                }

                return {
                    services : services,
                    plugins : plugins
                };
            }
       }
    };
});
