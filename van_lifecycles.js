import { getDefaultResultOrder } from "dns";
import van from "vanjs-core"

function lifecycle(tag, props) {
    let elem = van.tags[tag](props)
    
    const observer = new MutationObserver(callback);

    const callback = (mutationList, observer) => {
        console.log(mutationList, observer);
    };
    observer.observe(elem, {
        childList: true,
        attributeOldValue: true,
    });

    //childList에서 삭제되거나 새로 append된 children 감지, 각각 onDestroy와 onMount를 발동시켜준다.
    deleted.onDestroy()
    added.onMount()
    
    return elem

}