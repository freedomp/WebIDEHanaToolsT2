(function() {
	"use strict";
	function post(sUrl, sData) {
		var oXHR = new XMLHttpRequest();
		oXHR.open("POST", sUrl, false);
		oXHR.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		oXHR.onload = function(oEvent) {
			//if (oXHR.readyState === 4) {
			//	if (oXHR.status === 200) {
            //
			//	}
			//}
		};
		oXHR.onerror = function(ex) {
		};
		oXHR.send(sData);
	}

	window.addEventListener('beforeunload', postData);
	window.addEventListener("postCoverageData", postData);

	function postData(event) {
		var sUrl = window._$coverageReportUrl || "/watt-tests/coverage/collect";
		var oCoverageData = jscoverage_serializeCoverageToJSON();
		var sFormData = "coverageReport=" + encodeURI(oCoverageData);
		if (window._$coverageReportTypes) {
			sFormData += "&reportTypes=" + encodeURI(window._$coverageReportTypes);
		}
		post(sUrl, sFormData);
		if (event && event.detail && event.detail.skipOnBeforeUnload === true) {
			window.removeEventListener('beforeunload', postData);
		}
		if (sap.ui.Device.browser.internet_explorer) {
			var event = document.createEvent("CustomEvent");
			event.initCustomEvent("coverageDataPosted", false, false, {
				bubbles : true,
				cancelable : true
			});
			window.dispatchEvent(event);
		} else {
			window.dispatchEvent(new CustomEvent("coverageDataPosted", {
				bubbles : true,
				cancelable : true
			}));
		}
	}

	function jscoverage_serializeCoverageToJSON() {
		var json = [];
		try {
			for ( var file in _$jscoverage) {
				var coverage = _$jscoverage[file];

				var array = [];
				var length = coverage.length;
				for ( var line = 0; line < length; line++) {
					var value = coverage[line];
					if (value === undefined || value === null) {
						value = 'null';
					}
					array.push(value);
				}

				json.push('"' + file + '":[' + array.join(',') + ']');
			}
			return '{' + json.join(',') + '}';
		} catch (e) {
			return "{}";
		}
	}

})();