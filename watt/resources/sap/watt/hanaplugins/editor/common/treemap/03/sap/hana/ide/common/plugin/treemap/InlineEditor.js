/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
jQuery.sap.declare("sap.hana.ide.common.plugin.treemap.InlineEditor");

sap.ui.core.Control.extend("sap.hana.ide.common.plugin.treemap.InlineEditor", {
    metadata: {
        properties: {
            "showEditor": {
                type: "boolean",
                defaultValue: false
            }
        },

        aggregations: {
            "label": {
                singularName: "label",
                multiple: false,
                visibility: "public"
            },
            "editor": {
                singularName: "editor",
                multiple: false,
                visibility: "public"
            },
            "contextMenu": {
                singularName: "contextMenu",
                multiple: false,
                visibility: "public"
            }

        },
        events: {
            "change": {},
            "liveChange": {},
            "openContextMenu": {}
        }
    },

    init: function() {

        var editor = new sap.ui.commons.TextField();
        editor.attachLiveChange(function(oEvent) {
            var oInlineEditor = oEvent.getSource().getParent();
            var data = {
                "source": oEvent.getSource(),
                "liveValue": oEvent.getSource().getLiveValue(),
                "inlineEditor": oInlineEditor
            };
            oInlineEditor.fireLiveChange(data);
        });

        editor.attachChange(function(oEvent) {
            var oInlineEditor = oEvent.getSource().getParent();
            var oSource = oEvent.getSource();

            if (oSource.getValueState() !== sap.ui.core.ValueState.None) {
                oSource.setTooltip(null);
                var oBinding = oSource.getBinding("value");
                oBinding.setValue(oInlineEditor.getOldValue());
                oSource.setValueState(sap.ui.core.ValueState.None);
            } else {
                var data = {
                    "source": oSource,
                    "value": oSource.getValue(),
                    "inlineEditor": oInlineEditor
                };
                oInlineEditor.fireChange(data);
            }

        });

        this.setEditor(editor);
        this._oldValue = null;
        
                
        var oMenu = new sap.ui.commons.Menu({
            ariaDescription: "Menu"
        });
        this.setContextMenu(oMenu);
    },

    renderer: {
        render: function(oRenderManager, oControl) {
            oRenderManager.addClass("InlineEditor");
            oRenderManager.write("<div ");
            oRenderManager.writeClasses();
            oRenderManager.writeControlData(oControl);
            oRenderManager.write(">");

            if (oControl.getShowEditor()) {
                oControl._oldValue = oControl.getValue();
                oRenderManager.renderControl(oControl.getEditor());
            } else {
                oRenderManager.renderControl(oControl.getLabel());
            }

            oRenderManager.write("</div>");
        }
    },
    onAfterRendering: function() {
        var that = this;
        if (this.getShowEditor()) {

            var input = $("#" + this.getEditor().getId());

            // change to non-edit mode on focus out
            input.focusout(function() {
                that.setShowEditor(false);
                that._oldValue = that.getValue();
            });

            // change to non-edit mode on enter
            input.keyup(function(oEvent) {
                if (oEvent.keyCode === 13) {
                    that.setShowEditor(false);
                    that._oldValue = that.getValue();
                }
            });

            // focus and set cursor at the end
            input.focus();
            var strLength = input.val().length * 2;
            input[0].setSelectionRange(strLength, strLength);


        } else {
            var oElement = $("#" + this.getId());
            var oTableData = oElement.parent().parent();

            oTableData.on("contextmenu", function(event) {
                event.stopPropagation();
                var oContextM = that.getContextMenu();


                if (that.getBindingContext() && oContextM && oContextM.open) {
                    var oBindingContext = that.getBindingContext();
                    var data = {
                        "data": oBindingContext.getObject(),
                        "menu": oContextM
                    };


                    that.fireOpenContextMenu(data);

                    if (oContextM.getItems().length > 0) {
                        var eDock = sap.ui.core.Popup.Dock;

                        oContextM.open(false, that.getFocusDomRef(), eDock.BeginTop,
                            eDock.BeginBottom,
                            that);
                    }
                }

                return false;
            });

        }
    },


    bindEditorValue: function(value) {
        this.getEditor().bindProperty("value", value);
    },

    getValue: function() {
        return this.getEditor().getValue();
    },

    getOldValue: function() {
        return this._oldValue;
    }
});
