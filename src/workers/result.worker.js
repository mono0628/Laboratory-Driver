
const config = require('../config');
const storage = require('../storage/results');
const manager = require('../websocket/manager');

const device = config.driver.id;
let running = false;

function connectWebSocket() {
    manager.connect('ws://192.168.1.30:5300');
}

async function syncResults() {

    connectWebSocket();
    
    if(running) return;

    running = true;

    try {
        const results = storage.getPendingResult(100);

        if(results.length === 0) return;

        console.log(`[RESULT WORKER] Resultados pendientes: ${results.length}`);

        for(const result of results){
            storage.syncResult({
                id:result.id,
                order: result.id_order,
                code: result.id_test,
                unit: result.unit,
                result: result.result,
                analyzer: result.analyzer,
                sample: result.sample,
                consecutive: result.consecutive,
                date:result.created_at
            })
        }
    } catch (error) {
         console.error('[RESULT WORKER]', error.message);
    } finally {
        running = false;
    }
}

//connectWebSocket();

setInterval(syncResults, 5000);

setInterval(() => {
    process.send?.({
        type: 'heartbeat',
        worker: 'result',
        timestamp: Date.now()
    });
}, 5000);

console.log('[RESULT WORKER] Driver:', device);

syncResults();
