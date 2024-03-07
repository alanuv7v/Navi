import van from "vanjs-core"
const {div, span, button, textarea, input, a, img} = van.tags

export default function (target, completions) {

    let original = Array.from(target.parentNode.children).find((c) => {return c.autoCompleteTarget === target})
    if (original) original.remove()

    let list = div({class: "autoCompletion"})
    list.autoCompleteTarget = target
    list.style.position = "absolute"
    list.style.width = target.offsetWidth + "px"
    list.style.top = target.offsetTop + target.offsetHeight + "px"
    list.style.left = target.offsetLeft + "px"

    for (let doc of completions) {
        let str = doc.name.slice(0, doc.name.lastIndexOf("."))
        let item = button(
            {class: "autoCompletionItem",
            onclick: () => {target.value = str} ,
            onkeydown: (event) => {
                switch (event.key) {
                    case "ArrowUp":
                        event.target.previousSibling.focus()
                        break
                    case "ArrowDown":
                        event.target.nextSibling.focus()
                        break
                }
            }
            },
            str
        )
        list.append(item)
    }

    target.parentNode.append(list)

    let keydown = (event) => {
        if (event.key === "Tab") {
            event.preventDefault()
            list.firstChild.focus()
        }
    }
    if (target.prevKeydownEventListener) target.removeEventListener("keydown", target.prevKeydownEventListener) 
    target.addEventListener("keydown", keydown)
    target.prevKeydownEventListener = keydown


}