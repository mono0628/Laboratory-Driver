const axios = require('axios');
const config = require('../config');
const db = require('./database')

async function syncAnalyzer(device){

    try{
        
        console.log('DEVICE EN DRIVER', device);

        const response = await axios.get(`${config.middle.url}/middle/analyzer/${device}`);

        console.log(response.data);

        const stmt = db.prepare(`INSERT OR REPLACE INTO analyzers 
            (id_analyzer,name_analyzer,ip_address,port,connection_type,file_server,protocol,driver)
            VALUES (?,?,?,?,?,?,?,?)
        `)

        for (const item of response.data){

            stmt.run(
                item.code_analyzers,
                item.name_analyzers,
                item.ip_address,
                item.port,
                item.connection_type,
                item.file_server,
                item.protocol,
                item.driver
            )

        }   
       
        console.log('Guardado')
        return {
                success: true,
                count: response.data.length
            };
    }catch(err){

        console.log(err.message)

        return  {
                success: false,
                error: err.code || err.message
            };

    }

}

async function getAnalyzer(id){

    try{
    
        const stmt = db.prepare(`
            SELECT * FROM analyzers WHERE id_analyzer = ?
        `)

        const device = stmt.get(id)
       
        return device;

    }catch(err){

        console.log(err)
        return err;

    }

}

module.exports = {
    syncAnalyzer,
    getAnalyzer
}