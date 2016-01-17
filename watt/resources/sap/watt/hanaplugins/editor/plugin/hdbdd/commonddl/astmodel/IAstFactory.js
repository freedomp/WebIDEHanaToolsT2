define(
    ["commonddl/astmodel/AstFactoryImpl"], //dependencies
    function (AstFactoryImpl) {

        function IAstFactory() {

        }
        IAstFactory.eINSTANCE = AstFactoryImpl.init();
        return IAstFactory;
    }
);