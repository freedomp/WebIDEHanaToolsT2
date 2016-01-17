"use strict";
(function () {


	function createSyncScriptNode(src) {
		var script = document.createElement('script');
		script.src = src;
		script.async = false;
		return script;
	}

	function webappPath() {
		var targetPath = "/src/main/webapp/";
		var pathName = window.location.pathname;
		// building the url dynamically, this means it should work on any web server (hcp/tomcat/karma's webserver/...)
		return pathName.substring(0, pathName.indexOf(targetPath) + targetPath.length);
	}

	function saneTestsPath() {
		return webappPath() + "test-resources/sap/watt/sane-tests/";
	}

	/**
	 *
	 * @param {string} runnerName - The name of the runner, for example: w5g/extensibility/...
	 * @param {boolean} [loadUI5InTopWindow=false] - If enabled UI5 will be loaded in the root window
	 */
	window.createTestRunner = function (runnerName, loadUI5InTopWindow) {

		if (loadUI5InTopWindow === undefined) {
			loadUI5InTopWindow = false;
		}

		// zi dom
		//noinspection Eslint
		document.write(
			'<head>\
				<title>' + runnerName + ' html test runner</title>\
				<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">\
				<meta name="viewport" content="width=device-width, initial-scale=1.0">\
				<link rel="stylesheet" href="' + saneTestsPath() + 'libs/mocha.css"/>\
				</head>\
			<body>\
				<div id="mocha"  ></div>\
			</body>');

		// ui5 script tag
		if (loadUI5InTopWindow) {

			// hack for sync script loading for 'ui5 properties defining the sap-ui-core.js URL'
			var xhrObj = new XMLHttpRequest();
			xhrObj.open('GET', webappPath() + 'test-resources/sap/watt/sane-tests/ui5Version.js', false);
			xhrObj.send('');
			var ui5VersionScriptNode = document.createElement('script');
			ui5VersionScriptNode.type = "text/javascript";
			ui5VersionScriptNode.text = xhrObj.responseText;
			document.body.appendChild(ui5VersionScriptNode);

			var uiBootStrapScriptNode = createSyncScriptNode(WEBIDE_LOCAL_DEV_UI5.baseURL + WEBIDE_LOCAL_DEV_UI5.version + '/resources/sap-ui-core.js');
			uiBootStrapScriptNode.setAttribute('id', 'sap-ui-bootstrap');
			uiBootStrapScriptNode.setAttribute('data-sap-ui-theme', 'sap_bluecrystal');
			uiBootStrapScriptNode.setAttribute('data-sap-ui-libs', 'sap.ui.commons');
			document.body.appendChild(uiBootStrapScriptNode);
		}

		document.getElementsByTagName("html")[0].style.overflow = "auto";

		// infrastructure and 3rd party libs script tags
		[
			'libs/mocha.js',
			'libs/chai.js',
			'libs/chai-string.js',
			'libs/chai-as-promised.js',
			'testSetupUtils.js'
		].forEach(function (src) {
				document.body.appendChild(createSyncScriptNode(saneTestsPath() + src));
			});

		// Each runner's setup must have the exact name "testSetup.js" and must be in the
		// same directory as the test runner (index.html)
		document.body.appendChild(createSyncScriptNode('testsSetup.js'));
		document.body.appendChild(createSyncScriptNode(webappPath() + 'resources/sap/watt/lib/q/q.js'));

		// require.js with data-main to get the "party started"
		var requireJSScriptNode = createSyncScriptNode(webappPath() + 'resources/sap/watt/lib/requirejs/require.js');
		requireJSScriptNode.setAttribute('data-main', saneTestsPath() + 'test-main');
		document.body.appendChild(requireJSScriptNode);
	};

})();
