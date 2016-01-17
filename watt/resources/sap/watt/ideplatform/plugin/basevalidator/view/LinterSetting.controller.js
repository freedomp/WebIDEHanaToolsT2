sap.ui.controller("sap.watt.ideplatform.plugin.basevalidator.view.LinterSetting", {
    _oTiming:null,
    
	onInit : function() {
        this._oTiming = this.byId("LinterSetting_Timing");
	},

	onBeforeRendering  : function() {
	    var levelListControl = this.byId("levelSelection");
	    levelListControl.setSelectedKey(this.getView().getModel().getProperty("/modelData/filterLevel/key"));
    },
    
	onTriggerChange: function() {
	    this.getView().getModel().setProperty("/modelData/trigger", this._oTiming.getSelectedItem().getKey());
	},
	
	onLevelChange : function(oEvent) {
	    var selectedItem = oEvent.getParameters().selectedItem;
	    this.getView().getModel().setProperty("/modelData/filterLevel/key", selectedItem.getKey());
	    this.getView().getModel().setProperty("/modelData/filterLevel/value", selectedItem.data("filter"));
	    this.getView().getModel().setProperty("/modelData/disabledCodeCheck", selectedItem.getKey() === "none");
	},

	negativeBooleanFormatter: function(bValue) {
        return !bValue;  
    },
    
	triggerToIndexFormatter: function(sTrigger) {
		var items = this._oTiming.getItems();
		for (var i = 0; i < items.length; i++) {
			if (items[i].getKey() === sTrigger) {
				return i;
			}
		}
		return 0;
    }

});
