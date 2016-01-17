define(
    ["commonddl/astmodel/StatementContainerImpl","commonddl/astmodel/EObjectContainmentEList","rndrt/rnd"], //dependencies
    function (StatementContainerImpl,EObjectContainmentEList,rnd) {
        function CompilationUnitImpl() {
            StatementContainerImpl.call(this);
        }
        CompilationUnitImpl.prototype = Object.create(StatementContainerImpl.prototype);
        CompilationUnitImpl.PARSED_SOURCE_EDEFAULT = null;
        CompilationUnitImpl.prototype.parsedSource = CompilationUnitImpl.PARSED_SOURCE_EDEFAULT;
        CompilationUnitImpl.prototype.tokens = null;
        CompilationUnitImpl.prototype.annotations = null;
        CompilationUnitImpl.prototype.repositoryAccess = null;
        CompilationUnitImpl.prototype.constructor = CompilationUnitImpl;
        CompilationUnitImpl.prototype.getParsedSource = function() {
            return this.parsedSource;
        };
        CompilationUnitImpl.prototype.setParsedSource = function(newParsedSource) {
            var oldParsedSource = this.parsedSource;
            this.parsedSource = newParsedSource;
        };
        CompilationUnitImpl.prototype.getTokens = function() {
            return this.getTokenList();
        };
        CompilationUnitImpl.prototype.tokenList = null;
        CompilationUnitImpl.prototype.getTokenList = function() {
            return this.tokenList;
        };
        CompilationUnitImpl.prototype.setTokenList = function(tokenListParam) {
            this.tokenList = tokenListParam;
        };
        /**
         * @returns {} ALL annotations in the whole AST - convenience e.g. for translation compliance checks
         */
        CompilationUnitImpl.prototype.getAnnotations = function() {
            /*eslint-disable no-eq-null*/
            if (this.annotations == null) {
                this.annotations = new EObjectContainmentEList(this);
            }
            return this.annotations;
        };
        CompilationUnitImpl.prototype.toString = function() {
            var result = new rnd.StringBuffer(StatementContainerImpl.prototype.toString.call(this));
            result.append(" (parsedSource: ");
            result.append(this.parsedSource);
            result.append(", tokens: ");
            result.append(this.tokens);
            result.append(")");
            return result.toString();
        };
        CompilationUnitImpl.prototype.setRepositoryAccess = function(prepositoryAccess) {
            this.repositoryAccess = prepositoryAccess;
        };
        CompilationUnitImpl.prototype.getRepositoryAccess = function() {
            return this.repositoryAccess;
        };
        return CompilationUnitImpl;
    }
);
