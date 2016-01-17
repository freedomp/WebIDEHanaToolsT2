/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
sap.ui.define(["sap/ui/ux3/NavigationItem" ], function(NavigationItem) {

    var NavigationItemTab = NavigationItem.extend("sap.watt.hanaplugins.editor.plugin.hdbcalculationview.view.NavigationItemTab", {

        metadata: {
            properties : {
                isProxy: {type : "boolean"}
            }
        }
          
    });

    return NavigationItemTab;

}, true);
