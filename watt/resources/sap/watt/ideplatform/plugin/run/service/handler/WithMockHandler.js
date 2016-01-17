define({
	updateCB: function(oEvent, name, state) {
			var model = oEvent.getSource().getModel();
			model.setProperty(name, (state) ? 0 : 1);
		}
});