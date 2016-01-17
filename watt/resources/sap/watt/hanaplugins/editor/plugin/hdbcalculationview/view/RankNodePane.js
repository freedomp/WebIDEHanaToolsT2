/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define([
        "../util/ResourceLoader",
        "../base/modelbase",
        "../viewmodel/commands",
        "./TypedObjectParser",
        "./TypedObjectTable",
        "./CalcViewEditorUtil",
        "../viewmodel/model",
        "./IconComboBox"
    ],
    function(ResourceLoader, modelbase, commands, TypedObjectParser, TypedObjectTable, CalcViewEditorUtil,modelClass,IconComboBox) {
        "use strict";

        var resourceLoader = new ResourceLoader("/watt/resources/sap/watt/hanaplugins/editor/plugin/hdbcalculationview");

        var columnParser = new TypedObjectParser("column");
        
        /* @class
         */
        var RankNodePane = function(parameters) {
            this._undoManager = parameters.undoManager;
            this._context = parameters.context;
            this._model = parameters.model;
            this._viewNode = parameters.viewNode;
            this.thresholdTypeCombo;
            this.model;
            
        };

        RankNodePane.prototype = {

            _execute: function(command) {
                return this._undoManager.execute(command);
            },

            getContent: function() {
                var mainLayout = new sap.ui.commons.layout.VerticalLayout({
                    height: "100%",
                    width: "100%"
                }).addStyleClass("masterDetailsMainDiv");
                var toolBar = this.getToolBar();
                var childContent = this.buildContent();
                var data = this.buildData();
                this.updateThreshHoldComboType();
                this.model = new sap.ui.model.json.JSONModel(data);
                childContent.setModel(this.model);
                this.unSubScribeEvents();
                this.subScribeEvents();
                mainLayout.addContent(toolBar);
                mainLayout.addContent(childContent);
                return mainLayout;
            },
             subScribeEvents: function() {
                this._model.columnView.$getEvents().subscribe(commands.ViewModelEvents.ELEMENT_CREATED, this.updateModel, this);
                this._model.columnView.$getEvents().subscribe(commands.ViewModelEvents.ELEMENT_DELETED, this.updateModel, this);
                this._model.columnView.$getEvents().subscribe(commands.ViewModelEvents.PARAMETER_CREATED, this.updateModel, this);
                this._model.columnView.$getEvents().subscribe(commands.ViewModelEvents.PARAMETER_DELETED, this.updateModel, this);
                this._model.columnView.$getEvents().subscribe(commands.ViewModelEvents.PARAMETER_CHANGED, this.updateModel, this);
                this._model.columnView.$getEvents().subscribe(commands.ViewModelEvents.RANKNODE_PROPERTIES_CHANGED, this.updateModel, this);
            },
            unSubScribeEvents: function() {
                this._model.columnView.$getEvents().unsubscribe(commands.ViewModelEvents.ELEMENT_CREATED, this.updateModel, this);
                this._model.columnView.$getEvents().unsubscribe(commands.ViewModelEvents.ELEMENT_DELETED, this.updateModel, this);
                this._model.columnView.$getEvents().unsubscribe(commands.ViewModelEvents.PARAMETER_CREATED, this.updateModel, this);
                this._model.columnView.$getEvents().unsubscribe(commands.ViewModelEvents.PARAMETER_DELETED, this.updateModel, this);
                this._model.columnView.$getEvents().unsubscribe(commands.ViewModelEvents.PARAMETER_CHANGED,  this.updateModel, this);
                this._model.columnView.$getEvents().unsubscribe(commands.ViewModelEvents.RANKNODE_PROPERTIES_CHANGED, this.updateModel, this);

            },
            updateModel:function(event){
                 var data = this.buildData();
                 this.model.setData(data);
                 this.model.updateBindings(true);
                 this.updateThreshHoldComboType();
            },
            buildData: function() {
                var that = this;
                if (this._viewNode.windowFunction) {
                    var orderFirstValue;
                    if(this._viewNode.windowFunction.orders && this._viewNode.windowFunction.orders.count() > 0){
                     orderFirstValue = this._viewNode.windowFunction.orders._values[0];
                    }
                    return {
                        sortDirection: orderFirstValue ? orderFirstValue.direction : "DESC",
                        thresholdParameter: this._viewNode.windowFunction.rankThreshold ? this._viewNode.windowFunction.rankThreshold.parameter : undefined,
                        thresholdValue:this._viewNode.windowFunction.rankThreshold ? this._viewNode.windowFunction.rankThreshold.constantValue : "",
                        orderByElement:orderFirstValue ? orderFirstValue.byElement : undefined,
                        dynamicPartition: this._viewNode.windowFunction.dynamicPartitionElements,
                        columnPartitions: that.getPartitionElements(),
                        viewNodeElements: that.getAttributeElements(),
                        attributeElementsForOrder:that.getAttributeElementsForOrder(),
                        parameters:that.getParameters()};
                } else {
                    return {
                        sortDirection: "DESC",
                        thresholdParameter:undefined,
                        thresholdValue: "",
                        orderByElement: undefined,
                        dynamicPartition: false,
                        columnPartitions: [],
                        viewNodeElements:that.getAttributeElements(),
                        attributeElementsForOrder:that.getAttributeElementsForOrder(),
                        parameters:that.getParameters()
                    };
                }
            },
            getPartitionElements: function(){
                var partitionElements = [];
                if (this._viewNode.windowFunction) {
                    this._viewNode.windowFunction.partitionElements.foreach(function(element) {
                        partitionElements.push({
                            partitionElement: element
                        });
                    });
                }
                return partitionElements;
            },
            getAttributeElements:function(){
                 var that = this;
                var attributes = [];
                this._viewNode.elements.foreach(function(element){
                if(!that.isBasedOnElementProxy(element,that._model.columnView,that._viewNode)){
                     if(!that.isPartOfPartitionelement(element)){
                    attributes.push({element:element});
                     }
                }
                });
                return attributes;
            },
            getAttributeElementsForOrder: function(){
                 var that = this;
                var attributes = [];
                this._viewNode.elements.foreach(function(element){
                if(!that.isBasedOnElementProxy(element,that._model.columnView,that._viewNode)){
                    attributes.push({element:element});
                }
                });
                return attributes;
            },
            isPartOfPartitionelement:function(element){
                var exist = false;
                if(element && this._viewNode.windowFunction && this._viewNode.windowFunction.partitionElements){
                 this._viewNode.windowFunction.partitionElements.foreach(function(partitionElement) {
                       if(partitionElement.name === element.name){
                            exist = true;
                       }
                    });
                }
                return exist;
            },
            getParameters:function(){
                var that = this;
              var parameters = [];
              this._model.columnView.parameters.foreach(function(parameter){
                  if(!parameter.isVariable && !parameter.multipleSelections){
                       if(!that.isBasedOnElementProxy(parameter,that._model.columnView,that._viewNode)){
                      var primitiveType = parameter.inlineType ? parameter.inlineType.primitiveType : undefined;
                       if(that.isSupportedPrimitiveType(primitiveType)){
                        parameters.push({parameter:parameter});
                       }
                       }
                  }
              });
              return parameters;
            },
            isSupportedPrimitiveType:function(primitiveType){
                if(primitiveType === "INTEGER"){
                    return true;
                }else if(primitiveType === "BIGINT"){
                    return true;
                }else if(primitiveType === "SMALLINT"){
                    return true;
                }else if(primitiveType === "TINYINT"){
                    return true;
                }else if(primitiveType === "DECIMAL"){
                    return true;
                }else if(primitiveType === "REAL"){
                   return true; 
                }else if(primitiveType === "FLOAT"){
                   return true; 
                }else if(primitiveType === "DOUBLE"){
                   return true; 
                }else if(primitiveType === "SMALLDECIMAL"){
                  return true;  
                }
                return false;
            },
            updateThreshHoldComboType:function(){
                if(this.thresholdTypeCombo){
                    if(this._viewNode.windowFunction){
                        if(this._viewNode.windowFunction.rankThreshold && this._viewNode.windowFunction.rankThreshold.parameter){
                             this.thresholdTypeCombo.setSelectedKey("Input Parameter");
                             this.thresholdTypeCombo.fireChange({newValue:"Input Parameter"});
                        }else{
                             this.thresholdTypeCombo.setSelectedKey("Fixed");
                             this.thresholdTypeCombo.fireChange({newValue:"Fixed"});
                        }
                    }else{
                        this.thresholdTypeCombo.setSelectedKey("Fixed");
                        this.thresholdTypeCombo.fireChange({newValue:"Fixed"});
                    }
                }
            },
            buildContent: function() {
                var that = this;
                 var mainLayout = new sap.ui.commons.layout.VerticalLayout({
                    height: "100%",
                    width: "100%"
                }).addStyleClass("rankNodeDeatils");
                var topMatrixLayout = new sap.ui.commons.layout.MatrixLayout({
                    width: "100%",
                    widths: ["20%", "80%"],
                    columns: 2
                });
                topMatrixLayout.createRow(null);

                var sortDirection = new sap.ui.commons.Label({
                    text: resourceLoader.getText("txt_sort_direction")
                }).addStyleClass("labelFloat");

                var sortDirectionCombo = new sap.ui.commons.DropdownBox({
                    width: "80%",
                    value: "Descending(Top N)",
                    selectedKey: "{sortDirection}",
                    change: function(oevent) {
                        var selectedKey = oevent.getSource().getSelectedKey();
                        var command = new commands.ChangeRankNodePropertiesCommand(that._viewNode.name, {
                            order: {
                                direction: selectedKey,
                                byElement:that.model.getData().orderByElement
                            }
                        });
                        that._execute(command);

                    }
                });
                sortDirectionCombo.addItem(new sap.ui.core.ListItem({
                    text: "Descending(Top N)",
                    key: "DESC"
                }));

                sortDirectionCombo.addItem(new sap.ui.core.ListItem({
                    text: "Ascending(Bottom N)",
                    key: "ASC"
                }));

                topMatrixLayout.createRow(sortDirection, sortDirectionCombo);

                var threshold = new sap.ui.commons.Label({
                    text: resourceLoader.getText("txt_threshold")
                }).addStyleClass("labelFloat");

                 this.thresholdTypeCombo = new sap.ui.commons.DropdownBox({
                    width: "100%",
                    change: function(event) {
                        var thresholdType = event.getSource().getSelectedKey();
                        if (thresholdType !== "Fixed") {
                            thresholdmatrixCell.removeContent(thresholdText);
                            thresholdmatrixCell.addContent(thresholdCombo);
                        } else {
                            thresholdmatrixCell.removeContent(thresholdCombo);
                            thresholdmatrixCell.addContent(thresholdText);
                        }
                    }
                });

                this.thresholdTypeCombo.addItem(new sap.ui.core.ListItem({
                    text: "Fixed",
                    key: "Fixed"
                }));
                this.thresholdTypeCombo.addItem(new sap.ui.core.ListItem({
                    text: "Input Parameter",
                    key: "Input Parameter"
                }));



                var thresholdText = new sap.ui.commons.TextField({
                    editable: true,
                    width: "100%",
                    value: "{thresholdValue}",
                    change:function(oEvent){
                        var newValue = oEvent.getParameter("newValue");
                        var command = new commands.ChangeRankNodePropertiesCommand(that._viewNode.name, {
                                rankThreshold:{
                                    constantValue :newValue
                                }
                        });
                        that._execute(command);
                    }
                });
                thresholdText.addStyleClass("currencyText").addStyleClass("noPaddingRight");

                var thresholdCombo = new sap.watt.hanaplugins.editor.plugin.hdbcalculationview.view.IconComboBox({
                    width: "100%",
                    canedit:false,
                    value:{
                        path:"thresholdParameter",
                        formatter:function(thresholdParameter){
                            return thresholdParameter ? thresholdParameter.name : "";
                        }
                    },
                    selectedKey:{
                        path:"thresholdParameter",
                        formatter:function(thresholdParameter){
                           return thresholdParameter ? thresholdParameter.name : "";
                        }
                    },
                    change:function(oEvent){
                       var selectedKey = oEvent.getSource().getSelectedKey();
                        var command = new commands.ChangeRankNodePropertiesCommand(that._viewNode.name, {
                                rankThreshold:{
                                    parameter : selectedKey
                                }
                        });
                        that._execute(command);
                    }
                }).addStyleClass("borderIconCombo");
                var thresholdItem = new sap.ui.core.ListItem();
                thresholdItem.bindProperty("text",{
                    path:"parameter",
                    formatter:function(parameter){
                        return parameter ? parameter.name : "";
                    }
                    
                });
                
                 thresholdItem.bindProperty("key",{
                    path:"parameter",
                    formatter:function(parameter){
                        return parameter ? parameter.name : "";
                    }
                    
                });
                
                 thresholdItem.bindProperty("icon",{
                    path:"parameter",
                    formatter:function(parameter){
                      return resourceLoader.getImagePath("Parameter.png");
                    }
                    
                });
                
                
                
            thresholdCombo.bindItems({
                path:"/parameters",
                template:thresholdItem
            });
             


                var threshHoldMatrixLayout = new sap.ui.commons.layout.MatrixLayout({
                    width: "80%",
                    widths: ["25%", "75%"]
                });
                var thresholdMatrixRow = new sap.ui.commons.layout.MatrixLayoutRow();
                var thresholdmatrixCell = new sap.ui.commons.layout.MatrixLayoutCell().addStyleClass("noPaddingRight");
                thresholdmatrixCell.addContent(thresholdText);



                threshHoldMatrixLayout.addRow(thresholdMatrixRow);
                thresholdMatrixRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
                    content: [this.thresholdTypeCombo]
                }));
                thresholdMatrixRow.addCell(thresholdmatrixCell);


                topMatrixLayout.createRow(threshold, threshHoldMatrixLayout);


                var orderBy = new sap.ui.commons.Label({
                    text: resourceLoader.getText("txt_order_by")
                }).addStyleClass("labelFloat");

                var orderByCombo = new sap.watt.hanaplugins.editor.plugin.hdbcalculationview.view.IconComboBox({
                    width: "80%",
                    canedit:false,
                    selectedKey: {
                        path: "orderByElement",
                        formatter: function(orderByElement) {
                            return orderByElement ? orderByElement.name : "";
                        }

                    },
                    value: {
                        path: "orderByElement",
                        formatter: function(orderByElement) {
                            return orderByElement ? orderByElement.name : "";
                        }
                    },
                    change: function(oevent) {
                        var selectedElement = oevent.getSource().getSelectedKey();
                        var command = new commands.ChangeRankNodePropertiesCommand(that._viewNode.name, {
                            order: {
                                byElement: selectedElement,
                                direction:that.model.getData().sortDirection
                            }
                        });
                        that._execute(command);
                    
                    }
                }).addStyleClass("borderIconCombo");
                var orderItem = new sap.ui.core.ListItem({
                });
                
                orderItem.bindProperty("text", {
                    path: "element",
                    formatter: function(element) {
                        return element ? element.name : "";
                    } 
                });
                orderItem.bindProperty("key", {
                    path: "element",
                    formatter: function(element) {
                        return element ? element.name : "";
                    }
                });
                orderItem.bindProperty("icon", {
                    path: "element",
                    formatter: function(element) {
                        if(element){
                            return that.getIconPath(element);
                        }
                    }
                });
                var listBox = new sap.ui.commons.ListBox({
                    displayIcons: true,
                    items: {
                        path: "/attributeElementsForOrder",
                        template: orderItem
                    }
                });
                orderByCombo.setListBox(listBox);
                
               /* orderByCombo.bindItems({
                        path: "/viewNodeElements",
                        template: orderItem
                }); */
                
                topMatrixLayout.createRow(orderBy, orderByCombo);

                var dynamicPartition = new sap.ui.commons.CheckBox({
                    width: "30%",
                    text: resourceLoader.getText("txt_dynamic_partition_element"),
                    checked: "{dynamicPartition}",
                    change: function(oevent) {
                       var newValue = oevent.getParameter("checked"); 
                        var command = new commands.ChangeRankNodePropertiesCommand(that._viewNode.name, {
                            dynamicPartitionElements :newValue
                        });
                        that._execute(command);
                     that.model.getData().dynamicPartition = newValue;
                    
                    }
                });

                topMatrixLayout.addRow(new sap.ui.commons.layout.MatrixLayoutRow({
                    cells: [new sap.ui.commons.layout.MatrixLayoutCell(), new sap.ui.commons.layout.MatrixLayoutCell({
                        content: [dynamicPartition]
                    })]
                }));
                // topMatrixLayout.createRow(dynamicPartition);

                var partitionTable = that.getPartitionTable();

                topMatrixLayout.addRow(new sap.ui.commons.layout.MatrixLayoutRow({
                    cells: [new sap.ui.commons.layout.MatrixLayoutCell(), new sap.ui.commons.layout.MatrixLayoutCell({
                        content: [partitionTable]
                    })]
                }));

                // topMatrixLayout.createRow(partitionTable);

            mainLayout.addContent(topMatrixLayout);
            return mainLayout;
                // return topMatrixLayout;

            },
            getPartitionTable: function() {
                var that = this;
                var partitionTable = new sap.ui.table.Table({
                    visibleRowCount: 4,
                    width: "80%"
                });



                var toolBar = new sap.ui.commons.Toolbar().addStyleClass("parameterToolbarStyle");
                var createIcon = new sap.ui.commons.Button({
                    icon: "sap-icon://add", //resourceLoader.getImagePath("Add.png"),
                    // text: resourceLoader.getText("tol_add"),
                    tooltip: resourceLoader.getText("tol_add"),
                    press: function() {
                        var emptyElementExist = false;
                        that.model.getData().columnPartitions.forEach(function(element){
                            if(element && element.partitionElement === ""){
                              emptyElementExist = true;
                            }
                            
                        });
                        if(!emptyElementExist){
                        that.model.getData().columnPartitions.push({
                            partitionElement: ""
                        }
                        );
                        that.model.updateBindings(true);
                        }
                    }
                });

                var deleteIcon = new sap.ui.commons.Button({
                    icon: "sap-icon://delete", //resourceLoader.getImagePath("Delete.png"),
                    // text: resourceLoader.getText("tol_remove"),
                    tooltip: resourceLoader.getText("tol_remove"),
                    enabled: {
                        path: "name",
                        formatter: function() {

                        }
                    },
                    press: function() {
                         var removePartitionCommands = [];
                        for (var i = 0; i < partitionTable.getSelectedIndices().length; i++) {
                            var bindContext = partitionTable.getContextByIndex(partitionTable.getSelectedIndices()[i]);
                            if (bindContext) {
                                var partitionElement = bindContext.getProperty("partitionElement");
                                if (partitionElement && partitionElement !== "") {
                                    removePartitionCommands.push(new commands.ChangeRankNodePropertiesCommand(that._viewNode.name,{partitionElement:{
                                        oldPartitionElement: partitionElement.name
                                    }}
                                    ));
                                    partitionTable.removeSelectionInterval(partitionTable.getSelectedIndices()[i], partitionTable.getSelectedIndices()[i]);
                                     that.model.getData().columnPartitions.splice(partitionTable.getSelectedIndices()[i], 1);
                                     that._execute(new modelbase.CompoundCommand(removePartitionCommands));
                                     that.model.updateBindings(true);
                                } else if (partitionElement === "") {
                                    that.model.getData().columnPartitions.splice(partitionTable.getSelectedIndices()[i], 1);
                                    partitionTable.removeSelectionInterval(partitionTable.getSelectedIndices()[i], partitionTable.getSelectedIndices()[i]);
                                    that.model.updateBindings(true);
                                }
                            }
                        }
                    }

                });
                toolBar.addRightItem(createIcon);
                toolBar.addRightItem(deleteIcon);
                toolBar.addItem(new sap.ui.commons.Label({
                    text: resourceLoader.getText("tit_partition_by")
                }));

                partitionTable.setToolbar(toolBar);




                var oImage = new sap.ui.commons.Image({
                    src: {
                        path: "partitionElement",
                        formatter: function(partitionElement) {
                            if(partitionElement){
                                return that.getIconPath(partitionElement);
                            }
                        }
                    }
                    //src: resourceLoader.getImagePath("Attribute.png")
                });
                var attributeCombo = new sap.watt.hanaplugins.editor.plugin.hdbcalculationview.view.IconComboBox({
                    canedit:false,
                    selectedKey: {
                        path: "partitionElement",
                        formatter: function(element) {
                            return element ? element.name : "";
                        }
                    },
                    value: {
                        path: "partitionElement",
                        formatter: function(element) {
                            return element ? element.name : "" ;
                        }
                    },
                    change: function(event) {
                        var selectedItem = event.getParameter("selectedItem");
                        if (selectedItem && selectedItem.getBindingContext()) {
                            var selectedElement = selectedItem.getBindingContext().getProperty("element");

                            var selectedIndex = partitionTable._getFocusedRowIndex();
                            var previousElement = that.model.getData().columnPartitions[selectedIndex] ? that.model.getData().columnPartitions[selectedIndex].partitionElement : undefined;

                             var changeCommand = new commands.ChangeRankNodePropertiesCommand(that._viewNode.name,{partitionElement:{
                                        newPartitionElement: selectedElement.name,
                                        oldPartitionElement : previousElement ? previousElement.name : previousElement
                                    }}
                                    );
                            that._execute(changeCommand);
                            if(!previousElement){
                             that.model.getData().columnPartitions = that.getPartitionElements();}
                             else{
                                 that.model.getData().columnPartitions = that.getPartitionElements();
                                 that.model.getData().columnPartitions.push({
                              partitionElement: ""
                            } );
                             }
                            that.model.getData().columnPartitions = that.getPartitionElements();
                            that.model.updateBindings(true);
                            that.model.updateBindings(true);
                        }
                    
                    },
                    icon: oImage
                }).addStyleClass("marginLeft");

                var attributeListItem = new sap.ui.core.ListItem();
                attributeListItem.bindProperty("text", {
                    path: "element",
                    formatter: function(element) {
                        return element ? element.name : "";
                    }
                });
                attributeListItem.bindProperty("key", {
                    path: "element",
                    formatter: function(element) {
                        return element ? element.name : "";
                    }
                });
                attributeListItem.bindProperty("icon", {
                    path: "element",
                    formatter: function(element) {
                        return that.getIconPath(element);
                    }
                });

                var listBox = new sap.ui.commons.ListBox({
                    displayIcons: true,
                    items: {
                        path: "/viewNodeElements",
                        template: attributeListItem
                    }
                });
                attributeCombo.setListBox(listBox);

                /*  attributeCombo.bindItems({
                    path: "/viewNodeElements",
                    template: attributeListItem
                })*/

                var attributeColumn = new sap.ui.table.Column({
                    width: "100%",
                    label: new sap.ui.commons.Label({
                        text: "Partition By Column"
                    }),
                    template: attributeCombo
                });

                partitionTable.addColumn(attributeColumn);

                partitionTable.bindRows("/columnPartitions");

                return partitionTable;

            },
             isBasedOnElementProxy:function(element,columnView ,viewNode){
                if(element){
               var results = CalcViewEditorUtil.isBasedOnElementProxy({
                     object:element,
                     columnView:this._model.columnView,
                     viewNode:this._viewNode
                 });
                 if(results){
                   return true;
                 }
                }
                  return false;
            },
             getIconPath: function(element) {
                if (element) {
                     return resourceLoader.getImagePath("Column.png");
                }
                return resourceLoader.getImagePath("Column.png");
            },
            getToolBar: function() {
                var toolBar = new sap.ui.commons.Toolbar({
                    width: "100%",
                    items: []
                }).addStyleClass("parameterToolbarStyle");
                return toolBar;
            }

        };

        return RankNodePane;

    });
