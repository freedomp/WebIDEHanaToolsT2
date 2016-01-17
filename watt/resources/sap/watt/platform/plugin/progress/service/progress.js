define(["sap/watt/common/plugin/platform/service/ui/AbstractPart"],
    function(AbstractPart) {
        "use strict";

        var progress = AbstractPart.extend("sap.watt.platform.plugin.progress.service.Progress",
        {
            runningTasks : [],
            PROGRESS_BAR_ID : "ideProgressBar",

            init : function(){
                var oInner = $("<div/>").addClass('ideProgressBar').attr("id", this.PROGRESS_BAR_ID);
                var oWrapper = $("<div/>").addClass('ideProgressBarWrapper').append(oInner);
                $("body").append(oWrapper);
            },

            configure : function (mConfig) {
                return this.context.service.resource.includeStyles(mConfig.styles);
            },

            _startAnimation : function(){
                $("#"+this.PROGRESS_BAR_ID).addClass("animate");
            },

            _stopAnimation : function(){
                $("#"+this.PROGRESS_BAR_ID).removeClass("animate");
            },

            startTask : function () {
            	var iTaskId = Math.floor((Math.random() * 100000) + 1);
                if(iTaskId !== undefined && iTaskId !== null){
                    this.runningTasks.push(iTaskId);
                    if(this.runningTasks.length === 1){
                        this._startAnimation();
                    }
                }
                return iTaskId;
            },

            stopTask : function (iTaskId) {
                if(iTaskId !== undefined && iTaskId !== null){
                    var iFirstIndex = $.inArray(iTaskId, this.runningTasks);
                    if(iFirstIndex !== -1){
                        this.runningTasks.splice(iFirstIndex,1);
                        if(this.runningTasks.length === 0){
                            this._stopAnimation();
                        }
                    }
                }
            }

        }
        );
        
        return progress;
    }
);
