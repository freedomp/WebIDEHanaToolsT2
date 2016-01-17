define(["sap/watt/saptoolsets/fiori/editor/plugin/ui5wysiwygeditor/utils/UndoRedoStack", "sap/watt/saptoolsets/fiori/editor/plugin/ui5wysiwygeditor/utils/ViewState"], function (UndoRedoStack, ViewState) {
	"use strict";
	describe("Undo redo stack", function () {

		function cleanedStackValidations(stack) {
			assert.equal(stack.hasRedo(), false);
			assert.equal(stack.hasUndo(), false);
			assert.equal(stack.isClean(), true);
		}

		function pushAndUndoPushes(n, stack) {
			var i;
			for (i = 0; i < n; i++) {
				stack.push(new ViewState("state" + i, "selected" + i));
			}
			for (i = 0; i < n - 1; i++) {
				var oUndoStackState = stack.undo();
				var oStackState = new ViewState("state" + (n - i - 2), "selected" + (n - i - 2));
				assert.equal(oUndoStackState.getViewStateContent(), oStackState.getViewStateContent());
				assert.equal(oUndoStackState.getViewStateSelectedControlId(), oStackState.getViewStateSelectedControlId());
			}
			return i;
		}

		function validateOverflowScenario(n) {
			var oStack = new UndoRedoStack(n), i;
			pushAndUndoPushes(n, oStack);
			assert.equal(oStack.undo(), null);
			for (i = 1; i < n - 1; i++) {
				var oRedoStackState = oStack.redo();
				assert.equal(oRedoStackState.getViewStateContent(), "state" + i);
				assert.equal(oRedoStackState.getViewStateSelectedControlId(), "selected" + i);
			}
		}

		function ValidateMultipleUndoAndRedo(stack, /**number*/ n) {
			var i;
			pushAndUndoPushes(n, stack);
			for (i = 1; i < n; i++) {
				var oRedoStackState = stack.redo();
				var oStackState = new ViewState("state" + i, "selected" + i);
				assert.equal(oRedoStackState.getViewStateContent(), oStackState.getViewStateContent());
				assert.equal(oRedoStackState.getViewStateSelectedControlId(), oStackState.getViewStateSelectedControlId());
			}
		}

		it("Empty data structure - APIs work", function () {
			var oStack = new UndoRedoStack(10);
			cleanedStackValidations(oStack);
		});
		it("Push and pop", function () {
			var oStack = new UndoRedoStack(10);
			ValidateMultipleUndoAndRedo(oStack, 2);
		});
		it("Clean", function () {
			var oStack = new UndoRedoStack(10);
			oStack.push(new ViewState("state1", "selected1"));
			oStack.push(new ViewState("state2", "selected2"));
			oStack.push(new ViewState("state3", "selected3"));
			oStack.undo();
			oStack.clean();
			cleanedStackValidations(oStack);
		});
		it("Identical pushes are ignored", function () {
			var oStack = new UndoRedoStack(10);
			oStack.push(new ViewState("state1", "selected1"));
			oStack.push(new ViewState("state2", "selected2"));
			oStack.push(new ViewState("state2", "selected2"));
			var oUndoStackState = oStack.undo();
			assert.equal(oUndoStackState.getViewStateContent(), "state1");
			assert.equal(oUndoStackState.getViewStateSelectedControlId(), "selected1");
		});
		it("Buffer reaching max size exactly", function () {
			var oStack = new UndoRedoStack(3);
			ValidateMultipleUndoAndRedo(oStack, 3);
		});
		it("Buffer exceeding max size exactly", function () {
			validateOverflowScenario(3);
			validateOverflowScenario(30);
		});
	});
});
