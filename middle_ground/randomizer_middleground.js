Qualtrics.SurveyEngine.addOnload(function() {

    // 1. CONTROL DE REFRESCO: Si ja hi ha dades guardades al Qualtrics, no facis res
    let comprovacioMG = Qualtrics.SurveyEngine.getJSEmbeddedData("MG_Tema");
    if (comprovacioMG && comprovacioMG.trim() !== "") {
        console.log("El cervell MG ja havia fet l'assignació. Es manté la original.");
        return;
    }

    // 2. ESCUT D'IFRAME PROTOCOLO MÒBIL: Protegim l'accés securitzat en telèfons reals
    let parentMGBone = false;
    try {
        if (window.parent && window.parent !== window && window.parent.MG_BRAIN_DONE) {
            parentMGBone = true;
        }
    } catch (e) {
        console.log("Avís d'escut: Finestra pare inaccessible (normal en mòbils reals).");
    }

    if (parentMGBone) {
        console.log("Cervell MG detectat a la finestra pare. Copiant selecció i assegurant dades locals.");
        try {
            window.MG_FINAL = window.parent.MG_FINAL;

            // BLINDATGE EXTRA: Repoblem forçadament la memòria local per a aquesta segona finestra clonada
            Qualtrics.SurveyEngine.setJSEmbeddedData('MG_Tema', window.MG_FINAL.tema);
            Qualtrics.SurveyEngine.setJSEmbeddedData('MG_Forum_A_Tractament', window.MG_FINAL.tractaments[0]);
            Qualtrics.SurveyEngine.setJSEmbeddedData('MG_Forum_B_Tractament', window.MG_FINAL.tractaments[1]);
            Qualtrics.SurveyEngine.setJSEmbeddedData('MG_Forum_C_Tractament', window.MG_FINAL.tractaments[2]);
            Qualtrics.SurveyEngine.setJSEmbeddedData('MG_URL_A', window.MG_FINAL.urlA);
            Qualtrics.SurveyEngine.setJSEmbeddedData('MG_URL_B', window.MG_FINAL.urlB);
            Qualtrics.SurveyEngine.setJSEmbeddedData('MG_URL_C', window.MG_FINAL.urlC);
        } catch (err) {}
        return;
    }

    var temaEscollit = (Math.random() < 0.5) ? 'clima' : 'immigracio';

    Qualtrics.SurveyEngine.setJSEmbeddedData('MG_Tema', temaEscollit);

    var tractaments = ['20', '50', '80'];
    tractaments.sort(function() { return 0.5 - Math.random(); });

    Qualtrics.SurveyEngine.setJSEmbeddedData('MG_Forum_A_Tractament', tractaments[0]);
    Qualtrics.SurveyEngine.setJSEmbeddedData('MG_Forum_B_Tractament', tractaments[1]);
    Qualtrics.SurveyEngine.setJSEmbeddedData('MG_Forum_C_Tractament', tractaments[2]);

    var baseUrl = "https://alexcasadevall.github.io/turing-test-what-if/middle_ground/";

    Qualtrics.SurveyEngine.setJSEmbeddedData('MG_URL_A', baseUrl + temaEscollit + "/" + tractaments[0] + ".json");
    Qualtrics.SurveyEngine.setJSEmbeddedData('MG_URL_B', baseUrl + temaEscollit + "/" + tractaments[1] + ".json");
    Qualtrics.SurveyEngine.setJSEmbeddedData('MG_URL_C', baseUrl + temaEscollit + "/" + tractaments[2] + ".json");

    window.MG_FINAL = {
        tema: temaEscollit,
        tractaments: tractaments,
        urlA: baseUrl + temaEscollit + "/" + tractaments[0] + ".json",
        urlB: baseUrl + temaEscollit + "/" + tractaments[1] + ".json",
        urlC: baseUrl + temaEscollit + "/" + tractaments[2] + ".json"
    };

    try {
        if (window.parent && window.parent !== window) {
            window.parent.MG_FINAL = window.MG_FINAL;
            window.parent.MG_BRAIN_DONE = true;
        }
    } catch (err) {}

    console.log("MIDDLE GROUND BRAIN EXECUTAT UNIQUE:");
    console.log("Tema assignat:", temaEscollit);
    console.log("Ordre d'aparició:", tractaments);
});