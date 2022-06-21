// exports.sleep = ms => {
//     return new Promise(resolve => {
//          setTimeout(resolve, ms);
//     });
// }
// exports.hello = function(name, message){
// 	return `hi!${name},${message}`
// }

const sleep = ms => {
    return new Promise(resolve => {
         setTimeout(resolve, ms);
    });
}
const hello = function(name, message){
	return `hi!${name},${message}`
}
module.exports = {
	sleep,
	hello
}