define({

    decorate : function(oDocument, oEvent) {
        if(oDocument.isProject()){
            return this.context.service.projectType.getProjectTypes(oDocument)
            .then(function(aProjectTypes){
                if(aProjectTypes && aProjectTypes.length > 0){
                    var oHeadProject = aProjectTypes[0];
                    var sIcon = oHeadProject.icon;
                    if(sIcon){
                        var oDecorators = {};
                        oDecorators.decoratorIconTopLeft = sIcon;
                        return oDecorators;
                    }
                    var sDecoratorIconStyleClass = oHeadProject.decoratorIconStyleClass;
                    if (sDecoratorIconStyleClass) {
                        var oDecorators = {};
                        oDecorators.decoratorIconStyleClass = sDecoratorIconStyleClass;
                        return oDecorators;
                    }
                }
            });
        }
    }

});