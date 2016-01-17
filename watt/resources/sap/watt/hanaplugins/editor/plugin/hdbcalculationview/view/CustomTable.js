/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
sap.ui.define(["sap/ui/table/Table", "sap/ui/table/TableRenderer"], function(Table, TableRenderer) {

    var tableControl;
	var CustomTable = Table.extend("sap.watt.hanaplugins.editor.plugin.hdbcalculationview.view.CustomTable", {

		metadata: {
			aggregations: {
			    
			}
		},
		renderer: {
			render: function(oRm, oControl) {
			    tableControl = oControl;
			    TableRenderer.render(oRm, oControl);
			},
			_updateColumnHeader:function(u){
			    Table._updateColumnHeader(u);
			},
			 onBeforeRendering: function(event){
			     tableControl = event.srcControl;
			 },
			 onAfterRendering: function(event){
			     tableControl = event.srcControl;
			 }
		}
	
	});
	CustomTable.prototype._updateColumnHeader = function(u){if(tableControl){
	    	if(this._bOnAfterRendering){
	    		var h = $.find('.sapUiTableCtrlFirstCol > th');
	    		if(h && h.length > 0){
	    			Table.prototype._updateColumnHeader.call(this,u);
	    		}
	    	}else{
	    		var $this = this.$();
	    		if($this){
	    			var g = $this.find('.sapUiTableCtrlFirstCol > th');
	    			if(g && g.length > 0){
	    			    var tempAfterRendering = this._bOnAfterRendering;
	    			this._bOnAfterRendering = true;
	    			Table.prototype._updateColumnHeader.call(this,u);
	    			this._bOnAfterRendering = tempAfterRendering;
	    		}

	    		}
	    	}
	    }
	};

	return CustomTable;

}, true);
