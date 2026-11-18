const { dateTodayString,dateToString } = require('../utils/dateTodayString')
const { ENQ, STX, EOT, ETX,CR, LF} = require('../utils/constants')
const calcularChecksum  = require('../utils/checksum')

// module.exports = function astm2(options = {}){
 module.exports.start = function(options = {}){

        const { data, orders } = options
        console.log('astm1 driver',options)

        let frames = [];
        let numSegment = 1;

        frames.push(ENQ)
        
        let H = {
                'recordType': numSegment+"H",
                'delimiter': options.delimiter+options.repetitionSep+options.union,
                'senderName': options.codeAnalyzer,
                'processing': 'P', //P producción
                'versionNumber': '1',
                'dateTime':dateTodayString()
                }

        let segH = `${STX}${H.recordType}|${H.delimiter}||||||||${H.senderName}||${H.processing}|${H.versionNumber}|${H.dateTime}${CR}`;
        let ckH = `${ETX}${calcularChecksum(segH)}${CR}`;
        frames.push(segH+ckH);
        numSegment++

        //orders.forEach((element, i) => {
        const element = orders;
        const i =+ 1;

            let P = {
                'recordType': numSegment+'P',
                'setID':i,
                'history':element.lastname_1,
                'laboratory':element.identification,
                'name':element.lastname_1+options.repetitionSep+element.name_1,
                'birthdate':dateToString(element.date_of_birth),
                'sex':element.gender,
                'doctor':'',
                'location':element.service
                }
                            
            let segP = `${STX}${P.recordType}|${P.setID}|${P.history}|${P.laboratory}||${P.name}||${P.birthdate}|${P.sex}|||||${P.doctor}|||||||||||${P.location}||||||||||${CR}`;
            let ckP = `${ETX}${calcularChecksum(segP)}${CR}`;
            frames.push(segP+ckP);
            numSegment++;

        const arrTest = element.test

        let test = [];
        arrTest.forEach(e => {
            console.log('ITERA',e.code_universal)
            test.push(`${options.repetitionSep}${options.repetitionSep}${options.repetitionSep}${e.code_universal}${options.delimiter}`) //el delimiter final no va! 12-09-2026
        });

            let O = {
                'recordType':numSegment+'O',
                'setID':i,
                'order':element.num_order,
                'codAnalyzer':test.join('') || '!!!CD',
                'priority':'R', //(R)urgente (S)normal
                'actionCode':'Q',
                'reportTypes':'F',
                'sample':'Whole blood' || element.codSample
            }

                    let segO = `${STX}${O.recordType}|${O.setID}|${O.order}||${O.codAnalyzer}|${O.priority}||||||N||||||||||||||${O.reportTypes}|||||||${CR}`;
                    let ckO = `${ETX}${calcularChecksum(segO)}${CR}`;
                    frames.push(segO+ckO);
                    numSegment++;

            let L = {
                'recordType':numSegment+'L',
                'setID':i,
                'termination':'N'
            }

                    let segL = `${STX}${L.recordType}|${L.setID}|${L.termination}${CR}`
                    let ckL = `${ETX}${calcularChecksum(segL)}${CR}`
                    frames.push(segL+ckL);

                    i+1;
        //});

        frames.push(EOT)

        return frames;

};

