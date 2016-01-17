sap.ui.define(["sap/ui/test/Opa5","uitests/pageobjects/webIDEBase"], function(Opa5, WebIDEBase){

    return Opa5.createPageObjects({
		inTheCodeEditorPreferences: {
            baseClass : WebIDEBase,

			actions: {
				iSelectFontSize: function(sFontSize) {
					
					return this.waitFor({
					    id : "DropdownBox_fontSize",
						//controlType : "sap.watt.common.plugin.aceeditor.control.Editor", 
						success: function(oDropdownBox) {
					    	this.simulate.click(oDropdownBox);
							
							oDropdownBox.setValue(sFontSize);
							oDropdownBox.fireChange({
								newValue: sFontSize
							});
					
						},
						errorMessage: "Editor is not available"
					});
				}
				
				
			}, // end of actions  
			
			assertions: { 
			    iCheckPreviewFontSize : function(sFontSize) {
					
					return this.waitFor({
					    id : "editor-theme",
						//controlType : "sap.watt.common.plugin.aceeditor.control.Editor", 
						success: function(oEditor) {
					    	var fontSize = oEditor.$().css("font-size");
					        strictEqual(fontSize, sFontSize, "Ace editor Font Size is as expected");     
						},
						errorMessage: "Editor preview is not available"
					});
				}
				
			    
			 }
		}
	});
});