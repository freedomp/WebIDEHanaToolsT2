/*!
 * SAP APF Analysis Path Framework
 * 
 * (c) Copyright 2012-2014 SAP AG. All rights reserved
 */
jQuery.sap.declare("sap.apf.core.metadataFactory");
sap.apf.core.MetadataFactory=function(i){this.type="metadataFactory";var t=this;var m=i.messageHandler;var c=i.configurationFactory;var h=i.hashtable;var M=i.metadata;var e=i.entityTypeMetadata;var f=i.metadataFacade;delete i.metadata;delete i.entityTypeMetadata;delete i.metadataFacade;delete i.metadataProperty;delete i.configurationFactory;var o=new h(m);this.getMetadata=function(a){var b;if(o.hasItem(a)===false){b=new M(i,a);if(!b.failed){o.setItem(a,{metadata:b});}else{return;}}return o.getItem(a).metadata;};this.getEntityTypeMetadata=function(a,E){var b;var d=this.getMetadata(a);b=o.getItem(a).entityTypes;if(!b){b=new h(m);o.getItem(a).entityTypes=b;}if(!b.getItem(E)){b.setItem(E,new e(m,E,d));}return b.getItem(E);};this.getMetadataFacade=function(a){return new f({messageHandler:m,metadataProperty:sap.apf.core.MetadataProperty,metadataFactory:t},a);};this.getServiceDocuments=function(){return c.getServiceDocuments();};this.getEntitySets=function(s){var a=this.getMetadata(s);return a.getEntitySets();};};
