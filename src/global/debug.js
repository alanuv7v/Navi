export default class debug {
    log (str) {
        console.log(str)
        console.trace()
        global.LogPreview.innerText = str
    }   
}