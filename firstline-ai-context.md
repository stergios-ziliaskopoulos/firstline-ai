# FirstLine AI — Project Context

## Τι είναι
AI customer support chatbot SaaS για SaaS εταιρείες 5-20 ατόμων.
Στόχος: να λύνει αυτόματα το 70% των L1 support tickets.

## Positioning
- Target: SaaS εταιρείες 5-20 ατόμων που έχουν Intercom/Zendesk και πληρώνουν πολύ
- UVP: "AI support agent που μαθαίνει το knowledge base σου και απαντάει αυτόματα σε επαναλαμβανόμενες ερωτήσεις"
- GTM: Inbound μόνο (Product Hunt, directories, Reddit) — χωρίς cold outreach

## Pricing (στόχος)
- Starter: $49/μήνα
- Pro: $149/μήνα (7 πελάτες = ~€1k MRR)

## Tech Stack
- **Frontend/Landing page**: HTML + Tailwind CSS, hosted στο GitHub Pages
- **Automation**: n8n self-hosted μέσω Docker (local)
- **LLM**: Groq API — μοντέλο: `llama-3.3-70b-versatile`
- **Public tunnel**: ngrok (δωρεάν, URL αλλάζει κάθε επανεκκίνηση)

## Αρχεία & URLs
- **GitHub repo**: https://github.com/stergios-ziliaskopoulos/firstline-ai
- **Live landing page**: https://stergios-ziliaskopoulos.github.io/firstline-ai/
- **n8n local**: http://localhost:5678
- **Webhook endpoint**: http://localhost:5678/webhook/firstline-chat
- **ngrok public URL**: αλλάζει — τρέξε `ngrok http 5678` για νέο URL

## Αρχεία στο repo
- `index.html` — landing page + chat widget ενσωματωμένο
- `chat-widget.html` — standalone widget (backup)
- `firstline-ai-workflow.json` — n8n workflow v1
- `firstline-ai-workflow-v2.json` — n8n workflow v2 (διορθωμένο)

## n8n Workflow
3 nodes:
1. **Webhook** — δέχεται POST με `{"message": "..."}`
2. **Groq API** — HTTP Request node, καλεί `https://api.groq.com/openai/v1/chat/completions`
3. **Respond to Webhook** — επιστρέφει `{"reply": "...", "status": "ok"}`

### Groq API node JSON body
```json
{
  "model": "llama-3.3-70b-versatile",
  "messages": [
    {
      "role": "system",
      "content": "You are a helpful customer support agent for Acme Analytics, a SaaS platform. Help users with account, billing, API, and dashboard questions. If unsure, say: I will connect you with our team."
    },
    {
      "role": "user",
      "content": "={{ $json.body.message }}"
    }
  ],
  "max_tokens": 500,
  "temperature": 0.3
}
```

### Groq API credentials (n8n)
- Type: HTTP Header Auth
- Name: `Authorization`
- Value: `Bearer <GROQ_API_KEY>`

## Πώς να ξεκινήσεις το n8n
```bash
docker run -it --rm --name n8n -p 5678:5678 -v n8n_data:/home/node/.n8n n8nio/n8n
```

## Πώς να ξεκινήσεις το ngrok
```bash
ngrok http 5678
```
Μετά αντέγραψε το νέο URL και άλλαξέ το στο chat widget μέσα στο `index.html`.

## Test του webhook (PowerShell)
```powershell
Invoke-RestMethod -Uri "http://localhost:5678/webhook/firstline-chat" -Method POST -ContentType "application/json" -Body '{"message": "How do I reset my password?"}'
```

## Τι έχει γίνει ✅
- Landing page live στο GitHub Pages
- n8n workflow με Groq API δουλεύει
- Chat widget ενσωματωμένο στη σελίδα
- Public demo μέσω ngrok

## Επόμενα βήματα 🔜
1. Tally.so waitlist form → ενσωμάτωση στο landing page
2. Σταθερό public URL για n8n (Railway / Render δωρεάν tier)
3. System prompt με πραγματικό SaaS knowledge base αντί για Acme Analytics
4. Product Hunt launch όταν υπάρχει σταθερό demo URL

## Σημειώσεις
- Ο founder δεν θέλει cold outreach — μόνο inbound marketing
- Budget: €0 (όλα δωρεάν)
- Παράλληλο project με κύρια δουλειά
- Ρεαλιστικός στόχος: πρώτος πληρωμένος πελάτης σε 60 μέρες
- Payments: Lemon Squeezy (Merchant of Record) — δεν χρειάζεται εταιρεία για να ξεκινήσει
