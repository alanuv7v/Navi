import van from "vanjs-core"
const t = van.tags
const {div, span, button, textarea, input, a} = t
const d = div

export default function Folder (key, path, updateFileList, index) {
    function onClick(event) {
        updateFileList([...path, key])
    }
    return div(
        {class: "Folder"}, 
        span({style: "margin-right: 10px;"}, index),
        span({style: "margin-right: 10px;"}, key),
        span("["),
        a({
            href: '',
            onclick: (event) => {
                event.preventDefault()
                onClick(event)
            }
        }, "open"),
        span("]"),
    )
}
