define(
    [
        "rndrt/rnd",
        "commonddl/TokenUtil",
        "commonddl/astmodel/EObjectImpl"
    ], //dependencies
    function (
        rnd,
        TokenUtil,
        EObjectImpl
        ) {
        var Token = rnd.Token;
        var StringBuffer = rnd.StringBuffer;
        function ViewColumnNameImpl() {
            EObjectImpl.call(this);
        }
        ViewColumnNameImpl.prototype = Object.create(EObjectImpl.prototype);
        ViewColumnNameImpl.NAME_TOKEN_EDEFAULT = null;
        ViewColumnNameImpl.prototype.nameToken = ViewColumnNameImpl.NAME_TOKEN_EDEFAULT;
        ViewColumnNameImpl.NAME_EDEFAULT = null;
        ViewColumnNameImpl.prototype.constructor = ViewColumnNameImpl;
        ViewColumnNameImpl.prototype.getNameToken = function() {
            return this.nameToken;
        };
        ViewColumnNameImpl.prototype.setNameToken = function(newNameToken) {
            var oldNameToken = this.nameToken;
            this.nameToken = newNameToken;
        };
        ViewColumnNameImpl.prototype.getName = function() {
            return TokenUtil.getTokenLexem(this.getNameToken());
        };
        ViewColumnNameImpl.prototype.toString = function() {
            var result = new rnd.StringBuffer(EObjectImpl.prototype.toString.call(this));
            result.append(" (nameToken: ");
            result.append(this.nameToken);
            result.append(")");
            return result.toString();
        };
        return ViewColumnNameImpl;
    }
);