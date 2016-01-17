var a = 5;
var b = 3;
var multiply = function (_a, _b) {
	return _a * _b;
};

multiply(a, b);

function fibonacci(n) {
	if (n < 2) {
		return 1;
	} else {
		return fibonacci(n - 2) + fibonacci(n - 1);
	}
}

function log(str) {
}


function add1(init) {
	var counter = init;
	var plusVar = function () {
		counter += 1;
	};
	plusVar();
	return counter;
}

function addNum() {
	var counter = 0;

	function plus(num) {
		counter += num;
		return true;
	}

	plus(2);
	return counter;
}

function distance(x1, y1, x2, y2) {
	var dx = x2 - x1;
	var dy = y2 - y1;
	var MyMath = {
		sqrt: function (a, b) {
			return a * b;
		}
	};
	return MyMath.sqrt(dx * dx + dy * dy);
}
