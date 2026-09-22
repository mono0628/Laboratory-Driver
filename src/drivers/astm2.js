const { dateTodayString,dateToString } = require('../utils/dateTodayString')
//const { insertResults,getOrder } = require('../../controllers/middlewareController')
const { ENQ, STX, EOT, ETX, ETB ,CR, LF} = require('../utils/constants')
const calcularChecksum = require('../utils/checksum')
const splitChar = require('../utils/splitChar')

module.exports.start = async function(options = {}){

        const { orders,tests } = options
        console.log('astm2 driver bioflash',options)

        let frames = [];
        numFrame = 1;
        numSegmentoP = 1;
        numSegmentoO = 1;
        
        let H = {
                'recordType': numFrame+"H",
                'delimiter': options.delimiter+options.repetitionSep+options.union,
                'senderName': options.codeAnalyzer,
                'processing': 'P', //P producción
                'versionNumber': '1',
                'dateTime':dateTodayString()
                }

        let segH = `${STX}${H.recordType}|${H.delimiter}||||||||${H.senderName}||${H.processing}|${H.versionNumber}|${H.dateTime}${CR}`;
        let ckH = `${ETB}${calcularChecksum(segH)}${CR}`;
        frames.push(segH+ckH);

        numFrame++
       
        //orders.forEach((element, i) => {
        for (const order of orders) {
            console.log('ORDER:',order)
            let arrOrder = order.split(options.repetitionSep);    
            let orders = arrOrder[1].split('-')
            orderQ = orders[0]

            const data = {
                codeAnalyzer:options.codeAnalyzer,
                analyzer:options.analyzer,
                order:orderQ
            }

            const test = await getOrder(data)

            console.log('TEST',test)

            if(test.order.length > 0){

                const demographics = test.order[0];

                let P = {
                    'recordType': numFrame+'P',
                    'setID':numSegmentoP,
                    'history':demographics.identification,
                    'laboratory':demographics.identification,
                    'name':demographics.lastname_1+options.repetitionSep+demographics.name_1,
                    'birthdate':dateToString(demographics.date_of_birth),
                    'sex':demographics.gender,
                    'service':demographics.service || '' +options.repetitionSep 
                    }
                                
                let segP = `${P.recordType}|${P.setID}||${P.history}||${P.name}||${P.birthdate}|${P.sex}||||||||||||||||${P.service}||||||||||${CR}`;

                //let ckP = `${ETB}${calcularChecksum(segP)}${CR}`;
                //frames.push(segP+ckP);

                let programmingTest = ``
                let sample = ''
                test.tests.forEach((element,i) => {
                    programmingTest += `${options.repetitionSep}${options.repetitionSep}${options.repetitionSep}${element.codeAnalyzer}`
                    
                    if(i < test.tests.length - 1){
                        programmingTest += `${options.delimiter}`
                    }

                    sample = element.codSample

                    i=i+1;
                });

                let O = {
                        'recordType':'O',
                        'setID':numSegmentoO,
                        'order':demographics.num_order,
                        'test':programmingTest,
                        'priority':'', //(R)urgente (S)normal,
                        'date':dateTodayString(),
                        'sample':'' || sample,
                        'medical':'',//medico pendiente
                        'query':'Q',
                        'service':demographics.service || ''
                    }

                let segO = `${O.recordType}|${O.setID}|${O.order}||${O.test}|${O.priority}|${O.date}||||||||||${O.sample}|||||||||${O.query}||${O.service}|||||${CR}`;

                //let ckO = `${ETB}${calcularChecksum(segO)}${CR}`;

                let framesETB = segP+segO

                framesETB = splitChar(framesETB,247)
                
                for(frameETB of framesETB){
                    frames.push(STX+frameETB+ETB+(calcularChecksum(frameETB)+CR))
                }

                numSegmentoP++;
                numFrame++;

                if(numFrame===8){ //reset to zero
                    numFrame=0
                }
            }

        }

        let L = {
            'recordType':numFrame+'L',
            'setID':1,
            'termination':'N'
            }

        let segL = `${STX}${L.recordType}|${L.setID}|${L.termination}${CR}`
        let ckL = `${ETX}${calcularChecksum(segL)}${CR}`

        frames.push(segL+ckL);

        console.log('FRAMES EN ASTM:',frames)

        return frames;

    };

