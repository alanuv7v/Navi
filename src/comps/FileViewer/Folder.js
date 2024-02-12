import van from "vanjs-core"
const t = van.tags
const {div, span, button, textarea, input, a} = t
const d = div

export default function Folder (key, path, updateFileList) {
    function onClick(event) {
        updateFileList([...path, key])
    }
    return div(
        {class: "Folder", style: "width: 100%;"}, 
        //input({type: 'text', value: key, onclick: (event) => onClick(event)})
        button({onclick: (event) => onClick(event)}, key)
    )
}
