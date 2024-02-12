import van from "vanjs-core"
const t = van.tags
const {div, span, button, textarea, input, a} = t
const d = div

export default File = (key, file) => {
    function onClick(event) {
        console.log(key, file)
    }
    return div(
        {class: "File", style: "width: 100%;"}, 
        //input({type: 'text', value: key, onclick: (event) => onClick(event)})
        //button({onclick: (event) => onClick(event)}, key)
        a({href: ''}, key)
    )
}