
const WebSocket = require('ws');
const { updateStateResult } = require('../storage/results');
let ws = null;

function connect(url) {

    if(ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)){
        return;
    }

    ws = new WebSocket(
        url
    );

    ws.on('open',()=>{
    console.log('WebSocket conectado al MDW');

        ws.send(JSON.stringify({
            type:'CONNECTION',
        }))
    })

    ws.on('message',async (message) => {

        try {
            const data = JSON.parse(message);

            console.log('Mensaje recibido MDW',data);

             if (data.event === 'ACK') {
                if (data.success) {
                    
                    await updateStateResult(data.data,'SYNC')
                    console.log('Actualizado en driver')

                }else if(data.success===false){

                    await updateStateResult(data.data,'NOTEXIST')

                }}
        } catch (error) {
            console.error('Error procesado mensaje', error);
        }
    })

    ws.on('close', () => {
        console.log('WebSocket desconectado');
        ws = null;
    });

    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });
}

function send(message) {

    //console.log('WS',ws)
    
    if (!ws || ws.readyState !== 1) {
        console.log('WebSocket no conectado');
        return false;
    }

    ws.send(JSON.stringify(message));

    return true;
}

module.exports = {
    connect,
    send
};