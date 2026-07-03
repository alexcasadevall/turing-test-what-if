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
        var parts = [];

        for (var i = 1; i <= 6; i++) {
            var fileUrl = Qualtrics.SurveyEngine.getJSEmbeddedData("URL_Post_" + i);
            var categoria = Qualtrics.SurveyEngine.getJSEmbeddedData("Categoria_" + i);
            var tema = Qualtrics.SurveyEngine.getJSEmbeddedData("Tema_" + i);
            var mida = Qualtrics.SurveyEngine.getJSEmbeddedData("Mida_" + i);
            var id = Qualtrics.SurveyEngine.getJSEmbeddedData("ID_" + i);
            var noticia = Qualtrics.SurveyEngine.getJSEmbeddedData("Noticia_" + i);

            if (!fileUrl) continue;

            parts.push(
                "URL_Post_" + i + "=" + fileUrl + "|" +
                "Categoria_" + i + "=" + categoria + "|" +
                "Tema_" + i + "=" + tema + "|" +
                "Mida_" + i + "=" + mida + "|" +
                "ID_" + i + "=" + id + "|" +
                "Noticia_" + i + "=" + noticia
            );
        }

        if (parts.length === 0) {
            console.log("Avís: Dades de Turing encara no disponibles a la memòria de sessions.");
            return;
        }

        var valor = parts.join(';');

        var input = self.getQuestionContainer().querySelector('textarea');
        if (input) {
            var nativeInputValueSetter = Object.getOwnPropertyDescriptor(
                window.HTMLTextAreaElement.prototype, 'value'
            ).set;
            nativeInputValueSetter.call(input, valor);
    
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
            console.log("TEXT ENTRY ESCRIT OK:", valor);
        } else {
            console.log("ERROR: no s'ha trobat el camp textarea");
        }
    }, 1000);
});