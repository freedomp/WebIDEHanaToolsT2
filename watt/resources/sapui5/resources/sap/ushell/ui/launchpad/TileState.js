/*!
 * Copyright (c) 2009-2014 SAP SE, All Rights Reserved
 */
jQuery.sap.declare("sap.ushell.ui.launchpad.TileState");jQuery.sap.require("sap.ushell.library");jQuery.sap.require("sap.ui.core.Control");sap.ui.core.Control.extend("sap.ushell.ui.launchpad.TileState",{metadata:{library:"sap.ushell",properties:{"state":{type:"string",group:"Misc",defaultValue:'Loaded'}}}});jQuery.sap.require("sap.m.Text");jQuery.sap.require("sap.ui.core.IconPool");
sap.ushell.ui.launchpad.TileState.prototype.init=function(){this._rb=sap.ushell.resources.i18n;this._sFailedToLoad=this._rb.getText("cannotLoadTile");this._oWarningIcon=new sap.ui.core.Icon(this.getId()+"-warn-icon",{src:"sap-icon://notification",size:"1.37rem"});this._oWarningIcon.addStyleClass("sapSuiteGTFtrFldIcnMrk");};
sap.ushell.ui.launchpad.TileState.prototype.exit=function(){this._oWarningIcon.destroy();};
sap.ushell.ui.launchpad.TileState.prototype.setState=function(s,i){this.setProperty("state",s,i);return this;};
