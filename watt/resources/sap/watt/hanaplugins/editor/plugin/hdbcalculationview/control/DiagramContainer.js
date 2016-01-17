/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
sap.ui.core.HTML.extend("sap.watt.hanaplugins.editor.plugin.hdbcalculationview.control.DiagramContainer", {

    metadata: {
        events: {
            "exit": {}
        }
    },
    exit: function() {
        this.fireExit();
    },
    
    renderer: {}

});
