/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define([
        "../../util/ResourceLoader",
        "../../base/modelbase",
        "../../viewmodel/commands",
        "../CalcViewEditorUtil",
        "../../viewmodel/services/ViewModelService",
        "../../viewmodel/model"

    ],
    function(ResourceLoader, modelbase, commands, CalcViewEditorUtil, ViewModelService, model) {
        "use strict";

        var resourceLoader = new ResourceLoader("/watt/resources/sap/watt/hanaplugins/editor/plugin/hdbcalculationview");
        var that;
        /**
         * @class
         */
        var ReferenceDialog = function(parameters) {
            if (parameters.undoManager) {
                this._undoManager = parameters.undoManager;
                this.columnView = this._undoManager._model.columnView;
            }
            this._objects = parameters.element;
            this.onOK = parameters.fnCallbackMessageBox;
            this._isRemoveCall = parameters.isRemoveCall;
            this.removePaths = [];
            this.isDialog = parameters.isDialog;
	    this.callBack = parameters.callBack;
	    this.symbol = parameters.symbol;
	    this.editor = parameters.editor;
	    this.viewNode = parameters.viewNode;
        };

        ReferenceDialog.prototype = {

            _execute: function(command) {
                return this._undoManager.execute(command);
            },

            deleteElements: function() {
                var deleteElementCommands = [];
                for (var i = 0; i < this.removePaths.length; i++) {
                    deleteElementCommands.push(new modelbase.DeleteCommand(this.removePaths[i]));
                }
                return deleteElementCommands;
            },

            openMessageDialog: function() {
                that = this;
                var refs = [];

                //var ReferenceManager = modelbase.ReferenceManager;
                var oDialog1 = new sap.ui.commons.Dialog({
                    modal: true,
                    width: "600px"
                });
                //Set the title
                if (that._isRemoveCall) {
                    oDialog1.setTitle("Remove");
                } else {
                    oDialog1.setTitle("References");
                }


                //Set the icon            
                var oImage1 = new sap.ui.commons.Image({
                    src: resourceLoader.getImagePath("info.png")
                });

                oImage1.addStyleClass("dialogImg");

                //set the Content
                var referenceInfo;
                if (that._objects instanceof Array) {
                    for (var i = 0; i < that._objects.length; i++) {
                        // refs = ReferenceManager.getReferencesTo(that._objects[i], true);
                        var object = that._objects[i];
                        if (object instanceof model.ViewNode) {        
                                for(var x = 0; x < this.columnView.viewNodes.count(); x++){
                                        var localViewNode = this.columnView.viewNodes.getAt(x);
                                        for(var y = 0; y < localViewNode.inputs.count(); y++){
                                                var localInput = localViewNode.inputs.getAt(y);
                                                if (localInput.getSource() === object) {
//                                                refs = ViewModelService.DeleteService.getImpactAnalysis(localInput);
                                               refs = refs.concat(ViewModelService.DeleteService.getImpactAnalysis(localInput));
                                            //   newIndex++;
                                            }
                                        }
                                }
                        } 
                        //TODO: delete below if block
                        /*if (object instanceof model.ViewNode) {
                            this.columnView.viewNodes.foreach(function(viewNode) {
                                viewNode.inputs.foreach(function(input) {
                                    if (input.getSource() === object) {
                                        refs = ViewModelService.DeleteService.getImpactAnalysis(input)
                                    }
                                })
                            })

                        } */
                        else {
                            refs = ViewModelService.DeleteService.getImpactAnalysis(object);
                            if (this.columnView && object instanceof model.Input) { // Remove input from Union Node
                                this.columnView.viewNodes.foreach(function(node) {
                                    if (node.type === "Union") {
                                        node.inputs.foreach(function(input) {
                                            if (input === object) {
                                                refs = [refs[0]];
                                                input.mappings.foreach(function(mapping) {
                                                    refs.push({
                                                        object: mapping,
                                                        name: "mapping",
                                                        path: "columnView.viewNodes[\"" + node.name + "\"].inputs[" + input.$getKeyAttributeValue() + "].mappings[" + mapping.$getKeyAttributeValue() + "]",
                                                        changeType: undefined,
                                                        hidden: true
                                                    });
                                                })
                                            }
                                        });
                                    }
                                });
                            }
                        }
                        
                        //START - Move below code block to method that.isReferenced(refs, referenceInfo, object);
                        var isReferenced = false;
                        if (refs && refs.length >= 1) {
                            isReferenced = true;
                        }
                        if (isReferenced) {
                            if (referenceInfo) {
                                referenceInfo = referenceInfo + "\n" + that.getRerenceInfo(refs, object);
                            } else {
                                referenceInfo = that.getRerenceInfo(refs, object);
                            }
                        }
                        if (referenceInfo) {
                            isReferenced = true;
                        } else {
                            isReferenced = false;
                        }
                        //END - Move below code block to method that.isReferenced(refs, referenceInfo, object);
//                      var isReferenced = that.isReferenced(refs, referenceInfo, object);
                    }

                }
                //Set the context
                var oText = new sap.ui.commons.TextView();
                that.setDialogContext(oText, isReferenced);

                var mLayout = new sap.ui.commons.layout.MatrixLayout({
                    layoutFixed: false,
                    columns: 2
                });


                mLayout.createRow(oImage1, oText);

                var oLayout = new sap.ui.layout.VerticalLayout();
                oLayout.addContent(mLayout);

                var oInput = new sap.ui.commons.TextArea({
                    width: "550px"
                });

                oInput.setEditable(false);
                oInput.setRows(7);


                //Add buttons
                that.addButtons(oDialog1, that._isRemoveCall);

                if (referenceInfo) {
                    oInput.setValue(referenceInfo);
                    oLayout.addContent(oInput);
                }

                oDialog1.addContent(oLayout);
                if (that.isDialog === undefined) {
                    oDialog1.open();
                }

            },

            isReferenced: function(refs, referenceInfo, object){
                    var isReferenced = false;

                        if (refs && refs.length >= 1) {
                            isReferenced = true;
                        }

                        if (isReferenced) {
                            if (referenceInfo) {
                                referenceInfo = referenceInfo + "\n" + that.getRerenceInfo(refs, object);
                            } else {
                                referenceInfo = that.getRerenceInfo(refs, object);
                            }
                        }
                        if (referenceInfo) {
                            isReferenced = true;
                        } else {
                            isReferenced = false;
                        }
                        return isReferenced;
            },

            setDialogContext: function(oText, isReferenced) {
                if (this._isRemoveCall && isReferenced) {
                    oText.setText(resourceLoader.getText("msg_remove_confirmation_column_reference"));
                } else if (this._isRemoveCall && (!isReferenced)) {
                    oText.setText(resourceLoader.getText("msg_remove_confirmation"));
                } else {
                    oText.setText(resourceLoader.getText("msg_references_columns_used"));
                }
            },

            getRerenceInfo: function(refs, object) {
                var referenceStr;

                if (object instanceof model.Input) {
                    //referenceStr = "Input"+" '"+  CalcViewEditorUtil.getInputName(object) + '"';
                } else if (object instanceof model.ViewNode) {
                    //referenceStr = object.type+" '"+  object.name + '"';
                } else {
                    referenceStr = object.name;
                }

                var msgs;

                for (var i = 0; i < refs.length; i++) {
                    var ref = refs[i];
                    if (object instanceof model.Element) {
                        if (ref.path) {
                            this.removePaths.push(ref.path);
                        }
                    } else if (object instanceof model.Input || object instanceof model.ViewNode) {
                        if (ref.path && i !== 0) {
                            this.removePaths.push(ref.path);
                        }
                    }
                    if (ref.hidden) {
                        continue;
                    }

                    var msg = ref.name;
                    if (msgs) {
                        msgs = msgs + "\n \t" + msg;
                    } else {
                        msgs = "\n \t" + msg;
                    }

                }
                if (object instanceof model.Input) {
                    if (refs[0] && refs[0].path) {
                        this.removePaths.push(refs[0].path);
                    }
                } else if (object instanceof model.ViewNode) {
                    if (refs[0] && refs[0].path) {
                        this.removePaths.push(refs[0].path);
                    }
                    this.removePaths.push('columnView.viewNodes["' + object.name + '"]');
                }else if (object instanceof model.Entity) {
					for (var j = 1; j < refs.length; j++) {
						if (refs[j] && refs[j].path) {
							this.removePaths.push(refs[j].path);
						}
					}
                    if (refs[0] && refs[0].path) {
                        this.removePaths.push(refs[0].path);
                    }
                }

                if (msgs) {
                    if (referenceStr) {
                        referenceStr = referenceStr + msgs;
                    } else {
                        referenceStr = msgs;
                    }

                }
                return referenceStr;
            },
            
            addButtons: function(oDialog1, isRemoved) {
                var that = this;
                var okButton = new sap.ui.commons.Button({
                    text: "OK",
                    press: function() {
                        oDialog1.close();

                    }
                });
                var yesButton = new sap.ui.commons.Button({
                    text: "Yes",
                    press: function() {
                        oDialog1.close();
                        if (that.removePaths.length > 0) {
                            var deleteElementCommands = [];
                            for (var i = 0; i < that.removePaths.length; i++) {
                                deleteElementCommands.push(new modelbase.DeleteCommand(that.removePaths[i]));
                            }
                            if (that._undoManager) {
                                that._execute(new modelbase.CompoundCommand(deleteElementCommands));
                            } else {
                                that.onOK(true, deleteElementCommands);
                            }
                        } else {
                            that.onOK(true);
                        }
						if (that.viewNode) {
							if (that.viewNode.type === "Graph") {
								that.callBack(that.symbol, that.editor);
							}
						}
                    }
                });
                var NoButton = new sap.ui.commons.Button({
                    text: "No",
                    press: function() {
                        oDialog1.close();
                        that.onOK(false);
                    }
                });
                if (isRemoved) {
                    oDialog1.addButton(yesButton);
                    oDialog1.addButton(NoButton);
                } else {
                    oDialog1.addButton(okButton);
                }
            }
        };
        return ReferenceDialog;

    });
