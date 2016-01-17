define(
    [
        "rndrt/rnd",
        "commonddl/astmodel/EObjectImpl",
        "require",
        "commonddl/astmodel/EObjectContainmentEList"
    ], //dependencies
    function (rnd,
              EObjectImpl,
              require,
              EObjectContainmentEList) {
        var Token = rnd.Token;
        var StringBuffer = rnd.StringBuffer;

        function NamesImpl() {
            EObjectImpl.call(this);
        }

        NamesImpl.prototype = Object.create(EObjectImpl.prototype);
        NamesImpl.prototype.names = null;
        NamesImpl.prototype.viewColumnNames = null;
        NamesImpl.prototype.constructor = NamesImpl;
        NamesImpl.prototype.getNames = function () {
            /*eslint-disable no-eq-null*/
            if (this.names == null) {
                this.names = new EObjectContainmentEList(this);
            }
            return this.names;
        };
        NamesImpl.prototype.getViewColumnNames = function () {
            /*eslint-disable no-eq-null*/
            if (this.viewColumnNames == null) {
                this.viewColumnNames = new EObjectContainmentEList(this);
                /*eslint-disable no-eq-null*/
                if (this.names != null) {
                    for (var tkCount = 0; tkCount < this.names.length; tkCount++) {
                        var tk = this.names[tkCount];
                        var IAstFactory = require("commonddl/astmodel/IAstFactory");
                        var colnName = IAstFactory.eINSTANCE.createViewColumnName();
                        colnName.setNameToken(tk);
                        this.viewColumnNames.push(colnName);
                    }
                }
            }
            return this.viewColumnNames;
        };
        NamesImpl.prototype.add = function (name) {
            this.getNames().push(name);
        };
        NamesImpl.prototype.toString = function () {
        };
        return NamesImpl;
    }
);