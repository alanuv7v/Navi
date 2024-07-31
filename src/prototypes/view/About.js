import van from "vanjs-core"
const {div, a, b, dialog, br} = van.tags

export default dialog({id: "AboutRoot",
    onclick: (event) => {
        if (event.target.nodeName === 'DIALOG') {
            event.target.close();
        }
    }}, 
    div({class: "title"}, "Root 木"),
    div(b("You are the context.")),
    div({innerHTML: `<b>Root</b> allows you to create and navigate a private network of data easily.
        you can view and save data which originates from a <b>root</b>, which can be <b>you</b>.
        Be a center of what you store. You are the context.
        for more details, visit <a href="https://github.com/alanuv7v/Root" target="blank">the github repo</a>.`})
)
