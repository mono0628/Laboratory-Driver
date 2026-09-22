function dateTodayString () {
    let fecha = new Date()

    return (
        fecha.getFullYear().toString()+
        String(fecha.getMonth()+1).padStart(2,'0')+
        String(fecha.getDate()).padStart(2,'0')+
        String(fecha.getHours()).padStart(2,'0')+
        String(fecha.getMinutes()).padStart(2,'0')+
        String(fecha.getSeconds()).padStart(2,'0')
    )
}

function dateToString (date) {
    let fecha = new Date(date)

    return (
        fecha.getFullYear().toString()+
        String(fecha.getMonth()+1).padStart(2,'0')+
        String(fecha.getDate()).padStart(2,'0')
    )
    
}

module.exports = {dateTodayString, dateToString}