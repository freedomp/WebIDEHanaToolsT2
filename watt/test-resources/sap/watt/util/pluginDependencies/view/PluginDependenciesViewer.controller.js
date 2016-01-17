/**
 * Created by I058684 on 07/01/2015.
 */
(function() {
    "use strict";
    sap.ui.controller("pluginDependencies.view.PluginDependenciesViewer", {
        onInit : function () {
            var that = this;
            // Names of plugins which were loaded through the "load missing services" button
            this.loadedPlugins = {};
            require(["../test-resources/sap/watt/util/pluginDependencies/view/pluginDependenciesViewerModel"], function (model) {
                var uriParameters = jQuery.sap.getUriParameters();
                var noParamsSent = true;

                // Get all the plugin and service parameters to enable building a tree with several roots
                var rootPluginNames = uriParameters.get("plugin", true);
                that.rootPluginNames = rootPluginNames || [];
                if (rootPluginNames && rootPluginNames.length > 0) {
                    var pluginsListText = that.byId("pluginsList");
                    pluginsListText.setText("Root plugins: " + rootPluginNames.join(", "));
                    pluginsListText.setVisible(true);
                    noParamsSent = false;
                }

                var rootServiceNames = uriParameters.get("service", true);
                that.rootServiceNames = rootServiceNames || [];
                if (rootServiceNames && rootServiceNames.length > 0) {
                    var servicesListText = that.byId("servicesList");
                    servicesListText.setText("Root services: " + rootServiceNames.join(", "));
                    servicesListText.setVisible(true);
                    noParamsSent = false;
                }

                // Current configuration file (should at least contain the plugins specified in "plugin" parameter)
                var configJsonFilePath = uriParameters.get("config");
                if (configJsonFilePath) {
                    var configJsonText = that.byId("configJson");
                    configJsonText.setText("Plugins loaded from: " + configJsonFilePath);
                    configJsonText.setVisible(true);
                    noParamsSent = false;
                }

                // Configuration file with all the available plugins
                var completeConfigJson = uriParameters.get("completeConfig");
                if (completeConfigJson) {
                    var completeConfigJsonText = that.byId("completeConfigJson");
                    completeConfigJsonText.setText("Other plugins available from: " + completeConfigJson);
                    completeConfigJsonText.setVisible(true);
                    noParamsSent = false;
                }

                if (noParamsSent) {
                    that.byId("paramsPanel").setCollapsed(false);
                }

                model.getData(configJsonFilePath, completeConfigJson).then(function (data) {
                    that.data = data;
                    that.displayLoadedServices = false;

                    // Set up the tree
                    var dependenciesTree = that.byId("pluginDependenciesTree");
                    var model = new sap.ui.model.json.JSONModel();
                    that.treeModel = model;
                    dependenciesTree.setModel(model);

                    // Set the tree data and the function for displaying a tree node
                    dependenciesTree.bindNodes("/", function createTreeNode(id, context) {
                        var name = context.getProperty("name");
                        var displayName = name;
                        var expanded = false;
                        // css styles to apply to the tree node text. The styles are defined in the html file.
                        var styles = [];
                        if (context.getProperty("isPlugin")) {
                            styles.push("plugin");
                            if (context.getProperty("providedServices") && context.getProperty("providedServices").length > 0) {
                                displayName += " (provides " + context.getProperty("providedServices").join(", ") + ")";
                            }
                            if (!context.getProperty("isFound")) {
                                displayName += " - not found in config.json";
                                styles.push("notLoaded");
                            } else if (!context.getProperty("isLoaded")) {
                                displayName += " - not loaded";
                                styles.push("notLoaded");
                            } else if (context.getProperty("isCyclic")) {
                                displayName += " - cyclic";
                                styles.push("cyclic");
                            } else if (context.getProperty("isSeen")) {
                                displayName += " - see above";
                                styles.push("seen");
                            } else if (that.loadedPlugins[name]) {
                                displayName += " - loaded";
                                styles.push("loadedPlugin");
                            }
                            if (!context.getProperty("isSeen") && context.getProperty("isLoaded") &&
                                context.getProperty("requiredServices") && context.getProperty("requiredServices").length > 0) {
                                context.getProperty("requiredServices").forEach(function (service) {
                                    if (!service.isSeen) {
                                        expanded = true;
                                    }
                                });
                            }
                        } else if (context.getProperty("isService")) {
                            styles.push("service");
                            if (context.getProperty("isCyclic")) {
                                displayName += " - cyclic";
                                styles.push("cyclic");
                            } else if (context.getProperty("isSeen")) {
                                displayName += " - see above";
                                styles.push("seen");
                            } else if (!context.getProperty("loadedProvidingPlugins") || context.getProperty("loadedProvidingPlugins").length === 0) {
                                displayName += " - not provided";
                                styles.push("notProvided");
                            } else if (context.getProperty("loadedProvidingPlugins") && context.getProperty("loadedProvidingPlugins").length > 1) {
                                displayName += " - provided by several plugins";
                                styles.push("conflicting");
                            }
                            if (context.getProperty("providedByPlugins") && context.getProperty("providedByPlugins").length > 0 && !context.getProperty("isSeen")) {
                                context.getProperty("providedByPlugins").forEach(function (plugin) {
                                    if (!plugin.isSeen) {
                                        expanded = true;
                                    }
                                });
                            }
                        }
                        var treeNode = new sap.ui.commons.TreeNode({text : displayName, expanded : expanded});
                        styles.forEach(function (style) {
                            treeNode = treeNode.addStyleClass(style);
                        });
                        return treeNode;
                    });

                    // Set up the unrelated plugins list
                    var unrelatedPlugins = that.byId("unrelatedPlugins");
                    var pluginsModel = new sap.ui.model.json.JSONModel();
                    that.unrelatedPluginsModel = pluginsModel;
                    unrelatedPlugins.setModel(pluginsModel);
                    unrelatedPlugins.bindRows("/");
                    unrelatedPlugins.bindProperty("visibleRowCount", "/length");

                    // Build the tree nodes
                    that.refreshTree().then(function () {
                        that.refreshErrorTexts();

                        // Check if the "load missing plugins" button should be displayed
                        var loadMissingServicesButton = that.byId("loadMissingServices");
                        loadMissingServicesButton.setVisible(hasMissingServices(that.treeData.treeNodes, that.data.services, true));

                        // Remove "loading" text
                        that.setLoadingVisible(false);
                    });
                }).catch(function (err) {
                   // Ignore the error and write it to the log
                    console.error(err.message);
                }).done();
            });
        },
        setLoadingVisible : function(isVisible) {
            var loadingText = this.byId("loading");
            loadingText.setVisible(isVisible);
        },
        onLoadMissingServices : function() {
            var that = this;

            // This could take a while so it's done asynchronously. The loading text should be displayed meanwhile.
            this.setLoadingVisible(true);
            Q.try(function () {
                // This is done in a while loop because after loading the first set of missing plugins, more
                // plugins could be missing (if the loaded services require them and they aren't provided by any
                // loaded plugin)
                while (hasMissingServices(that.treeData.treeNodes, that.data.services, true)) {
                    visitTree(that.treeData.treeNodes, function (node) {
                        // isSeen check is done to ensure each service is only checked once
                        if (node.isService && !node.isSeen) {
                            var service = that.data.services[node.name];
                            if (isMissingService(service, true)) {
                                // We always take the first plugin that provides the service
                                service.loadedProvidingPlugins = [service.providedByPlugins[0]];
                                var loadedPluginName = service.providedByPlugins[0];
                                that.data.plugins[loadedPluginName].isLoaded = true;
                                that.loadedPlugins[loadedPluginName] = true;
                            }
                        }
                    });
                    // Re-build the tree so we can check if there are still missing services
                    that.treeData = buildTree(that.rootPluginNames, that.rootServiceNames, that.data.plugins, that.data.services, that.displayLoadedServices);
                }
                // Refresh the tree and list
                that.treeModel.setData(that.treeData.treeNodes);
                that.unrelatedPluginsModel.setData(that.treeData.unrelatedPlugins);

                // No need for the button now. Note: if we want to add an "undo" button, this is a good place to make it visible
                // (in case changes were made).
                var loadMissingServicesButton = that.byId("loadMissingServices");
                loadMissingServicesButton.setVisible(false);

                that.refreshErrorTexts();

                that.setLoadingVisible(false);
            }).done();
        },
        toggleDisplayLoadedServices : function() {
            this.displayLoadedServices = this.byId("displayLoadedServices").getProperty("checked");
            this.refreshTree().done();
        },
        refreshTree : function() {
            // This could take a while so we do it asynchronously. The loading text should be displayed meanwhile.
            var that = this;
            that.setLoadingVisible(true);
            return Q.try(function () {
                that.treeData = buildTree(that.rootPluginNames, that.rootServiceNames, that.data.plugins, that.data.services, that.displayLoadedServices);
                that.treeModel.setData(that.treeData.treeNodes);
                that.unrelatedPluginsModel.setData(that.treeData.unrelatedPlugins);
                that.setLoadingVisible(false);
            });
        },
        refreshErrorTexts : function() {
            var missingServices = this.byId("missingServicesAvailable");
            missingServices.setVisible(hasMissingServices(this.treeData.treeNodes, this.data.services));

            var conflictingServices = this.byId("conflictingServicesAvailable");
            conflictingServices.setVisible(hasConflictingServices(this.treeData.treeNodes, this.data.services));
        }
    });

    // Check if a service is not provided by any loaded plugins but there is at least one plugin which isn't loaded
    // and provides the service
    function isMissingService(service, providedByUnloadedPlugin) {
        // If the service doesn't exist, nothing provides it, so only return true if we want to return services that can't
        // be provided
        if (!service) {
            return !providedByUnloadedPlugin;
        }
        return ((!service.loadedProvidingPlugins || service.loadedProvidingPlugins.length === 0) &&
            (!providedByUnloadedPlugin || service.providedByPlugins && service.providedByPlugins.length > 0));
    }

    function hasMissingServices(treeNodes, services, providedByUnloadedPlugin) {
        var missingServiceFound = false;
        visitTree(treeNodes, function (node) {
            if (node.isService && isMissingService(services[node.name], providedByUnloadedPlugin)) {
                missingServiceFound = true;
                return true; // break
            }
        });
        return missingServiceFound;
    }

    function hasConflictingServices(treeNodes, services) {
        var conflictingServiceFound = false;
        visitTree(treeNodes, function (node) {
            var service = node.isService && services[node.name];
            if (service && service.loadedProvidingPlugins && service.loadedProvidingPlugins.length > 1) {
                conflictingServiceFound = true;
                return true; // break
            }
        });
        return conflictingServiceFound;
    }

    // Visit the tree nodes. The callback is called for each node (parent before its children).
    // Returning true from the callback stops the visitor. By default, the function only visits
    // loaded plugins (and any service), this can be changed by sending visitUnloadedPlugins = true.
    function visitTree(treeNodes, callback, visitUnloadedPlugins) {
        if (!treeNodes) {
            return false;
        }
        var stop = false;
        treeNodes.forEach(function (node) {
            // Only visit plugins which are not loaded if required
            if (node.isPlugin && !node.isLoaded && !visitUnloadedPlugins) {
                return;
            }

            // There is no way to break a foreach loop so we just don't invoke the callback
            // if stopping was requested
            if (!stop) {
                stop = callback(node);
                if (stop) {
                    return;
                }
                if (node.isPlugin) {
                    stop = visitTree(node.requiredServices, callback);
                } else if (node.isService) {
                    stop = visitTree(node.providedByPlugins, callback);
                }
            }
        });
        return stop;
    }

    function buildTree(rootPluginNames, rootServiceNames, plugins, services, showProvidedServices) {
        var seen = {};

        // Build the tree data
        var data = [];
        rootPluginNames.forEach(function (rootPluginName) {
            addPlugin(rootPluginName, data, {});
        });
        rootServiceNames.forEach(function (rootServiceName) {
            addService(rootServiceName, data, {}, showProvidedServices);
        });

        // Find unrelated plugins
        var unrelatedPlugins = [];
        for (var pluginName in plugins) {
            var plugin = plugins[pluginName];
            var pluginKey = getPluginKey(plugin, pluginName);
            if (plugin.isLoaded && !seen[pluginKey]) {
                unrelatedPlugins.push({ "name" : plugin.name });
            }
        }

        return { treeNodes : data, unrelatedPlugins : unrelatedPlugins };

        function getPluginKey(plugin, pluginName) {
            return "plugin " + (plugin ? plugin.name : pluginName);
        }
        function getServiceKey(service, serviceName) {
            return "service " + serviceName;
        }
        function getKey(treeNode, name) {
            if (treeNode.isPlugin) {
                return getPluginKey(treeNode, name);
            } else if (treeNode.isService) {
                return getServiceKey(treeNode, name);
            }
            return "";
        }

        // Create a plugin node and add it to the plugins list
        function addPlugin(pluginName, pluginsList, parentNodes) {
            // Plugin tree node properties:
            // name
            // isPlugin
            // isFound
            // isLoaded
            // isSeen
            // isCyclic
            // requiredServices -> list of service tree nodes
            // providedServices (set in addService function) -> list of service names
            var plugin;
            var pluginNode;
            try{
                plugin = plugins[pluginName];
            } catch (err) {
                // Ignore - it means the plugin name doesn't exist in any of the provided configuration files
            }
            var key = getPluginKey(plugin, pluginName);
            if (!plugin) {
                pluginNode = { name : pluginName, isPlugin : true, isFound : false, isLoaded : false, requiredServices : [] };
            } else if (key in parentNodes) {
                pluginNode = { name : plugin.name, isPlugin : true, isFound : true, isLoaded : plugin.isLoaded, isSeen : true, isCyclic : true, requiredServices : [] };
            } else {
                var isSeen = key in seen;
                seen[key] = true;
                var requiredServices = [];
                parentNodes = Object.create(parentNodes);
                parentNodes[key] = true;
                plugin.requiredServices.forEach(function (serviceName) {
                    addService(serviceName, requiredServices, parentNodes, showProvidedServices);
                });
                pluginNode = { name : plugin.name, isPlugin : true, isFound : true, isLoaded : plugin.isLoaded, isSeen : isSeen, requiredServices : requiredServices };
            }
            pluginsList.push(pluginNode);
            return pluginNode;
        }

        // Create a service node and add it to the services list. If showProvidedServices is false and the service is provided,
        // the service node isn't added to the list and instead its providing plugins are added to the list (with a list of the
        // services they provide).
        function addService(serviceName, servicesList, parentNodes, showProvidedServices) {
            // Service tree node properties:
            // name
            // isService
            // providedByPlugins -> list of plugins tree nodes
            // loadedProvidingPlugins -> list of plugin names
            // isSeen
            // isCyclic

            // Get the service data
            var service;
            var serviceNode;
            try {
                service = services[serviceName];
            } catch (err) {
                // Ignore - it means the service isn't provided by any of the plugins
            }

            var key = getServiceKey(service, serviceName);
            if (!service || !service.providedByPlugins || service.providedByPlugins.length === 0) {
                serviceNode = { name : serviceName, isService : true, providedByPlugins : [] };
            } else if (key in parentNodes && (showProvidedServices || service.loadedProvidingPlugins.length !== 1)) {
                serviceNode = { name : serviceName, isService : true, providedByPlugins : [], isSeen : true, isCyclic : true };
            } else {
                var isSeen = key in seen;
                seen[key] = true;
                var pluginsList = [];
                parentNodes = Object.create(parentNodes);
                parentNodes[key] = true;
                service.providedByPlugins.forEach(function (pluginName) {
                    addPlugin(pluginName, pluginsList, parentNodes);
                });
                serviceNode = { name : serviceName, isService : true, providedByPlugins : pluginsList, loadedProvidingPlugins : service.loadedProvidingPlugins, isSeen : isSeen };
            }
            if (!showProvidedServices && serviceNode.loadedProvidingPlugins && serviceNode.loadedProvidingPlugins.length === 1) {
                pluginsList.forEach(function(plugin) {
                    var addToPluginsList = true;
                    if (plugin.isSeen) {
                        // If the plugin was already seen, it might have been in the same level. Search for it and if it
                        // is, only add the service name instead of another instance of the plugin.
                        servicesList.forEach(function (existingPlugin) {
                            // There might be services in the list if they have errors
                            if (existingPlugin.isPlugin && existingPlugin.name === plugin.name) {
                                plugin = existingPlugin;
                                addToPluginsList = false;
                            }
                        });
                    }
                    if (!plugin.providedServices) {
                        plugin.providedServices = [];
                    }
                    plugin.providedServices.push(serviceNode.name);
                    if (addToPluginsList) {
                        servicesList.push(plugin);
                    }
                });
            } else {
                servicesList.push(serviceNode);
            }
            return serviceNode;
        }
    }
}());
