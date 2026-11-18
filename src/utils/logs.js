const fs = require('fs/promises');

async function saveLog(data){

    try {
        const date = new Date();
        const route = `./logs/${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}.txt`;

        await fs.mkdir('./logs',{recursive: true});

        await fs.appendFile(route, `${date.toISOString()} | ${data} \n`)

    } catch (error) {
        
        console.error('Error in log', error)
    }

}

module.exports = {
    saveLog
} 