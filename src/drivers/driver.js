const config = require('../config')
const db = require('../storage/database');
const { syncAnalyzer, getAnalyzer } = require('../storage/analyzer');
const manager = require('../websocket/manager')

console.log('node.js', config.driver.id);
console.log(db)

setInterval(() => {

    process.send?.({
        type: 'heartbeat',
        worker: 'driver'
    });

}, 5000);

async function start() {

    console.log('DEVICE_ID',config.driver.id)
    console.log('ARGM',process.argv[2])

    const id = config.driver.id;

    if (!id) {
        throw new Error('No se ha configurado DEVICE_ID');
    }

    let device = await getAnalyzer(id);
    //let order = await getOrder();

    //console.log('ORDERS',order);

    if(!device){ 
        //console.error('Device no encontrado')
        console.error(
            `[FATAL] No se encontró configuración local para el analizador: ${id}`
        );

        const syncResult = await syncAnalyzer(id);

        if (!syncResult || syncResult.success === false) {
            throw new Error(
                `No existe configuración local para ${id} y no fue posible sincronizar con Master`
            );
        }

        device = await getAnalyzer(id);

        if (!device) {
            throw new Error(
                `El analizador ${id} no existe en la configuración del Master`
            );
        }
    }

    console.log('Resultado de la consulta:', device);

    //console.log('INFO DEVICE',device)

    const transport = require(`../comunication/${device.connection_type}.js`)
    const protocol = require(`../protocols/${device.protocol}.js`)
    const driver = require(`./${device.driver}.js`)

    await transport.start(device, (rawData,socket) => {

          protocol.start(rawData,socket,driver,device.id_analyzer)

    })
}

start().catch(err => {

    console.error(
        '[FATAL] No fue posible iniciar el Driver:',
        err.message
    );

    process.exitCode = 1;
});

/*setTimeout(() => {
    console.log('[TEST] Congelando Driver durante 30 segundos...');

    const inicio = Date.now();

    while (Date.now() - inicio < 30000) {
        // Bloquea deliberadamente el event loop
    }

    console.log('[TEST] Driver desbloqueado');
}, 30000);*/


