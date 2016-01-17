define(function() {
   "use strict"; 
   return { 
	   
	   execute : function() { 
		   var that = this;
		   return this.context.service.repositorybrowser.toggleLinkWithEditor().then(function(){
			   return that.context.service.command.invalidateAll();
		   });
	   }, 

	   isAvailable : function() { 
		   return this.context.service.repositorybrowser.getStateLinkWithEditor(); 
	   },
	   
	   isEnabled : function() { 
		   // not called during runtime, fixed value in command definition
		   return true;
	   }
	   
   }; 
   
});  
