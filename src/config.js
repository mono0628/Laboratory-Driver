//require('dotenv').config();
const path = require('path');
const dotenv = require('dotenv');

//const isSea = typeof process.versions.sea !== 'undefined';
const { isSea } = require('node:sea');
const sea = isSea();

const envPath = sea
    ? path.join(path.dirname(process.execPath), '.env')
    : path.join(__dirname, '../.env');

dotenv.config({
    path: envPath
});

const config = {
    driver: {
        id:process.env.DRIVER_ID,
        name: process.env.DRIVER_NAME || 'XN1000 DRIVER'
    },

    analyzer : {
        host: process.env.ANALYZER_HOST || '127.0.0.1',
        port: Number(process.env.ANALYZER_PORT || 5001)
    },

    mdw: {
        url: process.env.MDW_URL || 'http://localhost:5200'
    },

    middle: {
        url: process.env.MIDDLE_URL || 'http://localhost:5300'
    },

    queue: {
        interval: Number(process.env.QUEUE_INTERNAL || 3000),
        concurrency: Number(process.env.QUEUE_CONCURRENCY || 5)
    }
};

module.exports = config;

