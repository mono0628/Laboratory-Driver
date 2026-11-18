
const net = require('net');
const { saveLog } = require('../utils/logs');
const { error } = require('console');

let server = null;

module.exports.start = function(device, onData){
    
    return new Promise((resolve, reject)=> {
        server = net.createServer(socket => {
            console.log('SOCKET',socket.remoteAddress)

            socket.on('data', data => {
                onData(data.toString(),socket)

                saveLog('ANALYZER: '+data.toString());
                //console.log(data.toString())
                //const ACK = Buffer.from([0x06]);
                //socket.write(ACK)

            })

            socket.on('end', () => {
                console.log('Cliente desconectado')
                saveLog('Client Disconected');
            })

            socket.on('error', err => {
                console.error('Error en socket:', err);
                saveLog('Error: '+err);
            })
        })

        server.listen(device.port, () => {
            console.log(`TCP Server listening on ${device.port}`)
            saveLog(`TCP Server listening on ${device.port}`);
            resolve();
        }).on('error',err => {
            console.error('Error al iniciar TCP server', err)
            saveLog('Error al iniciar TCP server', err);
            reject(err);
        })

    })
}

module.exports.stop = function(){
    
   if(server) {
        server.close(() => {
            console.log('Servidor TCP cerrado')
        })

        server = null;
   }
    
}