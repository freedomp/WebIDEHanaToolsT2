namespace("sap.watt.hanaplugins.editor.plugin.hdbcalculationview.impactanalysis.generic",function(editor){
    'use strict'
    editor.DiagramEditorExtension = sap.galilei.core.defineClass({
        // Define class name
        fullClassName: "sap.watt.hanaplugins.editor.plugin.hdbcalculationview.impactanalysis.generic.DiagramEditorExtension",

        // Define parent
        parent: sap.galilei.ui.editor.impactAnalysis.DiagramEditorExtension,
        
        methods:{
            showTooltip:function(shapeType, oEvent, oSymbol){
                var div = document.createElement("div");

				var availableSpaceY = Math.abs(window.screen.availHeight - oEvent.pageY);

				if (availableSpaceY > 200) {
					div.style.top = oEvent.pageY + 20 + "px";
					div.style.left = oEvent.pageX + 10 + "px";

				} else {
					div.style.top = oEvent.pageY - 150 + "px";
					div.style.left = oEvent.pageX + 10 + "px";
				}
				div.setAttribute("class", "impactPropertyTooltip");
						var c1Div = document.createElement("div");
						var c1DSpan = document.createElement("span");
						c1DSpan.setAttribute("class", "tPropName");
						var c1DSpanText = document.createTextNode(oSymbol.object.analysisObject.name);
						c1DSpan.appendChild(c1DSpanText);
						c1Div.appendChild(c1DSpan);
						div.appendChild(c1Div);
					var body = document.getElementsByTagName("body")[0];
					oSymbol.object.hover = true;
					setTimeout(function() {
						if (oSymbol && oSymbol.object && oSymbol.object.hover) {
							var hover = document.getElementsByClassName("impactPropertyTooltip");
							if (typeof hover != 'undefined') {
								for (var ii = 0; hover.length; ++ii) {
									hover[ii].parentElement.removeChild(hover[ii]);
								}
							}
							body.appendChild(div);
						}
					}, 150); 
				
            },
            hideTooltip:function( oEvent, oSymbol){
				if (oSymbol.object.hover)
					oSymbol.object.hover = false;
				if (oSymbol.object.Fill)
					oSymbol.object.Fill = "Transparent";
				var hover = document.getElementsByClassName("impactPropertyTooltip");
				if (typeof hover !== 'undefined') {
					for (var ii = 0; hover.length; ++ii) {
						hover[ii].parentElement.removeChild(hover[ii]);
					}
				}
			
                
            },
			onKeyDown: function (oEvent) {
				var self = this,
                bProcessed = false,
                bExpandAll;

            switch (oEvent.keyCode) {
                case 107: // Add (+)
                    if (this.editor.selectedSymbols.length > 0) {

                        // Expand impact and lineage
                        bExpandAll = oEvent.ctrlKey;
                        this.impactAnalyzer.expandSelectedNodes(true, true, false, bExpandAll ? sap.galilei.ui.editor.impactAnalysis.ImpactAnalyzer.MAX_EXPAND_LEVEL : 1);
                        bProcessed = true;
                    }
                    break;
                case 109: // Substract (-)
                    if (this.editor.selectedSymbols.length > 0) {

                        // Collapse impact and lineage
                        this.impactAnalyzer.collapseSelectedNodes(true, true, false);
                        bProcessed = true;
                    }
                    break;
            }


            return bProcessed || this.editor.defaultOnKeyDown(oEvent);
			}
        }
    });
});