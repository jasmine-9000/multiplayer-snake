const util = require('util');
const MODULE_NAME = 'UTIL0014';

const makeid2 = util.deprecate((length) => {
		var result = '';
		var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
		var charactersLength = characters.length;
		for(var i = 0; i < length; i++) {
			result += characters.charAt(Math.floor(Math.random() * charactersLength));
		}
		return result;
	},  
	'makeid2() is deprecated. Use makeid() instead.',
	MODULE_NAME
	);


function makeid(length) {
	var result = '';
	var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	var charactersLength = characters.length;
	for(var i = 0; i < length; i++) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength));
	}
	return result;
}

function beginSection(title="") {
	const consoleLength = process.stdout.columns;
	var firstLine = ''.padStart(consoleLength, '-');
	
	
	var secondLine = '';
	var msgLength = title.length;
	var lrLength = (consoleLength - 2 - msgLength) / 2;
	secondLine = ''.padStart(lrLength, ' ') + title + ''.padStart(lrLength, ' ');
	
	secondLine = '|' + secondLine + '|';

	console.log(firstLine);
	
	console.log(secondLine);
}

function endSection(footer="") {
	const consoleLength = process.stdout.columns;
	var firstLine = ''.padStart(consoleLength, '-');
	
	
	var secondLine = '';
	var msgLength = footer.length;
	var lrLength = (consoleLength - 2 - msgLength) / 2;
	secondLine = ''.padStart(lrLength, ' ') + footer + ''.padStart(lrLength, ' ');
	
	secondLine = '|' + secondLine + '|';
	
	
	console.log(secondLine);
	console.log(firstLine);
}

module.exports = {
	makeid,
	makeid2,
	beginSection,
	endSection,
}