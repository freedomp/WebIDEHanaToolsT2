/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
jQuery.sap.declare("sap.watt.hanaplugins.editor.plugin.hdbcalculationview.control.FormattedTextViewInput");

(function() {
	"use strict";

	sap.ui.core.Control.extend("sap.watt.hanaplugins.editor.plugin.hdbcalculationview.control.FormattedTextViewInput", {

		metadata: {
			properties: {
				"editMode": {
					type: "boolean",
					defaultValue: false
				}
			},

			aggregations: {
				"textView": {
					multiple: false,
					type: "sap.ui.commons.FormattedTextView"
				},
				"input": {
					multiple: false,
					type: "sap.ui.commons.TextField"
				}
			}
		},

		setEditMode: function(value) {
			var input = this.getInput(),
				textView = this.getTextView();

			this.setProperty("editMode", value, true);
			if (value) {
				// incident: #1570154932
				// remove tooltip since IE10 shows it in the upper left corner of the window
				this._tooltip = textView.getTooltip();
				textView.setTooltip(null);
				input.removeStyleClass("calcViewAddColumnsFromHidden");
				textView.addStyleClass("calcViewAddColumnsFromHidden");
				this.getInput().focus();
			} else {
				textView.setTooltip(this._tooltip || null);
				textView.removeStyleClass("calcViewAddColumnsFromHidden");
				input.addStyleClass("calcViewAddColumnsFromHidden");
			}
		},

		setTextView: function(control) {
			control.addDelegate(this.ftvDelegate);
			return this.setAggregation("textView", control);
		},

		setInput: function(control) {
			control.addDelegate(this.inputDelegate);
			return this.setAggregation("input", control);
		},

		onAfterRendering: function() {
			if (this.getEditMode()) {
				this.getInput().focus();
			}
		},

		init: function() {
			var that = this;

			this.ftvDelegate = {
				onclick: function() {
					that.setEditMode(true);
				}
			};

			this.inputDelegate = {
				onsapescape: function() {
					that.setEditMode(false);
				},

				onsapfocusleave: function() {
					that.setEditMode(false);
				},

				onsapenter: function() {
					that.setEditMode(false);
				}
			};
		},

		renderer: {
			render: function(rm, control) {
				var input, textView,
					isEditMode = control.getProperty("editMode");

				input = control.getInput();
				textView = control.getTextView();

				rm.write("<div");
				rm.writeControlData(control);
				rm.writeStyles();
				rm.addClass("calcViewFTVInput");
				rm.writeClasses();
				rm.write(">");
				if (isEditMode) {
					input.removeStyleClass("calcViewAddColumnsFromHidden");
					textView.addStyleClass("calcViewAddColumnsFromHidden");
				} else {
					textView.removeStyleClass("calcViewAddColumnsFromHidden");
					input.addStyleClass("calcViewAddColumnsFromHidden");
				}
				rm.renderControl(input);
				rm.renderControl(textView);
				rm.write("<div>");
			}
		}
	});

})();
