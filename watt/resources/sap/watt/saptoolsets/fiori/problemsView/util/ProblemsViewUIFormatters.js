jQuery.sap.declare("sap.watt.common.plugin.problemsView.util.ProblemsViewUIFormatters");

sap.watt.common.plugin.problemsView.util.ProblemsViewUIFormatters = {};

sap.watt.common.plugin.problemsView.util.ProblemsViewUIFormatters._iconsMetadataMap = {
		ERROR_ICON_URL : "resources/sap/watt/ideplatform/plugin/aceeditor/css/problemsViewIcons/error.png",
		ERROR_ICON_BACKGROUND : "#e22525",
		ERROR_ICON_COLOR : "#ffffff",

		WARNING_ICON_URL : "resources/sap/watt/ideplatform/plugin/aceeditor/css/problemsViewIcons/warning.png",
		WARNING_ICON_BACKGROUND : "#f0ab00",
		WARNING_ICON_COLOR : "#ffffff",

		INFO_ICON_URL : "resources/sap/watt/ideplatform/plugin/aceeditor/css/problemsViewIcons/info.png",
		INFO_ICON_BACKGROUND : "#007cc0",
		INFO_ICON_COLOR : "#ffffff"
	};


sap.watt.common.plugin.problemsView.util.ProblemsViewUIFormatters.getProblemsIcon = function (severity) {
		var iconsMetadataMap = sap.watt.common.plugin.problemsView.util.ProblemsViewUIFormatters._iconsMetadataMap;
		switch (severity) {
			case "error":
				return iconsMetadataMap.ERROR_ICON_URL;
			case "warning":
				return iconsMetadataMap.WARNING_ICON_URL;
			case "info":
				return iconsMetadataMap.INFO_ICON_URL;
			default:
				return iconsMetadataMap.INFO_ICON_URL;
		}
	};

sap.watt.common.plugin.problemsView.util.ProblemsViewUIFormatters.getProblemsIconBackground = function (severity) {
	var iconsMetadataMap = sap.watt.common.plugin.problemsView.util.ProblemsViewUIFormatters._iconsMetadataMap;
	switch (severity) {
				case "error":
					return iconsMetadataMap.ERROR_ICON_BACKGROUND;
				case "warning":
					return iconsMetadataMap.WARNING_ICON_BACKGROUND;
				case "info":
					return iconsMetadataMap.INFO_ICON_BACKGROUND;
				default:
					return iconsMetadataMap.INFO_ICON_BACKGROUND;
			}
		};

sap.watt.common.plugin.problemsView.util.ProblemsViewUIFormatters.getProblemsIconColor = function(severity) {
	var iconsMetadataMap = sap.watt.common.plugin.problemsView.util.ProblemsViewUIFormatters._iconsMetadataMap;
	switch (severity) {
				case "error":
					return iconsMetadataMap.ERROR_ICON_COLOR;
				case "warning":
					return iconsMetadataMap.WARNING_ICON_COLOR;
				case "info":
					return iconsMetadataMap.INFO_ICON_COLOR;
				default:
					return iconsMetadataMap.INFO_ICON_COLOR;
			}
		};
