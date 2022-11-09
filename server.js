const express = require('express');
const server = express();
 
server.all('/', (req, res) => {
  res.send(`Applications are up!`)
})
 
function keepAlive() {
  server.listen(8080, () => { console.log("Server is Ready!!" + Date.now()) });
}
 
module.exports = keepAlive;
