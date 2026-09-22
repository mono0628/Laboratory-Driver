const db = require('../storage/database');
const storage = require('../storage/order');
const config = require('../config');
const manager = require('../websocket/manager');

let running = false;
const device = config.driver.id;

async function syncOrders() {

    manager.connect('ws://192.168.1.30:5300');

    if(running){
        return;
    }

    running = true;

    try {
        
          let order = await storage.syncOrders(device);

          if(order.success){
            console.log('SYNC ORDERS')
          }
          

    } catch (error) {
        
        console.error(
            '[ORDER SYNC]',
            error.message
        );
    } finally {

        running = false;
    }
}

setInterval(syncOrders,60000)

setInterval(() => {
    process.send?.({
        type:'heartbeat',
        worker:'order-sync',
        timestamp:Date.now()
    });
},5000)

syncOrders();