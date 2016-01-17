/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define([        
        "../view/CalcViewEditorUtil",
        "../viewmodel/model"
    ],
	function(CalcViewEditorUtil, model) {		
		var ColumnDataLineage = function(parameter) {
			this.editor = parameter.editor;
			this.lineageLayout = parameter.lineageLayout;
			this._Sequencetabels = {};
			this.lineageButton = undefined;
			this.lineageView = false;
			this.dataLineage = {
				viewNodeList: [],
				datasoureViewNodeMap: [],
				sorceElementViewNodeMap: [],
				targetElementViewNodeMap: [],
				nodeAndElements: []
			};
		};

		ColumnDataLineage.prototype = {
				

                traceColumnLineage: function(viewNode, element, curTab) {
                                var findClearBut = this.lineageLayout.getParent().getParent().getCells()[2].getContent()[0].getRows()[0].getCells()[5].getContent()[0];
                                findClearBut.firePress();
                                this.elementName1 = element.name;
                                var semTable = this._Sequencetabels["sc1"];
                                if (semTable !== undefined && curTab === "Sc") {
                                                var semElements = semTable.getModel().oData.columns;
                                                if (semElements !== undefined) {
                                                                for (var q = 0; q < semElements.length; q++) {
                                                                                if (semElements[q].name === element.name) {
                                                                                                semElements[q].lineage = undefined;
                                                                                }

                                                                }
                                                }
                                                semTable.getModel().refresh(true);
                                }

                                var secondTable = this._Sequencetabels["mp2"];
                                if (secondTable !== undefined && curTab === "mp") {
                                                var path1 = secondTable.mBindingInfos.rows.path;
                                                var elements1 = secondTable.getModel().oData[path1.replace("/", "")].nodes;
                                                for (var j = 0; j < elements1.length; j++) {
                                                                var element1 = elements1[j];
                                                                element1.lineage = undefined;

                                                }
                                                secondTable.getModel().refresh(true);
                                }
                                var firstTable = this._Sequencetabels["mp1"];
                                if (firstTable !== undefined && curTab === "mp") {

                                                var path = firstTable.mBindingInfos.rows.path;
                                                var elements = firstTable.getModel().oData[path.replace("/", "")].nodes;
                                                for (var r = 0; r < elements.length; r++) {
                                                                var element2 = elements[r];
                                                                var nodes = element2.nodes;
                                                                for (var i = 0; i < nodes.length; i++) {
                                                                                var node = nodes[i];
                                                                                node.lineage = undefined;

                                                                }
                                                }
                                                firstTable.getModel().refresh(true);

                                }

                                for (var k = 0; k < this.dataLineage.targetElementViewNodeMap.length; k++) {
                                                this.dataLineage.targetElementViewNodeMap[k].lineage = undefined;
                                }
                                for (var l = 0; l < this.dataLineage.sorceElementViewNodeMap.length; l++) {
                                                this.dataLineage.sorceElementViewNodeMap[l].lineage = undefined;
                                }

                                this.dataLineage = {
                                                viewNodeList: [],
                                                datasoureViewNodeMap: [],
                                                sorceElementViewNodeMap: [],
                                                targetElementViewNodeMap: [],
                                                nodeAndElements: []
                                };

                                this.lineageLayout.removeStyleClass("lineageDisplay");
                                this.repeatLineageNode(viewNode, element);
                                this.lineageLayout.getRows()[0].getCells()[1].getContent()[0].setText("Column Lineage");

                                for (var m = 0; m < this.dataLineage.targetElementViewNodeMap.length; m++) {
                                                this.dataLineage.targetElementViewNodeMap[m].lineage = "lineage";
                                }
                                for (var p = 0; p < this.dataLineage.sorceElementViewNodeMap.length; p++) {
                                                this.dataLineage.sorceElementViewNodeMap[p].lineage = "lineage";
                                }
                                var semTable1 = this._Sequencetabels["sc1"];
                                if (semTable1 !== undefined && curTab === "Sc") {
                                                var semElements = semTable1.getModel().oData.columns;
                                                if (semElements !== undefined) {
                                                                for (var q = 0; q < semElements.length; q++) {
                                                                                if (semElements[q].name === element.name) {
                                                                                                semElements[q].lineage = "lineage";
                                                                                } else {
                                                                                                semElements[q].lineage = undefined;
                                                                                }

                                                                }
                                                }
                                                semTable.getModel().refresh(true);
                                }
                                var secondTable = this._Sequencetabels["mp2"];
                                if (secondTable !== undefined && curTab === "mp") {
                                                var path1 = secondTable.mBindingInfos.rows.path;
                                                var elements1 = secondTable.getModel().oData[path1.replace("/", "")].nodes;
                                                for (var j = 0; j < elements1.length; j++) {
                                                                var element1 = elements1[j];
                                                                if (element1.name === element.name) {
                                                                                element1.lineage = "lineage";
                                                                } else {
                                                                                element1.lineage = undefined;
                                                                }

                                                }
                                                secondTable.getModel().refresh(true);
                                }
                                var firstTable = this._Sequencetabels["mp1"];
                                if (firstTable !== undefined && curTab === "mp") {

                                                var path = firstTable.mBindingInfos.rows.path;
                                                var elements = firstTable.getModel().oData[path.replace("/", "")].nodes;
                                                for (var r = 0; r < elements.length; r++) {
                                                                var element2 = elements[r];
                                                                var nodes = element2.nodes;
                                                                for (var i = 0; i < nodes.length; i++) {
                                                                                var node = nodes[i];
                                                                                var value = 'columnView.viewNodes["' + element2.name + '"].elements["' + nodes[i].name + '"]';
                                                                                if (value === element.getMapping().sourceElement.$getKeyPath()) {
                                                                                                nodes[i].lineage = "lineage";
                                                                                } else {
                                                                                                nodes[i].lineage = undefined;
                                                                                }

                                                                }
                                                }
                                                firstTable.getModel().refresh(true);

                                }
                                this.lineageView = " Lineage for Column " + this.dataLineage.viewNodeList[0].name +
                                                "." + this.dataLineage.sorceElementViewNodeMap[0].name;
                                return this.dataLineage;

                },
                clearData: function(editor1) {
                                this.editor = editor1;
                                this.lineageView = false;
                                if (this.lineageButton !== undefined) {
                                                this.lineageButton.setEnabled(true);
                                }
                                var semTable = this._Sequencetabels["sc1"];
                                if (semTable !== undefined) {
                                                var semElements = semTable.getModel().oData.columns;
                                                if (semElements !== undefined) {
                                                                if (semElements !== undefined) {
                                                                                for (var q = 0; q < semElements.length; q++) {
                                                                                                if (semElements[q].name === this.elementName1) {
                                                                                                                semElements[q].lineage = undefined;
                                                                                                }

                                                                                }
                                                                }
                                                }
                                                semTable.getModel().refresh(true);
                                }

                                var secondTable = this._Sequencetabels["mp2"];
                                if (secondTable !== undefined && secondTable.mBindingInfos.rows !== undefined) {
                                                var path1 = secondTable.mBindingInfos.rows.path;
                                                var elements1 = secondTable.getModel().oData[path1.replace("/", "")].nodes;
                                                for (var j = 0; j < elements1.length; j++) {
                                                                var element1 = elements1[j];
                                                                element1.lineage = undefined;

                                                }
                                                secondTable.getModel().refresh(true);
                                }
                                var firstTable = this._Sequencetabels["mp1"];
                                if (firstTable !== undefined && firstTable.mBindingInfos.rows !== undefined) {

                                                var path = firstTable.mBindingInfos.rows.path;
                                                var elements = firstTable.getModel().oData[path.replace("/", "")].nodes;
                                                for (var r = 0; r < elements.length; r++) {
                                                                var element2 = elements[r];
                                                                var nodes = element2.nodes;
                                                                for (var i = 0; i < nodes.length; i++) {
                                                                                var node = nodes[i];
                                                                                node.lineage = undefined;
                                                                }
                                                }
                                                firstTable.getModel().refresh(true);

                                }
                                var ccTable = this._Sequencetabels["cc"];
                                if (ccTable !== undefined) {
                                                var elements2 = ccTable.getModel().oData;
                                                for (var m = 0; m < elements2.length; m++) {
                                                                elements2[m].lineage = undefined;
                                                }
                                                ccTable.getModel().refresh(true);
                                }
                                for (var k = 0; k < this.editor.getAllSymbols().length; k++) {
                                                this.editor.getAllSymbols()[k].changeBorder = false;
                                                this.editor.getAllSymbols()[k].changeInputBorder = false;
                                                this.editor.getAllSymbols()[k].changeTableBorder = false;
                                                this.editor.getAllSymbols()[k].highlightBorder = false;

                                }

                                for (var m = 0; m < this.dataLineage.targetElementViewNodeMap.length; m++) {
                                                this.dataLineage.targetElementViewNodeMap[m].lineage = undefined;
                                }
                                for (var p = 0; p < this.dataLineage.sorceElementViewNodeMap.length; p++) {
                                                this.dataLineage.sorceElementViewNodeMap[p].lineage = undefined;
                                }
                                this.dataLineage = {
                                                viewNodeList: [],
                                                datasoureViewNodeMap: [],
                                                sorceElementViewNodeMap: [],
                                                targetElementViewNodeMap: [],
                                                nodeAndElements: []
                                };

                },
                repeatLineageNode: function(viewNode, element) {
                    this.dataLineage.viewNodeList.push(viewNode);
                                var mappingFound = false;
                                var sourceElement;
                                var targetElement;
                                
                                if(viewNode.inputs){
                                for (var i = 0; i < viewNode.inputs.size(); i++) {
                                    var input = viewNode.inputs.get(i);
                                    for (var j = 0; j < input.mappings.count(); j++) {
                                        var mapping = input.mappings.get(j);
                                        if (mapping && mapping.sourceElement!==undefined && mapping.targetElement === element) {
                                            sourceElement = mapping.sourceElement;
                                                                                targetElement = mapping.targetElement;
                                         if(sourceElement){
                                             this.dataLineage.datasoureViewNodeMap.push({
                                                                                                viewNode: viewNode,
                                                                                                input: input
                                                                                });
                                                                                this.dataLineage.sorceElementViewNodeMap.push(sourceElement);
                                                                                this.dataLineage.targetElementViewNodeMap.push(targetElement);
                                                                                mappingFound = true;
                                         }
                                         break;
                                        }else{
                                          mappingFound = false;  
                                        }
                                         
                                    }
                                    if(mappingFound ){
                                        this.repeatLineageNode(input._source, sourceElement);
                                        if(viewNode.type !=="Union"){
                                        break;
                                        }
                                    }
                                }
                                }
                    
                },
                registerTable: function(key, table) {
                                this._Sequencetabels[key] = table;
                }


				
		};
		return ColumnDataLineage;
	});
