module.exports.start = function(rawData){
    
    console.log('entra por protocol')
    const messages = rawData.split('\r')

    console.log("DATA INTERFAZ HL7| ", messages+".\n\n")

    messages.forEach(segment => {
        //console.log("HL7 segment:", segment)
    })
}

function handleHL7(message){

    console.log(message)

}