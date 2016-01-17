/* global jQuery, sap, window, console */
(function() {
    "use strict";

    jQuery.sap.require('sap.ushell.renderers.fiori2.search.controls.SearchSelect');
    jQuery.sap.require('sap.ushell.renderers.fiori2.search.controls.SearchInput');
    jQuery.sap.require('sap.ushell.renderers.fiori2.search.controls.SearchButton');

    sap.ui.core.Control.extend("sap.ushell.renderers.fiori2.search.controls.SearchFieldGroup", {

        metadata: {
            properties: {
                "selectActive": {
                    defaultValue: true,
                    type: "boolean"
                },
                "inputActive": {
                    defaultValue: true,
                    type: "boolean"
                },
                "buttonActive": {
                    defaultValue: true,
                    type: "boolean"
                }
            },
            aggregations: {
                "select": {
                    type: "sap.ui.core.Control",
                    multiple: false
                },
                "input": {
                    type: "sap.ui.core.Control",
                    multiple: false
                },
                "button": {
                    type: "sap.ui.core.Control",
                    multiple: false
                }
            }
        },


        init: function() {
            var that = this;

            // check activity //TODO
            that.initSelect();
            that.initInput();
            that.initButton();
        },

        initSelect: function() {
            var that = this;
            var select = new sap.ushell.renderers.fiori2.search.controls.SearchSelect(that.getId() + '-select', {});
            select.attachChange(function() {
                if (that.getAggregation("input")) {
                    var input = that.getAggregation("input");
                    input.focus();
                    //remove? //TODO
                    input.destroySuggestionRows(); // to be doubly sure to close the suggestion
                }
            });
            that.setAggregation("select", select);
        },


        initInput: function() {
            var that = this;
            var input = new sap.ushell.renderers.fiori2.search.controls.SearchInput(that.getId() + '-input', {});
            that.setAggregation("input", input);
        },


        initButton: function() {
            var that = this;
            var button = new sap.ushell.renderers.fiori2.search.controls.SearchButton(that.getId() + '-button', {
                press: function(oEvent) {
                    if (that.getAggregation("input") && that.getAggregation("input").getValue() !== '') {
                        button.getModel().invalidateQuery();
                        var input = that.getAggregation("input");
                        input.destroySuggestionRows();
                        input.triggerSearch(oEvent);
                    }
                }
            });
            that.setAggregation("button", button);
        },

        setModel: function(model) {
            if (this.getSelectActive()) {
                this.getAggregation("select").setModel(model);
            }
            if (this.getInputActive()) {
                this.getAggregation("input").setModel(model);
            }
            if (this.getButtonActive()) {
                this.getAggregation("button").setModel(model);
            }
        },

        renderer: function(oRm, oControl) {
            oRm.write('<div');
            oRm.writeControlData(oControl);
            oRm.addClass("SearchFieldGroup");
            oRm.writeClasses();
            oRm.write('>');
            oRm.write('<div class="sapUshellSearchFieldGroupContainer">');
            oRm.write('<div class="sapUshellSearchFieldGroupSubContainer">');
            if (oControl.getSelectActive() === true) {
                oRm.renderControl(oControl.getAggregation("select"));
            }
            if (oControl.getInputActive() === true) {
                oRm.renderControl(oControl.getAggregation("input"));
            }
            oRm.write('</div>');
            if (oControl.getButtonActive() === true) {
                oRm.renderControl(oControl.getAggregation("button"));
            }
            oRm.write('</div>');
            oRm.write('</div>');
        }
    });

}());
