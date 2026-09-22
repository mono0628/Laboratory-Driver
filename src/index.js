const args = process.argv;

if (args.includes('--role=supervisor')) {
    require('./supervisor/supervisor');

} else if (args.includes('--role=worker')) {
    require('./workers/worker-host');

} else if (args.includes('--role=driver')) {
    require('./drivers/driver');

}else if (args.includes('--role=order-sync')) {
    require('./workers/order-sync.worker');

} else {

    require('./supervisor/supervisor');

    console.log('ARGV:', JSON.stringify(process.argv));
    console.log('EXEC:', process.execPath);
    console.log('SEA:', process.versions.sea);

    //process.exit(1);
}