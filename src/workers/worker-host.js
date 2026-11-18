const { spawn } = require('child_process');
const path = require('path');
const { isSea } = require('node:sea');

const sea = isSea();

console.log('[WORKER-HOST] SEA:', sea);

const workers = [
    {
        file: 'order-sync.worker.js',
        role: 'order-sync'
    },
    /*{
        file: '../websocket/server.js',
        role: 'websocket'
    },*/
     {
        file: 'result.worker.js',
        role: 'result-sync'
    },
    // {
    //     file: 'queue.worker.js',
    //     role: 'queue'
    // }
];

const children = new Map();

function startWorker(worker) {

    let command;
    let args;

    if (sea) {

        command = process.execPath;

        args = [
            `--role=${worker.role}`
        ];

    } else {

        command = process.execPath;

        args = [
            path.join(__dirname, worker.file)
        ];
    }

    console.log(
        `[WORKER-HOST] Iniciando ${worker.role}`
    );

    console.log(
        `[WORKER-HOST] Ejecutando: ${command} ${args.join(' ')}`
    );

    const child = spawn(
        command,
        args,
        {
            stdio: [
                'inherit',
                'inherit',
                'inherit',
                'ipc'
            ]
        }
    );

    children.set(worker.role, child);

    child.on('message', message => {

        if (message.type === 'heartbeat') {

            process.send?.({
                type: 'heartbeat',
                worker: worker.role,
                timestamp: Date.now()
            });

        }

    });

    child.on('exit', (code, signal) => {

        console.error(
            `[WORKER-HOST] ${worker.role} terminó`,
            { code, signal }
        );

        children.delete(worker.role);

        setTimeout(() => {
            startWorker(worker);
        }, 3000);

    });

    child.on('error', error => {

        console.error(
            `[WORKER-HOST] Error ${worker.role}:`,
            error
        );

    });
}

for (const worker of workers) {
    startWorker(worker);
}