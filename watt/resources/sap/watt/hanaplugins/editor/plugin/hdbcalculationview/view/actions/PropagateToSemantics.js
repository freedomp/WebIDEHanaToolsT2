/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define([
    "../../util/ResourceLoader",
    "../../base/modelbase",
    "../../viewmodel/commands",
    "../CalcViewEditorUtil"
], function(ResourceLoader, modelbase, commands, CalcViewEditorUtil) {
    "use strict";

    return {
        resourceLoader: new ResourceLoader("/watt/resources/sap/watt/hanaplugins/editor/plugin/hdbcalculationview"),

        canPropagate: function(columnView, viewNode) {
            if (columnView && viewNode) {
                if (viewNode.isDefaultNode()) {
                    return false;
                }

                // If a node has no parent then diasble th emenu option
                var parentNodeFound = false;
                columnView.viewNodes.foreach(function(node) {
                    node.inputs.foreach(function(input) {
                        if (input.getSource() === viewNode) {
                            parentNodeFound = true;
                        }
                    });
                });
                if (!parentNodeFound) {
                    return false;
                }
            }

            return true;
        },

        propagate: function(parameters) {
            this._undoManager = parameters.undoManager;
            this.columnView = parameters.columnView;
            this.viewNode = parameters.viewNode;
            this.elements = parameters.elements;
            // Holds those elements which would be propagated.
            this.elementsToPropagateList = [];

            this._executePropagation(parameters.bypassUserDecision);
        },

        createPropagateCommands: function(parameters) {
            this._undoManager = parameters.undoManager;
            this.columnView = parameters.columnView;
            this.viewNode = parameters.viewNode;
            this.element = parameters.element;
            this.input = parameters.input;
            this.addElementCommands = [];

            if (this.viewNode.isDefaultNode()) {
                this._addElementAndMapping(this.element, this.viewNode, this.input);
            } else {
                this._addElementAndMapping(this.element, this.viewNode, this.input);
                this._validateAndAddElementsToPropagatedViewNodes(this.viewNode, this.element, true, null, false);
            }
            return this.addElementCommands;

        },


        _execute: function(command) {
            return this._undoManager.execute(command);
        },

        _executePropagation: function(bypassUserDecision) {
            if (!bypassUserDecision) {
                // Upfront check the references of the selected elements.
                var userDecision = this._checkForElementsReference(false);
                if (!userDecision) {
                    return;
                }
            }
            this.addElementCommands = [];
            for (var i = 0; i < this.elements.length; i++) {
                var element = this.elements[i];
                this._validateAndAddElementsToPropagatedViewNodes(this.viewNode, element, true, null, false);
            }

            if (this.addElementCommands.length > 0) {
                this._execute(new modelbase.CompoundCommand(this.addElementCommands));
            }

            this._checkForElementsReference(true);

        },

        _checkForElementsReference: function(isImpactAnalysisRunning) {

            var multiStatus = {
                text: undefined,
                details: undefined
            };

            if (!isImpactAnalysisRunning) {
                multiStatus.text = this.resourceLoader.getText("msg_propagate_to_semantics_some_elements_already_exists_confirmation");
                //multiStatus.text = multiStatus.text + "\n" + "The following columns already exist:\n";
            } else if (isImpactAnalysisRunning) {
                multiStatus.text = this.resourceLoader.getText("msg_propagate_to_semantics_post_propagate");
            }

            var messagesList = [];

            // Holds those elements whose references are found
            var referencedElementsList = [];


            for (var i = 0; i < this.elements.length; i++) {
                var element = this.elements[i];
                if (isImpactAnalysisRunning && this.elementsToPropagateList.indexOf(element.name) === -1) {
                    continue;
                }
                this._validateAndAddElementsToPropagatedViewNodes(this.viewNode, element, false, messagesList, isImpactAnalysisRunning);
                if (messagesList.length > 0) {
                    referencedElementsList.push(element);

                    if (multiStatus.details) {
                        multiStatus.details = multiStatus.details + "\n" + element.name;
                    } else {
                        multiStatus.details = element.name;
                    }

                    for (var j = 0; j < messagesList.length; j++) {
                        multiStatus.details = multiStatus.details.concat("\n \t" + messagesList[j]);
                    }

                    messagesList = [];
                } else {
                    this.elementsToPropagateList.push(element.name);
                }
            }

            if (!isImpactAnalysisRunning && multiStatus.details) {
                // If none of the selected elements could be propagated, then show a information dialog box and a suitable user message
                if (referencedElementsList.length === this.elements.length) {
                    multiStatus.text = this.resourceLoader.getText("msg_cannot_propagate_anything_to_semantics");
                    this._displayUserInfoDialog(multiStatus);
                    return false;
                } else {
                    multiStatus.details = this.resourceLoader.getText("msg_propagate_to_semantics_elements_already_exists") + multiStatus.details;
                    this._displayUserInfoDialog(multiStatus, this.elementsToPropagateList);
                    return false;
                    //Util.ErrorDialogWithCancel dialog = displayUserDecisionDialog(multiStatus, elementsToPropagateList);
                    //int ret = dialog.open();
                    // if (ret == Dialog.CANCEL) {
                    //     return false;
                    // }
                }
                //abortPropagationOfReferredElements(referencedElementsList);
            }

            if (isImpactAnalysisRunning && multiStatus.details) {
                this._displayUserInfoDialog(multiStatus);
                return false;
            }

            return true;
        },

        _validateAndAddElementsToPropagatedViewNodes: function(selectedViewNode, element, isPropagatationRequired, messagesList, isImpactAnalysisRunning) {
            var that = this;
            this.columnView.viewNodes.foreach(function(node) {
                node.inputs.foreach(function(input) {
                    if (input.getSource() === selectedViewNode) {
                        var elementName = element.name;
                        if (!node.elements.get(elementName) && !that._checkElementNameExists(input, element)) {
                            if (isPropagatationRequired) {
                                that._addElementAndMapping(element, node, input);
                            }
                        } else if (!isPropagatationRequired && messagesList) {
                            var messageObjects = ["'" + elementName + "'", "'" + node.name + "'"];
                            if (!isImpactAnalysisRunning) {
                                messagesList.push(that.resourceLoader.getText("msg_propagate_to_semantics_impact", messageObjects));
                            } else {
                                messagesList.push(that.resourceLoader.getText("msg_propagate_to_semantics_post_propagate_element", messageObjects));
                            }
                        }
                        that._validateAndAddElementsToPropagatedViewNodes(node, element, isPropagatationRequired, messagesList, isImpactAnalysisRunning);
                    }
                });
            });
        },

        _checkElementNameExists: function(input, element) {
            var elementNameExists = false;
            input.mappings.foreach(function(mapping) {
                if (mapping.type === "ElementMapping" && mapping.sourceElement.name === element.name) {
                    elementNameExists = true;
                }
            });
            return elementNameExists;
        },

        _addElementAndMapping: function(element, node, input) {
            var elementAttributes = CalcViewEditorUtil.createModelForElementAttributes(element);
            elementAttributes.objectAttributes.name = CalcViewEditorUtil.getUniqueNameForElement(element.name, node);
            elementAttributes.objectAttributes.label = elementAttributes.objectAttributes.name;
            elementAttributes.objectAttributes.transparentFilter = element.transparentFilter;
            elementAttributes.mappingAttributes = {
                sourceName: element.name,
                targetName: elementAttributes.objectAttributes.name,
                type: "ElementMapping"
            };
            elementAttributes.input = input;
            var command = new commands.AddElementCommand(node.name, elementAttributes);
            this.addElementCommands.push(command);
        },

        _displayUserInfoDialog: function(multiStatus, elementsToPropagateList) {
            var that = this;

            var dialog = new sap.ui.commons.Dialog({
                title: that.resourceLoader.getText("txt_propagate_to_semantics"),
                modal: true,
                width: "600px"
            });

            //Set the icon            
            var oImage1 = new sap.ui.commons.Image({
                src: this.resourceLoader.getImagePath("info.png")
            });

            oImage1.addStyleClass("dialogImg");

            var oText = new sap.ui.commons.TextView({
                text: multiStatus.text
            });

            var mLayout = new sap.ui.commons.layout.MatrixLayout({
                layoutFixed: false,
                columns: 2
            });

            mLayout.createRow(oImage1, oText);

            var oLayout = new sap.ui.layout.VerticalLayout();
            oLayout.addContent(mLayout);

            var oInput = new sap.ui.commons.TextArea({
                width: "550px",
                editable: false
            });

            oInput.setRows(7);

            if (multiStatus.details) {
                if (elementsToPropagateList && elementsToPropagateList.length > 0) {
                    multiStatus.details = multiStatus.details + "\n" + this.resourceLoader.getText("msg_propagate_to_semantics_elements_can_add");
                    for (var k = 0; k < elementsToPropagateList.length; k++) {
                        multiStatus.details = multiStatus.details + "\n\t" + (k + 1) + ") " + elementsToPropagateList[k];
                    }
                }
                oInput.setValue(multiStatus.details);
                oLayout.addContent(oInput);
            }

            dialog.addContent(oLayout);

            //Add buttons
            if (elementsToPropagateList) {
                var yesButton = new sap.ui.commons.Button({
                    text: "Yes",
                    press: function() {
                        dialog.close();
                        that._executePropagation(true);
                    }
                });
                dialog.addButton(yesButton);
                var noButton = new sap.ui.commons.Button({
                    text: "No",
                    press: function() {
                        dialog.close();
                    }
                });
                dialog.addButton(noButton);
            } else {
                var okButton = new sap.ui.commons.Button({
                    text: "OK",
                    press: function() {
                        dialog.close();
                    }
                });
                dialog.addButton(okButton);
            }

            dialog.open();

        }

    };

});
