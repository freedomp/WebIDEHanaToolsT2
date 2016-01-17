define(function() {
	"use strict";
	return {

		TypedSelectionProvider: function() {
			this.provider = null;
		},

		getSelectionProvider: function() {
			return this.provider;
		},

		change: function(provider) {
			this.provider = provider;
			// The event will be handled in: provider service that attached the event "selectionProviderChanged" to be handled in selection.selectionProviderChanged.
			// selectionProviderChanged will attachEvent selectionChanged that will be handled in: providerHandler.
			// providerHandler will call: _specialSelectionChangedHandler which will fireTypedSelectionChanged with the current selection.
			// Will be handled in oPlugin.onTypedSelectionChanged and caught in typeEventHandler.
			return this.context.event.fireSelectionProviderChanged({ //  oTypedSelectionProvider1Service.context.event.fireSelectionProviderChanged
				selectionProvider: provider
			});
		}
	};
});