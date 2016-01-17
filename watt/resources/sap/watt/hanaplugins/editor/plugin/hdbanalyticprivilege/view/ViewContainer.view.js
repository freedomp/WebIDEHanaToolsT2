/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
sap.ui.jsview("sap.watt.hanaplugins.editor.plugin.hdbanalyticprivilege.view.ViewContainer", {

    createContent: function(oController) {
        this.setHeight("100%");

        var oLayout = new sap.ui.commons.layout.AbsoluteLayout(this.createId("viewcontainer"), {
            width: "100%",
            height: "100%"
        });

        return oLayout;
    }
});
