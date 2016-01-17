define(
	[
		"sap/watt/lib/lodash/lodash"
	],
	function (_) {
		"use strict";

		/**
		 * Constructor for a new UndoRedoStack.
		 *
		 * @param {number} iMaxSize the maximal number of states kept for undo
		 *
		 * @class
		 * Undo / Redo stack class
		 * @template T
		 *
		 * @constructor
		 * @public
		 * @alias sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.utils.UndoRedoStack
		 */
		function UndoRedoStack(iMaxSize) {
			/**
			 * @type {number}
			 * @private
			 */
			this._iMaxSize = iMaxSize;
			/**
			 * @type {Array<T>}
			 * @private
			 */
			this._aUndoStack = [];
			/**
			 * @type {Array<T>}
			 * @private
			 */
			this._aRedoStack = [];
		}

		/**
		 * Pushes a new state into the data structure
		 *
		 * @param {T} oPushCandidateState
		 *
		 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.utils.UndoRedoStack#push
		 * @function
		 * @public
		 */
		UndoRedoStack.prototype.push = function (oPushCandidateState) {
			if (!oPushCandidateState) {
				return;
			}
			if (oPushCandidateState.equalTo(_.last(this._aUndoStack))) {
				return;
			}
			this._aRedoStack = [];
			this._aUndoStack.push(oPushCandidateState);
			if (this._aUndoStack.length > this._iMaxSize) {
				this._aUndoStack.shift();
			}
		};

		/**
		 * Return the last state in order to undo
		 *
		 * @returns {T} Return the last state in order to undo
		 *
		 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.utils.UndoRedoStack#undo
		 * @function
		 * @public
		 */
		UndoRedoStack.prototype.undo = function () {
			//the top state is the current state, we want to return the state before, to revert to it
			if (this._aUndoStack.length <= 1) {
				return null;
			}
			var state = this._aUndoStack.pop();
			this._aRedoStack.push(state);
			return _.last(this._aUndoStack);
		};

		/**
		 * Return the next state in order to revert an undo
		 *
		 * @returns {T} Returns the last state in order to undo
		 *
		 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.utils.UndoRedoStack#redo
		 * @function
		 * @public
		 */
		UndoRedoStack.prototype.redo = function () {
			if (this._aRedoStack.length === 0) {
				return null;
			}
			var state = this._aRedoStack.pop();
			this._aUndoStack.push(state);
			return state;
		};

		/**
		 * Return true if there is something to undo
		 *
		 * @returns {boolean} Returns true if there is something to undo
		 *
		 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.utils.UndoRedoStack#hasUndo
		 * @function
		 * @public
		 */
		UndoRedoStack.prototype.hasUndo = function () {
			return this._aUndoStack.length > 1;
		};

		/**
		 * Return true if there is something to redo
		 *
		 * @returns {boolean} Returns true if there is something to redo
		 *
		 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.utils.UndoRedoStack#hasRedo
		 * @function
		 * @public
		 */
		UndoRedoStack.prototype.hasRedo = function () {
			return this._aRedoStack.length > 0;
		};

		/**
		 * Cleans state
		 *
		 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.utils.UndoRedoStack#clean
		 * @function
		 * @public
		 */
		UndoRedoStack.prototype.clean = function () {
			this._aUndoStack = [];
			this._aRedoStack = [];
		};

		/**
		 * Checks if the state is clean
		 *
		 * @returns {boolean} Returns true if the state is clean
		 *
		 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.utils.UndoRedoStack#isClean
		 * @function
		 * @public
		 */
		UndoRedoStack.prototype.isClean = function () {
			return this._aUndoStack.length + this._aRedoStack.length === 0;
		};

		return UndoRedoStack;
	}
);
