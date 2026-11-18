const config = require('../config');
const db = require('./database');

function createResult(data){

    try {
        //console.log('CREATE RESULT',data);
        const stmt = db.prepare(`
            INSERT OR REPLACE INTO results
            (id_order,id_test,unit,result,analyzer,sample,consecutive)
            VALUES(?,?,?,?,?,?,?)
            ON CONFLICT(id_order,id_test)
            DO UPDATE SET
                result = excluded.result
            `);

        stmt.run(
            data.order,
            data.code,
            data.unit,
            data.result,
            data.analyzer,
            data.sample,
            data.consecutive
        )

    } catch (error) {
        
        console.log(error)
    }

}

function syncResult(data){
    const manager = require('../websocket/manager');

   const send = manager.send(
            {
                type:'RESULT',
                state:"SYNC",
                results:data,
                //order_test:mapTest,
                //order:element.num_order
            }
        );

        if(!send){
            console.log('[RESULT] WebSocket no conectado, resultado pendiente de envió')
        }
}

function getPendingResult(limit=100){
    return db.prepare(
        `SELECT * FROM results WHERE status = 'PENDING'
        ORDER BY id LIMIT ?`
    ).all(limit);
}

function updateStateResult(data,state){

    try {
        const smtp = db.prepare(`UPDATE results 
            SET status = '${state}' 
            WHERE id_order = ? 
            AND id_test = ?
            AND status = 'PENDING'`)

        smtp.run(data?.order,data?.code);

    } catch (error) {
        console.log(error);
    }
   
}

module.exports = {
    createResult,
    syncResult,
    getPendingResult,
    updateStateResult
}