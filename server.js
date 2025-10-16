const http = require('http');
const dotenv = require('dotenv');
dotenv.config({ path: './src/config.env' });
const createApp = require('./src/app');
const { attachWebSocket } = require('./src/ws');


const app = createApp();
const server = http.createServer(app);
attachWebSocket(server);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log('Server listening on', PORT));

/*
 TODO remove the  Accept/Reject options

 -> first one joined to Room X
 will not make any connections(Offer)

 -> Everyone joined after Joined Room X After the First one WILL
  recieve all Room X members (IDs)
  create connection for each member(ID) Except Me
  create Offer for each Member(ID)
  "AUTO" All offers Will be Accepted

-> for each Member in Room X recieved the Joiner's Offer
  will create him a special Connection & Answer

  So Web Service Must keep {ID -> ws} pairs to easily send Specific Messages "not Always broadcast"
*/
