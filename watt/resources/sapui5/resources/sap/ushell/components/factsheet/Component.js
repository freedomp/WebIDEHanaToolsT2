jQuery.sap.declare("sap.ushell.components.factsheet.Component");jQuery.sap.require("sap.ui.core.UIComponent");sap.ui.core.UIComponent.extend("sap.ushell.components.factsheet.Component",{oMainView:null,metadata:{version:"1.32.6",library:"sap.ushell.components.factsheet",includes:["css/custom.css"],dependencies:{libs:["sap.m","sap.ui.vbm","sap.suite.ui.commons","sap.ui.layout","sap.viz"],components:[]}},createContent:function(){var c=this.getComponentData();var s=(c&&c.startupParameters)||{};this.oMainView=sap.ui.view({type:sap.ui.core.mvc.ViewType.JS,viewName:"sap.ushell.components.factsheet.views.ThingViewer",viewData:s,height:"100%"}).addStyleClass("ThingViewer");return this.oMainView;},exit:function(){window.console.log("On Exit of factsheet Component.js called : this.getView().getId()"+this.getId());},onExit:function(){window.console.log("On Exit of factsheet Component.js called : this.getView().getId()"+this.getId());}});jQuery.sap.setObject("factsheet.Component",sap.ushell.components.factsheet.Component);
