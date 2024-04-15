import global from "./global"

export default Logs = {
    log (str) {
        console.log(str)
        console.trace()
        global.LogPreview.innerText = str
    }
}