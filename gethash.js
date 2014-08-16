//
// get hash
//
var commandline = 'usage: node gethash.js val';
var argvlength = process.argv.length;
if (argvlength < 3) {
  console.log("ERROR: not enough argument.");
  console.log(commandline);
  return;
}

//
// getHash function
//
var crypto = require("crypto");
var secretKey = "inakit";
var getHash = function(target) {
  var sha = crypto.createHmac("sha512", secretKey);
  sha.update(target);
  return sha.digest("hex");
};

console.log(getHash(process.argv[2]));
