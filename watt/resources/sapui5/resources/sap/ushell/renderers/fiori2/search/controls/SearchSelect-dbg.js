/* global jQuery, sap, window */
(function() {
    "use strict";

    jQuery.sap.require('sap.m.Select');

    sap.m.Select.extend('sap.ushell.renderers.fiori2.search.controls.SearchSelect', {

        constructor: function(sId, options) {
            options = jQuery.extend({}, {
                visible: "{/businessObjSearchEnabled}",
                autoAdjustWidth: true,
                maxWidth: "16rem",
                items: {
                    path: "/dataSources",
                    template: new sap.ui.core.Item({
                        key: "{key}",
                        text: "{labelPlural}"
                    })
                },
                selectedKey: {
                    path: '/dataSource/key',
                    mode: sap.ui.model.BindingMode.OneWay
                },
                change: function(event) {
                    var item = this.getSelectedItem();
                    var context = item.getBindingContext();
                    var dataSource = context.getObject();
                    this.getModel().setDataSource(dataSource, false);
                    this.getModel().abortSuggestions();
                }
            }, options);
            sap.m.Select.prototype.constructor.apply(this, [sId, options]);
            this.addStyleClass('searchSelect');
        },

        renderer: 'sap.m.SelectRenderer',

        setDisplayMode: function(mode) {
            if (mode === 'icon') {
                this.setType(sap.m.SelectType.IconOnly);
                this.setIcon('sap-icon://slim-arrow-down');
            }
        }

    });

})();
