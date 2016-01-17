define(
    ["rndrt/rnd", "commonddl/astmodel/SourceRangeImpl"], //dependencies
    function (rnd, SourceRangeImpl) {
        function ForeignKeyImpl() {
            SourceRangeImpl.call(this);
        }

        ForeignKeyImpl.prototype = Object.create(SourceRangeImpl.prototype);
        ForeignKeyImpl.KEY_TOKEN_EDEFAULT = null;
        ForeignKeyImpl.prototype.keyToken = ForeignKeyImpl.KEY_TOKEN_EDEFAULT;
        ForeignKeyImpl.ALIAS_TOKEN_EDEFAULT = null;
        ForeignKeyImpl.prototype.aliasToken = ForeignKeyImpl.ALIAS_TOKEN_EDEFAULT;
        ForeignKeyImpl.prototype.keyPath = null;
        ForeignKeyImpl.prototype.constructor = ForeignKeyImpl;
        ForeignKeyImpl.prototype.getKeyToken = function () {
            return this.keyToken;
        };
        ForeignKeyImpl.prototype.setKeyToken = function (newKeyToken) {
            var oldKeyToken = this.keyToken;
            this.keyToken = newKeyToken;
        };
        ForeignKeyImpl.prototype.getAliasToken = function () {
            return this.aliasToken;
        };
        ForeignKeyImpl.prototype.setAliasToken = function (newAliasToken) {
            var oldAliasToken = this.aliasToken;
            this.aliasToken = newAliasToken;
        };
        ForeignKeyImpl.prototype.getKeyPath = function () {
            return this.keyPath;
        };
        ForeignKeyImpl.prototype.basicSetKeyPath = function (newKeyPath, msgs) {
            var oldKeyPath = this.keyPath;
            this.keyPath = newKeyPath;
            this.keyPath.setParent(this);
            return msgs;
        };
        ForeignKeyImpl.prototype.setKeyPath = function (newKeyPath) {
            if (newKeyPath !== this.keyPath) {
                this.basicSetKeyPath(newKeyPath);
            }
        };
        ForeignKeyImpl.prototype.getKeyName = function () {
            var path = this.getKeyPath();
            /*eslint-disable no-eq-null*/
            if (path != null) {
                var s = path.getPathString(false);
                return s;
            }
            var kt = this.getKeyToken();
            /*eslint-disable no-eq-null*/
            if (kt != null) {
                return kt.m_lexem;
            }
            return null;
        };
        ForeignKeyImpl.prototype.toString = function () {
            var result = new rnd.StringBuffer(SourceRangeImpl.prototype.toString.call(this));
            result.append(" (keyToken: ");
            result.append(this.keyToken);
            result.append(", aliasToken: ");
            result.append(this.aliasToken);
            result.append(")");
            return result.toString();
        };
        return ForeignKeyImpl;
    }
);