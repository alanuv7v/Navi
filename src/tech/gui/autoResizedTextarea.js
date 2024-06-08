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
        {class: "autoResize"},
        inputTextarea,
        visibleTextarea
    )
    res.autoResize = () => {
        console.log("resize")
        inputTextarea.style.height = "0px" //리셋해서 scrollHeight 다시 계산
        inputTextarea.style.height = (inputTextarea.scrollHeight) + "px"
        visibleTextarea.style.height = inputTextarea.style.height
        visibleTextarea.value = inputTextarea.value //높이 먼저 변한 후 value 변경됨
    }
    inputTextarea.style.transition = "none" //!!!!!!
    inputTextarea.addEventListener('input', res.autoResize, false);    
    
    let observer = new MutationObserver(callback);
    observer.observe(res, {
        childList: true,
        attributes: true
    });
    window.ooooo = observer
    function callback(mutationList) {
        console.log(mutationList)
        mutationList.forEach((mutation) => {
            switch (mutation.type) {
            case "childList":
                switch (mutation.attributeName) {
                case "parentElement":
                    console.log('appended!!')
                    break;
                }
                break;
            }
        });
    }

    return res
}
