/*!
 * Copyright (c) 2009-2014 SAP SE, All Rights Reserved
 */
jQuery.sap.declare("sap.ushell.components.factsheet.controls.PictureViewerItem");jQuery.sap.require("sap.ushell.library");jQuery.sap.require("sap.ui.core.Control");sap.ui.core.Control.extend("sap.ushell.components.factsheet.controls.PictureViewerItem",{metadata:{deprecated:true,library:"sap.ushell",properties:{"src":{type:"string",group:"Misc",defaultValue:null}},aggregations:{"image":{type:"sap.m.Image",multiple:false}}}});
/*!
 * @copyright@
*/

sap.ushell.components.factsheet.controls.PictureViewerItem.prototype.setSrc=function(s){this.setProperty("src",s);var i=this.getImage();if(i==null){i=new sap.m.Image();}i.setSrc(s);this.setImage(i);return this;};
sap.ushell.components.factsheet.controls.PictureViewerItem.prototype.exit=function(){var i=this.getImage();if(i){i.destroy();}};
