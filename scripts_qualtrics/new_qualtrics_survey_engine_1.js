Qualtrics.SurveyEngine.addOnload(function() {

    var nextButton = document.getElementById('NextButton');
    if (nextButton) {
        nextButton.disabled = true;
        nextButton.style.opacity = '0.5';
        nextButton.style.cursor = 'not-allowed';
        nextButton.title = 'Si no puedes continuar, asegúrate de haber leído la conversación hasta el final.';
    }

    var numBloc = 1;

    var jsonUrl = Qualtrics.SurveyEngine.getJSEmbeddedData('URL_Post_' + numBloc);

    if (!jsonUrl) {
        document.getElementById('reddit-messages').innerHTML = "<p style='color:red;'>Error: No s'ha rebut cap ruta de JSON.</p>";
        return;
    }

    var COLORS = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#6366f1'];

    fetch(jsonUrl)
        .then(function(response) {
            if (!response.ok) throw new Error("No s'ha trobat el fitxer: " + jsonUrl);
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

            setTimeout(function() {
                var wrapper = document.getElementById('session-wrapper');
                
                function encendreBoto() {
                    if (nextButton) {
                        nextButton.disabled = false;
                        nextButton.style.opacity = '1';
                        nextButton.style.cursor = 'pointer';
                        nextButton.title = '';
                    }
                }

                if (wrapper.scrollHeight <= wrapper.clientHeight + 10) {
                    encendreBoto();
                } else {
                    wrapper.addEventListener('scroll', function scrollCheck() {
                        if (wrapper.scrollHeight - wrapper.scrollTop <= wrapper.clientHeight + 30) {
                            encendreBoto();
                            wrapper.removeEventListener('scroll', scrollCheck);
                        }
                    });
                }
            }, 300);

        })
        .catch(function(err) {
            document.getElementById('reddit-messages').innerHTML =
                '<div style="padding:20px;background:#fee2e2;border:1px solid #ef4444;border-radius:8px;color:#b91c1c;">' +
                '<strong>Error:</strong> ' + err.message + '</div>';
        });
});