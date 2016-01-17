define(
    ["commonddl/astmodel/SourceRangeImpl","rndrt/rnd"], //dependencies
    function (SourceRangeImpl,rnd) {
        function NamedDeclarationImpl() {
            SourceRangeImpl.call(this);
        }
        NamedDeclarationImpl.prototype = Object.create(SourceRangeImpl.prototype);
        NamedDeclarationImpl.NAME_TOKEN_EDEFAULT = null;
        NamedDeclarationImpl.prototype.nameToken = NamedDeclarationImpl.NAME_TOKEN_EDEFAULT;
        NamedDeclarationImpl.NAME_EDEFAULT = null;
        NamedDeclarationImpl.prototype.namePath = null;
        NamedDeclarationImpl.prototype.constructor = NamedDeclarationImpl;
        NamedDeclarationImpl.prototype.getNameToken = function() {
            return this.nameToken;
        };
        NamedDeclarationImpl.prototype.setNameToken = function(newNameToken) {
            var oldNameToken = this.nameToken;
            this.nameToken = newNameToken;
        };
        NamedDeclarationImpl.prototype.getName = function() {
            var path = this.getNamePath();
            /*eslint-disable no-eq-null*/
            if (path != null && path.getEntries() != null && path.getEntries().length > 0) {
                return path.getPathString(false);
            }
            var tk = this.getNameToken();
            /*eslint-disable no-eq-null*/
            return (tk != null) ? tk.m_lexem : "";
        };
        NamedDeclarationImpl.prototype.getNamePath = function() {
            return this.namePath;
        };
        NamedDeclarationImpl.prototype.basicSetNamePath = function(newNamePath,msgs) {
            var oldNamePath = this.namePath;
            this.namePath = newNamePath;
            return msgs;
        };
        NamedDeclarationImpl.prototype.setNamePath = function(newNamePath) {
            if (newNamePath !== this.namePath) {
                this.basicSetNamePath(newNamePath);
            }
        };
        NamedDeclarationImpl.prototype.toString = function() {
            var result = new rnd.StringBuffer(SourceRangeImpl.prototype.toString.call(this));
            result.append(" (nameToken: ");
            result.append(this.nameToken);
            result.append(")");
            return result.toString();
        };
        return NamedDeclarationImpl;
    }
);