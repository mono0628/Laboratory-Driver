module.exports = function splitChar(txt, size){
    const partes = [];
    for(let i = 0; i < txt.length; i+= size){
        partes.push(txt.slice(i,i+size));
    }
    console.log('PARTES:',partes)
    return partes;
}