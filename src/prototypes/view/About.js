import van from "vanjs-core"
const {div, a, b, dialog, br} = van.tags

const content = 
`<div class="title">Blur</div>
<a href="https://github.com/alanuv7v/Blur" target="blank">Visit the github repo for details.</a>
`

export default dialog({id: "About",
    onclick: (event) => {
        if (event.target.nodeName === 'DIALOG') {
            event.target.close();
        }
    }}, 
    div({innerHTML: content})
)
