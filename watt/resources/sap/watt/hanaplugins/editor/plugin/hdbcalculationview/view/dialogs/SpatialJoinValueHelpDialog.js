/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define(["../../util/ResourceLoader"], function(ResourceLoader) {

    var SpatialJoinValueHelpDialog = function(mSettings) {
        this.title = mSettings.title;
        this.type = mSettings.type;
        this.columnView = mSettings.columnView;
        this.onOK = mSettings.onOK;
    };

    var resourceLoader = new ResourceLoader("/watt/resources/sap/watt/hanaplugins/editor/plugin/hdbcalculationview");

    SpatialJoinValueHelpDialog.prototype = {


        open: function() {
            var that = this;

            var dialog = new sap.ui.commons.Dialog({
                width: "auto",
                title: this.title,
                tooltip: this.title,
                modal: true,
                resizable: true
            });

            var loMatrix = new sap.ui.commons.layout.MatrixLayout({
                layoutFixed: false,
                width: '100%',
                columns: 2
            });
            dialog.addContent(loMatrix);
            var typeLabel = new sap.ui.commons.Label({
                text: "Type"
            });

            var types = [{
                type: "Fixed",
                key: "0"
            }, {
                type: resourceLoader.getText("tol_parameter"),
                key: "1"
            }];

            var typeListItem = new sap.ui.core.ListItem({});
            typeListItem.bindProperty("text", "type");
            typeListItem.bindProperty("key", "key");
            var typeField = new sap.ui.commons.DropdownBox({
                width: "90%",
            });

            typeField.bindItems({
                path: "/",
                template: typeListItem
            });

            typeField.setModel(new sap.ui.model.json.JSONModel(types));

            loMatrix.createRow(typeLabel, typeField);

            var loButtonCancel = new sap.ui.commons.Button({
                tooltip: "Cancel",
                text: "Cancel",
                press: function() {
                    dialog.destroy();
                }
            });

            var loButtonOK = new sap.ui.commons.Button("OK", {
                tooltip: "Ok",
                text: "OK",
                enabled: false,
                press: function() {}
            });
            dialog.addButton(loButtonOK);
            dialog.addButton(loButtonCancel);
            dialog.open();
        },

    };
    return SpatialJoinValueHelpDialog;
});
