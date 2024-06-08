import van from "vanjs-core"
const {textarea, div} = van.tags

export default function (props) {
    let inputTextarea = textarea({
        placeholder: " ",
        ...props
    })
    let visibleTextarea = textarea({
        placeholder: " ",
        ...props
    })
    let res = div(
        inputTextarea,
        visibleTextarea
    )
    function autoResize() {
        inputTextarea.style.height = "0px" //리셋해서 scrollHeight 다시 계산
        inputTextarea.style.height = (inputTextarea.scrollHeight) + "px"
        visibleTextarea.style.height = inputTextarea.style.height
        visibleTextarea.value = inputTextarea.value //높이 먼저 변한 후 value 변경됨
    }
    inputTextarea.style.transition = "none" //!!!!!!
    inputTextarea.addEventListener('input', autoResize, false);
    autoResize()
    return res
}
