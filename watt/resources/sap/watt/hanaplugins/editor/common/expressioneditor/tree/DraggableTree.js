/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
sap.ui.commons.Tree.extend("sap.watt.hanaplugins.editor.common.expressioneditor.DraggableTree", {

	metadata : {
		events : {
			scroll : {enablePreventDefault : true},
			rerendered : {enablePreventDefault : true}
		}
	},
		
	renderer : {
		render : function(oRm, oControl) {
			sap.ui.commons.TreeRenderer.render(oRm, oControl);
		}

	},
	
	onAfterRendering : function() {
		
		$.sap.require('sap.ui.thirdparty.jqueryui.jquery-ui-draggable');
		
		var selector = "#"+this.getId()+" .sapUiTreeNode";
		$(selector).addClass("draggable");
		
		
		// TODO id problem
		$(".draggable").draggable({
			containment : '.exprEditorInnerLayout',
			curser : 'move',
			appendTo : '.exprEditorInnerLayout',
			helper : $.proxy(this.createDropHelper, this)
		});
		
		this.fireRerendered({});
	},
	
	createDropHelper : function(event) {
		var target = event.currentTarget;
		return '<div id=\"helper\">' + target.title + '</div>';
	}

});
