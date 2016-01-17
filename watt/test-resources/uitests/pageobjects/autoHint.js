sap.ui.define(["sap/ui/test/Opa5", "uitests/pageobjects/webIDEBase"], function(Opa5, WebIDEBase) {

	return Opa5.createPageObjects({
		inAutoHint: {
			baseClass: WebIDEBase,

			actions: {

				iChooseProposalByName: function() {},

				iChooseProposalByIndex: function() {},

				iChooseCurrentProposal: function() {
					var $autoHint;
					return this.waitFor({
						check: function() {
							if (this.getWindow()) {
								$autoHint = this.getWindow().$(".ace_autocomplete_hint:visible");
								return Boolean($autoHint.length);
							}

						},
						success: function() {
							return this.waitFor({
								controlType: "sap.watt.common.plugin.aceeditor.control.Editor",
								success: function(aEditor) {
									if (aEditor.length) {
										var event = $.Event("keydown");
										event.keyCode = 9; // Character '\t'
										event.which = 9;
										aEditor[0].$().children(".ace_text-input").trigger(event);

										aEditor[0].oEditor.onTextInput("\t");

										event = $.Event("keyup");
										event.keyCode = 9; // Character '\t'
										event.which = 9;
										aEditor[0].$().children(".ace_text-input").trigger(event);
									}

								},
								errorMessage: "Editor is not available"
							});

						},
						errorMessage: "Auto hint is not available"
					});

				}
			},

			assertions: {
				iSeeAutoHint: function() {
					var $autoHint;
					return this.waitFor({
						check: function() {
							if (this.getWindow()) {
								$autoHint = this.getWindow().$(".ace_autocomplete_hint:visible");
								return Boolean($autoHint.length);
							}

						},
						success: function() {
							ok($autoHint, "I found autoHint");
						},
						errorMessage: "Auto hint is not available"
					});
				}
			}
		}
	});
});