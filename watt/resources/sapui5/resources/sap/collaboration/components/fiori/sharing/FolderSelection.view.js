/*!
 * @copyright@
 */
sap.ui.jsview("sap.collaboration.components.fiori.sharing.FolderSelection",{getControllerName:function(){return"sap.collaboration.components.fiori.sharing.FolderSelection";},createContent:function(c){var p=this.getViewData().controlId;this.oFoldersList=new sap.m.List(p+"_FoldersList",{inset:false,showNoData:false,growing:true,growingThreshold:c.constants.top,updateStarted:function(C){c.updateStarted(C);}});var d=new sap.m.VBox(p+"_DisplayFoldersLayout",{width:"100%",height:"100%",items:[this.oFoldersList]});return d;}});
