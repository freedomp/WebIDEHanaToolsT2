/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
sap.ui.commons.AutoComplete.extend("sap.watt.hanaplugins.editor.plugin.hdbcalculationview.control.AutoComplete", {

    metadata: {
        properties: {
            "hasFocus" : {type : "boolean", defaultValue : true},
        },
        events: {
            "focus": {},
            "blur": {}
        }
    },

    onfocusin: function(event) {
        sap.ui.commons.AutoComplete.prototype.onfocusin.call(this, event);
        this.fireFocus();
    },
    
    onsapfocusleave: function(event) {
        sap.ui.commons.AutoComplete.prototype.onsapfocusleave.call(this, event);
        this.fireBlur();
    },

    renderer: {}

});
