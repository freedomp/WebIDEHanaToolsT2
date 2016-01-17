jQuery.sap.require("jquery.sap.history");

/**
 * Main Controller. Handles all events of the Main views.
 */
sap.ui.controller("sap.app.template.masterdetail.Main", {

	/**
	 * Called when a controller is instantiated and its View controls (if available) are already created.
	 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
	 */
	onInit: function () {
		var bus = sap.ui.getCore().getEventBus();

		// TODO: MOVE THIS TO A BETTER PLACE
		bus.subscribe("nav", "to", function (chan, evt, inf) {
			var _id = this.byId(inf.id) ? this.byId(inf.id).getId() : inf.id;
			this.navTo(_id, true, jQuery.sap.history.NavType.Forward);

			if (inf.data) {
				this.getView().setBindingContext(inf.data.context);
			}
		}, this);
		bus.subscribe("nav", "back", function (chan, evt, inf) {
			var _id = null;
			if (inf.id) {
				_id = this.byId(inf.id) ? this.byId(inf.id).getId() : inf.id;
			}
			this.navTo(_id, false, jQuery.sap.history.NavType.Back);
		}, this);
	},

	/**
	 * Navigates to certain page.
	 *
	 * @param id
	 * @param writeHistory
	 * @param navType
	 */
	navTo: function (id, writeHistory, navType) {
		var app = this.byId("app");
		// check param
		if (navType === jQuery.sap.history.NavType.Back) {
			if (id) {
				app.backToPage(id);
			} else {
				if (!app.backDetail) {
					app.back();
				} else {
					app.backDetail();
				}
			}
			return;
		} else {
			app.to(id);
		}

		// write browser history
		if (writeHistory === undefined || writeHistory) {
			var bookmarkable = false;
			var stateData = {
				id: id
			};
			jQuery.sap.history.addHistory("page", stateData, bookmarkable);
		}

		// log
		jQuery.sap.log.info("navTo '" + id + "' (" + writeHistory + "," + navType + ")");
	}
});