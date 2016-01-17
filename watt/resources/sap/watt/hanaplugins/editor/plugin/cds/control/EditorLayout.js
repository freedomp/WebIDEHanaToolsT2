/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
sap.ui.commons.Splitter.extend("sap.watt.hanaplugins.editor.plugin.cds.control.Splitter", {

	metadata: {
		events: {
			"moved": {
				"params": [{
					"name": "left",
					"type": "numeric"
                }, {
					"name": "width",
					"type": "numeric"
                }]
			}
		}
	},

	onAfterRendering: function(event) {
		sap.ui.commons.Splitter.prototype.onAfterRendering.apply(this, arguments);

		var splitterBar = this.$().children(".sapUiVerticalSplitterBar");
		var width = splitterBar.width();
		var that = this;
		var mouseDownAt = -1;
		var moved = false;
		var splitterPosition;

		function mouseDown(event) {
			splitterPosition = that._getSplitterPosition();
			mouseDownAt = event.pageX;
			$(document).mouseup(mouseUp);
			$(document).mousemove(mouseMove);
		}

		function mouseMove(event) {
			if (Math.abs(mouseDownAt - event.pageX) > width) {
				moved = true;
				that.fireMoved({
					left: event.pageX,
					width: width
				});
			}
		}

		function mouseUp(event) {
			if (moved) {
				try {
					that._lastSplitterPosition = splitterPosition;
					mouseMove(event);
				} finally {
					moved = false;
				}
			}
			$(document).off("mouseup", mouseUp);
			$(document).off("mousemove", mouseMove);
			mouseDownAt = -1;
		}

		splitterBar.mousedown(mouseDown);
	},

	init: function() {
		this._lastSplitterPosition = this._getSplitterPosition();
	},

	registerCallbacks: function(isExpanding, isCollapsing, calculateSplitterPosition) {
		this._isExpanding = isExpanding;
		this._isCollapsing = isCollapsing;
		this._calculateSplitterPosition = calculateSplitterPosition;
	},

	_getSplitterPosition: function() {
		var me = this.$();
		var splitterBar = me.children(".sapUiVerticalSplitterBar");
		var splitterOffset = splitterBar.offset();
		if (splitterOffset) {
			return this._calculateSplitterPosition(Math.round(splitterOffset.left));
		} else {
			var prop = this.getProperty('splitterPosition');
			return prop.substr(0, prop.length - 1);
		}
	},

	_getLastSplitterPosition: function() {
		return this._lastSplitterPosition;
	},

	rememberSplitterPosition: function() {
		this._lastSplitterPosition = this._getSplitterPosition();
	},

	setProperty: function(name, value) {
		var isSplitterProp = name === 'splitterPosition';
		var isExpanding, isCollapsing, hasChanged, oldValue;

		if (isSplitterProp) {
			isExpanding = this._isExpanding ? this._isExpanding : function() {
				return false;
			};
			isCollapsing = this._isCollapsing ? this._isCollapsing : function() {
				return false;
			};
			oldValue = this.getProperty("splitterPosition");
			hasChanged = oldValue !== value;

			if (!isExpanding() && !isCollapsing() && hasChanged) {
				this.rememberSplitterPosition();
			}
		}

		sap.ui.commons.Splitter.prototype.setProperty.apply(this, arguments);

		if (isSplitterProp && !isExpanding() && !isCollapsing() && hasChanged) {
			var splitterBar = this.$().children(".sapUiVerticalSplitterBar");
			if (splitterBar.offset()) {
				this.fireMoved({
					left: Math.round(splitterBar.offset().left),
					width: splitterBar.width()
				});
			}
		}
	},

	setSplitterBarVisible: function(value) {
		sap.ui.commons.Splitter.prototype.setSplitterBarVisible.apply(this, arguments);
		if (value) {
			this.$().next().hide();
		} else {
			this.$().next().show();
		}
	},

	renderer: function(rm, control) {
		sap.ui.commons.SplitterRenderer.render(rm, control);
	}
});

/*
 * see: http://kizu.ru/en/fun/rotated-text/
 * for details on how to rotate text
 */
sap.ui.commons.Button.extend("sap.watt.hanaplugins.editor.plugin.cds.control.EditorLayoutRotatedButton", {
	metadata: {
		interfaces: ["sap.watt.hanaplugins.editor.plugin.cds.control.EditorLayoutRotatedItem"]
	},
	renderer: {
		render: function(rm, control) {
			rm.write("<button");
			rm.writeControlData(control);
			rm.addClass("editorLayoutButton");
			rm.writeClasses();
			rm.write(">");
			rm.write("<span");
			rm.addClass("editorLayoutButtonInner");
			rm.writeClasses();
			rm.write(">");
			rm.write(control.getText());
			rm.write("</span>");
			var iconUri = control.getIcon();
			if (iconUri) {
				var icon = new sap.ui.core.Icon({
					src: iconUri
				});
				rm.renderControl(icon);
			}
			rm.write("</button>");
		}
	}
});

/*
 * see: http://kizu.ru/en/fun/rotated-text/
 * for details on how to rotate text
 */
sap.ui.commons.Label.extend("sap.watt.hanaplugins.editor.plugin.cds.control.EditorLayoutRotatedLabel", {
	metadata: {
		interfaces: ["sap.watt.hanaplugins.editor.plugin.cds.control.EditorLayoutRotatedItem"]
	},
	renderer: {
		render: function(rm, control) {
			rm.write("<label");
			rm.writeControlData(control);
			rm.addClass("editorLayoutLabel");
			rm.writeClasses();
			rm.write(">");
			rm.write("<span");
			rm.addClass("editorLayoutLabelInner");
			rm.writeClasses();
			rm.write(">");
			rm.write(control.getText());
			rm.write("</span>");
			rm.write("</label>");
		}
	}
});

sap.ui.core.Control.extend("sap.watt.hanaplugins.editor.plugin.cds.control.EditorLayout", {

	metadata: {
		properties: {
			"collapseLeft": {
				type: "boolean",
				defaultValue: false
			},
			"collapseRight": {
				type: "boolean",
				defaultValue: false
			},
			"allowExpandLeft": {
				type: "boolean",
				defaultValue: true
			},
			"allowExpandRight": {
				type: "boolean",
				defaultValue: true
			},
			"splitterPosition": {
				type: "sap.ui.core.Percentage",
				defaultValue: "50%"
			}
		},
		aggregations: {
			"_content": {
				multiple: false,
				visibility: "hidden"
			},
			"firstPaneContent": {
				singularName: "firstPaneContent"
			},
			"secondPaneContent": {
				singularName: "secondPaneContent"
			},
			"collapsedContentLeft": {
				singularName: "collapsedContentLeft",
				type: "sap.watt.hanaplugins.editor.plugin.cds.control.EditorLayoutRotatedItem"
			},
			"collapsedContentRight": {
				singularName: "collapsedContentRight",
				type: "sap.watt.hanaplugins.editor.plugin.cds.control.EditorLayoutRotatedItem"
			},
			"_expandButtonLeft": {
				multiple: false,
				visibility: "hidden"
			},
			"_expandButtonRight": {
				multiple: false,
				visibility: "hidden"
			}
		},
		// defaultAggregation: "content",
		events: {
			"expandedLeft": {},
			"expandedRight": {},
			"collapsedLeft": {},
			"collapsedRight": {}
		}
	},

	onAfterRendering: function(event) {
		this.lWidth = this.$().find(".editorLayoutCollapsedLeft").width();
		this.rWidth = this.$().find(".editorLayoutCollapsedRight").width();
	},

	init: function() {
		var that = this;

		function moved(event) {
			var splitterLeft = event.getParameter("left");
			var splitterWidth = event.getParameter("width");
			var left = Math.round(that.$().offset().left);
			var lOffset = splitterLeft - left;
			var width = that.$().width();
			var rOffset = width - lOffset - splitterWidth;

			var collapsedLeft = that.getCollapseLeft();
			if (collapsedLeft) {
				if (lOffset > that.lWidth) {
					that._setCollapseLeft(false);
				}
			} else {
				if (lOffset <= that.lWidth) {
					that._setCollapseLeft(true);
				}
			}

			var collapsedRight = that.getCollapseRight();
			if (collapsedRight) {
				if (rOffset > that.rWidth) {
					that._setCollapseRight(false);
				}
			} else {
				if (rOffset <= that.rWidth) {
					that._setCollapseRight(true);
				}
			}
		}

		var expandButtonLeft = new sap.ui.commons.Button({
			styled: false,
			icon: "sap-icon://open-command-field",
			tooltip: "expand",
			press: function(e) {
				that._expandLeft();
			}
		});
		expandButtonLeft.addStyleClass("editorLayoutExpandButton");
		this.setAggregation("_expandButtonLeft", expandButtonLeft);

		var expandButtonRight = new sap.ui.commons.Button({
			styled: false,
			icon: "sap-icon://slim-arrow-left",
			tooltip: "expand",
			press: function(e) {
				that._expandRight();
			}
		});
		expandButtonRight.addStyleClass("editorLayoutExpandButton");
		this.setAggregation("_expandButtonRight", expandButtonRight);

		var content = new sap.watt.hanaplugins.editor.plugin.cds.control.Splitter({
			moved: moved,
			showScrollBars: false
		});
		content.registerCallbacks(
			function() {
				return that._isExpanding;
			},
			function() {
				return that._isCollapsing;
			},
			function(splitterOffsetLeft) {
				var me = that.$();
				var offset = me.offset();
				var width = me.width();
				return (splitterOffsetLeft - Math.round(offset.left)) * 100 / width;
			}
		);
		this.setAggregation("_content", content);
	},

	exit: function() {
		this.destroyAggregation("_content", true);
		this.destroyAggregation("firstPaneContent", true);
		this.destroyAggregation("secondPaneContent", true);
		this.destroyAggregation("collapsedContentLeft", true);
		this.destroyAggregation("collapsedContentRight", true);
		this.destroyAggregation("_expandButtonLeft", true);
		this.destroyAggregation("_expandButtonRight", true);
	},

	getFirstPaneContent: function() {
		return this.getAggregation("_content").getFirstPaneContent();
	},

	insertFirstPaneContent: function(content, index) {
		this.invalidate();
		return this.getAggregation("_content").insertFirstPaneContent(content, index);
	},

	addFirstPaneContent: function(content) {
		this.invalidate();
		return this.getAggregation("_content").addFirstPaneContent(content);
	},

	removeFirstPaneContent: function(content) {
		this.invalidate();
		return this.getAggregation("_content").removeFirstPaneContent(content);
	},

	removeAllFirstPaneContent: function() {
		this.invalidate();
		return this.getAggregation("_content").removeAllFirstPaneContent();
	},

	indexOfFirstPaneContent: function(content) {
		return this.getAggregation("_content").indexOfFirstPaneContent(content);
	},

	destroyFirstPaneContent: function(content) {
		this.invalidate();
		return this.getAggregation("_content").destroyFirstPaneContent(content);
	},

	getSecondPaneContent: function() {
		return this.getAggregation("_content").getSecondPaneContent();
	},

	insertSecondPaneContent: function(content, index) {
		this.invalidate();
		return this.getAggregation("_content").insertSecondPaneContent(content, index);
	},

	addSecondPaneContent: function(content) {
		this.invalidate();
		return this.getAggregation("_content").addSecondPaneContent(content);
	},

	removeSecondPaneContent: function(content) {
		this.invalidate();
		return this.getAggregation("_content").removeSecondPaneContent(content);
	},

	removeAllSecondPaneContent: function() {
		this.invalidate();
		return this.getAggregation("_content").removeAllSecondPaneContent();
	},

	indexOfSecondPaneContent: function(content) {
		return this.getAggregation("_content").indexOfSecondPaneContent(content);
	},

	destroySecondPaneContent: function(content) {
		this.invalidate();
		return this.getAggregation("_content").destroySecondPaneContent(content);
	},

	_expandLeft: function() {
		this.setCollapseLeft(false);
	},

	_expandRight: function() {
		this.setCollapseRight(false);
	},

	_setSplitterPosition: function(position) {
		var splitter = this.getAggregation("_content");
		this.invalidate();
		return splitter.setSplitterPosition(position);
	},

	setSplitterPosition: function(position) {
		this.invalidate();

		if (position === "0%") {
			this.setCollapseLeft(true);
		} else if (position === "100%") {
			this.setCollapseRight(true);
		} else if (this.getCollapseLeft()) {
			this.setCollapseLeft(position);
		} else if (this.getCollapseRight()) {
			this.setCollapseRight(position);
		} else {
			return this._setSplitterPosition(position);
		}
	},

	getSplitterPosition: function(position) {
		return this.getAggregation("_content").getSplitterPosition();
	},

	_getLastSplitterPosition: function() {
		var splitter = this.getAggregation("_content");
		return splitter._getLastSplitterPosition().toString() + "%";
	},

	setCollapseLeft: function(collapse) {
		var isCollapsed = this.getProperty("collapseLeft");
		var collapseRight = this.getProperty("collapseRight");
		if (collapse === true && !collapseRight && !isCollapsed){ this.getAggregation("_content").rememberSplitterPosition();}
		this._setCollapseLeft(collapse);
	},

	setCollapseRight: function(collapse) {
		var isCollapsed = this.getProperty("collapseRight");
		var collapseLeft = this.getProperty("collapseLeft");
		if (collapse === true && !collapseLeft && !isCollapsed){ this.getAggregation("_content").rememberSplitterPosition();}
		this._setCollapseRight(collapse);
	},

	_setCollapseLeft: function(collapse) {
		var isAlreadyCollapsed = this.getProperty("collapseLeft");
		var newPosition;
		if (typeof collapse === "string") {
			newPosition = collapse;
			collapse = false;
		} else {
			newPosition = this._getLastSplitterPosition();
		}
		if (collapse === isAlreadyCollapsed) {return;}

		this.setProperty("collapseLeft", collapse, true);
		var splitter = this.getAggregation("_content");
		var leftArea = this.$().find(".editorLayoutCollapsedLeft");
		var splitterHasFocus = this.$().find(".sapUiVerticalSplitterBar").is(":focus");

		if (!collapse) {
			this._isExpanding = true;
			try {
				leftArea.hide();
				this._setSplitterPosition(newPosition);
				this.fireExpandedLeft();
			} finally {
				this._isExpanding = false;
			}
		} else {
			this._isCollapsing = true;
			try {
				leftArea.show();
				this._setCollapseRight(false);
				this._setSplitterPosition("0%");
				this.fireCollapsedLeft();
			} finally {
				this._isCollapsing = false;
			}
		}

		// regain focus that might got lost because of show()/hide()
		var that = this;
		if (splitterHasFocus) {
			setTimeout(function() {
				that.$().find(".sapUiVerticalSplitterBar").focus();
			}, 20);
		}
	},

	_setCollapseRight: function(collapse) {
		var isAlreadyCollapsed = this.getProperty("collapseRight");
		var newPosition;
		if (typeof collapse === "string") {
			newPosition = collapse;
			collapse = false;
		} else {
			newPosition = this._getLastSplitterPosition();
		}
		if (collapse === isAlreadyCollapsed) {return;}

		this.setProperty("collapseRight", collapse, true);
		var splitter = this.getAggregation("_content");
		var rightArea = this.$().find(".editorLayoutCollapsedRight");
		var splitterHasFocus = this.$().find(".sapUiVerticalSplitterBar").is(":focus");

		if (!collapse) {
			this._isExpanding = true;
			try {
				rightArea.hide();
				this._setSplitterPosition(newPosition);
				this.fireExpandedRight();
			} finally {
				this._isExpanding = false;
			}
		} else {
			this._isCollapsing = true;
			try {
				rightArea.show();
				this._setCollapseLeft(false);
				this._setSplitterPosition("100%");
				this.fireCollapsedRight();
			} finally {
				this._isCollapsing = false;
			}
		}

		// regain focus that might got lost because of show()/hide()
		var that = this;
		if (splitterHasFocus) {
			setTimeout(function() {
				that.$().find(".sapUiVerticalSplitterBar").focus();
			}, 20);
		}
	},

	renderer: {
		collapsedPanelRenderer: function(rm, expandButton, content) {
			var i;
			// collapsed header
			if (expandButton) {
				rm.renderControl(expandButton);
			}

			// collapsed content rows
			for (i = 0; i < content.length; i++) {
				rm.renderControl(content[i]);
			}
		},

		render: function(rm, control) {
			var i;
			var splitter = control.getAggregation("_content");
			var content = [splitter];
			rm.write("<div");
			rm.writeControlData(control);
			rm.addStyle("height", "100%");
			rm.addStyle("width", "100%");
			rm.writeStyles();
			rm.addClass("editorLayout");
			rm.writeClasses();
			rm.write(">");

			rm.write("<table");
			// rm.writeControlData(control);
			rm.writeAttribute("role", "presentation");
			rm.writeAttribute("cellpadding", "0");
			rm.writeAttribute("cellspacing", "0");
			rm.addStyle("width", "100%");
			rm.addStyle("height", "100%");
			rm.addStyle("table-layout", "fixed");
			rm.addStyle("border-collapse", "collapse");
			rm.addStyle("overflow", "hidden");
			rm.addStyle("text-overflow", "ellipsis");
			rm.addStyle("padding", "0");
			rm.writeStyles();
			if (control.getFirstPaneContent().length === 0) {
				rm.addClass("editorLayoutNoFirstPane");
				content = control.getSecondPaneContent();
			}
			if (control.getSecondPaneContent().length === 0) {
				rm.addClass("editorLayoutNoSecondPane");
				content = control.getFirstPaneContent();
			}
			rm.writeClasses();
			rm.write(">");

			rm.write("<tbody");
			rm.addStyle("width", "100%");
			rm.addStyle("height", "100%");
			rm.writeStyles();
			rm.write(">");
			rm.write("<tr>");

			// collapsed panel left
			rm.write("<td");
			if (!control.getCollapseLeft()) {
				rm.addStyle("display", "none");
			}
			rm.addStyle("height", "100%");
			rm.addStyle("vertical-align", "top");
			rm.writeStyles();
			rm.addClass("editorLayoutCollapsedLeft");
			rm.writeClasses();
			rm.write(">");
			var leftButton;
			if (control.getAllowExpandLeft()) {
				leftButton = control.getAggregation("_expandButtonLeft");
			}
			this.collapsedPanelRenderer(rm, leftButton, control.getCollapsedContentLeft());
			rm.write("</td>");

			// panel content
			rm.write("<td");
			rm.addStyle("height", "100%");
			rm.addStyle("width", "100%");
			rm.addStyle("vertical-align", "top");
			rm.writeStyles();
			rm.addClass("editorLayoutContent");
			rm.writeClasses();
			rm.write(">");
			for (i = 0; i < content.length; i++) {
				rm.renderControl(content[i]);
			}
			rm.write("</td>");

			// collapsed panel right
			rm.write("<td");
			if (!control.getCollapseRight()) {
				rm.addStyle("display", "none");
			}
			rm.addStyle("height", "100%");
			rm.addStyle("vertical-align", "top");
			rm.writeStyles();
			rm.addClass("editorLayoutCollapsedRight");
			rm.writeClasses();
			rm.write(">");
			var rightButton;
			if (control.getAllowExpandRight()) {
				rightButton = control.getAggregation("_expandButtonRight");
			}
			this.collapsedPanelRenderer(rm, rightButton, control.getCollapsedContentRight());
			rm.write("</td>");

			rm.write("</tr>");
			rm.write("</tbody>");
			rm.write("</table>");

			rm.write("</div>");
		}
	}

});