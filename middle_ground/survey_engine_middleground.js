Qualtrics.SurveyEngine.addOnload(function() {
	
    var scrollDone = false;
    var scrollStatus = { 1: false, 2: false, 3: false };

    // --- 1. Funcions per obtenir el botó (igual que el Turing que funciona) ---
    function getIframeDoc() {
        var iframe = document.querySelector('iframe#preview-view') ||
                     window.parent.document.querySelector('iframe#preview-view');
        if (iframe && iframe.contentDocument) return iframe.contentDocument;
        if (iframe && iframe.contentWindow) return iframe.contentWindow.document;
        return null;
    }

    function getNextButton() {
        var btn = document.getElementById('next-button') ||
                  document.querySelector('[aria-label="Next page"]') ||
                  document.querySelector('.navigation-button');
        if (btn) return btn;
        var iDoc = getIframeDoc();
        if (iDoc) {
            return iDoc.getElementById('next-button') ||
                   iDoc.querySelector('[aria-label="Next page"]') ||
                   iDoc.querySelector('.navigation-button');
        }
        return null;
    }

    // --- 2. Bloqueig i desbloqueig del botó ---
    function bloquejarBoto() {
        var btn = getNextButton();
        if (btn) {
            btn.disabled = true;
            btn.setAttribute('disabled', 'disabled');
            btn.style.opacity = '0.4';
            btn.style.cursor = 'not-allowed';
            btn.style.pointerEvents = 'none';
        }

        if (!document.getElementById('scroll-warning')) {
            var msg = document.createElement('div');
            msg.id = 'scroll-warning';
            msg.innerText = '⚠️ Si no puedes continuar, asegúrate de haber leído las 3 conversaciones hasta el final.';
            msg.style.cssText = 'font-size:13px;color:#b45309;background:#fef9c3;border:1px solid #fde68a;border-radius:6px;padding:8px 12px;margin-bottom:8px;text-align:center;font-family:Inter,sans-serif;';
            var btn2 = getNextButton();
            if (btn2 && btn2.parentNode) {
                btn2.parentNode.insertBefore(msg, btn2);
            }
        }
    }

    function desbloquejarBoto() {
        if (scrollDone) return;
        scrollDone = true;
        clearInterval(reblockInterval);

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

    // Re-bloqueig continu fins que l'usuari hagi llegit tot
    var reblockInterval = setInterval(function() {
        if (!scrollDone) bloquejarBoto();
    }, 300);

    bloquejarBoto();

    // --- 3. Comprovació: tots 3 fòrums llegits? ---
    function checkAllScrolled() {
        if (scrollStatus[1] && scrollStatus[2] && scrollStatus[3]) {
            desbloquejarBoto();
        }
    }

    // --- 4. Càrrega de les URLs ---
    var url1 = Qualtrics.SurveyEngine.getJSEmbeddedData('MG_URL_1');
    var url2 = Qualtrics.SurveyEngine.getJSEmbeddedData('MG_URL_2');
    var url3 = Qualtrics.SurveyEngine.getJSEmbeddedData('MG_URL_3');

    if (!url1 || !url2 || !url3) {
        document.getElementById('mg-news-title').innerHTML =
            "<span style='color:#ef4444;'>Error: Falten dades. Intenta recarregar la pàgina.</span>";
        return;
    }

    var urls = [url1, url2, url3];
    var COLORS = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#6366f1'];

    Promise.all(urls.map(function(u) {
        return fetch(u).then(function(r) {
            if (!r.ok) throw new Error('No s\'ha pogut carregar: ' + u);
            return r.json();
        });
    }))
    .then(function(dataArray) {

        // Notícia (del primer fòrum, compartida)
        var baseData = dataArray[0];
        if (baseData.post_original) {
            document.getElementById('mg-news-agency').innerText = baseData.post_original.agency || '';
            document.getElementById('mg-news-title').innerText = baseData.post_original.title || '';
            document.getElementById('mg-news-body').innerText = baseData.post_original.body || '';
        }

        // --- 5. Renderització de cada fòrum ---
        dataArray.forEach(function(data, index) {
            var forumNum = index + 1;
            var list = document.getElementById('reddit-messages-' + forumNum);
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
                card.style.cssText = 'background:white;border:1px solid #e2e8f0;border-left:4px solid ' + col + ';border-radius:12px;padding:12px;margin-bottom:10px;font-family:Inter,sans-serif;';

                // Header: avatar + nom + hora
                var msgTime = new Date(m.timestamp * 1000).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
                var headerHtml = '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">' +
                    '<div style="display:flex;align-items:center;gap:8px;">' +
                    '<div style="width:30px;height:30px;border-radius:50%;background:' + col + ';color:white;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;flex-shrink:0;">' + m.sender[0].toUpperCase() + '</div>' +
                    '<span style="font-size:13px;font-weight:600;color:' + col + ';">' + m.sender + '</span>' +
                    '</div>' +
                    '<span style="font-size:11px;color:#94a3b8;">' + msgTime + '</span>' +
                    '</div>';

                // Quote (només si hi ha reply_to i reply_text)
                var quoteHtml = '';
                if (m.reply_to && m.reply_text) {
                    var truncated = m.reply_text.length > 60 ? m.reply_text.substring(0, 60) + '...' : m.reply_text;
                    quoteHtml = '<div style="margin:0 0 8px 0;padding:6px 10px;background:#f8fafc;border-left:3px solid ' + (replyCol || '#94a3b8') + ';border-radius:4px;">' +
                        '<div style="font-size:11px;font-weight:600;color:' + (replyCol || '#94a3b8') + ';margin-bottom:2px;text-align:left;">' + m.reply_to + '</div>' +
                        '<div style="font-size:11px;color:#64748b;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-align:left;">' + truncated + '</div>' +
                        '</div>';
                }

                // Cos del missatge
                var bodyHtml = '<div style="font-size:13px;line-height:1.5;color:#1e293b;margin-bottom:10px;">' + m.text + '</div>';

                // Footer: Reply, Like, Mention, Report
                var likeColor = m.likes > 0 ? '#ef4444' : '#94a3b8';
                var likeLabel = m.likes > 0 ? String(m.likes) : 'Like';
                var footerHtml = '<div style="display:flex;gap:16px;margin-top:4px;">' +
                    '<span style="font-size:11px;color:#94a3b8;font-weight:500;display:flex;align-items:center;gap:3px;cursor:pointer;">&#8629; Reply</span>' +
                    '<span style="font-size:11px;color:' + likeColor + ';font-weight:500;display:flex;align-items:center;gap:3px;cursor:pointer;">&#9825; ' + likeLabel + '</span>' +
                    '<span style="font-size:11px;color:#94a3b8;font-weight:500;display:flex;align-items:center;gap:3px;cursor:pointer;">&#64; Mention</span>' +
                    '<span style="font-size:11px;color:#94a3b8;font-weight:500;display:flex;align-items:center;gap:3px;cursor:pointer;">&#9873; Report</span>' +
                    '</div>';

                card.innerHTML = headerHtml + quoteHtml + bodyHtml + footerHtml;
                list.appendChild(card);
            });

            // --- 6. Lògica de scroll per cada fòrum ---
            setTimeout(function() {
                var wrapper = document.getElementById('session-wrapper-' + forumNum);
                if (!wrapper) return;

                function checkScroll() {
                    if (scrollStatus[forumNum]) return;
                    if ((wrapper.scrollHeight - wrapper.scrollTop) <= (wrapper.clientHeight + 40)) {
                        scrollStatus[forumNum] = true;
                        checkAllScrolled();
                    }
                }

                wrapper.addEventListener('scroll', checkScroll, { passive: true });

                // Si el contingut ja cap sense scroll
                checkScroll();
                setTimeout(checkScroll, 500);
            }, 400);
        });
    })
    .catch(function(err) {
        document.getElementById('mg-news-title').innerHTML =
            '<span style="color:#b91c1c;">Error: No s\'han pogut carregar els fòrums. Verifica la connexió.</span>';
        console.error(err);
    });
});