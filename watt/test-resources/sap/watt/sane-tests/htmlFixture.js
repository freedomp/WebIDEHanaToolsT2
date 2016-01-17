"use strict";
(function () {

	/**
	 * This check is crucial for setting the webappPath to node_modules and is relevant only for external plugins scenarios.
	 * We need to check the 'location.href' url, to determine whether this is an external plugin scenario or not.
	 * Therefore, we check if the url contains the 'node_modules/webide' folder, as this indicates that that this is an external plugin scenario.
	 * Hence, we turn on the 'window.isExternalPlugin' flag, so later on we could compute paths to specific resources differently.
	 */
	if (window.location.href.match(/base\/node_modules\/webide/i)) {
		window.isExternalPlugin = true;
	}
	var webappPath = window.webappPath();
	var sPath = webappPath + "resources/" + "sap/watt/uitools/";
	var baseNode = document.createElement("base");
	baseNode.href = sPath;
	document.head.appendChild(baseNode);

	var configPathMatch = /config_path=([^&]+)(?:&|$)/.exec(document.location.search);
	if (!configPathMatch) {
		throw new Error('Missing config_path argument in URL');
	}

	var configPath = decodeURIComponent(configPathMatch[1]);


	var envPathMatch = /env-json-path=([^&]+)(?:&|$)/.exec(document.location.search);
	if (!envPathMatch) {
		throw new Error('Missing env-json-path argument in URL');
	}

	// env-json-path
	var envJsonPath = decodeURIComponent(envPathMatch[1]);

	window.createTestFixture = function () {

		var requireJS = document.createElement('script');
		requireJS.setAttribute('src', '../lib/requirejs/require.js');
		requireJS.setAttribute('data-main', '../core/Global');
		requireJS.setAttribute('data-sap-ide-main', 'sap/watt/core/Core');
		requireJS.setAttribute('data-sap-ide-environment-path', envJsonPath);
		requireJS.setAttribute('data-sap-ide-basedir', "../../../");
		requireJS.setAttribute('data-sap-ide-config', configPath);
		document.head.appendChild(requireJS);
	};

})();
