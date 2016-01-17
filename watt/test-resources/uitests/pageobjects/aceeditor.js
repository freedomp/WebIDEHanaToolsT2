sap.ui.define(["sap/ui/test/Opa5", "uitests/pageobjects/webIDEBase"], function(Opa5, WebIDEBase) {

	return Opa5.createPageObjects({
		inTheAceEditor: {
			baseClass: WebIDEBase,

			actions: {

				iSetEditorContent: function(sText) {

					return this.waitFor({
						controlType: "sap.watt.common.plugin.aceeditor.control.Editor",
						success: function(aEditor) {
							if (aEditor.length) {
								var oEditor = aEditor[0];
								oEditor.setValue(sText);
							}
						},
						errorMessage: "Editor is not available"
					});
				},

				iClearTheEditorContentAndInsertNewCntent: function(sText) {
					return this.waitFor({
						controlType: "sap.watt.common.plugin.aceeditor.control.Editor",
						success: function(aEditor) {
							if (aEditor.length) {
								var oEditor = aEditor[0];
								oEditor.setValue(sText);
							}
						},
						errorMessage: "Editor is not available"
					});
				},

				iSetEditorContentFromFile: function(sFileName) {

					return this.waitFor({
						controlType: "sap.watt.common.plugin.aceeditor.control.Editor",
						success: function(aEditor) {
							jQuery.get(sFileName).then(function(text, status, xhr) {
								if (aEditor.length) {
									var oEditor = aEditor[0];
									oEditor.setValue(xhr.responseText);
								}
							});
						},
						errorMessage: "Editor is not available"
					});
				},

				iGetEditorContent: function(fnSuccess) {
					return this.waitFor({
						controlType: "sap.watt.common.plugin.aceeditor.control.Editor",
						success: function(aEditor) {
							var sContent = "";
							if (aEditor.length) {
								sContent = aEditor[0].getValue();
							}
							fnSuccess.call(this, sContent);
						},
						errorMessage: "Editor is not available"
					});
				},

				iTypeInEditor: function(sContent, oPosition) {
					return this.waitFor({
						controlType: "sap.watt.common.plugin.aceeditor.control.Editor",
						success: function(aEditor) {
							if (aEditor.length) {
								if (oPosition) {
									aEditor[0].oEditor.navigateTo(oPosition.row, oPosition.column);
								} else {
									aEditor[0].oEditor.navigateLineEnd();
								}
								for (var i = 0; i < sContent.length; i++) {
									aEditor[0].setFocus();

									var event = $.Event("keydown");
									event.which = sContent[i].charCodeAt(0); // Character 'A'
									aEditor[0].$().children(".ace_text-input").trigger(event);

									aEditor[0].oEditor.onTextInput(sContent[i]);

									event = $.Event("keyup");
									event.which = sContent[i].charCodeAt(0);
									aEditor[0].$().children(".ace_text-input").trigger(event);
								}
							}

						},
						errorMessage: "Editor is not available"
					});
				}

			},

			assertions: {

				iSeeEditor: function() {

					return this.waitFor({
						controlType: "sap.watt.common.plugin.aceeditor.control.Editor",
						matchers: function(oEditor) {
							return oEditor.$().hasClass("ace_editor");
						},
						success: function(aEditors) {
							strictEqual(aEditors.length, 1, "Ace editor is opened as expected");
						},
						errorMessage: "Editor is not available"
					});
				},

				iSeeContent: function(sContent) {
					return this.waitFor({
						controlType: "sap.watt.common.plugin.aceeditor.control.Editor",
						success: function(aEditor) {
							if (aEditor.length) {
								var sCurrContent = aEditor[0].getValue();
								strictEqual(sCurrContent, sContent, "Ace editor content is as expected");
							}
						},
						errorMessage: "Ace editor Content is not as expected"
					});
				},

				iCheckFontSize: function(sFontSize) {

					return this.waitFor({
						controlType: "sap.watt.common.plugin.aceeditor.control.Editor",
						matchers: function(oEditor) {
							return oEditor.$().hasClass("ace_editor");
						},
						success: function(aEditors) {
							strictEqual(aEditors.length, 1);
							var fontSize = aEditors[0].$().css("font-size");
							strictEqual(fontSize, sFontSize, "Ace editor Font Size is as expected");
						},
						errorMessage: "Editor is not available"
					});
				}
			}
		}
	});
});