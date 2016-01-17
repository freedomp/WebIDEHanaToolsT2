define(function() {
   "use strict"; 
   return { 
	   
	   execute : function() { 
		   var that = this;
			return this.context.service.perspective.getAreaForService(that.context.service.content).then(function(sPerspectiveArea) {
				return that.context.service.perspective.isAreaMaximized(sPerspectiveArea).then(function(bMaximized) {
					if (bMaximized){
						return that.context.service.perspective.setAreaMaximized(sPerspectiveArea, false).then(function(){
							return that.context.service.repositorybrowser.setSelectionToCurrentDocument();
						});						
					}else{
						return that.context.service.repositorybrowser.setSelectionToCurrentDocument();
					}
				});
			});
	   }, 

	   isAvailable : function() { 
		   var that = this;
		   return this.context.service.repositorybrowser.getStateLinkWithEditor().then(function(bResult){ 
			   if (bResult){
				   return false;
			   }else{
				  return that.context.service.content.isClickedTabSelected().then(function(bResult){
						  return bResult;
				  });
			   }
		   });
	   },
	   
	   isEnabled : function() {
		 // not called during runtime, fixed value in command definition
		 return true; 
	   }
	   
   }; 
   
});  
