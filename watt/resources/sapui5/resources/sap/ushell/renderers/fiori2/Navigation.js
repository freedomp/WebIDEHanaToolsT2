// Copyright (c) 2009-2014 SAP SE, All Rights Reserved
(function(){"use strict";jQuery.sap.declare("sap.ushell.renderers.fiori2.Navigation");sap.ushell.renderers.fiori2.Navigation=function(){this.SEARCH={ID:"ShellSearch",SEMANTICOBJECT:"shell",ACTION:"search"};sap.ushell.Container.getService("NavTargetResolution").registerCustomResolver({name:"Search App Container",isApplicable:function(h){return h==="#Action-search";},resolveHashFragment:function(h){var d=new jQuery.Deferred(),r={};if(h==="#Action-search"){r={"additionalInformation":"SAPUI5.Component=sap.ushell.renderers.fiori2.search.container","applicationType":"URL","url":jQuery.sap.getResourcePath("sap/ushell/renderers/fiori2/search/container")};}d.resolve(r);return d.promise();}});};sap.ushell.Container.getService("NavTargetResolution").registerCustomResolver({name:"FLP Resolver",isApplicable:function(h){return h==="#Shell-home"||h==="#shell-catalog";},resolveHashFragment:function(h){var d=new jQuery.Deferred(),r={};if(h==="#Shell-home"||h==="#shell-catalog"){r={"additionalInformation":"SAPUI5.Component=sap.ushell.components.flp","applicationType":"URL","url":jQuery.sap.getResourcePath("sap/ushell/components/flp")};}d.resolve(r);return d.promise();}});sap.ushell.renderers.fiori2.Navigation=new sap.ushell.renderers.fiori2.Navigation();}());