//const { insertResults,getOrder } = require('../../controllers/middlewareController')
const { createResult } = require('../storage/results');
const { getOrder } = require('../storage/order');
//const { dateTodayString,dateToString } = require('../../utils/dateTodayString')
//const calcularChecksum  = require('../../utils/checksum')
const { ENQ, STX, EOT, ETX, ETB ,CR, LF,NAK,ACK} = require('../utils/constants')

let messageQueue = ''
let delimiter = '';
let repetitionSep = '';
let union = '';
let order = '';
let sample = '';
let consecutive = '';
let codeAnalyzer = '';

const id = process.env.DEVICE_ID || process.argv[2];

module.exports.start = async function(rawData,socket,driver,device){
    
    let segment = rawData //.split('\r')

        switch(true){

            case segment.indexOf(ENQ)>-1:
                console.log("Entro por ENQ|",segment)
                socket.write(ACK)
            break;

            case segment.indexOf(EOT)>-1:
                console.log("Entro por EOT|",segment)

            break;

            case segment.indexOf(ACK)>-1:
                console.log("Entro por ACK|",segment)


            break;

            case segment.indexOf(STX)>-1:
                //console.log("Entro por STX",segment)

                switch(true){
                    case segment.indexOf(ETX)>-1:

                        console.log('Entro con ETX')
                        const posLF = segment.indexOf(LF)
                        
                        if(posLF>0){
                            segment = segment.substring(0,posLF-4)
                        }
                        console.log('TRAMA COMPLETA',messageQueue)
                        const posSTXETX = segment.indexOf(STX)
            
                        segment = segment.substring(posSTXETX+2)
                        
                        messageQueue += segment;

                        handleASTM(messageQueue,driver,socket,device)

                        messageQueue='';

                        break;

                    case segment.indexOf(ETB)>-1:
                        //console.log('Entro con ETB',messageQueue)

                        const posLFe = segment.indexOf(LF)
                        
                        if(posLFe>0){
                            segment = segment.substring(0,posLFe-4)
                        }
                        
                        const posSTXETB = segment.indexOf(STX)
            
                        segment = segment.substring(posSTXETB+2)

                        messageQueue = messageQueue + segment;
                        break;
                }
                socket.write(ACK)
            break;

        }

    //})
}

async function handleASTM(message,driver,socket,device){

    //console.log('HANDLE:',message)

    const messages = message.split('\r')

    //messages.forEach(segment => {
    for (const segment of messages) {
        let line = segment.split('|');
        console.log('Corriendo trama',line)

        switch(line[0]){

            case 'H':
                console.log('entro por H')
                let delimiters = line[1]; //delimiter

                delimiter = delimiters[0];
                repetitionSep = delimiters[1];
                union = delimiters[2];

                console.log('DELIMITER',delimiter)
                console.log('REPETITION',repetitionSep)

                let arrDeviceName = line[4].split(repetitionSep);
                codeAnalyzer = arrDeviceName[0];

                console.log('Nombre device', arrDeviceName)

                break;

            case 'O':
                console.log('entro por O')

                let arrOrder = line[2].split(repetitionSep);    
                let orders = arrOrder[0].split('-')
                order = orders[0]
                
                if(orders[1]){
                    sample = orders[1]
                }

                if(orders[2]){
                    consecutive = orders[2]
                }

                break;

            case 'P':
                console.log('entro por P')

                let arrNames = line[5].split(repetitionSep),
                birhtday = line[7]

                break;

            case 'M':
                console.log('entro por M')
                break;

            case 'R':
                console.log('entro por R')

                let arrResult = line[2].split(repetitionSep),
                code = arrResult[3],
                name,
                assayStatus;

                if(arrResult[4]){
                    name = arrResult[4];
                }

                if(arrResult[6]){
                    assayStatus = arrResult[6];
                }
                
                result = line[3],
                unit = line[4];

                console.log('CODE',code)

                const payload = {
                    order,
                    result,
                    unit,
                    code,
                    name,
                    assayStatus,
                    codeUniversal:code,
                    analyzer:id,
                    sample,
                    consecutive
                }

                await handleResult(payload)
                break;

            case 'Q':
                console.log('Entro en hostquery')
                let arrOrderQuery = line[2].split(delimiter)

                console.log('ORDERS:',arrOrderQuery)
                
                await handleQuery(arrOrderQuery,driver,socket,device)    
        }
    }
     //})
}

async function handleResult(data){
        try {

            console.log('HANDLE RESULT', data);

            //if(data.assayStatus === 'F'){ //parametrizar este dato porque no funcionaria para otros drivers
                await createResult(data);
            //}

        }catch(err){
            console.log('Error insertando resultado:', err)
        }
}

async function handleQuery(arrOrderQuery, driver, socket, device){

    let frames = [];

        for (const orderQuery of arrOrderQuery) {

            if(orderQuery && typeof orderQuery === 'string'){

                const arrOrder = orderQuery.split(repetitionSep);
                        
                console.log(arrOrder);

                if(arrOrder.length > 1 && arrOrder[1]){

                    const arrOrderSample = arrOrder[1].split('-');

                    console.log(arrOrderSample[0],arrOrderSample[1],arrOrderSample[3]);

                    const order = await getOrder(arrOrderSample[0],arrOrderSample[1],device);

                    const data = {
                            delimiter:delimiter,
                            repetitionSep:repetitionSep,
                            union:union,
                            codeAnalyzer:codeAnalyzer,
                            analyzer:id,
                            order:arrOrderQuery,
                            orders:order
                        }

                        console.log('TEST EN HANDLE QUERY:',data);
            
                        frames = await driver.start(data);

                        console.log('FRAME:',frames);
                    }
            }
        }
            
        console.log('funciona para DxH');

        for(const frame of frames){

                socket.write(frame)

        }
}