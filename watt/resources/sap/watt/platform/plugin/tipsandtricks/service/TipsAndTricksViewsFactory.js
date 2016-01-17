define(["sap/watt/lib/lodash/lodash", "../uicontrols/ShortcutLabel"], function(_, ShortcutLabel) {
	var that;

	function _init() {
		that = this;
	}

	/**
	 * Creates an array of the key bindings of a command.
	 *
	 * //TODO the core team are working on changing the API of the commands. Once they do this method may be irrelevant.
	 *
	 * @param oCommand - Core framework command
	 * @returns {string[]} - Array of strings containing a key in each cell
	 * @private
	 */
	function _getCommandKeyBindingAsArray(oCommand) {
		//getKeyBindingAsText returns the key binding for mac with an empty string delimiter and with a + delimeter
		//on windows
		var sKeyBinding = oCommand.getKeyBindingAsText();
		var aKeyBinding = sKeyBinding.indexOf("+") >= 0 ? sKeyBinding.split("+") : sKeyBinding.split("");
		return aKeyBinding;
	}

	/**
	 * Creates a vertical layout containing a horizontal layout in each row. Each horizontal layout describes
	 * the shortcut of a single command of the commands array input.
	 *
	 * @param aCommands - array of commands
	 * @returns {sap.ui.layout.VerticalLayout[]} - The vertical layout described above
	 * @private
	 */
	function _buildShortcutsLayout(aCommands) {
		var aShortcutLabelsVerticalLayoutContent = [];
		_.forEach(aCommands, function(oCommand) {
			var aKeyBinding = _getCommandKeyBindingAsArray(oCommand);

			var aShortcutLabels = [];
			for(var shortcutLabelsIndex = 0, keyBindingIndex = 0; shortcutLabelsIndex < 2*aKeyBinding.length - 1; ++shortcutLabelsIndex) {
				if(shortcutLabelsIndex%2 === 0) {
					//Then we add the shortcut label
					aShortcutLabels.push(new ShortcutLabel({
						text: aKeyBinding[keyBindingIndex]
					}));
					keyBindingIndex++;
				} else {
					aShortcutLabels.push(new sap.ui.commons.Label({
						text: "+"
					}));
				}
			}
			var shortcutsHorizontalLayout = new sap.ui.layout.HorizontalLayout({
				content: aShortcutLabels
			}).addStyleClass("tipsAndTricksViewShortcutsHorizontalLayout");
			aShortcutLabelsVerticalLayoutContent.push(shortcutsHorizontalLayout);
		});

		return new sap.ui.layout.VerticalLayout({
			content: aShortcutLabelsVerticalLayoutContent
		}).addStyleClass("tipsAndTricksViewShortcutsVerticalLayout");
	}

	/**
	 * Creates a shortcut view to be used in the tips and tricks dialog. The shortcut view contains an image (GIF), a
	 * title, the keymaps of the commands in the shortcut, and an explanation text.
	 * @param sViewName          {string} - The name of the view that will be built
	 * @param sTipImagePath      {string} - The path to the GIF that will be in the view, the path is relative to the plugin
	 * 						    		  the implementation of this function calls require.toUrl to get the real path
	 * @param sTipTitle		     {string} - The title of the tip. Should be short.
	 * @param aCommandID [string]         - Array of Web-IDE commands IDs, each command key binding will appear in a row.
	 * 									  To understand why this is an array see the MoveLinesUpDownTip.js
	 * @param sTipText			 {string} - The text of the explanation of the tip
	 * @returns 			{sap.ui.view} - The created view
	 */
	function _buildShortcutView(sViewName, sTipImagePath, sTipTitle, aCommandID, sTipText) {
		var aCommandPromises = _.map(aCommandID, function(sCommandId) {
			return that.context.service.command.getCommand(sCommandId);
		});

		return Q.all(aCommandPromises).then(function(aCommands) {
			//Define the view
			sap.ui.jsview(sViewName, {
				createContent: function() {
					var oTipImage = new sap.ui.commons.Image({
						src: require.toUrl(sTipImagePath)
					}).addStyleClass("tipsAndTricksViewImage");

					var oTipTitle = new sap.ui.commons.Label({
						text: sTipTitle
					}).addStyleClass("tipsAndTricksViewTipTitle");


					var oTipText = new sap.ui.commons.TextView({
						text: sTipText
					}).addStyleClass("tipsAndTricksViewTipText");

					var shortcutsLayout = _buildShortcutsLayout(aCommands);

					var oTitleShortcutTextVerticalLayout = new sap.ui.layout.VerticalLayout({
						content: [oTipTitle, shortcutsLayout, oTipText]
					}).addStyleClass("tipsAndTricksViewVerticalLayout");

					var oHorizontalLayout = new sap.ui.layout.HorizontalLayout({
						content: [oTipImage, oTitleShortcutTextVerticalLayout]
					}).addStyleClass("tipsAndTricksViewHorizontalLayout");

					return oHorizontalLayout;
				}
			});


			return sap.ui.view({
				type: sap.ui.core.mvc.ViewType.JS,
				viewName: sViewName
			});
		});
	}

	/**
	 * Creates a simple view to be used in the tips and tricks dialog. The simple view contains an image (GIF), a
	 * title, and an explanation text.
	 * @param sViewName          {string} - The name of the view that will be built
	 * @param sTipImagePath      {string} - The path to the GIF that will be in the view, the path is relative to the plugin
	 * 						    		    the implementation of this function calls require.toUrl to get the real path
	 * @param sTipTitle		     {string} - The title of the tip. Should be short.
	 * @param sTipText			 {string} - The text of the explanation of the tip
	 * @returns 			{sap.ui.view} - The created view
	 */
	function _buildSimpleTipView(sViewName, sTipImagePath, sTipTitle, sTipText) {
		sap.ui.jsview(sViewName, {
			createContent: function() {
				var oTipImage = new sap.ui.commons.Image({
					src: require.toUrl(sTipImagePath)
				}).addStyleClass("tipsAndTricksViewImage");

				var oTipTitle = new sap.ui.commons.Label({
					text: sTipTitle
				}).addStyleClass("tipsAndTricksViewTipTitle");


				var oTipText = new sap.ui.commons.TextView({
					text: sTipText
				}).addStyleClass("tipsAndTricksViewTipText");

				var oTitleTextVerticalLayout = new sap.ui.layout.VerticalLayout({
					content: [oTipTitle, oTipText]
				}).addStyleClass("tipsAndTricksViewVerticalLayout");

				var oHorizontalLayout = new sap.ui.layout.HorizontalLayout({
					content: [oTipImage, oTitleTextVerticalLayout]
				}).addStyleClass("tipsAndTricksViewHorizontalLayout");

				return oHorizontalLayout;
			}
		});


		return sap.ui.view({
			type: sap.ui.core.mvc.ViewType.JS,
			viewName: sViewName
		});
	}

	return {
		init: _init,
		buildShortcutView: _buildShortcutView,
		buildSimpleTipView: _buildSimpleTipView,

		//For testing only
		_getCommandKeyBindingAsArray: _getCommandKeyBindingAsArray,
		_buildShortcutsLayout: _buildShortcutsLayout
	};
});
