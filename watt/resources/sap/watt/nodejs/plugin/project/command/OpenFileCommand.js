define(function() {

	"use strict";

	function OpenFileCommand() {
		return this; // return this object reference
	}

	// Define the class methods.
	OpenFileCommand.prototype = {};

	OpenFileCommand.prototype.isAvailable = function(oDelegate) {
		return true;
	};

	OpenFileCommand.prototype.isEnabled = function(oDelegate) {
		var oObject = oDelegate.default;
		if (oObject && oObject.uri) {
			return true;
		}

		return false;
	};

	OpenFileCommand.prototype.execute = function(oObject) {
		return this._openEditor(oObject.uri, oObject.localUri, oObject.line);
	};

	OpenFileCommand.prototype._showInfo = function(sMessage, sCommandId, oCommandExecuteValue) {
		this.context.service.usernotification.liteInfoWithAction(sMessage, sCommandId, false, oCommandExecuteValue).done();
	};

	OpenFileCommand.prototype._openEditor = function(sUri, sLocalUri, line) {

		var that = this;

		var documentService = this.context.service.document;
		var editorService = this.context.service.editor;
		var contentService = this.context.service.content;

		return documentService.getDocumentByPath(sUri).then(function(foundDocument) {
			return editorService.getDefaultEditor(foundDocument).then(function(defaultEditor) {
				if (defaultEditor) {
					return contentService.open(foundDocument, defaultEditor.service).then(function() {
						if (line) {
							return defaultEditor.service.getUI5Editor().then(function(ioUI5Editor) {
								ioUI5Editor.oEditor.moveCursorTo(line - 1, 0);
								ioUI5Editor.oEditor.scrollToLine(line - 1, true, true, null);
								ioUI5Editor.oEditor.clearSelection();
							});
						}
					}).done();

				} else {
					var title = that.context.i18n.getText("testResultPane_fileNotFound_xtit");
					var message = that.context.i18n.getText("testResultPane_fileNotFound_xmsg", [sLocalUri]);
					that._showInfo(message);
				}
			}).fail(function(error) {
				that._logInfo(error);
			});
		}).fail(function(error) {
			that._logInfo("Could not open resource " + sLocalUri + ": " + error);
		});
	};

	return OpenFileCommand;
});
