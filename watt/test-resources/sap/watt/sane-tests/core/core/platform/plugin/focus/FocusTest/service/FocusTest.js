define( {
	
	_oView : null,	
	_bvisible : true,
	_title : "undefined",
	_tooptip: "undefined",

	getContent: function() {
		this._initView();	
		
		return this._oView;
	},
	
	getFocusElement: function() {
		return this._oView;
	},
	
	setVisible: function(bVisible) {
		this._bvisible = bVisible;
	},
	
	isVisiable : function() {
		return this._bVisible;
	},
	
	getTitle : function() {
		return this._title;
	},
	
	getTooltip : function() {
		return this._tooptip;
	},
	
	setTitle : function(title) {
		this._title = title;
	},
	
	setTooltip : function(tooltip) {
		this._tooltip = tooltip;
	},
	
	_initView: function() {
		if ( this._oView === null ) {
			this._oView = sap.ui.view({
				viewName : "focus.test.FocusTest.view.FocusTest",
				type : sap.ui.core.mvc.ViewType.XML
			});
		}
	},

	getDomRef: function() {
		return this.getContent().getFocusDomRef();
	}
});