define(["./NodeJsDebugSourceFileDocument"], function(NodeJsDebugSourceFileDocument) {
	"use strict";

	var NodeJsDebugSourceDocumentProvider = function(debugSession) {

		this._debugSession = debugSession;

		/**
		 * Returns the source document from the node debugger.
		 * The key has to have the following structure:
		 * {
		 * 		url: <url as returned from the node debugger with the scriptParsed event>,
		 * 		id: <script id as returned from the node debugger with the scriptParsed event>
		 * }
		 */
		this.getDocumentByKey = function(key) {

			if (!this._debugSession) {
				throw "No debug session set";
			}

			return new NodeJsDebugSourceFileDocument(this._debugSession, key);
		};

		/**
		 * Returns the source document from the node debugger.
		 * See getDocumentByKey().
		 * The key string has to be a json string containing the following:
		 * "{
		 * 		url: <url>,
		 * 		id: <script id as returned from the node debugger with the scriptParsed event>
		 * }"
		 */
		this.getDocumentByKeyString = function(keyString) {

			var key = JSON.parse(keyString);

			return this.getDocumentByKey(key);
		};
	};

	return NodeJsDebugSourceDocumentProvider;
});
