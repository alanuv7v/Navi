export default function stringToWasm (encoded) {

    function asciiToBinary(str) {
        if (typeof atob === 'function') {
            // this works in the browser
            return atob(str)
        } else {
            // this works in node
            return new Buffer(str, 'base64').toString('binary');
        }
    }
      
    function decode(encoded) {
        let binaryString =  asciiToBinary(encoded);
        let bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes.buffer;
    }
    
    let module = WebAssembly.instantiate(decode(encoded), {});

    return module
      
}


