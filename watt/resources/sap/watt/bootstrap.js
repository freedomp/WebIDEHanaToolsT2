/*

 <link id="css" rel="stylesheet" href="resources/sap/watt/uitools/plugin/ide/css/MainLayout.css" type="text/css">

 <!-- boot IDE framework with require.js (data-sap-ide-* are IDE framework relevant attributes) -->
 <script src="resources/sap/watt/lib/requirejs/require.js"
 data-main="resources/sap/watt/core/Global.js"
 data-sap-ide-main="sap/watt/core/Core"
 data-sap-ide-basedir="resources/"
 data-sap-ide-config="resources/sap/watt/uitools/config.json"></script>

 */

(function() {
    window["sap-ide-perf"] = Date.now();
	var sWebIDECachebuster = "";
	var sConfigLocation = document.getElementById("idebootstrap").getAttribute("data-sap-idebootstrap-config");
	var sCssLocation = document.getElementById("idebootstrap").getAttribute("data-sap-idebootstrap-css");
	var sPlatformLocation = document.getElementById("idebootstrap").getAttribute("data-sap-idebootstrap-platform-url") || "";

	// request the sap-ui-cachebuster that contains the cache buster infos as ~commitId~ (in hcproxy case)
	// which is used later for creating the dynamic segment for the requests to cache them 
	var oXHR = new XMLHttpRequest();
	var sVersionLocation = "sap-ui-cachebuster";
	oXHR.open("GET", sVersionLocation, false);
	oXHR.onload = function(oEvent) {
		if (oXHR.readyState === 4) {
			if (oXHR.status === 200) {
				sWebIDECachebuster = oXHR.response + "/";
				if (window.console) {
					window.console.log("bootstrap.js: SAP Web IDE cachebuster timestamp: " + sWebIDECachebuster);
				}
			} else {
				if (window.console) {
					window.console.warn("bootstrap.js: " + oXHR.statusText);
				}
			}
		}
	};
	oXHR.onerror = function(ex) {
		if (window.console) {
			window.console.info("bootstrap.js: " + ex.message);
		}
	};
	oXHR.send(null);
	var sBaseDir = sPlatformLocation + "resources/" + sWebIDECachebuster;
	var sCssUrl = sBaseDir + sCssLocation;
	document.write("<link id=\"css\" rel=\"stylesheet\" href=\"" + sCssUrl + "\" type=\"text/css\">");


	var sRequireUrl = sBaseDir + "sap/watt/lib/requirejs/require.js";
	var sMainUrl = sBaseDir + "sap/watt/core/Global.js";
	var sConfigUrl = "resources/" + sWebIDECachebuster + sConfigLocation;

	document.write("<scr" + "ipt src=\"" + sRequireUrl + "\" " + "data-main=\"" + sMainUrl + "\" "
	+ "data-sap-ide-main=\"sap/watt/core/Core\" " + "data-sap-ide-basedir=\"" + sBaseDir + "\" " + "data-sap-ide-config=\""
	+ sConfigUrl + "\"></scr" + "ipt>");

}());