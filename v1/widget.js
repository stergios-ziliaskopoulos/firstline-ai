(function () {
    var scriptEl = document.currentScript || document.querySelector("script[data-tenant]");
    var tenantId = scriptEl && scriptEl.dataset ? scriptEl.dataset.tenant : null;
    if (!tenantId) {
        console.error("[TrustQueue] Missing data-tenant on widget script tag.");
        return;
    }

    var WEBHOOK_URL = "https://sop-assistant.onrender.com/api/v1/query/" + tenantId;
    var HANDOFF_URL = "https://sop-assistant.onrender.com/api/v1/demo/handoff";

    var STYLES = [
        "#tq-chat-root{position:fixed;bottom:24px;right:24px;z-index:2147483000;display:flex;flex-direction:column;align-items:flex-end;gap:12px;pointer-events:none;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;}",
        "#tq-chat-root *{box-sizing:border-box;}",
        "#tq-chat-window{width:360px;height:min(520px,calc(100vh - 100px));max-height:calc(100vh - 100px);background:#18181b;border:1px solid #27272a;border-radius:16px;box-shadow:0 25px 50px -12px rgba(0,0,0,.5);display:flex;flex-direction:column;overflow:hidden;pointer-events:auto;transform-origin:bottom right;transition:opacity 200ms ease,transform 200ms ease;color:#f4f4f5;}",
        "#tq-chat-window.tq-hidden{opacity:0;transform:scale(.95) translateY(8px);pointer-events:none;}",
        ".tq-header{display:flex;align-items:center;justify-content:space-between;padding:12px 16px;border-bottom:1px solid #27272a;background:rgba(24,24,27,.8);backdrop-filter:blur(8px);}",
        ".tq-header-left{display:flex;align-items:center;gap:10px;}",
        ".tq-avatar{position:relative;}",
        ".tq-avatar-bubble{width:32px;height:32px;border-radius:9999px;background:linear-gradient(135deg,#6366f1,#9333ea);display:flex;align-items:center;justify-content:center;color:#fff;font-size:14px;font-weight:600;}",
        ".tq-avatar-dot{position:absolute;bottom:0;right:0;width:10px;height:10px;background:#10b981;border:2px solid #18181b;border-radius:9999px;}",
        ".tq-title{font-size:14px;font-weight:500;color:#f4f4f5;line-height:1.2;}",
        ".tq-subtitle{font-size:12px;color:#71717a;line-height:1.2;}",
        "#tq-close-btn{background:none;border:none;cursor:pointer;color:#71717a;padding:0;display:flex;align-items:center;justify-content:center;transition:color .15s;}",
        "#tq-close-btn:hover{color:#e4e4e7;}",
        "#tq-messages{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:12px;}",
        "#tq-messages::-webkit-scrollbar{width:6px;}",
        "#tq-messages::-webkit-scrollbar-track{background:transparent;}",
        "#tq-messages::-webkit-scrollbar-thumb{background:#27272a;border-radius:3px;}",
        "#tq-messages::-webkit-scrollbar-thumb:hover{background:#3f3f46;}",
        ".tq-row{display:flex;}",
        ".tq-row-user{justify-content:flex-end;}",
        ".tq-row-assistant{justify-content:flex-start;}",
        ".tq-bubble{max-width:80%;font-size:14px;padding:8px 14px;line-height:1.5;white-space:pre-wrap;word-wrap:break-word;border-radius:16px;}",
        ".tq-bubble-user{background:#4f46e5;color:#fff;border-bottom-right-radius:4px;}",
        ".tq-bubble-assistant{background:#27272a;color:#f4f4f5;border:1px solid rgba(63,63,70,.5);border-bottom-left-radius:4px;}",
        "#tq-chat-form{border-top:1px solid #27272a;background:#18181b;padding:12px;display:flex;align-items:flex-end;gap:8px;}",
        "#tq-chat-input{flex:1;resize:none;background:rgba(39,39,42,.6);color:#f4f4f5;font-size:14px;border-radius:12px;padding:10px 12px;border:1px solid rgba(63,63,70,.6);max-height:128px;outline:none;font-family:inherit;}",
        "#tq-chat-input::placeholder{color:#71717a;}",
        "#tq-chat-input:focus{border-color:rgba(99,102,241,.6);box-shadow:0 0 0 1px rgba(99,102,241,.4);}",
        "#tq-send-btn{flex-shrink:0;width:40px;height:40px;border-radius:12px;background:#4f46e5;color:#fff;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .15s;}",
        "#tq-send-btn:hover:not(:disabled){background:#6366f1;}",
        "#tq-send-btn:disabled{background:#3f3f46;cursor:not-allowed;}",
        "#tq-open-btn{width:56px;height:56px;border-radius:9999px;background:#4f46e5;color:#fff;border:none;cursor:pointer;box-shadow:0 10px 15px -3px rgba(49,46,129,.4);display:flex;align-items:center;justify-content:center;transition:transform .15s,background .15s;pointer-events:auto;}",
        "#tq-open-btn:hover{background:#6366f1;transform:scale(1.05);}",
        "#tq-open-btn:active{transform:scale(.95);}",
        ".tq-resolution-row{display:flex;gap:8px;margin-top:4px;}",
        ".tq-resolution-btn{font-size:12px;color:#a1a1aa;border:1px solid rgba(63,63,70,.5);background:transparent;border-radius:8px;padding:6px 12px;cursor:pointer;transition:all .15s;font-family:inherit;}",
        ".tq-resolution-btn:hover{background:#27272a;color:#e4e4e7;}",
        ".tq-handoff-card{max-width:85%;background:#27272a;border:1px solid rgba(63,63,70,.5);border-radius:16px;border-bottom-left-radius:4px;padding:12px 14px;}",
        ".tq-handoff-form{display:flex;flex-direction:column;gap:8px;}",
        ".tq-handoff-email{width:100%;background:rgba(24,24,27,.8);color:#f4f4f5;font-size:14px;border-radius:8px;padding:8px 12px;border:1px solid rgba(82,82,91,.5);outline:none;font-family:inherit;}",
        ".tq-handoff-email::placeholder{color:#71717a;}",
        ".tq-handoff-email:focus{border-color:rgba(99,102,241,.6);box-shadow:0 0 0 1px rgba(99,102,241,.4);}",
        ".tq-handoff-submit{width:100%;font-size:14px;font-weight:500;color:#fff;background:#4f46e5;border:none;border-radius:8px;padding:8px 12px;cursor:pointer;transition:background .15s;font-family:inherit;}",
        ".tq-handoff-submit:hover:not(:disabled){background:#6366f1;}",
        ".tq-handoff-submit:disabled{opacity:.7;cursor:not-allowed;}",
        ".tq-typing{background:#27272a;border:1px solid rgba(63,63,70,.5);border-radius:16px;border-bottom-left-radius:4px;padding:10px 16px;display:inline-flex;align-items:center;gap:4px;}",
        ".tq-typing-dot{width:6px;height:6px;border-radius:9999px;background:#a1a1aa;animation:tq-blink 1.4s infinite both;}",
        ".tq-typing-dot:nth-child(2){animation-delay:.2s;}",
        ".tq-typing-dot:nth-child(3){animation-delay:.4s;}",
        "@keyframes tq-blink{0%,80%,100%{opacity:.2;}40%{opacity:1;}}"
    ].join("");

    var ROOT_HTML =
        '<div id="tq-chat-root">' +
            '<div id="tq-chat-window" class="tq-hidden">' +
                '<div class="tq-header">' +
                    '<div class="tq-header-left">' +
                        '<div class="tq-avatar">' +
                            '<div class="tq-avatar-bubble">T</div>' +
                            '<span class="tq-avatar-dot"></span>' +
                        '</div>' +
                        '<div>' +
                            '<div class="tq-title">TrustQueue Support</div>' +
                            '<div class="tq-subtitle">Usually replies instantly</div>' +
                        '</div>' +
                    '</div>' +
                    '<button id="tq-close-btn" aria-label="Close chat">' +
                        '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
                    '</button>' +
                '</div>' +
                '<div id="tq-messages"></div>' +
                '<form id="tq-chat-form">' +
                    '<textarea id="tq-chat-input" rows="1" placeholder="Type your message…"></textarea>' +
                    '<button type="submit" id="tq-send-btn" aria-label="Send message">' +
                        '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>' +
                    '</button>' +
                '</form>' +
            '</div>' +
            '<button id="tq-open-btn" aria-label="Open chat">' +
                '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>' +
            '</button>' +
        '</div>';

    function injectStyles() {
        var style = document.createElement("style");
        style.setAttribute("data-tq-widget", "1");
        style.appendChild(document.createTextNode(STYLES));
        document.head.appendChild(style);
    }

    function injectMarkup() {
        var container = document.createElement("div");
        container.innerHTML = ROOT_HTML;
        document.body.appendChild(container.firstChild);
    }

    function init() {
        injectStyles();
        injectMarkup();

        var openBtn  = document.getElementById("tq-open-btn");
        var closeBtn = document.getElementById("tq-close-btn");
        var chatWin  = document.getElementById("tq-chat-window");
        var form     = document.getElementById("tq-chat-form");
        var input    = document.getElementById("tq-chat-input");
        var sendBtn  = document.getElementById("tq-send-btn");
        var messages = document.getElementById("tq-messages");

        var isOpen = false;
        var hasGreeted = false;
        var sessionId = null;
        var chatHistory = [];
        var history = [];

        function openChat() {
            chatWin.classList.remove("tq-hidden");
            isOpen = true;
            if (!hasGreeted) {
                addMessage("assistant", "Hi! I'm the TrustQueue assistant. How can I help you today?");
                hasGreeted = true;
            }
            setTimeout(function () { input.focus(); }, 200);
        }

        function closeChat() {
            chatWin.classList.add("tq-hidden");
            isOpen = false;
        }

        openBtn.addEventListener("click", function () { isOpen ? closeChat() : openChat(); });
        closeBtn.addEventListener("click", closeChat);

        input.addEventListener("input", function () {
            input.style.height = "auto";
            input.style.height = Math.min(input.scrollHeight, 128) + "px";
        });

        input.addEventListener("keydown", function (e) {
            if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                form.requestSubmit();
            }
        });

        function addMessage(role, text) {
            chatHistory.push({ role: role, text: text });
            history.push({ role: role, content: text });

            var wrap = document.createElement("div");
            wrap.className = "tq-row " + (role === "user" ? "tq-row-user" : "tq-row-assistant");

            var bubble = document.createElement("div");
            bubble.className = "tq-bubble " + (role === "user" ? "tq-bubble-user" : "tq-bubble-assistant");
            bubble.textContent = text;

            wrap.appendChild(bubble);
            messages.appendChild(wrap);
            messages.scrollTop = messages.scrollHeight;
            return wrap;
        }

        function addResolutionButtons(originalQuestion) {
            var wrap = document.createElement("div");
            wrap.className = "tq-row tq-row-assistant";
            var inner = document.createElement("div");
            inner.className = "tq-resolution-row";

            var yesBtn = document.createElement("button");
            yesBtn.type = "button";
            yesBtn.textContent = "\u2713 Yes, this helped";
            yesBtn.className = "tq-resolution-btn";

            var noBtn = document.createElement("button");
            noBtn.type = "button";
            noBtn.textContent = "\u2717 No \u2014 connect me to the team";
            noBtn.className = "tq-resolution-btn";

            yesBtn.addEventListener("click", function () {
                wrap.remove();
                addMessage("assistant", "Glad I could help! \uD83D\uDE0A");
            });

            noBtn.addEventListener("click", function () {
                wrap.remove();
                addHandoffForm(originalQuestion);
            });

            inner.appendChild(yesBtn);
            inner.appendChild(noBtn);
            wrap.appendChild(inner);
            messages.appendChild(wrap);
            messages.scrollTop = messages.scrollHeight;
        }

        function addHandoffForm(originalQuestion) {
            addMessage("assistant", "I couldn't find this in our docs. Can I get your email so our team can help you directly?");

            var wrap = document.createElement("div");
            wrap.className = "tq-row tq-row-assistant";
            wrap.innerHTML =
                '<div class="tq-handoff-card">' +
                    '<form class="tq-handoff-form">' +
                        '<input type="email" class="tq-handoff-email" required placeholder="you@company.com" />' +
                        '<button type="submit" class="tq-handoff-submit">Connect me with the team</button>' +
                    '</form>' +
                '</div>';
            messages.appendChild(wrap);
            messages.scrollTop = messages.scrollHeight;

            var handoffForm = wrap.querySelector(".tq-handoff-form");
            var emailInput = wrap.querySelector(".tq-handoff-email");

            handoffForm.addEventListener("submit", async function (ev) {
                ev.preventDefault();
                var email = emailInput.value.trim();
                if (!email) return;

                var submitBtn = handoffForm.querySelector("button");
                submitBtn.disabled = true;
                submitBtn.textContent = "Sending...";

                var recentMessages = chatHistory.slice(-3).map(function (m) {
                    return (m.role === "user" ? "User" : "Assistant") + ": " + m.text;
                }).join("\n");

                try {
                    await fetch(HANDOFF_URL, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            email: email,
                            question: originalQuestion,
                            chat_context: recentMessages,
                            session_id: sessionId,
                            history: history
                        })
                    });
                } catch (e) {
                    // Still show success to the user
                }

                wrap.remove();
                addMessage("assistant", "Got it \u2014 I've flagged this for the team. You'll hear back within 4 hours. \u23F1\uFE0F");
                input.focus();
            });
        }

        function addTypingIndicator() {
            var wrap = document.createElement("div");
            wrap.className = "tq-row tq-row-assistant";
            wrap.id = "tq-typing-indicator";
            wrap.innerHTML =
                '<div class="tq-typing">' +
                    '<span class="tq-typing-dot"></span>' +
                    '<span class="tq-typing-dot"></span>' +
                    '<span class="tq-typing-dot"></span>' +
                '</div>';
            messages.appendChild(wrap);
            messages.scrollTop = messages.scrollHeight;
        }

        function removeTypingIndicator() {
            var el = document.getElementById("tq-typing-indicator");
            if (el) el.remove();
        }

        form.addEventListener("submit", async function (e) {
            e.preventDefault();
            var text = input.value.trim();
            if (!text) return;

            if (!sessionId) sessionId = (crypto && crypto.randomUUID) ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(16).slice(2);

            addMessage("user", text);
            input.value = "";
            input.style.height = "auto";
            sendBtn.disabled = true;
            addTypingIndicator();

            try {
                var res = await fetch(WEBHOOK_URL, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ query: text, session_id: sessionId, history: history })
                });

                removeTypingIndicator();

                if (!res.ok) {
                    addMessage("assistant", "Sorry, something went wrong (HTTP " + res.status + "). Please try again.");
                    return;
                }

                var data = await res.json().catch(function () { return null; });
                var reply = data && typeof data.answer === "string" && data.answer.trim()
                    ? data.answer
                    : "I didn't get a response. Please try again.";
                addMessage("assistant", reply);

                if (data && data.needs_handoff) {
                    addHandoffForm(text);
                } else {
                    addResolutionButtons(text);
                }
            } catch (err) {
                removeTypingIndicator();
                addMessage("assistant", "Network error — couldn't reach the assistant. Please check your connection.");
            } finally {
                sendBtn.disabled = false;
                input.focus();
            }
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
