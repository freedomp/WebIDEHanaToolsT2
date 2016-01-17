/*global define*/
define([], function() {
	"use strict";
	function buildPath(){
		return "//ns:Label[(not(@id) or normalize-space(@id)='')]"
			+ "|//ns:Column[(not(@id) or normalize-space(@id)='')]"
			+ "|//ns:Button[(not(@id) or normalize-space(@id)='')]"
			+ "|//ns:ObjectAttribute[(not(@id) or normalize-space(@id)='')]"
			+ "|//ns:Toolbar[(not(@id) or normalize-space(@id)='')]"
			+ "|//ns:IconTabFilter[(not(@id) or normalize-space(@id)='')]"
			+ "|//ns:IconTabBar[(not(@id) or normalize-space(@id)='')]"
			+ "|//ns:SearchField[(not(@id) or normalize-space(@id)='')]"
			+ "|//ns:Page[(not(@id) or normalize-space(@id)='')]"
//			+ "|//mvc:View[(not(@id) or normalize-space(@id)='')]"
			+ "|//navpopover:SmartLink[(not(@id) or normalize-space(@id)='')]"
			+ "|//sfilter:controlConfiguration[(not(@id) or normalize-space(@id)='')]"
			+ "|//sfilter:SmartFilterBar[(not(@id) or normalize-space(@id)='')]"
			+ "|//sfield:SmartField[(not(@id) or normalize-space(@id)='')]"
			+ "|//sfield:SmartLabel[(not(@id) or normalize-space(@id)='')]"
			+ "|//sform:SmartForm[(not(@id) or normalize-space(@id)='')]"
			+ "|//stable:SmartTable[(not(@id) or normalize-space(@id)='')]"
			+ "|//svariants:SmartVariantManagement[(not(@id) or normalize-space(@id)='')]"
			+ "|//svariants:SmartVariantManagementUi2[(not(@id) or normalize-space(@id)='')]"
			+ "|//core:Item[(not(@id) or normalize-space(@id)='')]"
			+ "|//uilayout:DynamicSideContent[(not(@id) or normalize-space(@id)='')]"
			+ "|//uilayout:FixFlex[(not(@id) or normalize-space(@id)='')]"
			+ "|//uilayout:Grid[(not(@id) or normalize-space(@id)='')]"
			+ "|//uilayout:GridData[(not(@id) or normalize-space(@id)='')]"
			+ "|//uilayout:GridIndent[(not(@id) or normalize-space(@id)='')]"
			+ "|//uilayout:GridPosition[(not(@id) or normalize-space(@id)='')]"
			+ "|//uilayout:GridSpan[(not(@id) or normalize-space(@id)='')]"
			+ "|//uilayout:HorizontalLayout[(not(@id) or normalize-space(@id)='')]"
			+ "|//uilayout:ResponsiveFlowLayout[(not(@id) or normalize-space(@id)='')]"
			+ "|//uilayout:ResponsiveFlowLayoutData[(not(@id) or normalize-space(@id)='')]"
			+ "|//uilayout:Splitter[(not(@id) or normalize-space(@id)='')]"
			+ "|//uilayout:SplitterLayoutData[(not(@id) or normalize-space(@id)='')]"
			+ "|//uilayout:VerticalLayout[(not(@id) or normalize-space(@id)='')]"
			+ "|//layoutform:Form[(not(@id) or normalize-space(@id)='')]"
			+ "|//layoutform:FormContainer[(not(@id) or normalize-space(@id)='')]"
			+ "|//layoutform:FormElement[(not(@id) or normalize-space(@id)='')]"
			+ "|//layoutform:FormLayout[(not(@id) or normalize-space(@id)='')]"
			+ "|//layoutform:GridContainerData[(not(@id) or normalize-space(@id)='')]"
			+ "|//layoutform:GridElementCells[(not(@id) or normalize-space(@id)='')]"
			+ "|//layoutform:GridElementData[(not(@id) or normalize-space(@id)='')]"
			+ "|//layoutform:GridLayout[(not(@id) or normalize-space(@id)='')]"
			+ "|//layoutform:ResponsiveGridLayout[(not(@id) or normalize-space(@id)='')]"
			+ "|//layoutform:ResponsiveLayout[(not(@id) or normalize-space(@id)='')]"
			+ "|//layoutform:SimpleForm[(not(@id) or normalize-space(@id)='')]"
			+ "|//layoutform:SimpleFormLayout[(not(@id) or normalize-space(@id)='')]";
	}

	return {
		id: "XML_MISSING_STABLE_ID",
		category: "Fiori Architectural Guidelines Error",
		path: buildPath(),
		errorMsg: "An ID must be set for this control.",
		validate: function(report, path, nodes){
			var result = [];
			//console.log("validating (" + this.id + ")");
			for(var i = 0; i < nodes.length; i++){
				var node = nodes[i];
				if(node){
					result.push(node);
				}
			}
			return result;
		}
	};
});