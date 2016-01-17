define(
	[
		"../utils/W5gUtils",
		"./OpenInLayoutEditor"
	],
	function (W5gUtils, OpenInLayoutEditor) {
		"use strict";

		return jQuery.extend({}, OpenInLayoutEditor, {

			/**
			 * Command is available if wysiwyg editor is the selection owner and if the selected control is a fragment
			 *
			 * @return {Boolean}
			 *
			 * @override OpenInLayoutEditor.isAvailable
			 */
			isAvailable: function () {
				return Q.all([
					this.context.service.selection.assertOwner(this.context.service.ui5wysiwygeditor),
					this.context.service.ui5wysiwygeditor.getSelection()
				]).spread(function (w5gSelectionOwner, oResult) {
					var oControl = oResult && oResult[0].control,
						isFragment = oControl ? W5gUtils.isControlFragment(oControl) : false;
					return !!w5gSelectionOwner && isFragment;
				});
			}
		});
	}
);
