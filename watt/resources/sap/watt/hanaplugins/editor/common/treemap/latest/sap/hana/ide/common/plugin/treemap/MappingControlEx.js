/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
jQuery.sap.declare("sap.watt.hanaplugins.editor.common.treemap.MappingControlEx");
jQuery.sap.require("com.sap.it.spc.webui.mapping.MappingControl");
jQuery.sap.require("com.sap.it.spc.webui.mapping.core");
/**
 * sap.watt.hanaplugins.editor.common.treemap.MappingControlEx extends
 * com.sap.it.spc.webui.mapping.MappingControl with new functionality which is
 * required for HANA Modeler
 */
// sap.watt.hanaplugins.editor.common.treemap.MappingControlEx = function() {
// };
// sap.watt.hanaplugins.editor.common.treemap.MappingControlEx.prototype = new
// com.sap.it.spc.webui.mapping.MappingControl();
com.sap.it.spc.webui.mapping.MappingControl.extend("sap.watt.hanaplugins.editor.common.treemap.MappingControlEx", {
    
    metadata : {
	
	events : {
	    "createMapping" : {
		    allowPreventDefault : true
		}
	}
	
    },
    renderer : "com.sap.it.spc.webui.mapping.MappingControlRenderer"
});

/**
 * Overriding this method allows controlling if a certain drop is allowed. TODO
 * should be part of the API
 */
// sap.watt.hanaplugins.editor.common.treemap.MappingControlEx.prototype._canDrag =
// function(element, oTable) {
// return true;
// };
/**
 * Set a custom label for the first hierarchical column of the source tree
 * 
 * @param {sap.ui.core.Control}
 *                oCustomlabel
 */
sap.watt.hanaplugins.editor.common.treemap.MappingControlEx.prototype.setCustomSourceLabel = function(oCustomlabel) {
    // replacing default column template with new one
    var oSColumns = this._getSourceTable().getColumns();
    oSColumns[0].setTemplate(oCustomlabel);
};

/**
 * Set a custom label for the first hierarchical column of the target tree
 * 
 * @param {sap.ui.core.Control}
 *                oCustomlabel
 */
sap.watt.hanaplugins.editor.common.treemap.MappingControlEx.prototype.setCustomTargetLabel = function(oCustomlabel) {
    // replacing default column template with new one
    var oTColumns = this._getTargetTable().getColumns();
    oTColumns[0].setTemplate(oCustomlabel);
};

/**
 * Redefine the start point for data binding. This is important for having
 * multiple root elements. The mapping model knows only one root node per tree.
 * But the root node could have multiple children. By setting the binding to
 * "/rootNode" the initial root node is not visible but its children appear as
 * new root nodes
 */
sap.watt.hanaplugins.editor.common.treemap.MappingControlEx.prototype.setCustomSourceBinding = function(sCustomBinding) {
    this._getSourceTable().bindRows(sCustomBinding);
};

/**
 * Redefine the start point for data binding. This is important for having
 * multiple root elements. The mapping model knows only one root node per tree.
 * But the root node could have multiple children. By setting the binding to
 * "/rootNode" the initial root node is not visible but its children appear as
 * new root nodes
 */
sap.watt.hanaplugins.editor.common.treemap.MappingControlEx.prototype.setCustomTargetBinding = function(sCustomBinding) {
    this._getTargetTable().bindRows(sCustomBinding);
};

sap.watt.hanaplugins.editor.common.treemap.MappingControlEx.prototype.setDropValidator = function(fCallback) {
    if (typeof fCallback === "function") {
	this._dropValidatorCallback = fCallback;
    } else {
	this._dropValidatorCallback = null;
    }

};

/**
 * Called by _setupDragAndDrop
 * 
 * @param element
 * @returns
 */
sap.watt.hanaplugins.editor.common.treemap.MappingControlEx.prototype._validateDrop = function(element) {
    var oSourceContext = this._getRowContextFromElement(this._dragStart.startElement, this._getSourceTable());
    var oSource = oSourceContext.getObject();
    var oTargetContext = this._getRowContextFromElement(element, this._getTargetTable());
    var oTarget = null;
    if (oTargetContext) {
	oTarget = oTargetContext.getObject();
    }

    if (typeof this._dropValidatorCallback === "function") {
	return this._dropValidatorCallback([ oSource ], oTarget);
    } else {
	return true;
    }

};

/**
 * Customized copy which overwrites MappingControl_setupDragAndDrop and
 * implements an hook for drop validation callbacks.
 */
sap.watt.hanaplugins.editor.common.treemap.MappingControlEx.prototype._setupDragAndDrop = function() {
    var that = this, oGR = this._oGraphicRenderer, $this = this.$();
    // handle auto scroll down
    $this.find(".webuiMapping .sapUiHorizontalSplitterBar").mouseover(function(oEvent) {
	if (!!that._dragStart) {
	    that.scrollable = true;// move this to dragstart
	    that.scrollDown(oEvent);
	}
    }).mouseout(function() {
	that.scrollable = false;
    });

    // Handle start of drag
    $this.find(".webuiGraphicalArea").mousedown(
	    function(oEvent) {
		var currentElement = this.ownerDocument.elementFromPoint(oEvent.clientX, oEvent.clientY), bDraggable;
		$this = that.$();
		that._dragStart = null;
		if ($this.find(".webuiSourceMessage table").find($(currentElement)).length > 0) {
		    bDraggable = that._isValidRowElement(currentElement, that._getSourceTable());
		    if (bDraggable) {
			that._dragStart = that._getDragInfo(currentElement, "source");
			that._dragStart.isSourceTable = true;
		    } else {
			document.body.style.cursor = "not-allowed";
		    }
		} else if ($this.find(".webuiTargetMessage table").find($(currentElement)).length > 0) {
		    bDraggable = that._isValidRowElement(currentElement, that._getTargetTable())
			    && !that._isMapped(currentElement, that._getTargetTable());
		    if (bDraggable) {
			that._dragStart = that._getDragInfo(currentElement, "target");
			that._dragStart.isTargetTable = true;
		    } else {
			document.body.style.cursor = "not-allowed";
		    }
		}
	    });
    // Handle connection line previews
    $this.find(".webuiGraphicalArea").mousemove(
	    function(oEvent) {
		var ce /* current element */, pp/* preview point */, canvas, bDraggable;
		$this = that.$();
		if (!!that._dragStart) {
		    ce = this.ownerDocument.elementFromPoint(oEvent.clientX, oEvent.clientY);
		    document.body.style.cursor = "auto";
		    oGR.cancelPreview();
		    if ($this.find(".webuiSourceMessage table").find($(ce)).length > 0
			    && !that._dragStart.isSourceTable) {
			if (!!that._getRowContextFromElement(ce, that._getSourceTable())) {
			    document.body.style.cursor = "auto";
			} else {
			    document.body.style.cursor = "not-allowed";
			}
			pp = that._getDragInfo(ce, "source");
			oGR.showPreview(that._dragStart.x, that._dragStart.y, pp.x, pp.y);
		    } else if ($this.find(".webuiSourceMessage table").find($(ce)).length > 0
			    && that._dragStart.isSourceTable) {
			if (ce.contains(that._dragStart.startElement)) {
			    document.body.style.cursor = "auto";
			} else {
			    document.body.style.cursor = "not-allowed";
			}
		    } else if ($this.find(".webuiTargetMessage table").find($(ce)).length > 0
			    && !that._dragStart.isTargetTable) {
			// customization
			bDraggable = that._validateDrop(ce);
			// bDraggable = that._isValidRowElement(ce,
			// that._getTargetTable());
			document.body.style.cursor = bDraggable ? "auto" : "not-allowed";
			pp = that._getDragInfo(ce, "target");
			oGR.showPreview(that._dragStart.x, that._dragStart.y, pp.x, pp.y);
		    } else if ($this.find(".webuiTargetMessage table").find($(ce)).length > 0
			    && that._dragStart.isTargetTable) {
			if (ce.contains(that._dragStart.startElement)) {
			    document.body.style.cursor = "auto";
			} else {
			    document.body.style.cursor = "not-allowed";
			}
		    } else if (ce.className && ce.className.baseVal
			    && ce.className.baseVal.indexOf("functionIcon") !== -1) {
			document.body.style.cursor = "not-allowed";
			canvas = $this.find(".sapUiBorderLayoutCenter");
			oGR.showPreview(that._dragStart.x, that._dragStart.y, oEvent.clientX - canvas.offset().left,
				oEvent.clientY - canvas.offset().top);
		    } else if ($this.find(".webuiTargetMessage .sapUiTableCnt").find($(ce)).length > 0
			    && $this.find(".webuiTargetMessage .sapUiTableCnt .sapUiTableCCnt").find($(ce)).length === 0
			    // if drag and drop is on target table header
			    && !that._dragStart.isTargetTable) {
			bDraggable = that._validateDrop(ce);
			document.body.style.cursor = bDraggable ? "auto" : "not-allowed";
			var canvas = $(".webuiTargetMessage .sapUiTableCol");
			var x = $(".webuiGraphicalArea .sapUiBorderLayoutCenter").outerWidth();
			var y = canvas.outerHeight(true)/2;
			oGR.showPreview(that._dragStart.x, that._dragStart.y, x, y);	
			
		    } else if (
		        ($(ce).hasClass("sapUiTableCtrlEmpty") || ($this.find(".webuiTargetMessage .sapUiTableCtrlEmpty").find($(ce)).length > 0))
			    // if drag and drop is on empty target table
			    && !that._dragStart.isTargetTable) {

			        
			bDraggable = that._validateDrop(ce);
			document.body.style.cursor = bDraggable ? "auto" : "not-allowed";
			var canvas = $(".sapUiBorderLayoutCenter");
			var x = canvas.outerWidth();
			var y = canvas.outerHeight(true)/2;
			oGR.showPreview(that._dragStart.x, that._dragStart.y, x, y);
			
		    } else {
			canvas = $this.find(".sapUiBorderLayoutCenter");
			oGR.showPreview(that._dragStart.x, that._dragStart.y, oEvent.clientX - canvas.offset().left,
				oEvent.clientY - canvas.offset().top);
		    }
		    oEvent.stopPropagation();
		}
	    });
    // Handle drop
    $this.find(".webuiGraphicalArea").mouseup(
	    function(oEvent) {
		document.body.style.cursor = "auto";
		var currentElement, dropPoint, bDroppable, oTable, sMappingId;
		$this = that.$();
		if (!!that._dragStart) {
		    oGR.cancelPreview();
		    currentElement = this.ownerDocument.elementFromPoint(oEvent.clientX, oEvent.clientY);
		    if ($this.find(".webuiSourceMessage table").find($(currentElement)).length > 0
			    && !that._dragStart.isSourceTable) {
			bDroppable = that._isValidRowElement(currentElement, that._getSourceTable());
			if (bDroppable) {
			    dropPoint = that._getDragInfo(currentElement, "source");
			    that._createMapping(currentElement, "source", that._dragStart.xPath);
			}
		    } else if ($this.find(".webuiTargetMessage table").find($(currentElement)).length > 0
			    && !that._dragStart.isTargetTable) {
			oTable = that._getTargetTable();
			// customization
			bDroppable = that._validateDrop(currentElement);
			// bDroppable = that._isValidRowElement(currentElement,
			// oTable);
			if (bDroppable) {
			    var oTargetContext = that._getRowContextFromElement(currentElement, that._getTargetTable());
			    var oSourceContext = that._getRowContextFromElement(that._dragStart.startElement, that._getSourceTable());
			    dropPoint = that._getDragInfo(currentElement, "target");
			    var bExecuteDefault = that.fireCreateMapping({
				mappingControl : that,
				sourceObject : oSourceContext ? oSourceContext.getObject() : null,
				targetObject : oTargetContext ? oTargetContext.getObject() : null
			    });
			    if(bExecuteDefault){
        			    if (that._isMapped(currentElement, oTable)) {
        				sMappingId = that._getMappingIds(dropPoint.xPath, "target")[0];
        				dropPoint = oGR.getFunctionXY(sMappingId);
        				that._addNewConnectionToMapping(sMappingId, that._dragStart.xPath, "source");
        			    } else {
					if(oTargetContext){
					    //drop onto existing element
					    that._createMapping(currentElement, "target", that._dragStart.xPath);
					}
        			    }
			    }
			}
		    }else if ($this.find(".webuiTargetMessage .sapUiTableCnt").find($(currentElement)).length > 0
			    && $this.find(".webuiTargetMessage .sapUiTableCnt .sapUiTableCCnt").find($(currentElement)).length === 0
			    // if drag and drop is on target table header
			    && !that._dragStart.isTargetTable){
			
				bDroppable = that._validateDrop(currentElement);
        			if(bDroppable){
        				
        				var oSourceContext = that._getRowContextFromElement(that._dragStart.startElement, that._getSourceTable());
        				var bExecuteDefault = that.fireCreateMapping({
        				    mappingControl : that,
        				    sourceObject: oSourceContext ? oSourceContext.getObject() : null,
        				    targetObject: null
        				});
        			    
        			}
        			
		    } else if (
		        ($(currentElement).hasClass("sapUiTableCtrlEmpty") || ($this.find(".webuiTargetMessage .sapUiTableCtrlEmpty").find($(currentElement)).length > 0))
			    // if drag and drop is on empty target table
			    && !that._dragStart.isTargetTable) {
			        
			        
			bDroppable = that._validateDrop(currentElement);
        			if(bDroppable){
        				
        				var oSourceContext = that._getRowContextFromElement(that._dragStart.startElement, that._getSourceTable());
        				var bExecuteDefault = that.fireCreateMapping({
        				    mappingControl : that,
        				    sourceObject: oSourceContext ? oSourceContext.getObject() : null,
        				    targetObject: null
        				});
        			    
        			}
		    }
		    oEvent.stopPropagation();
		}
		that._dragStart = null;
	    });

    // handle auto expand and auto scroll up
    $this.find(".webuiGraphicalArea").mouseover(
	    function(oEvent) {
		var currentElement, previewPoint;
		$this = that.$();
		if (!!that._dragStart) {
		    oGR.cancelPreview();
		    currentElement = this.ownerDocument.elementFromPoint(oEvent.clientX, oEvent.clientY);
		    if ($this.find(".webuiSourceMessage .sapUiTableTr").find($(currentElement)).length > 0
			    && !that._dragStart.isSourceTable) {
			that._expandRow(currentElement, that._getSourceTable());
			previewPoint = that._getDragInfo(currentElement, "source");
			oGR.showPreview(that._dragStart.x, that._dragStart.y, previewPoint.x, previewPoint.y);
		    } else if ($this.find(".webuiTargetMessage .sapUiTableTr").find($(currentElement)).length > 0
			    && !that._dragStart.isTargetTable) {
			that._expandRow(currentElement, that._getTargetTable());
			previewPoint = that._getDragInfo(currentElement, "target");
			oGR.showPreview(that._dragStart.x, that._dragStart.y, previewPoint.x, previewPoint.y);
		    } else if ($this.find(".webuiSourceMessage .sapUiTableCol").find($(currentElement)).length > 0
			    && !that._dragStart.isSourceTable) {
			that.scrollable = true;
			that.scrollUp(oEvent, "source");
			oGR.showPreview(that._dragStart.x, that._dragStart.y, oEvent.clientX, oEvent.clientY);
		    } else if ($this.find(".webuiTargetMessage .sapUiTableCol").find($(currentElement)).length > 0
			    && !that._dragStart.isTargetTable) {
			that.scrollable = true;
			that.scrollUp(oEvent, "target");
			oGR.showPreview(that._dragStart.x, that._dragStart.y, oEvent.clientX, oEvent.clientY);
		    }
		}
	    }).mouseout(function() {
	that.scrollable = false;
    });

    // Handle events on document
    $(document).mousemove(
	    function(oEvent) {
		if (!!that._dragStart) {
		    $this = that.$();
		    document.body.style.cursor = "not-allowed";
		    canvas = $this.find(".sapUiBorderLayoutCenter");
		    oGR.cancelPreview();
		    oGR.showPreview(that._dragStart.x, that._dragStart.y, oEvent.clientX - canvas.offset().left,
			    oEvent.clientY - canvas.offset().top);
		}
	    });
    $(document).mouseup(function(oEvent) {
	if (!!that._dragStart) {
	    oGR.cancelPreview();
	    document.body.style.cursor = "auto";
	    that._dragStart = null;
	}
    });

    sap.watt.hanaplugins.editor.common.treemap.MappingControlEx.prototype.getSelectedNodes = function() {
	aSelectedNodes = [];
	var selctedIndicesSource = this._getSourceTable().getSelectedIndices();
	var selctedIndicesTarget = this._getTargetTable().getSelectedIndices();
	for ( var i in selctedIndicesSource) {
	    aSelectedNodes.push(this._getSourceTable().getContextByIndex(selctedIndicesSource[i]).getObject());
	}
	for ( var i in selctedIndicesTarget) {
	    aSelectedNodes.push(this._getTargetTable().getContextByIndex(selctedIndicesTarget[i]).getObject());
	}
	return aSelectedNodes;
    };
};

    sap.watt.hanaplugins.editor.common.treemap.MappingControlEx.prototype.refreshUI = function() {
    	var oMessageTable, oTransformation;
    	oTransformation = this.getTransformation();
    	oMessageTable = this._getSourceTable();
    	oMessageTable.getModel().setData(oTransformation.getSourceMessage());
    	oMessageTable = this._getTargetTable();
    	oMessageTable.getModel().setData(oTransformation.getTargetMessage());
    	var object = $("#" + this.sId);
        if (object.length > 0) { 
    	    this._drawMappings();
        }
    };

    /*
    Overwriting _confirmDelete to disable the Delete Mapping Dialog
    */
    sap.watt.hanaplugins.editor.common.treemap.MappingControlEx.prototype._confirmDelete = function() {

    };
    
    /*
    Overwriting _onCurveRightClick to disable the Context Menu
    */
    sap.watt.hanaplugins.editor.common.treemap.MappingControlEx.prototype._onCurveRightClick = function() {

    };

com.sap.it.spc.webui.mapping.models.TransformationModel.prototype.addMappingJSON = function(jsonMapping) {
	var mapping = new com.sap.it.spc.webui.mapping.models.MappingModel("_new_mapping" + Math.ceil(Math.random() * Math.pow(10, 10)));
	mapping.sourcePaths = jsonMapping.sourcePaths;
	mapping.targetPaths = jsonMapping.targetPaths;
	mapping.fn = {};
	mapping.fn.expression = mapping.sourcePaths[0];
	mapping.fn.description = "";
	
	this.addMapping(mapping);
};


