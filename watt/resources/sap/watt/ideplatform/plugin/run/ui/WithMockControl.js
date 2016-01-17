sap.ui.define(["sap/ui/core/Control", "sap/watt/ideplatform/plugin/run/ui/TitleExtendedControl"], function(Control, ExtendedTitle) {
	return Control.extend("MockCheckboxCompositeControl", {
		_isVisited: false,
		
		metadata: {
			properties: {
				Label: {
					type: "string",
					description: "Run with mockdata label"
				},
				ControlTitle: {
					type: 'string',
					description: "Mock Data Control title"
				},
				oController: "object"
			},
			aggregations: {
				_oCheckBox: {
					type: "sap.ui.commons.CheckBox",
					multiple: false,
					visibility: "hidden"
				},
				_oVerticalLayout: {
					type: "sap.ui.layout.VerticalLayout",
					multiple: false,
					visibility: "hidden"
				}
			}
		},
		init: function() {
			//Define title
			this._title = new ExtendedTitle({});
			
			this._oCB = new sap.ui.commons.CheckBox({
				checked: {
					path: "/dataMode",
					formatter: function(x) {
						return (x === 0);
					}
				},
				change: this._onCheckBoxChange.bind(this)
			});
			
			this.setAggregation("_oVerticalLayout", new sap.ui.layout.VerticalLayout({
				content: [this._title, this._oCB]
			}));
		},
		
		exit: function() {
			if (this._title) {
				this._title.destroy();
				delete this._title;
			}
		
			var _oVerticalLayout = this.getAggregation("_oVerticalLayout");
			if (_oVerticalLayout)
			{
				var _oControlContent = _oVerticalLayout.getContent();
				if (_oControlContent.length) {
					for (var i = 0; i < _oControlContent.length; i++) {
						var item = _oControlContent[i];
						item.destroy();	
					}	
				}
			}
		},
		_onCheckBoxChange: function(oEvent) {
			var self = this;
			var oEventExtend = jQuery.extend(true, {}, oEvent);
			self.getOController().updateCB(oEventExtend, "/dataMode", oEventExtend.getParameter("checked")).done();
		},
		onBeforeRendering: function() {
			var self = this;
			if (!this._isVisited) {
				this._isVisited = true;
				
				//Get Resource Bundle for I18n
				var oRessourceBundle = self.getModel("i18n").getResourceBundle();
				if (!this.getControlTitle()) {
					this.setControlTitle(oRessourceBundle.getText("title_run_config_ui_mock_data"));	
				}
				self._title.getAggregation("title").setText(this.getControlTitle());
				
				if (!this.getLabel()) {
					this.setLabel(oRessourceBundle.getText("lbl_run_config_ui_mock_data_cb"));
				}
				var oVerticalAggr = self.getAggregation("_oVerticalLayout");
				var oCheckBoxControl = oVerticalAggr.getContent()[1];
				oCheckBoxControl.setText(this.getLabel());
			}
		},
		renderer: function(oRm, oControl) {
			oRm.write('<div');
			oRm.writeControlData(oControl);

			oRm.addClass('myControlProperty');
			oRm.writeClasses();
			oRm.write('>');

			oRm.write('<div>');
			oRm.renderControl(oControl.getAggregation("_oVerticalLayout"));
			oRm.write('</div>');
			
			oRm.write('</div>');
		}

	});

});