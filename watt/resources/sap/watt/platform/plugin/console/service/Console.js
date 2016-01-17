define(["sap/watt/common/plugin/platform/service/ui/AbstractPart", "../view/Console.controller"], function(AbstractPart) {
	"use strict";

	var Console = AbstractPart.extend("sap.watt.common.plugin.console.service.Console", {

		_oView : null,

		_iMaxLineCount : null,

		_iActLineCount : 0,

		_sFormat : null,

		_targets : null,
		
		_LINE_BREAK_REGEXP : new RegExp("&#xa;", "g"),

		_oOrder : {
			"debug" : 0,
			"info" : 1,
			"warn" : 2,
			"error" : 3
		},

		configure : function(mConfig) {
			for (var i = 0; i < mConfig.targets.length; i++) {
				var oActTarget = mConfig.targets[i];
				this._targets[oActTarget] = oActTarget;
			}
			this._iMaxLineCount = mConfig.maxLineCount ? mConfig.maxLineCount : 200;
			this._sFormat = mConfig.format ? mConfig.format : "$MESSAGE";
			this._aStyles = mConfig.styles;
		},


		init : function() {
			this._targets = {};
			this._oView = sap.ui.view("Console", {
				viewName : "sap.watt.platform.plugin.console.view.Console",
				type : sap.ui.core.mvc.ViewType.XML
			});
		},

		getContent : function() {
			var that = this;
			var oResult = undefined;
			if (this._aStyles) {
				oResult = this.context.service.resource.includeStyles(this._aStyles).then(function() {
					return that._oView;
				});
			}
			return !!oResult ? oResult : Q(this._oView);
		},

		getFocusElement : function() {
			//TODO Return input field if it is there
			return this.getContent();
		},

		addMessage : function(oMessage) {
			this._addMessage(oMessage);
			return Q();
		},

		clear : function() {
			this._iActLineCount = 0;
			var oContainer = this._oView.getContent()[0];
			var oHTML = oContainer.getContent()[0];
			oHTML.destroy();
			oContainer.removeAllContent();
			oHTML = new sap.ui.core.HTML({
				id: "consoleHtml",
				content : "",
				preferDOM : false
			});
			oContainer.addContent(oHTML);
		},

		_addMessage : function(oMessage) {

			var oContainer = this._oView.getContent()[0];
			var oHTML = oContainer.getContent()[0];
			if (oHTML) {
				var sAct = oHTML.getContent();
				if (this._iActLineCount >= this._iMaxLineCount) {
					// If there are more lines than the maximum cut the first line before adding a new one
					var iIndex = sAct.indexOf("</div>");
					if (iIndex >= 0) {
						sAct = sAct.substr(iIndex + 6, sAct.length);
					}
					this._iActLineCount--;
				}

				// Create the requested format
				var sMessage = this._sFormat;
				sMessage = sMessage.replace("$TIME", oMessage.timestamp.toLocaleTimeString());
				sMessage = sMessage.replace("$TAG", oMessage.tag);
				sMessage = sMessage.replace("$MESSAGE", oMessage.message);
				
				//To avoid security issues
				sMessage = jQuery.sap.encodeHTML(sMessage);
				
				//Format the message after encoding
				sMessage = sMessage.replace(this._LINE_BREAK_REGEXP,"<br/>");
				
				// create a div containing the log message
				sAct += "<div class=\"" + oMessage.level + " " + "selectable\"" + ">" + sMessage + "</div>";
				this._iActLineCount++;

				oHTML.destroy();
				oContainer.removeAllContent();
				oHTML = new sap.ui.core.HTML({
					id: "consoleHtml",
					preferDOM : false
				});

				// set content explicitly. setting via constructor cause issue in case message contains parts like"{0}" that are
				// apparently confuse with binding strings. This leads to an empty log display
				oHTML.setContent(sAct);

				oContainer.addContent(oHTML);
				this._scrollToBottom();

			}
		},

		_scrollToBottom : function() {
			setTimeout(function() {
				var myDiv = $('#Console');
				myDiv = myDiv ? myDiv[0] : null;
				if (myDiv) {
					myDiv.scrollTop = myDiv.scrollHeight;
				}
			}, 100);
		},

		onLoggerEvent : function(oEvent) {

			var that = this;
			var sTarget = oEvent.params.target;
			var oService = oEvent.params.service;
			var oResult = undefined;
			if (this._targets[sTarget]) {
				oResult = oService.getLastLogMessage(sTarget).then(function(oMessage) {
					that._addMessage(oMessage);
				});
			}
			return !!oResult ? oResult : Q();

		}
	});

	return Console;
});