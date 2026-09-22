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

module.exports = {
    createResult
}