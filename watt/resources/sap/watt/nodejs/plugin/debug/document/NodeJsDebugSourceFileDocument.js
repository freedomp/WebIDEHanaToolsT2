define([ "sap.watt.common.document/Document",
         "./NodeJsDebugSourceEntity" ], function(Document, NodeJsDebugSourceEntity) {
	"use strict";

	var NodeJsDebugSourceFileDocument = Document.extend("sap.xs.nodejs.debug.document.NodeJsDebugSourceDocument", {

		constructor : function(debugSession, key) {
			this._keyString = JSON.stringify(key);

			this._url = key.url;
			this._id = key.id;

			this._debugSession = debugSession;

			this._content = null;
		},

		getType : function() {
			return "file";
		},

		getTitle : function() {
			return this._url.split("/").pop();
		},

		getKeyString: function () {
			return this._keyString;
		},

		getEntity : function() {
			return new NodeJsDebugSourceEntity(this._url);
		},

		isReadOnly : function() {
			return true;
		},

		isDirty : function() {
			return false;
		},

		isNew : function() {
			return false;
		},

		getContent : function() {
			if (!this._content) {
				this._content = this._debugSession.getSourceCodeForId(this._id);
			}
			return this._content;
		},

		getProject : function(bRootProject) {
			return Q(this);
		}
	});

	return NodeJsDebugSourceFileDocument;
});