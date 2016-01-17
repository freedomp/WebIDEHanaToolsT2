sap.ui.define(["sap/ui/core/Control", "sap/watt/ideplatform/plugin/run/ui/TitleExtendedControl"], function(Control, ExtendedTitle) {
	return Control.extend("PreviewCompositeControl", {
		_isVisited: false,

		metadata: {
			properties: {
				ControlButtonPreviewText: {
					type: "string",
					description: "Run with preveiw toggle button"
				},
				ControlButtonFrameText: {
					type: "string",
					description: "Run with frame toggle button"
				},
				ControlTitle: {
					type: 'string',
					description: "Preveiw Control title"
				},
				oController: "object"
			},
			aggregations: {
				_oGrid: {
					type: "sap.ui.layout.Grid",
					multiple: false,
					visibility: "hidden"
				}
			}
		},
		init: function() {
			var self = this;
			//Define title
			this._title = new ExtendedTitle({
				layoutData: new sap.ui.layout.GridData({
					span: "L12 M12 S12"
				})
			});
			
			
			this._iconWF = new sap.ui.core.Icon({
				//src: "sap-icon://internet-browser",
				src: "sap-icon://watt/frame",
				size: "3rem",
				color: {
					path: "/previewMode",
					formatter: this._withFrameColor
				},
				layoutData: new sap.ui.layout.GridData({
					span: "L12 M12 S12"
				}),
				press: this._onIconWithFramePress.bind(self)
			}).addStyleClass('previewIcon');
			
			this._iconWoF = new sap.ui.core.Icon({
				size: "3rem",
				//src: "sap-icon://full-screen",
				src: "sap-icon://watt/preview",
				color: {
					path: "/previewMode",
					formatter: this._withoutFrameColor
				},
				layoutData: new sap.ui.layout.GridData({
					span: "L12 M12 S12"
				}),
				press: this._onIconWithoutFramePress.bind(self)
			}).addStyleClass('previewIcon');

			this._oTB_WithFrame = new sap.ui.commons.ToggleButton({
				placeholder: "With Frame",
				width: "100px",
				pressed: {
					path: "/previewMode",
					formatter: this._withFrame
				},
				layoutData: new sap.ui.layout.GridData({
					span: "L12 M12 S12"
				}),
				press: this._onTbWithFramePress.bind(self)
			});

			this._oTB_WithoutFrame = new sap.ui.commons.ToggleButton({
				placeholder: "Without Frame",
				pressed: {
					path: "/previewMode",
					formatter: this._withoutFrame
				},
				layoutData: new sap.ui.layout.GridData({
					span: "L12 M12 S12"
				}),
				width: "100px",
				press: this._onTbWithoutFramePress.bind(self)
			});
			
			
			
			var wFrameGrid = new sap.ui.layout.Grid({
				layoutData: new sap.ui.layout.GridData({
					span: "L3 M6 S12"
				}),
				content: [this._iconWF,this._oTB_WithFrame]
			});
			
			var woFrameGrid = new sap.ui.layout.Grid({
				layoutData: new sap.ui.layout.GridData({
					span: "L3 M6 S12"
				}),
				content: [this._iconWoF,this._oTB_WithoutFrame]
			});
			
			this.setAggregation("_oGrid", new sap.ui.layout.Grid({
				width: "100%",
				vSpacing: 1,
				hSpacing: 0,
				content: [this._title, woFrameGrid, wFrameGrid],
				layoutData: new sap.ui.layout.GridData({
					span: "L12 M12 S12"
				})}));
		},

		exit: function() {
			if (this._title) {
				this._title.destroy();
				delete this._title;
			}
			if (this._oTB_WithFrame) {
				this._oTB_WithFrame.destroy();
				delete this._oTB_WithFrame;
			}
			if (this._oTB_WithoutFrame) {
				this._oTB_WithoutFrame.destroy();
				delete this._oTB_WithoutFrame;
			}
			if (this._iconWF) {
				this._iconWF.destroy();
				delete this._iconWF;
			}
			if (this._iconWoF) {
				this._iconWoF.destroy();
				delete this._iconWoF;
			}
			
		},
		
		//formater functions
		_withFrame: function(e) {
			return e === 0 ? true : false;
		},

		_withoutFrame: function(e) {
			return e === 1 ? true : false;
		},
		
		_withFrameColor: function(e){
			return e === 0 ? "#107dc2" : "#787878";
		},
		
		_withoutFrameColor: function(e){
			return e === 1 ? "#107dc2" : "#787878";
		},
		
		//event handlers
		_onTbWithFramePress: function(oEvent) {
			var self = this;
			var oEventExtend = jQuery.extend(true, {}, oEvent);
			self.getOController().updatePreviewSelected(oEventExtend, "/previewMode", 0).done();
		},

		_onTbWithoutFramePress: function(oEvent) {
			var self = this;
			var oEventExtend = jQuery.extend(true, {}, oEvent);
			self.getOController().updatePreviewSelected(oEventExtend, "/previewMode", 1).done();
		},
		
		_onIconWithFramePress: function(oEvent){
			var self = this;
			var oEventExtend = jQuery.extend(true, {}, oEvent);
			self.getOController().onIconPressed(oEventExtend, "/previewMode", 0).done();
		},
		
		_onIconWithoutFramePress: function(oEvent){
			var self = this;
			var oEventExtend = jQuery.extend(true, {}, oEvent);
			self.getOController().onIconPressed(oEventExtend, "/previewMode", 1).done();
		},

		onBeforeRendering: function() {
			var self = this;
			if (!this._isVisited) {
				this._isVisited = true;

				//Get Resource Bundle for I18n
				var oRessourceBundle = self.getModel("i18n").getResourceBundle();
				
				//set title text
				if (!this.getControlTitle()) {
					this.setControlTitle(oRessourceBundle.getText("run_config_ui_preview_frame_title"));
				}
				self._title.getAggregation("title").setText(this.getControlTitle());
				
				//set toglebutton withoutFrame text
				if (!this.getControlButtonPreviewText()) {
					this.setControlButtonPreviewText(oRessourceBundle.getText("run_config_ui_preview_btn"));
				}
				self._oTB_WithoutFrame.setText(this.getControlButtonPreviewText());
				self._oTB_WithoutFrame.setTooltip(oRessourceBundle.getText("lbl_run_config_ui_without_preview_frame_cb"));
				
				//set toglebutton withFrame text
				if (!this.getControlButtonFrameText()) {
					this.setControlButtonFrameText(oRessourceBundle.getText("run_config_ui_frame_btn"));
				}
				self._oTB_WithFrame.setText(this.getControlButtonFrameText());
				self._oTB_WithFrame.setTooltip(oRessourceBundle.getText("lbl_run_config_ui_with_preview_frame_cb"));
				
				//set tooltips to icons
				self._iconWoF.setTooltip(oRessourceBundle.getText("lbl_run_config_ui_without_preview_frame_cb"));
				self._iconWF.setTooltip(oRessourceBundle.getText("lbl_run_config_ui_with_preview_frame_cb"));
			}
		},
		renderer: function(oRm, oControl) {
			oRm.write('<div');
			oRm.writeControlData(oControl);
			oRm.write('>');
			oRm.renderControl(oControl.getAggregation("_oGrid"));
			oRm.write('</div>');
		}

	});

});