import van from "vanjs-core"
const t = van.tags
const {div, span, button, textarea, input, a} = t
const d = div

export default File = (key, file, index) => {
    function onClick(event) {
        console.log(key, file)
    }
    let filePreview = span({style: "margin-left: 10px;"}, file)

    return div(
        {class: "File", style: "width: fit-content;"}, 
        span({style: "margin-right: 10px;"}, index),
        a({href: '', style: "color: var(--link);"}, key), span(":"),
        filePreview
    )
}