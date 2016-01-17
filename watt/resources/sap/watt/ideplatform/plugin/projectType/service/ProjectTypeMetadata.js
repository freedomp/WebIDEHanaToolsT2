define(function() {
	"use strict";
	
	var ProjectTypeMetadata = sap.ui.base.Object.extend("sap.watt.common.plugin.filesystem.projecttype.ProjectTypeMetadata", {
		constructor : function(sId, sdisplayName, bMixable, bPrimaryable, aAttributeDescriptors, aRunnerCategories ) {
			this.id = sId;
			this.displayName = sdisplayName;
			this.bPrimaryable = bPrimaryable;
			this.bMixable = bMixable;
			this.aAttributeDescriptors = aAttributeDescriptors;
			this.aRunnerCategories = aRunnerCategories;
		}
	});

	ProjectTypeMetadata.prototype = jQuery.extend(ProjectTypeMetadata.prototype, {
		
		getAvailableRunners : function(){
//			return this._aRunners;
		},
		
		getAvailableBuilders : function(){
//			return this._aBuilders;
		},
		getbPrimaryable : function(){
			return this.bPrimaryable;
		}
	});

	return ProjectTypeMetadata;
});