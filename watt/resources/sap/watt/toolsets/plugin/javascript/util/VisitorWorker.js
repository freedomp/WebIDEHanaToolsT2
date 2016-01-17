(function(){
    importScripts("../../../../lib/requirejs/require.js");
    
    var _EsprimaVisitor;
    
    require.config({
        baseUrl: "../../../../../../",
        paths: {
            //'javascript' : 'sap/watt/common/plugin/javascript',
            'orionclient' : 'sap/watt/lib/orion'
        }
    });
    
    require(
        [ "orionclient/javascript/esprima/esprimaVisitor"], function (EsprimaVisitor) {
            this._EsprimaVisitor = EsprimaVisitor;
            this.postMessage({action:"ready"});
        }
    );
    
    var that = this;
    
    this._parseFunction = function(key,value){
        //key !== 'content' - is a workaround, we need to find a better way to identified function as part of editor document content.
        if (key === 'content' || typeof value !== 'string' || (typeof value === 'string' && value.length < 8)) {
        	return value;
        }
        else if(value.substring(0, 8) === 'function'){ 
            /*eslint-disable no-eval*/
            return eval('(' + value + ')');
            /*eslint-enable no-eval*/
        }
        return value;
    };
    
    this.addEventListener('message',function(e) {
        var data = JSON.parse(e.data,that._parseFunction);
        try{
            if ( data && data.context && data.action === 'visit' && data.context.visitorOperation && data.context.visitorPostOperation && data.context.visitorContext && that._EsprimaVisitor) {
                var ast = esprima.parse(data.context.content,data.context.parseOptions);
                that._EsprimaVisitor.visit(ast,data.context.visitorContext,data.context.visitorOperation,data.context.visitorPostOperation);
                this.postMessage({action:'visit', result:data.context.visitorContext, contentOwner: data.context.contentOwner});
        	}
        }
        catch(exception){  
            this.postMessage({action:'visit', result:{}, contentOwner: data.context.contentOwner});
        }
        
    }, false);
})();