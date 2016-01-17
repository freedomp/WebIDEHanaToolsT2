/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define([
        "../../../util/ResourceLoader",
        "../../../base/modelbase",
        "../../../viewmodel/commands",
        "../../CalcViewEditorUtil",
        "./DiagramPane",
        "./PropertiesPane"
    ],
    function(ResourceLoader, modelbase, commands, CalcViewEditorUtil, DiagramPane, PropertiesPane) {
        "use strict";

        var resourceLoader = new ResourceLoader("/watt/resources/sap/watt/hanaplugins/editor/plugin/hdbcalculationview");

        /**
         * @class
         */
        var JoinDefinitionPane = function(parameters) {
            this._undoManager = parameters.undoManager;
            this.viewNode = parameters.viewNode;
            this._model = parameters.model;
            this.context = parameters.context;
            this.mainLayout = null;
            this.dataModel = new sap.ui.model.json.JSONModel();
            this.viewNode.$getEvents().subscribe(commands.ViewModelEvents.CHANGED, this.updateProperties, this);
        };

        JoinDefinitionPane.prototype = {

            _execute: function(command) {
                return this._undoManager.execute(command);
            },

            close: function() {
                if (this.viewNode.$getEvents()._registry) {
                    this.viewNode.$getEvents().unsubscribe(commands.ViewModelEvents.CHANGED, this.updateProperties, this);
                }
                if (this.dataModel) {
                    this.dataModel.destroy();
                }
                if (this.diagramPane) {
                    this.diagramPane.destroy();
                } 
                if (this.propertiesPane) {
                    this.propertiesPane.close();
                }
            },

            getContent: function() {
                var that = this;
                var imageButton;

                this.propertiesPane = new PropertiesPane({
                    undoManager: this._undoManager,
                    viewNode: this.viewNode,
                    model: this._model
                });

                this.diagramPane = new DiagramPane(that._model, that.viewNode, this._model, this.context, this.propertiesPane);

                var isCollapse = true;

                var toggleFunction = function() {
                    if (isCollapse) {
                        imageButton.setIcon("sap-icon://collapse-group");
                        var splitterHeight = $("#" + that.mainLayout.splitterDIV.id).height();
                        var splitterPosition = ((splitterHeight - 34) / splitterHeight) * 100;
                        splitterPosition = "" + splitterPosition + "%";
                        that.mainLayout.setSplitterPosition(splitterPosition);
                        isCollapse = false;
                    } else {
                        imageButton.setIcon("sap-icon://expand-group");
                        that.mainLayout.setSplitterPosition("60%");
                        isCollapse = true;
                    }
                };

                imageButton = new sap.ui.commons.Button({
                    icon: "sap-icon://expand-group",
                    press: toggleFunction
                });

                var propertyLabel = new sap.ui.commons.Label();
                propertyLabel.setText(resourceLoader.getText("txt_properties"));
                propertyLabel.addStyleClass("propertiesLinkLabel");

                var toolbar = new sap.ui.commons.Toolbar();
                // set standalone false, flat design and fixed width
                toolbar.setStandalone(false);

                toolbar.addItem(propertyLabel);
                toolbar.addRightItem(imageButton);

                var propertyLayout = new sap.ui.layout.VerticalLayout({
                    width: "100%",
                    content: [toolbar, this.propertiesPane.getContent()]
                });

                setTimeout(function() {
                    $("#" + propertyLabel.sId).click(toggleFunction);
                }, 1000);

                propertyLayout.addStyleClass("joinPropertyCustom");

                this.mainLayout = new sap.ui.commons.Splitter({
                    splitterOrientation: sap.ui.commons.Orientation.horizontal,
                    splitterPosition: "70%",
                    //minSizeSecondPane: "30px",
                    firstPaneContent: this.diagramPane.getContent(),
                    secondPaneContent: propertyLayout
                });
                this.mainLayout.addStyleClass("joinPane");

                return this.mainLayout;
            },
            joinHighlight:function(value,seq){
                return this.diagramPane.joinHighlight(value,seq);

            }
        };

        return JoinDefinitionPane;

    });
