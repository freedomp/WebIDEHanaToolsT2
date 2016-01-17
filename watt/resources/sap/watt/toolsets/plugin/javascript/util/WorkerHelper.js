define([],function(){
            "use strict";
            
            var _oDeferred;//is it correct?
            var _worker;
            var _workerPostProcess;
    	    
    	    var _oOpenQueue = new Q.sap.Queue();
            
            var workerHelper = {
                init: function(workerScript,workerPostProcess, errorHandler){
                    var that = this;
                    return _oOpenQueue.next(function() {
                        if(!_worker){
                            _oDeferred = Q.defer();
                            _worker = new Worker(workerScript);
                            _workerPostProcess = workerPostProcess;
                            _worker.onmessage = that._onMessage;
                            _worker.onerror = errorHandler;
                            return _oDeferred.promise;
                        }
                        else{
                            //console.log("loading not needed");
                            return new Q();
                        }
                    });
                },
                
                _onMessage:function(event){
                    if (event.data.action === "ready") {
                        //console.log("ready");
                    	_oDeferred.resolve();
                    }
                    else {//if(event.data.action === "visit") {
                    	return _workerPostProcess(event);
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
                        _worker.postMessage(contextObjectString);}
                    else{
                        //TODO - handle the message
                        throw new Error("make sure the worker is not terminated");
                    }
                },
                
                terminateWorker: function() {
                    if(_worker){
                        _worker.terminate();
                        _worker = undefined;
                    }
                }
            };
            return function(workerScript,workerPostProcess,errorHandler) {
                return this.init(workerScript,workerPostProcess,errorHandler).then(function(){
                    return {
                        doOperation: this.doOperation,
                        terminateWorker : this.terminateWorker
                    } ;
                }.bind(this));
            }.bind(workerHelper);
        }
    );