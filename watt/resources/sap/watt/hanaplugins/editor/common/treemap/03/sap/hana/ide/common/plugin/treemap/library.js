/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/

/**
 * Initialization Code and shared classes of library com.sap.it.spc.webui.mapping (0.0)
 */
jQuery.sap.declare("sap.hana.ide.common.plugin.treemap.library");
jQuery.sap.require("sap.ui.core.Core");
/**
 * [Enter description for com.sap.it.spc.webui.mapping]
 *
 * @namespace
 * @name com.sap.it.spc.webui.mapping
 * @public
 */


// library dependencies
jQuery.sap.require("sap.ui.core.library");

// delegate further initialization of this library to the Core
sap.ui.getCore().initLibrary({
  name : "sap.hana.ide.common.plugin.treemap",
  dependencies : ["sap.ui.core","com.sap.it.spc.webui.mapping"],
  types: [],
  interfaces: [],
  controls: [
    "sap.hana.ide.common.plugin.treemap.MappingControlEx"
  ],
  elements: [],
  version: "0.0"});

