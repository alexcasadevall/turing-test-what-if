Qualtrics.SurveyEngine.addOnload(function() {

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

    var self = this;
    setTimeout(function() {
        if (!window.MG_FINAL) {
            console.log("ERROR: MG_FINAL no disponible");
            return;
        }

        var mg = window.MG_FINAL;
        var valor =
            "MG_Tema=" + mg.tema + "|" +
            "MG_Forum_1_Tractament=" + mg.tractaments[0] + "|" +
            "MG_Forum_2_Tractament=" + mg.tractaments[1] + "|" +
            "MG_Forum_3_Tractament=" + mg.tractaments[2] + "|" +
            "MG_URL_1=" + mg.url1 + "|" +
            "MG_URL_2=" + mg.url2 + "|" +
            "MG_URL_3=" + mg.url3;

        var input = self.getQuestionContainer().querySelector('textarea');
        if (input) {
            var nativeInputValueSetter = Object.getOwnPropertyDescriptor(
                window.HTMLTextAreaElement.prototype, 'value'
            ).set;
            nativeInputValueSetter.call(input, valor);
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
            console.log("MG TEXT ENTRY ESCRIT OK:", valor);
        } else {
            console.log("ERROR: no s'ha trobat el camp textarea");
        }
    }, 1000);
});