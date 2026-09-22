module.exports = function calcularChecksum(datos){
    let suma = 0;

    for(let i = 0; i< datos.length;i++){

        suma += datos.charCodeAt(i);
       
    }
    console.log(suma % 256)
    return suma % 256
        .toString(16)
        .toUpperCase()
        .padStart(2,'0')
}