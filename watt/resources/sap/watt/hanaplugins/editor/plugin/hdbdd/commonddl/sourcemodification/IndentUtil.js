/*eslint-disable quotes*/
define(["rndrt/rnd"],
    function(rnd) {

        function IndentUtil() {
        }

        IndentUtil.getLineIndention = function(source,offset) {
            var i = offset;
            /*eslint-disable no-constant-condition*/
            while (true) {
                var c = source.charAt(i);
                if (c === '\r' || c === '\n') {
                    i++;
                    break;
                }
                i--;
                if (i <= 0) {
                    break;
                }
            }
            var diff = offset - i;
            var res = new rnd.StringBuffer();
            for (var i1 = 0;i1 < diff;i1++) {
                res.append(" ");
            }
            return res.toString();
        };

        return IndentUtil;
    }
);