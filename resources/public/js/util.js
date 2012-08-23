var lookup = function(key) {
	return function(data) {
		return data[key];
	};
};

function identity(arg) {
	return arg;
}

Array.prototype.sort_unique = function() {
	var sorted = this.sort();
	var unique;
	var i;

	unique = [sorted[0]];
	for (i = 1; i < sorted.length; i++) { // start loop at 1 as element 0 can never be a duplicate
		if (sorted[i-1] !== sorted[i]) {
			unique.push(sorted[i]);
		}
	}

	return unique;
};

Array.prototype.sort_by_key = function(key) {
	var sort_function = function(a,b) {
		return b[key] - a[key];
	};

	return this.sort(sort_function);
};

Number.prototype.toMoney = function(decimals, decimal_sep, thousands_sep) {
	var n = this,
		c = isNaN(decimals) ? 2 : Math.abs(decimals), //if decimal is zero we must take it, it means user does not want to show any decimal
		d = decimal_sep || '.', //if no decimal separator is passed we use the dot as default decimal separator (we MUST use a decimal separator)

		/*
		   according to [http://stackoverflow.com/questions/411352/how-best-to-determine-if-an-argument-is-not-sent-to-the-javascript-function]
		   the fastest way to check for not defined parameter is to use typeof value === 'undefined'
		   rather than doing value === undefined.
		   */
		t = (typeof thousands_sep === 'undefined') ? ',' : thousands_sep, //if you don't want to use a thousands separator you can pass empty string as thousands_sep value

		sign = (n < 0) ? "-" : "",

		//extracting the absolute value of the integer part of the number and converting to string
		i = String( parseInt(n = Math.abs(n).toFixed(c), 10) );

	j = ((j = i.length) > 3) ? j % 3 : 0;
	return sign + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
};

