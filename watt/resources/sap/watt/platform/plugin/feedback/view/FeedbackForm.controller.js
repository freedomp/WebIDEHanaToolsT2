    var _;  
    sap.ui.controller("sap.watt.platform.plugin.feedback.view.FeedbackForm", {
        
        _selectedRatingValue : 0, 
        
        onInit : function(){
			require(["sap/watt/lib/lodash/lodash"],function(lodash){
			    _ = lodash;
			});
        },
    
        openForm : function(){
            this.getView()._oFeedbackDialog.open(); 
        },
        
        cancelFeedback : function(oEvent){
            this.getView()._oFeedbackDialog.close();
        },
        
        onRatingSelect : function(oSource){
            var sSelectedId = oSource.getParameters().selectedButtonId;
            var oSelectedButton = sap.ui.getCore().byId(sSelectedId);
            this._selectedRatingValue = oSelectedButton.ratingValue;
            this.getView()._oSendButton.setEnabled(true);
        },
        
        sendFeedback : function(oEvent){
            var oView = this.getView();
            var oService = oView.oViewData.service;
            var oI18nService = oView.oViewData.context.i18n;
            var that = this;
            oView._oFeedbackDialog.close();
            return this._getContextAttributes().then(function(mContextAttributes){
                return oService.feedback.sendFeedback(that._getTextAnswers(), that._getRatings(), mContextAttributes).then(function(){
                    oService.usernotification.liteInfo(oI18nService.getText("i18n", "feedback_sent_successfully"), true).done();
                }).fail(function(oError){
    				oService.log.info("Feedback", oI18nService.getText("i18n", "feedback_failed"), [ "user" ]).done();
                    throw oError;
                });
            });
        },
        
        _getTextAnswers : function(){
            var oView = this.getView();

            var mTextAnswers = {
                t1 : oView._aTextAreas[0].getValue(),
                t2 : oView._aTextAreas[1].getValue(),
                t3 : oView._aTextAreas[2].getValue()
            };
            
            return mTextAnswers;
        },
        
        _getRatings : function(){
            var mRatings = {
                r1 : {
                    value : this._selectedRatingValue
                }
            };
            
            return mRatings;
        },

        _getContextAttributes : function(){
            var that = this;
            return this._getWebIdeVersion().then(function(aResult){
                var mBrowserProp = that._getBrowserProperties();
                
                var mContextAttributes = {
                    attr1 : mBrowserProp.browser,  
                    attr2 : mBrowserProp.version,
                    attr3 : mBrowserProp.mobile,
                    attr4 : sap.ui.version,
                    attr5 : aResult[0].version,
                    page : window.location.href
                };
                
                return mContextAttributes;
            });
        },
        
        _getBrowserProperties : function(){
            var sUserAgent = window.navigator.userAgent;
            var oBrowser = jQuery.browser;
            var mBrowserProp = {};
            
            if (sUserAgent.indexOf("MSIE") !== -1) {
                mBrowserProp.browser = "IE";
                mBrowserProp.version = "10 or below";
            } else if (sUserAgent.indexOf("Trident") !== -1 && sUserAgent.indexOf("MSIE") === -1){  
                mBrowserProp.browser = "IE";
                mBrowserProp.version = "11 or above";
            } else {
                if(oBrowser.chrome){
                    mBrowserProp.browser = "Chrome";
                } else if (oBrowser.safari) {
                    mBrowserProp.browser = "Safari";
                } else if (oBrowser.mozilla) {
                    mBrowserProp.browser = "Firefox";
                }
                mBrowserProp.version = oBrowser.fVersion.toString();
            }
            
            mBrowserProp.mobile = oBrowser.mobile.toString();
            
            return mBrowserProp;
        },
        
        _getWebIdeVersion : function(){
			var sUrl = jQuery.sap.getModulePath("sap.watt.uitools.version", ".json");
			return Q.sap.ajax(sUrl,{
   			    dataType : "json"
			}).then(function(mVersion) {    
			    return mVersion;
			});
        }
        
    });