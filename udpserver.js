/// UDP server 4    //////////////////////
/// techinfo@lora-wan.net

const version=210416.1;
const debug=1;
console.log('Version:',version,'Level of debug:',debug);

//////////

const SERVERPORT = 9090; //UDP port for our server
//const SERVERHOST='185.255.135.85'; // (abas.services)
const SERVERHOST='0.0.0.0'; // (abas.services)

const WSPORT=2876;


var dt=new Date();
///////////////////////////////////////////
const fs = require('fs');
const io = require('socket.io').listen(WSPORT); 
const dgram = require('dgram');
const server = dgram.createSocket('udp4');
const mysql = require('mysql2');
const openpgp = require('openpgp');
openpgp.config.compression = openpgp.enums.compression.zlib


function consolelog(msg){
  if (debug) {
    ts = new Date();
    var textlog=(ts.getTime()+'. ' + msg);
    console.log(textlog);
    if (debug>2) textlog=textlog+' <br>';
    if (debug>1) fs.appendFileSync("./server.log", textlog+'\n');
  }
}

//const connection = mysql.createConnection({
//    host: "localhost",
//    user: "user",               //  user
//    database: "abas",
//    password: "pass"            //  pass
//});

const connection = mysql.createConnection({
  host: "localhost",
  user: "zlodey",     //TODO:change user 
  charset: "utf8",
  database: "abas",
  password: "zeratul"  //secret!!!!
});

var pribors=[];
connection.connect(function(err){
  if (err) return console.error("Error MySQL connect: " + err.message);
  else {
    consolelog("+ connection with server MySQL enable");
    consolelog("- try import pribors");
    connection.execute("select * from pribors order by id;", (err, sqlresults, fields) => {
      if (!err) pribors=sqlresults;
      if (pribors) {
        consolelog(' import table pribors ok. objects:'+pribors.length);
        var n=0;
        pribors.forEach(obj => {console.log(++n,obj.id,obj.serial,obj.vpnip)})
      }
      else consolelog('import pribors failed');
    });
  }
});

function hexdump(msg){  //return string in
  var tmpstr='[.';
  for (var i=0;i<msg.length;i++) {
    if (msg[i]<16 ) tmpstr+='0'+(msg[i].toString(16)) + '.';
    else tmpstr+=(msg[i].toString(16)) + '.';
  }
  return tmpstr+']';
}

//////////////////////////!!! websocket !!! ////////////////////
io.sockets.on('connection', function (socket) {
  var handshake = socket.handshake;
  var ID =handshake.address.toString().substr(7,19)+':['+(socket.id).toString().substr(0, 20)+']';
  var time = (new Date).toLocaleTimeString();
  consolelog('< new connection ID='+ID)
  // send to client message about connecectin and her WS ID
  socket.json.send({'event': 'connected', 'name': ID, 'time': time});                                                                           

////////PGP generate ne keys open & public /////////////////////
  socket.on('newpgpkey',(data)=> {
    consolelog('<  req for generate new key from '+ID)
    options={
      userIds: [{ 
        name: 'test', 
        email: 'test@example.com' 
      }],
      numBits: 2048,
      passphrase: 'secretut'
    }
    if (data) options=data;
    console.log(options);
    openpgp.generateKey(options).then(key => {socket.emit("newpgpkey",key);});
  });
///////////////////////////////////////////////////
}) //end of socket.on

//////////////////////////!!!  udp  !!!/////////////////////////
connection.connect(function(err){
    if (err) return consolelog("! Error: " + err.message);
    else consolelog("+ Conected to MySQL server");
});


///////////////////////server function
server.on('error', function (err){
  consolelog('! server error: '+err.stack);
  server.close(function(){console.log('! !!! server UDP down!!!!!!!!!!!!');});
});

server.on('listening', function () {
  lastcmd=0;
  var address = server.address();
  consolelog('* Start UDP Server listening on ' + address.address + ":" + address.port)
});

server.on('message', function (message, remote) {
  consolelog('< recive message');
  console.log('FROM',remote);
  console.log('rcv.msg:',message);

//раскрываем свои закрытым ключем 
//понимаем какой айдишник по отправителю
//находим его открытый ключь отправителя
//открываем его ключем
//получаем что-то вроде \0x7e\.\.\.\.\.\0x7f

  var id=pribors.filter(obj => obj.vpnip==remote.address)[0].id;

  var msg=message;
  validcode=0;
  if (msg[0]==0x7e && msg[msg.length-1]==0x7f ) validcode=1;
  if (!id) validcode=-1
 
  if (validcode>0) {
dt=new Date();
    var cmd=message[1]
    if (cmd==2) dooropen(id);
    else if (cmd==3) doorclose(id);
    else if (cmd==0) bobberon(id);
    else if (cmd==1) bobberoff(id);
//    else if (cmd==77) autoapdate(id);
    else if (cmd==127) everyday(id,message);
    else validcode=0;
  }
  

//TODO validation incoming message end create outgoing message
// after validation:
// var cmd=
// var id=
// validcode
//

  var packetResponse=new Buffer.from('it`s not for you'); //16 Byte
  packetResponse[0]=0x7e;
  packetResponse[15]=0x7f;
  if (validcode){
    packetResponse[1]=0; // signal oK
    packetResponse[2]=0; // signal oK
    packetResponse[3]=0; // signal oK
  } 
  //TODO uncript & test of original
  server.send(packetResponse, 0, packetResponse.length, remote.port, remote.address, function(err, bytes) {
    if (err) throw err;
    consolelog('> snt UDP server message response to ' + 
      remote.address + ':' + 
      remote.port +' [' + 
      hexdump(packetResponse) + ']');
    consolelog('____________');
  });
});//on.message

/*
*/
  
function dooropen(id){
  consolelog(" "+id+" dooropen");
dtstr=dt.toString.
  sqlq="insert into doorstatus (prid,changestatu) values('"+id+"',1);"
  console.log(' #',sqlq);
  connection.execute(sqlq, function(err, sqlresults, fields) {
    if (err) console.log(err.message);
  });
}
function doorclose(id){
  console.log(" "+id+" doorclose");
  sqlq="insert into doorstatus (prid,changestatu) values('"+id+"',0;"
  consolelog(' #',sqlq);
  connection.execute(sqlq, function(err, sqlresults, fields) {
    if (err) console.log(err.message);
  });

}

function bobberon(id){
  consolelog(" "+id+" bobber ON");
  sqlq="insert into bobber (prid,changestatu) values('"+id+"',1);"
  console.log(' #',sqlq);
  connection.execute(sqlq, function(err, sqlresults, fields) {
    if (err) console.log(err.message);
  });

}
function bobberoff(id){
  consolelog(" "+id+" bobber OFF");
  sqlq="insert into bobber (prid,changestatu) values('"+id+"',0);"
  console.log(' #',sqlq);
  connection.execute(sqlq, function(err, sqlresults, fields) {
    if (err) console.log(err.message);
  });
}

//TODO parcing data & insert into tables
function everyday(id,mess){
  consolelog(" "+id+" bobber OFF");
  sqlq="insert into bobber (prid,changestatu) values('"+id+"',0);"
  console.log(' #',sqlq);
  connection.execute(sqlq, function(err, sqlresults, fields) {
    if (err) console.log(err.message);
  });
};



// main: //////////////////////////////////////////
server.bind(SERVERPORT, SERVERHOST, function(){});
