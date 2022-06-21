const http = require("http");

const {sleep} = require("./tool");

http.createServer(async (req,res) => {
  await sleep(3000);
  //console.log(req,"req");
  res.end("<p>Hello world</p>")
}).listen(process.env.PORT || 3000)

console.log(process.env.PORT,"PORT")
