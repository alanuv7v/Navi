import van from "vanjs-core"
const {textarea, div} = van.tags

export default class {

    constructor (props) {

        this.inputTextarea = textarea({
            class: "input",
            oninput: this.autoResize(),
            style: `transition: none; 
            position: absolute; 
            color: rgba(0,0,0,0); 
            overflow: hidden;
            caret-color: var(--light);`,
            placeholder: " ",
            spellcheck: false,
            ...props
        })

        this.visibleTextarea = textarea({
            class: "visible",
            style: `transition: none; 
            position: relative; 
            pointer-events: none; 
            background-color: transparent;
            overflow: hidden;
            caretColor: var(--light);`,
            placeholder: " ",
            spellcheck: false,
            ...props
        })

    }
    
    onAutoResize = null

    autoResize () {
        if (this.onAutoResize) this.onAutoResize()
        inputTextarea.style.height = "0px" //리셋해서 scrollHeight 다시 계산
        inputTextarea.style.height = (inputTextarea.scrollHeight) + "px"
        visibleTextarea.style.height = inputTextarea.style.height
        visibleTextarea.value = inputTextarea.value //높이 먼저 변한 후 value 변경됨
    }

    DOM = div(
        {
            class: "autoResize",
            style: "position: relative; height: fit-content;"
        },
        this.inputTextarea,
        this.visibleTextarea
    )

}
