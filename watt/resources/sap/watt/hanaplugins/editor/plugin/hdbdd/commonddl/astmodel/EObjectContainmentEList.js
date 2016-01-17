define(
    ["rndrt/rnd"], //dependencies
    function (rnd) {
        var Utils = rnd.Utils;

        function EObjectContainmentEList(owner) {
            this.owner = owner;
        }

        EObjectContainmentEList.prototype = Object.create(Array.prototype);
        EObjectContainmentEList.prototype.constructor = EObjectContainmentEList;

        EObjectContainmentEList.prototype.push = function (obj) {
            if (Utils.arrayContains(this, obj)) {
                return;
            }

            Array.prototype.push.call(this, obj);
            if (obj.setContainer) {
                obj.setContainer(this.owner);
            }
        };

        EObjectContainmentEList.prototype.addAll = function (list) {
            for (var i = 0; i < list.length; i++) {
                var e = list[i];
                this.push(e);
            }
        };

        EObjectContainmentEList.prototype.isEmpty = function () {
            Utils.arrayIsEmpty(this);
        };

        return EObjectContainmentEList;
    }
);