import van from "vanjs-core"
const {textarea, div} = van.tags

export default function (props) {
    let inputTextarea = textarea({
        placeholder: " ",
        spellcheck: false,
        ...props
    })
    inputTextarea.classList.add("input")
    let visibleTextarea = textarea({
        class: "visible",
        placeholder: " ",
        spellcheck: false,
        ...props
    })
    visibleTextarea.classList.add("visible")
    let res = div(
        {class: "autoResize"},
        inputTextarea,
        visibleTextarea
    )
    res.onAutoResize = null
    res.autoResize = () => {
        if (res.onAutoResize) res.onAutoResize()
        inputTextarea.style.height = "0px" //리셋해서 scrollHeight 다시 계산
        inputTextarea.style.height = (inputTextarea.scrollHeight) + "px"
        visibleTextarea.style.height = inputTextarea.style.height
        visibleTextarea.value = inputTextarea.value //높이 먼저 변한 후 value 변경됨
    }

    inputTextarea.addEventListener('input', res.autoResize, false); 
    
    inputTextarea.style.transition = "none" //!!!!!!
    res.style.position = "relative"
    inputTextarea.style.position = "absolute"
    visibleTextarea.style.position = "relative"
    inputTextarea.style.color = "rgba(0,0,0,0)"
    visibleTextarea.style.pointerEvents = "none"
    visibleTextarea.style.backgroundColor = "transparent"

    inputTextarea.style.overflow = "hidden"
    visibleTextarea.style.overflow = "hidden"

    visibleTextarea.style.transition = "none"

    inputTextarea.style.caretColor = "var(--light)"

    return res
}
