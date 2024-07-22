import Logger from "./gui/Logger";

export default function () {

    window.onunhandledrejection = event => {
        Logger.log(`${event.reason.stack}`, "error unhandled");
        console.log(event)
    };
      
    window.onerror = function(message, source, lineNumber, colno, error) {
        Logger.log(`${error.stack}`, "error unhandled");
        console.log(message, source, lineNumber, colno, error)
    };

    window.addEventListener("error", function (errorEvent) {
        Logger.log(`${errorEvent.error.stack}`, "error unhandled");
        return false;
     })

}
