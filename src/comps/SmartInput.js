import van from "vanjs-core"

const {div, input} = van.tags


export function resizeTextarea(inputTextarea, visibleTextarea, height) {
  inputTextarea.style.height = "0px" //리셋해서 scrollHeight 다시 계산
  inputTextarea.style.height = (inputTextarea.scrollHeight) + "px"
  visibleTextarea.style.height = inputTextarea.style.height
  visibleTextarea.value = inputTextarea.value //높이 먼저 변한 후 value 변경됨
}


export const MultilineTextarea = (inputTextarea, visibleTextarea) => {
    inputTextarea.classList.add('inputTextarea')
    visibleTextarea.classList.add('visibleTextarea')

    inputTextarea.spellcheck = false
    visibleTextarea.spellcheck = false

    resizeTextarea(inputTextarea, visibleTextarea)

    inputTextarea.addEventListener('input', () => {resizeTextarea(inputTextarea, visibleTextarea)})

    let main = div({class: "MultilineTextarea"},
        inputTextarea,
        visibleTextarea
    )

  return main
}