(function(){
    importScripts("../../../../lib/requirejs/require.js");
    var _path;
    
    require.config({
        baseUrl: "../../../../../../",
        paths: {
        }
    });
    this.MAX_ISSUES_FOR_SOURCE = 1000; //used to limit number of issues to worker. Temp solution for bug 1570030300
    this.LODASH_LIB_PATH = "../../../../lib/lodash/lodash.js";
    
    // Since ValidationWorker might be used for JavaScript sources, using Constructors and XMLHttpRequests is forbidden
    // in order to prevent AJAX injections.
    self.Worker = function(url) {
        return null;
    };
    
    this.postMessage({action:"ready"});
    
    var that = this;
    
    this._parseFunction = function(key,value){
        if (key === 'content' || typeof value !== 'string' || (typeof value === 'string' && value.length < 8)) {
        	return value;
        }
        // else if(value.substring(0, 8) === 'function'){ 
        //     return eval('(' + value + ')');
        // }
        return value;
    };
    
    this.addEventListener('message',function(e) {
        var data = JSON.parse(e.data,that._parseFunction);
        try{
            if (data.action === 'validate') {
                that._path = data.context.currentServicePath; 
                require([that._path], function (validatorLogic) {
                        var result = validatorLogic.getIssues(data.context.oDocContent, data.context.mergedProjectConfiguration, data.context.docFullPath, data.context.oCustomRules);
                        if (result.issues) {
                            if (result.issues.length > that.MAX_ISSUES_FOR_SOURCE) {
                                require([that.LODASH_LIB_PATH], function(){
                                            result.issues = _.dropRight(result.issues, result.issues.length -  that.MAX_ISSUES_FOR_SOURCE );
                                            this.postMessage({action:'validate', result:result, validatedContent:data.context.oDocContent, docFullPath:data.context.docFullPath, serviceId:data.context.serviceId});
                                        });
                            } else {
                                this.postMessage({action:'validate', result:result, validatedContent:data.context.oDocContent, docFullPath:data.context.docFullPath, serviceId:data.context.serviceId});
                            }
                        } else {
                            this.postMessage({action:'validate', result:result, validatedContent:data.context.oDocContent, docFullPath:data.context.docFullPath, serviceId:data.context.serviceId});
                        }
                    }
                );
            }
        }
        catch(exception){  
            this.postMessage({action:'validate', result:{}, validatedContent:data.context.oDocContent, docFullPath:data.context.docFullPath, serviceId:data.context.serviceId});
        }
        
    }, false);
})();