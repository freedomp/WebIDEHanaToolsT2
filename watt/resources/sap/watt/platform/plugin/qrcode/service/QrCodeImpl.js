define([
	"../lib/QRCode",
	"../lib/QRUtil",
	"../lib/jquery-sap-qrcode"
], {
	_fixURIIfRelative : function(sValue) {
		"use strict";
		var origin = window.location.origin;
		if (!origin) {
			// for IE
			origin = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port: '');
		}
		if (!sValue.match(/^https?:\/\//g)) { //If url is relative
			var link;
			if (sValue.match(/^\//g)) { //if the relative url start with '/'
				link = origin;
				return link + sValue;	
			}
			else {
				var path = window.location.pathname;
				path = path.substring(0, path.lastIndexOf("/"));
				link = origin + path;
				return link + "/" + sValue;
			}
		} else {
			return sValue;
		}
	},
	
	/** Generate a QR Code UI5 Control
	 * @memberOf sap.watt.platform.plugin.qrcode.service.QrCodeImpl
	 * @param {string} the string to be converted to QR Code
	 * @param {boolean} whether the string is an URL, so that relative path can be resolved
	 * @return {Promise} a deferred promise that will provide control in oControl property 
	 */
	getQrCodeControl : function(sString, bIsUrl) {
		"use strict";
		var qrControl = new sap.watt.platform.plugin.qrcode.lib.QRCode({value: sString, isUrl: bIsUrl});
		var _aItem = { 'oControl' : qrControl };
		return _aItem;
	},
	
	/** Create a QR Code jQuery object
	 * @memberOf sap.watt.platform.plugin.qrcode.service.QrCodeImpl
	 * @param {string} the string to be converted to QR Code
	 * @param {boolean} whether the string is an URL, so that relative path can be resolved
	 * @param {boolean} whether the qrcode is renderred in an IMG element
	 * @return {Promise} a deferred promise that will provide jQuery object in oDiv property 
	 */
	getQrCode : function(sString, bIsUrl, bImg) {
		"use strict";
		if (sString) {
			var qrString = sString;
			var sContainerDiv = "<div>";
			if (bIsUrl) {
				qrString = this._fixURIIfRelative(sString);
				var completeUrl = qrString;
				
				//If the hostname is localhost then display a warning
				var regex = /^https?:\/\/localhost/;
				if (regex.test(completeUrl)) {
					sContainerDiv += "<div id='localhost-warning' style='color:#d14900; padding: 2px; padding-bottom:18px;'>Warning: the URI's hostname is localhost. It will be unreachable on mobile device</div>";
				}
			}
			sContainerDiv += "</div>";
			var oContainerDiv = $(sContainerDiv);
			var oQrDiv = $("<div style=\"display:block; margin:auto; width:256px;\" />");
			oQrDiv.qrcode(qrString);
			if(!bImg) {
				oContainerDiv.append(oQrDiv);
			} else {
				var sDataUrl = oQrDiv.find("canvas")[0].toDataURL("image/png");
				var oImg = $("<img style=\"display:block; margin:auto; width:256px;\" />");
				oImg.attr("src", sDataUrl);
				oContainerDiv.append(oImg);
			}
			var _aItem = { 'oDiv' : oContainerDiv };
			return _aItem;
		}
	}
	
});