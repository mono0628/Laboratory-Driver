
const net = require('net');

let server = null;

module.exports.start = function(device, onData){
    
    return new Promise((resolve, reject)=> {
        server = net.createServer(socket => {
            console.log('SOCKET',socket.remoteAddress)

            socket.on('data', data => {
                onData(data.toString(),socket)
                //console.log(data.toString())
                //const ACK = Buffer.from([0x06]);
                //socket.write(ACK)

            })

            socket.on('end', () => {
                console.log('Cliente desconectado')
            })

            socket.on('error', err => {
                console.error('Error en socket:', err);
            })
        })

        server.listen(device.port, () => {
            console.log(`TCP Server listening on ${device.port}`)
            resolve();
        }).on('error',err => {
            console.error('Error al iniciar TCP server', err)
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