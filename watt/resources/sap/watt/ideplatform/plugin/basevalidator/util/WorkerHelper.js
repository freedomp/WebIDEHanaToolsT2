define([],function(){
    "use strict";
    
    var _oDeferred;
    var _worker;
    var _workerPostProcess;
    var _workerErrorHandler;
    var _lastProcessedDocContext;
    //var _context;
    var docToValidateQueue = [];
    var docToValidationContextMap = [];
    var workerInProcess = false;
    
    var _oOpenQueue = new Q.sap.Queue();

    var workerHelper = {
        init: function(workerScript,workerPostProcess, errorHandler){
            var that = this;
            return _oOpenQueue.next(function() {
                if(!_worker){
                    _oDeferred = Q.defer();
                    _worker = new Worker(workerScript);
                    _workerPostProcess = workerPostProcess;
                    _workerErrorHandler = errorHandler;
                    _worker.onmessage = that._onMessage;
                    _worker.onerror = that._onError;
                    return _oDeferred.promise;
                }
                else{
                    return new Q();
                }
            });
        },
        
        _onMessage:function(event){
            if (event.data.action === "ready") {
            	_oDeferred.resolve();
            }
            else {
                if(_worker){
                    workerInProcess = workerHelper.callPostMessage();
                    _workerPostProcess(event);
                }
                else{
                    throw new Error("make sure the worker is not terminated");
                }
            }
        },
        
        _onError:function(event){
            if(_worker){
                workerInProcess = workerHelper.callPostMessage();
                var fullContext = JSON.parse(_lastProcessedDocContext) || {};
                event.data = fullContext.context || {};
                event.data.validatedContent = fullContext.context.oDocContent || {};
                _workerErrorHandler(event);
            }
            else{
                throw new Error("make sure the worker is not terminated");
            }
        },

        doOperation : function(action,context){
            if(_worker){
                var contextObject = {"action":action,"context":context};
                var contextObjectString = JSON.stringify(contextObject,function(key,value){
                                                if (value instanceof Function || typeof value === 'function') {
            	                                    return value.toString();
                                                }
                                                    return value;
                                                });
                if (!docToValidationContextMap[context.docFullPath]) {
                    //_context.service.log.error("workerHelper","add " + context.docFullPath,[ "user" ]).done();
                    docToValidateQueue.push(context.docFullPath);
                } /*else {
                    _context.service.log.error("workerHelper","set " + context.docFullPath,[ "user" ]).done();
                }*/
                docToValidationContextMap[context.docFullPath] = contextObjectString;
                if (!workerInProcess) {
                    workerInProcess = true;
                    workerHelper.callPostMessage();
                }
            }
            else{
                throw new Error("make sure the worker is not terminated");
            }
        },

        callPostMessage : function(){
            var docFullPath = docToValidateQueue.shift();
            var contextObjectString = docToValidationContextMap[docFullPath];
            if (contextObjectString) {
                _lastProcessedDocContext = contextObjectString;
			 	//_context.service.log.error("workerHelper","validating " + docFullPath,[ "user" ]).done();
                _worker.postMessage(contextObjectString);
			 	delete docToValidationContextMap[docFullPath];
            }
            return (docToValidateQueue.length > 0);
        },

        terminateWorker: function() {
            if(_worker){
                _worker.terminate();
                _worker = undefined;
            }
        }
    };
    
    return function(context, workerScript,workerPostProcess,errorHandler) {
        //_context = context;
        return this.init(workerScript,workerPostProcess,errorHandler).then(function(){
            return {
                doOperation: this.doOperation,
                terminateWorker : this.terminateWorker
            };
        }.bind(this));
    }.bind(workerHelper);
});