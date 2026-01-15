# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Bilingual Voice AI Agent** for Acces Croisieres et Voyages - a 24/7 inbound call handling system using VAPI that qualifies leads, answers travel questions, and books consultations in French and English.

## Agent Capabilities

- Answer common questions (destinations, pricing ranges, availability)
- Collect lead information (name, travel dates, preferences, budget)
- Qualify leads based on criteria (trip type, timeline, budget tier)
- Book consultation appointments with human agents
- Transfer hot leads to available agents in real-time
- Send SMS confirmations with agent details

## MCP Integration

VAPI MCP server connected via `mcp.json`:
- `create_assistant` / `update_assistant` - Configure voice agent
- `create_call` - Initiate outbound calls
- `list_phone_numbers` - Manage phone numbers
- `create_tool` - Add function tools (SMS, transfer, API requests)

**Known Issue**: MCP server may return 401 errors due to `mcp-remote` auth header handling. The API key IS valid - test with curl if needed:
```bash
curl -s -X GET "https://api.vapi.ai/assistant" -H "Authorization: Bearer $VAPI_TOKEN"
```

## VAPI Resources (Deployed Jan 2025)

### Assistant
- **Name**: Sophie - Acces Croisieres
- **ID**: `d476d365-e717-4007-be37-7a4e2db3f36b`
- **Voice**: 11labs (sarah)
- **Transcriber**: deepgram nova-3
- **LLM**: claude-3-5-sonnet-20241022
- **Languages**: French (primary), English (auto-detect)

### Tools
| Tool | ID | Type |
|------|-----|------|
| SMS Confirmation | `9590301d-b302-48fb-a462-f5c3a13284a6` | sms |
| Transfer to Consultant | `774dfa98-ab53-4c94-b294-33cf735143d2` | transferCall |
| Lead Capture | `9b790a08-c535-40f8-a243-bb2c7e63e3b9` | function |

### Phone Numbers
- None configured yet (use VAPI dashboard to purchase/import)

### Testing
Test via VAPI Dashboard > Assistants > Sophie > "Talk with Assistant" button
Or create outbound call with curl:
```bash
curl -X POST "https://api.vapi.ai/call" \
  -H "Authorization: Bearer $VAPI_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"assistantId": "d476d365-e717-4007-be37-7a4e2db3f36b", "customer": {"number": "+1XXXXXXXXXX"}}'
```

## VAPI Configuration

```
Voice: 11labs (natural speech)
Transcriber: deepgram nova-3
LLM: claude-3-7-sonnet or gpt-4o
Response target: <600ms
Languages: French (primary), English
```

## Business Targets

- Capture 100% of after-hours inquiries
- Reduce agent qualification time by 70%
- 20+ new leads captured per month

## Production Readiness Checklist

- [x] Assistant created with correct configuration
- [x] SMS tool attached
- [x] Transfer call tool attached
- [x] Lead capture tool attached
- [x] API token secured (not hardcoded)
- [x] System prompt version controlled (`prompts/sophie-system-prompt.md`)
- [x] Documentation complete
- [ ] Phone number configured (via VAPI dashboard)
- [x] Lead capture webhook endpoint configured
- [ ] End-to-end call testing completed
- [ ] Softvoyage CRM integration tested

## Supabase Integration

- **Project ID**: `glzubknrxftcwzfetzit`
- **Project URL**: `https://glzubknrxftcwzfetzit.supabase.co`
- **Lead Capture Webhook**: `https://glzubknrxftcwzfetzit.supabase.co/functions/v1/capture-lead`

### Tables
- `leads` - Captured lead information (name, phone, destination, trip_type, budget, etc.)
- `appointments` - Booked consultation appointments

### Edge Functions
- `capture-lead` - Webhook endpoint for VAPI lead capture tool

### VAPI Tool Update Required
Update the Lead Capture tool (`9b790a08-c535-40f8-a243-bb2c7e63e3b9`) server URL to:
```
https://glzubknrxftcwzfetzit.supabase.co/functions/v1/capture-lead
```

## Demo Web App

- **URL**: `https://demo-n16wfinu1-qualiasolutionscy.vercel.app`
- **Team**: Qualia Solutions CY
- **Pages**:
  - `/` - Voice agent demo
  - `/leads` - Lead dashboard with real-time updates
  - `/calendar` - Appointment calendar (week/list views)

## Project Structure

```
voice/
├── access/
│   └── proposal.html      # Client proposal (Acces Voyages)
├── demo/                  # Next.js demo web app
│   ├── app/
│   │   ├── api/webhook/   # API routes (backup)
│   │   ├── calendar/      # Appointment calendar page
│   │   ├── components/    # VoiceAgent component
│   │   ├── leads/         # Leads dashboard page
│   │   ├── lib/           # Supabase client
│   │   └── page.tsx       # Main demo page
│   ├── package.json
│   └── vercel.json
├── prompts/
│   └── sophie-system-prompt.md  # Version-controlled system prompt
├── .env.example           # Environment variable template
├── .gitignore
├── CLAUDE.md              # This file
└── mcp.json               # VAPI MCP server config
```
