function Wrapper() {
	this.sUrl = this._getUrlParam("url");
	this.oURI = null;
	this.devices = {};
	this.deviceId = this._getUrlParam("device");
	this.degree = 0;
	this.oIdeWindow = null;
	this.deviceLeft = 0;
	this.msg = {
		"preview_edit" : "",
		"preview_confirm" : "",
		"preview_more" : "",
		"msg_invalid_url" : "",
		"msg_invalid_width" : "",
		"msg_invalid_height" : ""
	};
	this.aLiang = null;
	this.sLang = this._getUrlParam("lang");
	this.sLanguage = this._getUrlParam("dft");
}

Wrapper.prototype._getUrlParam = function(sKey) {
	// get the value of url parameter
	var result = new RegExp(sKey + "=([^&]*)", "i").exec(window.location.search);
	return result && unescape(result[1]) || "";
};

/*
 * initialize the preview window: 
 *   load content from the specified URL
 *   render device buttons based on the json config file
 *   load the QR code div
 *   bind html events
 */
Wrapper.prototype.init = function() {
	window.wrapper = this;
	// fix location.origin issue for IE11
	if (!window.location.origin) {
		window.location.origin = window.location.protocol + "//" + window.location.hostname
				+ (window.location.port ? ':' + window.location.port : '');
	}

	this.oIdeWindow = window.frameElement ? window.top : opener;
	var that = this;
	this._reLayout();
	// load the configuration file and apply it 
	var url = "../config.json";
	var oXHR = new XMLHttpRequest();
	oXHR.open("GET", url, true);
	oXHR.onload = function() {
		if (oXHR.readyState === 4) {
			if (oXHR.status === 200) {
				var result = JSON.parse(oXHR.responseText);
				// create language menu
				if (typeof that.sLang === "string" && that.sLang.length > 0) {
					var oLangItmes = {};
					$.each(that.sLang.split(","), function(idx, id) {
						id = id.toLowerCase();
						oLangItmes[id] = {
							"onclick" : "changeLanguage",
							"label" : result.languages[id] || id
						};
					});
					result.language_menu.items = oLangItmes;
					if (that.sLanguage) {
						result.language_menu["default"] = that.sLanguage;
					}
					that._createMenuButton("language_menu", result.language_menu).appendTo("#languages");
					$("ul#btn2").css("right", "10rem");
				} else {
					$("ul#btn2").css("right", "3rem");
				}

				that.devices = result.devices;
				for ( var id in result.buttons) {
					var settings = result.buttons[id];
					that._createMenuButton(id, settings).insertBefore("#custDevice");
				}
			} else {
				if (window.console) {
					window.console.error(oXHR.statusText);
				}
			}
		}
		that._envCheck();
		that.changeDevice({
			"id" : that.deviceId
		}).then(function(){
			that.oIdeWindow.postMessage("previewReady", location.origin);
			that.oIdeWindow.postMessage("initializeTexts", location.origin);
		});
	};
	oXHR.onerror = function(ex) {
		if (window.console) {
			window.console.error(ex.message);
		}
	};
	oXHR.send(null);

	// share and load qr code
	var link = this.sUrl;
	if (location.origin.indexOf("://localhost") >= 0 || link.indexOf("http://localhost") === 0) {
		$("#viaEmail").hide();
	} else {
		if (link.indexOf("http://") !== 0 && link.indexOf("https://") !== 0) {
			// url does not start with http:// or https:// 
			link = location.origin + link;
		}
		$("#link").val(link);
		$("#sharelink").attr("href",
				"mailto:?subject=Look at this app&body=" + escape("I would like to invite you to preview the app here:\n" + link));
	}
	// bind events
	$(window).bind("resize", this._reLayout);
	$("li#custDevice").bind("click", function(e) {
		that.customDevice.call(that, this, e);
	});
	$("#reloadBtn").bind("click", function() {
		// for CSN 1400760/2014, set a different src before set it back
		// for case with location hash in url
		var src = $("#display").attr("src");
		$("#display").attr("src", "");
		setTimeout(function() {
			$("#display").attr("src", src);
		}, 0);
	});
	$("#rotateBtn").bind("click", function(e) {
		if (!$(this).hasClass("disable")) {
			that.rotateDevice(this);
		}
	});
	$("#shareBtn").bind("click", function() {
		if (!$(this).hasClass("disable")) {
			$(".dropdown").hide();
			$(".dropdown-visible").removeClass("dropdown-visible");
			$("#share").fadeToggle();
			$("#shareBtn").toggleClass("active");
		}
	});
	$("input#inputWidth").keyup(function(e) {
		if (e.keyCode === 13 && that._validateIntInput()) {
			$("input#inputHeight").select().focus();
		}
	});
	$("input#inputHeight").keyup(function(e) {
		if (e.keyCode === 13) {
			this.blur();
			$("#custButton").click();
		}
	});
};
Wrapper.prototype._envCheck = function() {
	var oWin = this.oIdeWindow;
	if (oWin) {
		this.oURI = oWin.URI(this.sUrl);
		
		var oIdeEnv = oWin["sap-ide-env"];
		if (oIdeEnv) {
		    
			var sRegex = oIdeEnv.orion_preview.replace(".", "\\.").replace("{{uniqueToken}}", "[a-zA-Z0-9]*");
			sRegex = new RegExp(sRegex);
			
			if (sRegex.test(this.sUrl) || this.sUrl === "about:blank") {
				return;
			}
			if (this.sUrl.indexOf("ui5_execute_abap") > 0) { // case of "Run on ABAP Server"
			    return;
			}
			if (oIdeEnv.server_type === "java") {
				if (this.sUrl.indexOf(window.location.protocol + "//" + window.location.host) === 0 || this.oURI.is("relative")) {
					return;
				}
			}
			
			console.warn("Application URL is not from the correct origin!");
		}
	}
};

Wrapper.prototype._createMenuButton = function(id, settings, parentId, parentSettings) {
	var that = this;
	var icon = settings.icon || (parentSettings ? parentSettings.icon : null);
	var label = settings.label || (parentSettings ? parentSettings.label : null);
	var li = $("<li/>").attr("id", id);
	var menuItem = $("<div class=\"menu-item\"/>").attr("id", id).addClass(settings["class"]).appendTo(li);
	if (icon) {
		$("<span class=\"icon\"\>").text(icon).appendTo(menuItem);
	}
	var labelDiv = $("<div class=\"label\"/>").appendTo(menuItem);
	if (typeof parentId === "string") {
		menuItem.data("parentId", parentId);
	}
	if (this.devices[id]) {
		var dev = this.devices[id];
		var w = dev.width, h = dev.height;
		$("<span class=\"type\"\>").text(label).appendTo(labelDiv);
		$("<span class=\"desc\"\>").text(w + " × " + h).appendTo(labelDiv);
	} else if (settings.items && parentSettings === undefined) {
		// create sub menu items
		labelDiv.text(label);
		var ddtoggle = $("<span class=\"dropdown-toggle\" title=\"" + this.msg["preview_more"] + "\"/>").text("\uE1EF").prependTo(li);
		var dd = $("<ul class=\"dropdown\">").appendTo(li).hide();
		$.each(settings.items, function(sub_id, sub_settings) {
			var btn = that._createMenuButton(sub_id, sub_settings, id, settings).appendTo(dd);
			if (sub_id === settings["default"]) {
				menuItem.replaceWith(btn.children(".menu-item").clone());
			}
		});
		ddtoggle.bind("click", function(e) {
			var v = dd.is(':visible');
			// hide all popup divs
			$("#share").hide();
			$("li#shareBtn").removeClass("active");
			$(".dropdown").hide();
			$(".dropdown-visible").removeClass("dropdown-visible");
			if (!v) {
				dd.siblings("div.menu-item").addClass("dropdown-visible");
				dd.show();
			}
			e.stopPropagation();
		});
		menuItem.bind("click", function(e) {
			dd.fadeToggle();
			e.stopPropagation();
		});
	} else if (typeof settings.label === "string") {
		labelDiv.text(settings.label);
	}
	menuItem.bind("click", function(e) {
		if (typeof parentId === "string") {
			var p = $("li#" + parentId);
			p.children(".menu-item").replaceWith(menuItem.clone());
		}
		if (settings.onclick) {
			that[settings.onclick].call(that, this, e);
		} else {
			that["changeDevice"].call(that, this, e);
		}
		e.stopPropagation();
	});
	li.bind("click", function(e) {
		var mi = $(this).children("div.menu-item");
		if (settings.onclick) {
			that[settings.onclick].call(that, mi[0], e);
		} else {
			that["changeDevice"].call(that, mi[0], e);
		}
	});
	if (!this.devices[this.deviceId] && this.devices[id] && settings.active) {
		this.deviceId = id;
	}

	return li;
};

Wrapper.prototype._renderDevice = function() {
	var oDeferred = Q.defer();
	var id = this.deviceId;
	var device = this.devices[id];
	var w = device.width, h = device.height, b1 = device.frame;
	var b2 = (device.frameTB === undefined) ? b1 : device.frameTB;

	// hide all popup divs
	$("#share").hide();
	$("li#shareBtn").removeClass("active");
	$(".dropdown").hide();
	$(".dropdown-visible").removeClass("dropdown-visible");
	// change the active button
	$(".active").removeClass("active");
	$("div#" + id).addClass("active");
	$("div#" + id).siblings(".dropdown-toggle").addClass("active");
	$("div#" + id).siblings("#custButton").addClass("active");

	// add class to the device
	$("#device").removeClass().addClass(device.os);
	if (b1 === 0) {
		// disable rotate button for desktop mode
		this.degree = 0;
		$("#rotateBtn").addClass("disable");
	} else {
		$("#rotateBtn").removeClass("disable");
	}

	$("#screen").css("left", b1 + "px");
	$("#screen").css("top", b2 + "px");
	if (typeof (w) === "string" || typeof (h) === "string") {
		$("#device").css("width", w);
		$("#device").css("height", h);
		$("#screen").css("width", "100%");
		$("#screen").css("height", "100%");
		// move the device to the centre of the content div
		$("#device").css("top", "0px");
		$("#device").css("left", "0px");
	} else {
		$("#screen").css("width", w + "px");
		$("#screen").css("height", h + "px");
		$("#device").css("width", w + b1 * 2 + "px");
		$("#device").css("height", h + b2 * 2 + "px");
		// move the device to the centre of the content div
		var h1 = $("#content").height();
		var w1 = $("#content").width();
		$("#device").css("top", Math.max(2, Math.floor((h1 - h - b2 * 2) / 2)));
		this.deviceLeft = Math.max(0, Math.floor((w1 - w - b1 * 2) / 2));
		$("#device").css("left", this.deviceLeft);
	}
	// resize the display
	this.rotateDevice(this.degree);

	var newUrl = this._generateUrl();
	if ($("#display").attr("src") !== newUrl) {
		setTimeout(function() {
			$("#display").attr("src", newUrl);
			oDeferred.resolve();
		}, 10); //reduce from 1100 to 10, since there is no animation any more
	} else {
		oDeferred.resolve();
	}
	return oDeferred.promise;
};

Wrapper.prototype._reLayout = function() {
	// re-size the content
	$("#content").height($("body").height() - $("#topbar").height() - 4);

	// re-layout device
	var h1 = $("#content").height();
	var h2 = $("#device").height();
	var w1 = $("#content").width();
	var w2 = $("#device").width();
	$("#device").css("top", Math.max(2, Math.floor((h1 - h2) / 2)));
	this.deviceLeft = Math.max(0, Math.floor((w1 - w2) / 2));
	$("#device").css("left", this.deviceLeft);
};

// show toast message at the top right conner
Wrapper.prototype._toast = function(m) {
	var th = $('<li></li>').text(m).addClass('toast').appendTo("ul#messages").hide().show();
	setTimeout(function() {
		th.fadeOut();
	}, 3000);
};
// validate the input value of custom device size
Wrapper.prototype._validateIntInput = function() {
	var w = $("#inputWidth").val(), h = $("#inputHeight").val();
	$("#inputWidth").removeClass();
	$("#inputHeight").removeClass();
	if (String(Math.abs(parseInt(w))) !== w || parseInt(w) < 300 || parseInt(w) > 3000) {
		$("#inputWidth").addClass("error").select().focus();
		this._toast(this.msg["msg_invalid_width"]);
		return false;
	}
	if (String(Math.abs(parseInt(h))) !== h || parseInt(h) < 300 || parseInt(h) > 3000) {
		$("#inputHeight").addClass("error").select().focus();
		this._toast(this.msg["msg_invalid_height"]);
		return false;
	}
	return true;
};
//generate new URL with parameter langauge
Wrapper.prototype._generateUrl = function() {
	var oURI = this.oURI.clone();
	var devId = this.deviceId;
	var device = this.devices[devId];

	if (this.sLanguage) {
		oURI.addQuery("sap-ui-language", this.sLanguage);
	}
	if (device.os) {
		oURI.addQuery("sap-ui-xx-fakeOS", device.os);
	}
	return oURI.toString();
};
Wrapper.prototype.changeLanguage = function(button, ev) {
	// hide all popup divs
	$("#share").hide();
	$("li#shareBtn").removeClass("active");
	$(".dropdown").hide();
	$(".dropdown-visible").removeClass("dropdown-visible");

	if(this.sLanguage !== button.id && this.oIdeWindow){
			//send web analytics
		var sLanguage = $(button).find("div[class = label]").text();
		this.oIdeWindow.postMessage(JSON.stringify({"changeLanguage": sLanguage}), location.origin);
	}

	this.sLanguage = button.id;
	var newUrl = this._generateUrl();
	if ($("#display").attr("src") != newUrl) {
		$("#display").attr("src", newUrl);
	}
		
};

Wrapper.prototype.customButtonClicked = function(button, ev) {
	$(".dropdown").hide();
	$(".dropdown-visible").removeClass("dropdown-visible");
	var id = button.id;
	if (this.oIdeWindow) {
		this.oIdeWindow.postMessage(id, location.origin);
	}
};

/*
 * event handler of the device buttons. To show the choosed device 
 * @param {HTMLElement} the button element which has been clicked on
 * @param {object} ev jquerv event object
 */
Wrapper.prototype.changeDevice = function(button, ev) {
	var oDeferred = Q.defer();
	var id = button.id;
	var menuItem = $("div.menu-item#" + id);
	if (this.devices[id]) {
		this.deviceId = id;
		if (menuItem && menuItem.data("parentId")) {
			var parentId = menuItem.data("parentId");
			var p = $("li#" + parentId);
			p.children(".menu-item").replaceWith(menuItem.clone());
		}
		this._renderDevice().then(function() {
			oDeferred.resolve();
		});
		if (this.oIdeWindow) {
			var oMessage = {"changeDevice":id};
			if(ev && ev.type === "click"){
				oMessage.changeDeviceClicked = $(button).find("span[class = type]").text();
			}
			
			this.oIdeWindow.postMessage(JSON.stringify(oMessage), location.origin);
		}
		
	} else {
		oDeferred.reject();
	}
	return oDeferred.promise;
};

/*
 * event handler of the customDevice button. To show the device of a customized size 
 * @param {HTMLElement} the button element which has been clicked on
 * @param {object} ev jquerv event object
 */
Wrapper.prototype.customDevice = function(button, ev) {
	var oDeferred = Q.defer();
	//hide all popups
	$("#share").hide();
	$("li#shareBtn").removeClass("active");
	$(".dropdown").hide();
	$(".dropdown-visible").removeClass("dropdown-visible");
	if ($(button).hasClass("editing") && ev.target.id !== "custButton") {
		// click on other area during editing
		return;
	}
	if (ev.target.id === "custButton") {
		if ($(button).hasClass("editing")) {
			// click on the confirm button
			if (!this._validateIntInput()) {
				oDeferred.reject();
				return;
			}
			$("div#disp span.desc").text($("#inputWidth").val() + " × " + $("#inputHeight").val());
			$(button).removeClass("editing");
			$("#custButton").attr("title", this.msg["preview_edit"]);
		} else {
			// click on the edit button
			$(button).addClass("editing");
			$("#inputWidth").select().focus();
			$("#custButton").attr("title", this.msg["preview_confirm"]);
			return;
		}
	}
	// var device = this.devices[this.deviceId];
	var w = parseInt($("#inputWidth").val());
	var h = parseInt($("#inputHeight").val());
	this.devices["custDevice"] = {
		"os" : "ios", //device.os,
		"width" : w,
		"height" : h,
		"frame" : "60" //device.frame,
	//"frameTB": device.frameTB
	};
	this.deviceId = "custDevice";
	this._renderDevice().then(function() {
		oDeferred.resolve();
	});
	
	if (this.oIdeWindow) {
			var oMessage = {"changeDevice":this.deviceId};
			if(ev && ev.type === "click"){
				oMessage.changeDeviceClicked = $(button).find("span[class = 'type i18n']").text();
			}
			
			this.oIdeWindow.postMessage(JSON.stringify(oMessage), location.origin);
	}
	
	return oDeferred.promise;
};

/*
 * rotate the device
 * @param {number} deg how many degrees need to be rotated. either 0 or 90
 */
Wrapper.prototype.rotateDevice = function(deg) {
	var oDeferred = Q.defer();
	var id = this.deviceId;
	var device = this.devices[id];
	var w = typeof (device.width) === "number" ? device.width + "px" : "100%";
	var h = typeof (device.height) === "number" ? device.height + "px" : "100%";

	if (deg instanceof HTMLElement || deg === undefined) {
		// invoked by click event
		deg = (this.degree + 90) % 180;
	}
	this.degree = parseInt(deg);

	var h1 = $("#content").height();
	var w1 = $("#content").width();

	// rotate the device
	if (deg === 0) {
		$("#device").css("-webkit-transform", "rotate(" + deg + "deg)");
		$("#display").css("-webkit-transform", "none");
		$("#device").css("-moz-transform", "rotate(" + deg + "deg)");
		$("#display").css("-moz-transform", "none");
		$("#device").css("-ms-transform", "rotate(" + deg + "deg)");
		$("#display").css("-ms-transform", "none");
		$("#display").css("width", w);
		$("#display").css("height", h);
	} else {
		var frameSize = parseInt(device.frame, 10) * 2; //Total frame width on both side
		var trueWidth = device.width + frameSize;
		var trueHeight = device.height + frameSize;
		var d = (parseInt(w) - parseInt(h)) / 2;
		var xTrans = 0, yTrans = 0;

		//Rotate the device frame
		var trans = "rotate(" + deg + "deg)";
		//After rotate if the device height is bigger than the preview window's width we need shift it to the left
		// by translating the y axis (not x axis, because it's been rotated)
		if (trueHeight > w1) { //If the device 
			var left = parseInt(this.deviceLeft, 10);
			yTrans = d + left;
		}

		//After rotate if the device height is bigger than the preview window' height we need shift it up
		// by translating the x axis (not y axis, because it's been rotated)
		if (trueHeight > h1) {
			xTrans = d;
			if (h1 > trueWidth) {
				xTrans += (h1 - trueWidth) / 2;
			}
		}
		//Rotated translate coord is swap, so use yTrans horizontal
		trans += " translate(" + xTrans + "px, " + yTrans + "px)";
		$("#device").css("-webkit-transform", trans);
		$("#device").css("-moz-transform", trans);
		$("#device").css("-ms-transform", trans);

		//for display
		trans = "rotate(-" + deg + "deg) translate(" + d + "px, " + d + "px)";
		$("#display").css("-webkit-transform", trans);
		$("#display").css("-moz-transform", trans);
		$("#display").css("-ms-transform", trans);
		$("#display").css("width", h);
		$("#display").css("height", w);
	}
	//Workaround for webkitscrollbar issue when rotating a device bigger than the preview window.
	$("#device").css("margin", "0.0001px"); //Use 0.0001px so that the margin is not visible

	setTimeout(function() {
		$("#device").css("margin", "");
		oDeferred.resolve();
	}, 600);
	return oDeferred.promise;
};

Wrapper.prototype.createCustButtons = function(oCustomSettings) {
	if (oCustomSettings) {
		for ( var id in oCustomSettings) {
			// a clickable button
			if (typeof oCustomSettings[id] === "string") {
				var label = oCustomSettings[id];
				this._createMenuButton(id, {
					"label" : label,
					"onclick" : "customButtonClicked"
				}).insertAfter("#custDevice");
			} else {
				// a dropdown menu
				var settings = oCustomSettings[id];
				if (settings.items) {
					for ( var item in settings.items) {
						settings.items[item].onclick = "customButtonClicked";
					}
				} else {
					settings.onclick = "customButtonClicked";
				}
				this._createMenuButton(id, settings).insertAfter("#custDevice");
			}
		}
	}
};