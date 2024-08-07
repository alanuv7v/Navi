import van from "vanjs-core"
const {div, a, b, dialog, br} = van.tags

const content = 
`<div class="oneLiner">: Network As Visual Interface</div>

Navigate your mind.
Connect with each other.
Alone is no fun.

<a href="https://github.com/alanuv7v/Navi" target="blank">Visit the github repo for details.</a>`

export default dialog({id: "About",
    onclick: (event) => {
        if (event.target.nodeName === 'DIALOG') {
            event.target.close();
        }
    }}, 
    div({class: "title"}, "Navi"),
    div({innerHTML: content})
)
