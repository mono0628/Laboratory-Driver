const { spawn } = require('child_process');
const path = require('path');
const { isSea } = require('node:sea');

const sea = isSea();

console.log('[SUPERVISOR] SEA:', sea);
console.log('[SUPERVISOR] PID:', process.pid);
console.log('[SUPERVISOR] ARGV:', JSON.stringify(process.argv));

let driverProcess = null;
let workerProcess = null;

function startProcess(role) {

    let command;
    let args;

    if (sea) {

        // PRODUCCIÓN: ejecutable SEA
        command = process.execPath;

        args = [
            `--role=${role}`
        ];

    } else {

        // DESARROLLO: Node + index.js
        command = process.execPath;

        args = [
            path.join(__dirname, '../index.js'),
            `--role=${role}`
        ];

    }

    console.log(
        `[SUPERVISOR] Iniciando ${role}`
    );

    console.log(
        `[SUPERVISOR] command: ${command}`
    );

    console.log(
        `[SUPERVISOR] args: ${JSON.stringify(args)}`
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

    child.on('exit', (code, signal) => {

        console.error(
            `[SUPERVISOR] ${role} terminó`,
            {
                code,
                signal
            }
        );

    });

    child.on('error', error => {

        console.error(
            `[SUPERVISOR] Error ${role}:`,
            error
        );

    });

    return child;
}

driverProcess = startProcess('driver');

workerProcess = startProcess('worker');