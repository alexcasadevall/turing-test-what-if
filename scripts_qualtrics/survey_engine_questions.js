Qualtrics.SurveyEngine.addOnload(function() {

    var overlay = document.createElement('div');
    overlay.id = 'disclaimer-overlay';
    overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(15,23,42,0.75);z-index:99999;display:flex;align-items:center;justify-content:center;';
    overlay.innerHTML =
        '<div style="background:white;border-radius:12px;padding:32px;max-width:480px;width:90%;box-shadow:0 20px 60px rgba(0,0,0,0.3);text-align:center;font-family:Inter,sans-serif;">' +
            '<div style="font-size:18px;font-weight:700;color:#1e293b;margin-bottom:16px;">Antes de empezar</div>' +
            '<div style="font-size:15px;color:#475569;line-height:1.6;margin-bottom:24px;">Lee atentamente las siguientes conversaciones y responde a las preguntas. Ten en cuenta que no hace falta leer la noticia a menos que necesites contexto.</div>' +
            '<button id="disclaimer-ok-btn" style="background:#6366f1;color:white;border:none;padding:10px 32px;border-radius:8px;font-size:15px;font-weight:600;cursor:pointer;">Entendido</button>' +
        '</div>';
    document.body.appendChild(overlay);

    var okBtn = document.getElementById('disclaimer-ok-btn');
    okBtn.disabled = true;
    okBtn.style.opacity = '0.5';
    okBtn.style.cursor = 'not-allowed';

    setTimeout(function() {
        okBtn.disabled = false;
        okBtn.style.opacity = '1';
        okBtn.style.cursor = 'pointer';
    }, 3000);

    okBtn.addEventListener('click', function() {
        if (okBtn.disabled) return;
        overlay.remove();
    });
	
    var scrollDone = false;

    // --- 1. Funció per obtenir el document correcte (iframe o principal) ---
    function getIframeDoc() {
        var iframe = document.querySelector('iframe#preview-view') ||
                     window.parent.document.querySelector('iframe#preview-view');
        if (iframe && iframe.contentDocument) return iframe.contentDocument;
        if (iframe && iframe.contentWindow) return iframe.contentWindow.document;
        return null;
    }

    function getNextButton() {
        // Prova primer al document actual
        var btn = document.getElementById('next-button') ||
                  document.querySelector('[aria-label="Next page"]') ||
                  document.querySelector('.navigation-button');
        if (btn) return btn;

        // Si no, busca dins l'iframe
        var iDoc = getIframeDoc();
        if (iDoc) {
            return iDoc.getElementById('next-button') ||
                   iDoc.querySelector('[aria-label="Next page"]') ||
                   iDoc.querySelector('.navigation-button');
        }
        return null;
    }

    // --- 2. Bloqueig del botó ---
    function bloquejarBoto() {
        var btn = getNextButton();
        if (btn) {
            btn.disabled = true;
            btn.setAttribute('disabled', 'disabled');
            btn.style.opacity = '0.4';
            btn.style.cursor = 'not-allowed';
            btn.style.pointerEvents = 'none';
        }

        // Afegim missatge visible si no existeix ja
        if (!document.getElementById('scroll-warning')) {
            var msg = document.createElement('div');
            msg.id = 'scroll-warning';
            msg.innerText = '⚠️ Si no puedes continuar, asegúrate de haber leído la conversación hasta el final.';
            msg.style.cssText = 'font-size:13px;color:#b45309;background:#fef9c3;border:1px solid #fde68a;border-radius:6px;padding:8px 12px;margin-bottom:8px;text-align:center;font-family:Inter,sans-serif;';

            var btn = getNextButton();
            if (btn && btn.parentNode) {
                btn.parentNode.insertBefore(msg, btn);
            }
        }
    }

    function desbloquejarBoto() {
        if (scrollDone) return;
        scrollDone = true;
        clearInterval(reblockInterval);

        // Eliminem el missatge
        var msg = document.getElementById('scroll-warning');
        if (msg) msg.parentNode.removeChild(msg);

        var btn = getNextButton();
        if (btn) {
            btn.disabled = false;
            btn.removeAttribute('disabled');
            btn.style.opacity = '';
            btn.style.cursor = '';
            btn.style.pointerEvents = '';
        }
    }

    // Re-bloqueig continu fins que l'usuari faci scroll (React re-renderitza el botó)
    var reblockInterval = setInterval(function() {
        if (!scrollDone) bloquejarBoto();
    }, 300);

    bloquejarBoto();

    // --- 3. Càrrega del JSON ---
    var numBloc = 1;
    var jsonUrl = Qualtrics.SurveyEngine.getJSEmbeddedData('URL_Post_' + numBloc);

    if (!jsonUrl) {
        document.getElementById('reddit-messages').innerHTML = "<p style='color:red;'>Error: No se ha recibido ninguna ruta de JSON.</p>";
        return;
    }

    var COLORS = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#6366f1'];

    fetch(jsonUrl)
        .then(function(response) {
            if (!response.ok) throw new Error("No se ha encontrado el archivo: " + jsonUrl);
            return response.json();
        })
        .then(function(data) {
            if (data.post_original) {
                document.getElementById('news-agency').innerText = data.post_original.agency || '';
                document.getElementById('news-title').innerText = data.post_original.title || '';
                document.getElementById('news-body').innerText = data.post_original.body || '';
                var postTime = new Date(data.post_original.timestamp * 1000).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
                document.getElementById('news-time').innerText = postTime;
            }

            document.getElementById('p-count').innerText = (data.num_participants || 0) + ' participants';

            var list = document.getElementById('reddit-messages');
            list.innerHTML = '';

            var userColors = {};
            var cIdx = 0;

            data.messages.forEach(function(m) {
                if (!userColors[m.sender]) {
                    userColors[m.sender] = COLORS[cIdx % COLORS.length];
                    cIdx++;
                }
                var col = userColors[m.sender];
                var replyCol = m.reply_to ? (userColors[m.reply_to] || '#94a3b8') : null;

                var card = document.createElement('div');
                card.style.cssText = 'background:white;border:1px solid #e2e8f0;border-left:4px solid ' + col + ';border-radius:12px;padding:16px;margin-bottom:10px;font-family:Inter,sans-serif;';

                var headerHtml = '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">' +
                    '<div style="display:flex;align-items:center;gap:10px;">' +
                    '<div style="width:36px;height:36px;border-radius:50%;background:' + col + ';color:white;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700;flex-shrink:0;">' + m.sender[0].toUpperCase() + '</div>' +
                    '<span style="font-size:15px;font-weight:600;color:' + col + ';">' + m.sender + '</span>' +
                    '</div>' +
                    '<span style="font-size:11px;color:#94a3b8;">' + new Date(m.timestamp * 1000).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) + '</span>' +
                    '</div>';

                var quoteHtml = '';
                if (m.reply_to && m.reply_text) {
                    var truncated = m.reply_text.length > 80 ? m.reply_text.substring(0, 80) + '...' : m.reply_text;
                    quoteHtml = '<div style="margin:0 0 10px 0;padding:8px 12px;background:#f8fafc;border-left:3px solid ' + (replyCol || '#94a3b8') + ';border-radius:4px;">' +
                        '<div style="font-size:12px;font-weight:600;color:' + (replyCol || '#94a3b8') + ';margin-bottom:2px;">' + m.reply_to + '</div>' +
                        '<div style="font-size:12px;color:#64748b;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' + truncated + '</div>' +
                        '</div>';
                }

                var bodyHtml = '<div style="font-size:14px;line-height:1.5;color:#1e293b;margin-bottom:12px;">' + m.text + '</div>';

                var likeColor = m.likes > 0 ? '#ef4444' : '#94a3b8';
                var likeLabel = m.likes > 0 ? String(m.likes) : 'Like';
                var footerHtml = '<div style="display:flex;gap:20px;margin-top:4px;">' +
                    '<span style="font-size:12px;color:#94a3b8;font-weight:500;display:flex;align-items:center;gap:4px;cursor:pointer;">&#8629; Reply</span>' +
                    '<span style="font-size:12px;color:' + likeColor + ';font-weight:500;display:flex;align-items:center;gap:4px;cursor:pointer;">&#9825; ' + likeLabel + '</span>' +
                    '<span style="font-size:12px;color:#94a3b8;font-weight:500;display:flex;align-items:center;gap:4px;cursor:pointer;">&#64; Mention</span>' +
                    '<span style="font-size:12px;color:#94a3b8;font-weight:500;display:flex;align-items:center;gap:4px;cursor:pointer;">&#9873; Report</span>' +
                    '</div>';

                card.innerHTML = headerHtml + quoteHtml + bodyHtml + footerHtml;
                list.appendChild(card);
            });

            // --- 4. Lògica de scroll sobre #session-wrapper ---
            function checkScroll() {
                if (scrollDone) return;
                var el = document.getElementById('session-wrapper');
                if (!el) return;
                if ((el.scrollHeight - el.scrollTop) <= (el.clientHeight + 60)) {
                    desbloquejarBoto();
                }
            }

            var wrapperEl = document.getElementById('session-wrapper');
            if (wrapperEl) {
                wrapperEl.addEventListener('scroll', checkScroll, { passive: true });
            }

            setTimeout(checkScroll, 800);
            setTimeout(checkScroll, 1500);
        })
        .catch(function(err) {
            document.getElementById('reddit-messages').innerHTML =
                '<div style="padding:20px;background:#fee2e2;border:1px solid #ef4444;border-radius:8px;color:#b91c1c;">' +
                '<strong>Error:</strong> ' + err.message + '</div>';
        });
});