define(function() {
	"use strict";

	// MessageChannel mock
	var MessageChannelMock = function MessageChannelMock(channelName, onMessageCallback) {

		return {

			channelName: channelName,
			onMessageCallback: onMessageCallback,
			posts: [],
			subscribed: false,
			injectedError: null,
            validatePostError: null,

			post: function post(endpoint, payload, context) {
				// callback is registered in NodeJsDebugSession.connect()
				if (!this.subscribed) {
					return Q.reject("Subscription missing for message bus channel '" + channelName + "'");
				}

                var postData = {
					endpoint: endpoint,
					payload: payload,
					message: { id: payload.id,  params: []},
					error: this.injectedError,
					context: context
				};
				this.posts.push(postData);

				var that = this;
				setTimeout(function() {that.processPost(postData);}, 10);
				return new Q();
			},

			processPost: function processPost(postData) {
				// the onPostDataPrepareHandler is used to prepare the response message that will be passed
				// to the callback function registerd for subscribeToChannel
				if (this.onPostDataPrepareHandler != null) {
				 	this.onPostDataPrepareHandler.call(this, postData);
				}

				// By default two scripts will be loaded by the node.js runtime mock -
				// SCRIPT_ID_1 maps to file FILE_PATH_1
				// SCRIPT_ID_2 maps to file FILE_PATH_2
				// This will fire two 'debugger.scriptParsed' events - the below code will prepare the
				// corresponding response messages
				if (postData.payload && postData.payload.method === "Page.getResourceTree") {
					// allow removing request message 'Page.getResourceTree' from the message queue
					this.onMessageCallback(postData.message, null, postData.context);

    				// fire Debugger.scriptParsed event for script 1
				    var message = {
				    	method: "Debugger.scriptParsed",
					    params: {
						    scriptId: 1,
							url: MessageChannelMock.URL_1
    					}
				    };
	    			this.onMessageCallback(message, null, postData.context);

	    			// fire Debugger.scriptParsed event for script 2
	    			message = {
    	    			method: "Debugger.scriptParsed",
	    	    		params: {
    	            		scriptId: 2,
		    		    	url: MessageChannelMock.URL_2
				    	}
    				};
    	    		this.onMessageCallback(message, null, postData.context);
				}
				this.onMessageCallback(postData.message, postData.error, postData.context);
			},

			subscribe: function subscribe() {
				this.subscribed = true;
				return new Q();
			},

			unsubscribe: function unsubscribe() {
				this.subscribed = false;
				return new Q();
			},

			injectError: function injectError(error) {
			    this.injectedError = error;
			},

			reset: function reset() {
				this.subscribed = false;
				this.posts.length = 0;
				this.onPostDataPrepareHandler = null;
			},

			validatePost: function validatePost(expectedEndpoint, expectedMethod, expectedPayload) {
			    this.validatePostError = "";

				for (var i = 0; i < this.posts.length; i++) {
					if (this.posts[i].endpoint === expectedEndpoint) {
						if (expectedMethod && expectedMethod !== null) {
							if (this.posts[i].payload && this.posts[i].payload.method === expectedMethod) {
								// compare payload
								if (expectedPayload) {
									for (var j = 0; j < expectedPayload.length; j++) {
										if (this.posts[i].payload.params.hasOwnProperty(expectedPayload[j].key)) {
											if (this.posts[i].payload.params[expectedPayload[j].key] === expectedPayload[j].value) {
												return true;
											} else {
						    					this.validatePostError = "Node.js debugger, post for endpoint [" + expectedEndpoint + "], method [" + expectedMethod + "], payload property [" +
                            						expectedPayload[j].key + "] does not match expected value [" + expectedPayload[j].value + "].";
                            					this.dumpPosts();
                            					break;
											}
										} else {
											this.validatePostError = "Node.js debugger, post for endpoint [" + expectedEndpoint + "], method [" + expectedMethod +
												"], payload property [" + expectedPayload[j].key + "] not found.";
                        					this.dumpPosts();
											break;
										}
									}
								} else {
									return true;
								}
							}
						} else {
							return true;
						}
					}
				}
				if (!expectedMethod) {
					 this.validatePostError =  "Node.js debugger, post for endpoint [" + expectedEndpoint + "] not found.";
					this.dumpPosts();
				} else if (!expectedPayload) {
					this.validatePostError = "Node.js debugger, post for endpoint [" + expectedEndpoint + "], method [" + expectedMethod + "] not found.";
					this.dumpPosts();
				}
				return false;
			},

			dumpPosts: function dumpPosts() {
			      for (var i = 0; i < this.posts.length; i++) {
			        this.validatePostError += "\nPost " + (i + 1) + ": endpoint [" + this.posts[i].endpoint + "], method [" + (this.posts[i].payload ? this.posts[i].payload.method : "undefined") + "]";
                    if (this.posts[i].payload && this.posts[i].payload.params) {
        		        var params = this.posts[i].payload.params;
        				for (var key in params) {
		        			if (params.hasOwnProperty(key)) {
        			            this.validatePostError += "\n   Property [" +  key + "] ,  value [" + params[key] + "]";
		        			}
    			        }
                    }
			      }
			},

			onPostDataPrepareHandler: null
		};
	};

	/////////////////////////////////
	// constants
	/////////////////////////////////
	MessageChannelMock.PROJECT_PATH = "/foomta/nodeapp";
	MessageChannelMock.DEBUG_URL = "http://user:abc@host:6003";
	MessageChannelMock.SESSION_DEFINITION = { projectPath: MessageChannelMock.PROJECT_PATH, debugURL: MessageChannelMock.DEBUG_URL };
	MessageChannelMock.GLOBAL_CHANNEL = "debug:nodejs:events:";
	// the messagebus mock returns the following debugId;
	MessageChannelMock.SESSION_ID_1 = "session_1";
	// the messagebus mock returns the following session channel;
	MessageChannelMock.SESSION_CHANNEL_1 = "channel_1";
	// the node.js runtime mock loads the following files;
	MessageChannelMock.SCRIPT_ID_1 = 1;
	MessageChannelMock.FILE_NAME_1 = "helloworld.js";
	MessageChannelMock.FILE_PATH_1 = MessageChannelMock.PROJECT_PATH + "/f1/f2/helloworld.js";
	MessageChannelMock.URL_1 = "file:///usr/sap/xs2work/executionagent/executionroot/198956a6-5abd-4011-ab25-4e28d26dce88/app/f1/f2/" + MessageChannelMock.FILE_NAME_1;
	MessageChannelMock.SCRIPT_ID_2 = 2;
	MessageChannelMock.FILE_NAME_2 = "core.js";
	MessageChannelMock.FILE_PATH_2 = MessageChannelMock.PROJECT_PATH + "/f1/core.js";
	MessageChannelMock.URL_2 = "file:///usr/sap/xs2work/executionagent/executionroot/198956a6-5abd-4011-ab25-4e28d26dce88/app/f1/" + MessageChannelMock.FILE_NAME_2;

	return MessageChannelMock;
});