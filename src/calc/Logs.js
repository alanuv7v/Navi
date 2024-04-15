import global from "../global/global"

export function log (str) {
    console.log(str)
    console.trace()
    global.LogPreview.innerText = str
}
