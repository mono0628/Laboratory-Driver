const axios = require('axios');
const config = require('../config');
const db = require('./database');
const manager = require('../websocket/manager');

async function syncOrders(device){

    try {
        //console.log(config);
        const response = await axios.get(`${config.middle.url}/middle/getOrders/${device}/PENDING`);

        //console.log(response);

        const stmt = db.prepare(`INSERT OR REPLACE INTO orders
        (
            num_order,identification,name_1,name_2,
            lastname_1,lastname_2,date_of_birth,
            service,gender
        )
            VALUES(?,?,?,?,?,?,?,?,?)    
        `);

        const stmt_test = db.prepare(`
                INSERT INTO order_test 
                (
                    num_order,test_code,sample,code_universal,code_analyzer,consecutive,status
                )
                VALUES(?,?,?,?,?,?,?)
                ON CONFLICT(num_order,test_code)
                DO UPDATE SET
                    code_universal = excluded.code_universal,
                    code_analyzer = excluded.code_analyzer,
                    consecutive = excluded.consecutive
            `);

        for (const element of response.data) {
            
            stmt.run(
                element.num_order,
                element.identification,
                element.name_1,
                element.name_2,
                element.lastname_1,
                element.lastname_2,
                element.date_of_birth,
                element.service,
                element.gender
            )

            let test = element.test

            for (const item of test){
                stmt_test.run(
                    item.num_order,
                    item.test_code,
                    item.sample,
                    item.code_universal,
                    item.code_analyzer,
                    1,
                    'PENDING'
                )
            }
            
            const mapTest = test.map(test => test.test_code);

                manager.send(
                   {
                    type:'STATE',
                    state:"SYNC",
                    order_test:mapTest,
                    order:element.num_order
                   }
                )
        }

        return {
            success:true,
        }

    } catch (error) {

        console.log(error.message)

        return {
            success:false,
            error: error.code || error.message
        }
    }

}

async function getOrder(order,sample,device) {
    
    console.log('STORAGE ORDER: ',order,sample,device);

    try {
        
        const stmt = db.prepare(`
            SELECT * FROM orders
            WHERE num_order = ?
            `)

        const data = stmt.get(order);

        const stmt_test = db.prepare(
          `
          SELECT * FROM order_test
          WHERE num_order = ? 
          AND sample = ?
          AND code_analyzer = ?
          AND status = 'PENDING'
          `  
        )

        const data_test = stmt_test.all([order,sample,device])
        console.log('TEST:',data_test)

        const resp = {
            ...data,
            test: data_test
        }

         const stmt_test_status = db.prepare(
          `
          UPDATE order_test SET status = 'PROGRAMMED'
          WHERE num_order = ? 
          AND sample = ?
          AND code_analyzer = ?
          `  
        )

        const data_test_status = stmt_test_status.run([order,sample,device])

        //console.log('ORDERS INFO:',resp);

        return resp;

    } catch (error) { 

        console.log(error);
        return error;
        
    }

}

module.exports = {
    syncOrders, getOrder
}