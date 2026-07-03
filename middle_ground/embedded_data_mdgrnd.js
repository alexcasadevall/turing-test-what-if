Qualtrics.SurveyEngine.addOnload(function() {
    // 1. Ocultem el contenidor de forma immediata en carregar la pàgina
    var container = this.getQuestionContainer();
    if (container) {
        container.style.position = 'absolute';
        container.style.left = '-9999px';
        container.style.top = '-9999px';
        container.style.width = '1px';
        container.style.height = '1px';
        container.style.overflow = 'hidden';
        container.style.opacity = '0';
        container.style.pointerEvents = 'none';
    }
});

Qualtrics.SurveyEngine.addOnPageSubmit(function() {
    // 2. Això s'executa AUTOMÀTICAMENT just quan es clica el botó "Next"
    var tema = Qualtrics.SurveyEngine.getJSEmbeddedData("MG_Tema");
    var tractamentA = Qualtrics.SurveyEngine.getJSEmbeddedData("MG_Forum_A_Tractament");
    var tractamentB = Qualtrics.SurveyEngine.getJSEmbeddedData("MG_Forum_B_Tractament");
    var tractamentC = Qualtrics.SurveyEngine.getJSEmbeddedData("MG_Forum_C_Tractament");
    var urlA = Qualtrics.SurveyEngine.getJSEmbeddedData("MG_URL_A");
    var urlB = Qualtrics.SurveyEngine.getJSEmbeddedData("MG_URL_B");
    var urlC = Qualtrics.SurveyEngine.getJSEmbeddedData("MG_URL_C");

    if (!tema) return; // Si no hi ha dades, evitem escriure residus

    var valor =
        "MG_Tema=" + tema + "|" +
        "MG_Forum_A_Tractament=" + tractamentA + "|" +
        "MG_Forum_B_Tractament=" + tractamentB + "|" +
        "MG_Forum_C_Tractament=" + tractamentC + "|" +
        "MG_URL_A=" + urlA + "|" +
        "MG_URL_B=" + urlB + "|" +
        "MG_URL_C=" + urlC;

    // MODIFICACIÓ DE SEGURETAT: Selector universal adaptat al disseny Classic/Modern
    var input = this.getQuestionContainer().querySelector('textarea, input');
    if (input) {
        var proto = (input.tagName === 'TEXTAREA') ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
        var nativeInputValueSetter = Object.getOwnPropertyDescriptor(proto, 'value').set;
        nativeInputValueSetter.call(input, valor);
        
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
        console.log("MG TEXT ENTRY ESCRIT AL PAGE SUBMIT OK:", valor);
    } else {
        console.log("ERROR: no s'ha trobat el camp de text");
    }
});