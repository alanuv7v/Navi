export default function (target, operation, catchExeption) {
    function apply (target) {
        return operation(target)
    }
    function applyLoop (target, path="") {
        
        if (!(target && typeof target === "object" && Object.values(target))) return
        console.log(target, path)
        
        if (
            !catchExeption || !(catchExeption(path))
        ) apply(target)
        
        Object.entries(target).forEach(
            ([k, v]) => applyLoop(v, path + "/" + k)
        )
        
    }

    applyLoop(target)
    
    return target
}