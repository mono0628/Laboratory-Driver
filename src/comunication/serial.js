const serialPort = require('serialport');

module.exports.start = function(device,onData) {
    const port = new serialPort(device.port,{
        baudRate:device.baudRate,
        dataBits:8,
        stopBits:1,
        parity:'none'
    });

    port.on('data', onData);
}