import van from "vanjs-core"
const t = van.tags
const {div, span, button, textarea, input, a} = t
const d = div

export default File = (key, file, index) => {
    function onClick(event) {
        console.log(key, file)
    }
    let filePreview = input({type: "text", style: "margin-left: 10px;", value: file})

    return div(
        {class: "FileSystemItem File"}, 
        span({class: "hoverIndicator"}),
        span({style: "margin-right: 0.5em;"}, "1.1" /* index */),
        a({href: '', style: "color: var(--link);"}, key), span(":"),
        filePreview
    )
}