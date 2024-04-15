import global from "./global"

export function log (str) {
    console.log(str)
    console.trace()
    global.LogPreview.innerText = str
}
