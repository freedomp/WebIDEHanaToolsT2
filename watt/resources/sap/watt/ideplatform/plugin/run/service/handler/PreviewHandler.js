define({
	
	updatePreviewSelected: function(oEvent, name, state) {
		var model = oEvent.getSource().getModel();
		var btn = oEvent.getSource();
		var currentstate = model.getProperty(name);
		if (currentstate === state) {
			btn.setPressed(true);
		}
		model.setProperty(name, state);
	},

	onIconPressed: function(oEvent, name, state) {
		var src = oEvent.getSource();
		var parentGrid = src.getParent();
		var oTogleButton = parentGrid.getContent()[1];
		oEvent.oSource = oTogleButton;
		this.updatePreviewSelected(oEvent, name, state);
	}
});