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
        if (!window.TURING_FINAL) {
            console.log("ERROR: TURING_FINAL no disponible");
            return;
        }

        var baseUrl = window.TURING_BASE_URL;
        var parts = [];

        window.TURING_FINAL.forEach(function(post, index) {
            var postNum = index + 1;
            var fileUrl = baseUrl + "/" + post.type + "/" + post.length + "/" + post.id + ".json";
            parts.push(
                "URL_Post_" + postNum + "=" + fileUrl + "|" +
                "Categoria_" + postNum + "=" + post.type + "|" +
                "Tema_" + postNum + "=" + post.topic + "|" +
                "Mida_" + postNum + "=" + post.length + "|" +
                "ID_" + postNum + "=" + post.id + "|" +
                "Noticia_" + postNum + "=" + post.news
            );
        });

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