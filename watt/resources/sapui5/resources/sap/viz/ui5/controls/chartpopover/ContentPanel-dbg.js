/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2015 SAP SE. All rights reserved
 */
sap.ui.define([
    'jquery.sap.global',
    './ShapeMarker',
    'sap/ui/core/Control'
],
function(jQuery, ShapeMarker, Control) {
	
    var ContentPanel = Control.extend('sap.viz.ui5.controls.chartpopover.ContentPanel', {
        metadata : {
            publicMethods : ["setContentData"]
        },

        renderer : {
            render : function(oRm, oControl) {
                oRm.write('<div');
                oRm.addClass("viz-controls-chartPopover-contentPanel");
                oRm.writeClasses();
                oRm.write('>');
                oRm.renderControl(oControl._oShapeLabel);
                oRm.renderControl(oControl._oPanel);
                oRm.write('</div>');
            }
        }
    });

    ContentPanel.prototype.init = function() {
        this._measureItemsLen = 0;
        this._maxMeasureLableLen = 15;
        this._maxMeasureValueLen = 12;

        this._oShapeLabel = new ShapeMarker(this._createId('vizShapeMarker'), {
        }).addStyleClass('viz-controls-chartPopover-dimension-marker');
        this._oDimLabel = new sap.m.Text(this._createId('vizDimensionLabel'), {
        }).addStyleClass('viz-controls-chartPopover-dimension-label');
        
        this._oForm = new sap.ui.layout.form.SimpleForm({
            editable : false,
            //minWidth : 80,
            maxContainerCols : 2,
            layout:"ResponsiveGridLayout",
            labelSpanL: 6,
            labelSpanM: 6,
            labelSpanS: 6,
            emptySpanL: 0,
            emptySpanM: 0,
            emptySpanS: 0,
            columnsL: 2,
            columnsM: 2,
            content: [  
            ]
        });    
        this._oPanel = new sap.ui.layout.Grid({
            width: '100%',
            defaultSpan:"L12 M12 S12",
            content : [
                this._oDimLabel, 
                this._oForm
            ]
        }).addStyleClass('viz-controls-chartPopover-Vlt');

    };

    ContentPanel.prototype.setContentData = function(data) {
        var values = data.val, dims = '', meas = [], measureValue;
        this._measureItemsLen = 0;
        if (values) {
            this._oForm.removeAllContent();

	        //Check measure's type long text mode or not
	        var isLongMode = false,i;
	        for (i = 0; i < values.length; i++) {
	            if (values[i].type && values[i].type.toLowerCase()  === 'measure') {
	                    measureValue = values[i].value;
	                    if (measureValue == null){
	                        measureValue = this._getNoValueLabel();
	                    }
	                    if(values[i].name.length > this._maxMeasureLableLen || 
	                        measureValue.length > this._maxMeasureValueLen){
	                    isLongMode = true;
	                    break;
	                }
	            }
	        }
	
	        for (i = 0; i < values.length; i++) {
	            if (values[i].type && values[i].type.toLowerCase() === 'dimension') {
	                    if (dims == null) {
	                        dims = this._getNoValueLabel();
	                    }
	                    else if (dims.length > 0) {
	                    dims = dims + ' - ' + values[i].value;
	                } else {
	                    dims = values[i].value;
	                }
	            } else if (values[i].type && values[i].type.toLowerCase()  === 'measure') {
	                    measureValue = values[i].value;
	                    if (measureValue == null){
	                        measureValue = this._getNoValueLabel();
	                    }
	                    if(isLongMode){
	                        this._oForm.setLabelSpanS(12);
	                        this._oForm.addContent(new sap.m.Text({ 
	                            text: values[i].name
	                        }).addStyleClass('viz-controls-chartPopover-measure-labels')
	                        .addStyleClass('viz-controls-chartPopover-measure-labels-wrapper-name'));
	                        this._oForm.addContent(new sap.m.Text({
	                            text: measureValue,
	                            textAlign: sap.ui.core.TextAlign.Start
	                        }).addStyleClass('viz-controls-chartPopover-measure-labels')
	                        .addStyleClass('viz-controls-chartPopover-measure-labels-wrapper-value'));
	                    }else{
	                        this._oForm.setLabelSpanS(6);
	                        this._oForm.addContent(new sap.m.Label({ 
	                            text: values[i].name
	                        }).addStyleClass('viz-controls-chartPopover-measure-labels'));
	                        this._oForm.addContent(new sap.m.Text({
	                            text: measureValue,
	                            textAlign: sap.ui.core.TextAlign.End
	                        }).addStyleClass('viz-controls-chartPopover-measure-labels'));
	                    }
	                }
	            }
	
	        if(typeof data.color === 'string'){
	            var markerSize = this._oDimLabel.$().css('margin-left');
	            if (markerSize) {
	                markerSize = parseInt(markerSize.substr(0, markerSize.length - 2), 10);
	                this._oShapeLabel.setMarkerSize(markerSize);
	            }
	            this._oShapeLabel.setColor(data.color).setType((data.shape ? data.shape : 'square'));
	        }else{
	            this._oPanel.removeContent(this._oShapeLabel);
	        }

            if (dims && dims.length > 0) {
                this._oDimLabel.setText(dims);
            } else {
                this._oPanel.removeContent(this._oDimLabel);
            }
	
	        this._measureItemsLen = data.val.length;
        }
    };

    ContentPanel.prototype.isMultiSelected = function() {
        return this._measureItemsLen === 0;
    };        

    /**
     * Creates an id for an Element prefixed with the control id
     *
     * @return {string} id
     * @public
     */
    ContentPanel.prototype._createId = function(sId) {
        return this.getId() + "-" + sId;
    };
    
    ContentPanel.prototype._getNoValueLabel = function(){
        return sap.viz.extapi.env.Language.getResourceString("IDS_ISNOVALUE");
    };

    ContentPanel.prototype.exit = function(sId) {
        if (this._oForm) {
            this._oForm.destroy();
            this._oForm = null;
        }

        if (this._oShapeLabel) {
            this._oShapeLabel.destroy();
            this._oShapeLabel = null;
        }

        if (this._oDimLabel) {
            this._oDimLabel.destroy();
            this._oDimLabel = null;
        }

        if (this._oPanel) {
            this._oPanel.destroy();
            this._oPanel = null;
        }
    };
    
    return ContentPanel;
});
