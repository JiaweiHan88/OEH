# OpenEngineeringHub — Pitch Reference

> **Engineering knowledge that compounds.**
>
> A multilayer knowledge platform with self-learning AI agents for engineering teams.

**Purpose of this document:** Slide-deck reference for pitching OpenEngineeringHub to managers and developers. Each section maps to 1-2 slides. Use the diagrams, tables, and scenarios directly.

---

## Slide 1 — The Pain

### Knowledge Evaporates. Every Day. At Scale.

Engineering teams (~3,000 engineers, 200+ active projects) suffer from a compounding fragmentation problem that existing tools don't address:

- **6+ disconnected systems** — Jira, Confluence, GitHub, Gerrit, Codebeamer, Zuul. Context lives everywhere and nowhere.
- **~40% of time spent on context assembly** — engineers juggle 20+ browser tabs to understand a single defect, requirement, or code change. *(Source: internal time-tracking surveys)*
- **Zero compounding** — a senior engineer discovers a root cause, closes the tab, and that insight evaporates. The next engineer hitting the same issue starts from scratch.
- **Knowledge walks out the door** — team attrition, reorgs, and product handoffs erase months of accumulated understanding.

**Slide talking point:** *"This isn't a tab-switching problem. It isn't a chatbot problem. It's a knowledge architecture problem — and no existing tool solves it."*

---

## Slide 2 — The Solution: A 6-Layer Knowledge Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  L6  Workspace        Uploads, conversation findings        │
├─────────────────────────────────────────────────────────────┤
│  L5  User Private     Personal preferences, notes           │
├─────────────────────────────────────────────────────────────┤
│  L4  Shared Hive      Community-curated agent skills        │
├─────────────────────────────────────────────────────────────┤
│  L3  Agent Memory     Lessons learned + skills + history    │
│      ├─ L3a Memory    Topic-indexed wiki per agent          │
│      ├─ L3b Search    Cross-session conversation recall     │
│      └─ L3c Skills    Procedural workflows from experience  │
├─────────────────────────────────────────────────────────────┤
│  L2  Knowledge Store  Hybrid retrieval (vectors+BM25+graph) │
├─────────────────────────────────────────────────────────────┤
│  L1  Raw Artifacts    Jira tickets, pages, PRs, CLs, logs  │
└─────────────────────────────────────────────────────────────┘
```

Each layer has a distinct **scope, writer, and lifecycle**:

| Layer | What It Holds | Who Writes | Status |
|-------|--------------|-----------|--------|
| **L1 Raw** | Source artifacts (tickets, pages, PRs, CLs) | Connectors (auto-sync) | ✅ Shipped |
| **L2 Knowledge Store** | Indexed knowledge — keyword, semantic, graph | Embedding pipeline | ✅ Shipped (keyword + semantic) · 📋 Graph planned |
| **L3a Agent Memory** | Persistent lessons learned, topic-indexed per user | Agent (self-writes) | 📋 Planned |
| **L3b Cross-Session** | Full-text search across past conversations | Auto-saved | 📋 Planned |
| **L3c Agent Skills** | Procedural workflows extracted from complex tasks | Agent (post-task) | 📋 Planned |
| **L4 Shared Hive** | Community-curated skills, shared across all agents | Community PR model | 📋 Planned |
| **L5 User Private** | Personal preferences, notes, shortcuts | User + agent-assisted | 📋 Planned |
| **L6 Workspace** | Uploads, conversation findings | User + agent findings | ✅ Shipped |

**Slide talking point:** *"Lower layers are system-managed. Upper layers emerge from use. The architecture ensures knowledge is ingested once, indexed multiple ways, and accessible everywhere."*

---

## Slide 3 — Breakthrough #1: Multi-Strategy Retrieval

Not all knowledge retrieval is the same problem. A single strategy always fails at something:

| Strategy | Technology | Best For | Example |
|----------|-----------|----------|---------|
| **Keyword** | PostgreSQL BM25 | Error codes, identifiers, exact terms | *"Find error 0xDEAD in all Jira tickets"* |
| **Semantic** | pgvector embeddings | Conceptual similarity, natural language | *"Issues where display flickers on cold boot"* |
| **Graph** | Property graph | Relationships, traceability, multi-hop | *"What requirements trace to this failing test?"* |

```
          User Query
              │
    ┌─────────┼──────────┐
    ▼         ▼          ▼
 Keyword   Semantic    Graph
  BM25     pgvector   Traversal
    │         │          │
    └─────────┼──────────┘
              ▼
    Reciprocal Rank Fusion
              │
              ▼
       Merged Results
```

Results from all three strategies are fused via **Reciprocal Rank Fusion (RRF)** — producing more complete answers than any single approach.

| Component | Status |
|-----------|--------|
| BM25 keyword search | ✅ Shipped |
| pgvector semantic search | ✅ Shipped |
| Property graph (PostgreSQL) | 📋 Planned |
| LightRAG (document corpus graph) | 📋 Future |
| Graphiti (temporal agent memory graph) | 📋 Future |

**For developers:** The retrieval pipeline is pluggable — new strategies can be added without changing agent code. All strategies share the same query interface.

---

## Slide 4 — Breakthrough #2: Self-Learning Agents

The agents **are not stateless chatbots**. They learn. They remember. They get smarter.

### Agent Memory (L3a) — Persistent, Self-Managed Knowledge

Each agent maintains a **topic-indexed knowledge base** per user that persists across all workspaces and sessions:

```
Agent Memory for "Defect Analysis" (user: lena)
├── _index.md                          ← always in context (~2K chars)
├── vhal-binder-patterns.md            ← loaded when VHAL issue detected
├── dlt-log-parsing-lessons.md         ← loaded for log analysis tasks
└── common-aaos-failure-modes.md       ← loaded for AAOS defects
```

- **Always-loaded index** — compact overview always in the agent's context window
- **On-demand topic files** — loaded when task matches topic keywords
- **Self-managed** — agents autonomously write, merge, and archive their own entries
- **Deterministic consolidation** — no LLM summarization. Duplicates merge, contradictions are flagged with `[CONFLICT]` tags, exception patterns protected

### Cross-Session Recall (L3b)

Full-text search across past conversations. The agent recalls previous analysis: *"Last time we looked at VHAL issues, the root cause was always in the binder transaction layer."*

### Procedural Skills (L3c) — Learning *How*, Not Just *What*

After complex tasks, agents extract reusable step-by-step workflows:

```
Skill: "DLT-VHAL-Triage"
Trigger: VHAL-related defect with DLT log attachment
Steps:
  1. Download and parse DLT log for VHAL service PIDs
  2. Filter for error-level messages in 5s window around crash
  3. Cross-reference error codes against known VHAL failure modes
  4. Check Codebeamer for related requirement changes
  5. Output structured root-cause analysis
```

**Slide talking point for managers:** *"After 3 months of use, the Defect Analysis agent has seen 200+ triage sessions. It recognizes patterns, recalls past causes, and applies proven workflows. A new team member gets the benefit of that accumulated expertise on day one."*

**Slide talking point for developers:** *"Memory is deterministic — no lossy LLM summarization. Conflict detection, capacity-based archival, and topic splitting ensure quality degrades gracefully."*

---

## Slide 5 — Breakthrough #3: The Hive — Organizational Knowledge Sharing

Individual learning is powerful. **Shared learning is transformative.**

The Hive (L4) turns individual agent skills into organizational knowledge using a **community PR model**:

```
DRAFT → PRIVATE → PROPOSED → APPROVED → PUBLISHED
```

**How it works:**
1. An engineer's agent discovers a valuable triage pattern during daily work
2. The skill is proposed to the Hive with metadata (tech stack, domain, project)
3. Privacy scanning prevents credential/PII leakage before publishing
4. Community review and approval — same workflow engineers already use for code
5. All agents of that type across the organization gain the skill

**Safety gates:**
- **Privacy scanning** — regex-based detection prevents credential or PII leakage
- **Applicability tags** — skills carry metadata so agents load only relevant shared knowledge
- **Relevance scoring** — workspace context matched against skill tags; usage feedback influences ranking
- **Provenance tracking** — every shared skill traces back to its origin and author

**Slide talking point:** *"12 engineers × daily use = dozens of verified patterns/month flowing into the Hive. Senior expertise scales without senior interrupts. Knowledge compounds across the organization, not just per person."*

---

## Slide 6 — A Day in the Life

### Scenario: Lena triages a VHAL crash defect

| Step | What Happens | Knowledge Layer |
|------|-------------|-----------------|
| 1 | Lena opens the Defect Analysis agent with a Jira ticket | Agent loads ticket from **L1** |
| 2 | Agent retrieves related Confluence specs, past defect analyses, and Codebeamer requirements | **L2** semantic + keyword search |
| 3 | Agent recalls: *"Last 3 VHAL crashes were binder-related"* | **L3a** agent memory from past sessions |
| 4 | Agent applies the "DLT-VHAL-Triage" skill automatically | **L3c** procedural skill |
| 5 | Agent downloads DLT log, parses it, cross-references failure modes | **L1** connector tool execution |
| 6 | Root cause identified: binder deadlock in VHAL service during cold boot | Analysis grounded with **inline citations** |
| 7 | Agent proposes writing a Jira comment with the analysis | **Write-back** with HITL confirmation |
| 8 | New lesson learned written to agent memory | **L3a** self-updates |
| 9 | Lena promotes the triage skill to the Hive | **L4** shared with the team |

**Without OpenEngineeringHub:** 2-3 hours across 6 systems, repeating work someone else did last month.
**With OpenEngineeringHub:** 15 minutes, standing on the shoulders of every previous triage.

---

## Slide 7 — Specialized Agents

Four purpose-built agents consume the knowledge architecture:

| Agent | What It Does | Knowledge Layers | Status |
|-------|-------------|------------------|--------|
| **Contextual Companion** | Chat grounded in workspace data with inline citations | L1, L2, L3a, L5, L6 | ✅ Shipped |
| **Defect Analysis** | Root-cause triage: cross-references tickets, specs, logs, history | L1, L2, L3a, L3c, L4 | 🔄 Basic shipped, full in Wave 3 |
| **Code Review** | Reviews PRs/CLs with full requirement + architecture context | L1, L2, L3a, L4, L6 | ✅ Shipped |
| **PO Analytics** | Natural-language Jira analytics — time-in-state, ping-pong, sprints | L1, L2, L3a | 🔄 Wave 3 |

**Key properties:**
- **100% grounded** — every response cites its sources inline. No hallucination.
- **Configurable per user** — mind-map UI for toggling tools on/off per agent, risk-level visibility, admin constraints
- **Write-back capable** — agents can write findings back to Jira, Confluence, GitHub, Gerrit with human confirmation

---

## Slide 8 — Connector & Tool Ecosystem

**95 tools across 6 engineering systems:**

| Connector | Tools | Read | Write | Destructive | Status |
|-----------|-------|------|-------|-------------|--------|
| **Jira** | 13 | 10 | 2 | 1 | ✅ |
| **Confluence** | 12 | 8 | 2 | 2 | ✅ |
| **GitHub** | 34 | 19 | 8 | 7 | ✅ |
| **Gerrit** | 24 | 14 | 5 | 5 | ✅ |
| **Codebeamer** | 8 | 5 | 2 | 1 | ✅ |
| **Zuul** | 4 | 4 | — | — | ✅ |

**Risk-level human-in-the-loop (HITL):**
- **LOW** (read) → direct execution — no friction
- **MEDIUM** (write) → agent suggests, user confirms before execution
- **HIGH** (destructive) → explicit approval with diff/preview

**Architecture detail for developers:** Connectors are fully decoupled from agents via an inverted model — connectors declare tools → Registry indexes them → agents inject tools dynamically at runtime. Adding a new connector automatically makes its tools available to all agents.

---

## Slide 9 — Competitive Landscape

| Capability | Generic RAG Chatbots | IDE Copilots | **OpenEngineeringHub** |
|------------|---------------------|-------------|----------------------|
| Multi-source integration | ❌ Single source | ❌ Code only | ✅ 6 systems, 95 tools |
| Retrieval strategy | Semantic only | Keyword / AST | ✅ Keyword + Semantic + Graph |
| Agent memory | ❌ Stateless | ❌ Stateless | ✅ Persistent, self-managed |
| Knowledge sharing | ❌ None | ❌ None | ✅ Hive with PR model |
| Write-back actions | ❌ Read-only | Code completion | ✅ Jira, Confluence, GitHub, Gerrit |
| Domain-specific agents | Generic chat | Code completion | ✅ 4 specialized agents |
| Source citations | Sometimes | N/A | ✅ Always, inline, verifiable |
| Setup/time-to-value | ✅ Minutes | ✅ Minutes | ⚠️ Requires connector config |
| Language breadth | ✅ Any language | ✅ Broad IDE support | ⚠️ Focused on engineering workflows |
| Ecosystem maturity | ✅ Large vendor ecosystems | ✅ Established market | ⚠️ Purpose-built, early stage |

**Slide talking point:** *"IDE copilots and generic RAG are faster to set up and broader in language support — that's not what we compete on. We compete on compounding knowledge, organizational memory, and deep multi-source integration for engineering workflows. They're complementary, not competing."*

---

## Slide 10 — Architecture & Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | FastAPI · Python 3.12+ · SQLAlchemy · Alembic |
| Frontend | Next.js 15 · React 19 · TypeScript · Tailwind CSS |
| AI Runtime | CopilotKit (AG-UI protocol) · litellm (multi-provider LLM) |
| Database | PostgreSQL + TimescaleDB + pgvector |
| Queue/Cache | Redis · Taskiq (async task broker) |
| Observability | OpenTelemetry · Prometheus · structlog |
| Deployment | Docker Compose · Electron (macOS desktop) |

```
┌──────────────┐    ┌──────────────┐    ┌─────────────────┐
│   Next.js    │    │   Electron   │    │  Admin Panel    │
│   Web UI     │    │   macOS App  │    │  (Dashboard)    │
└──────┬───────┘    └──────┬───────┘    └────────┬────────┘
       │                   │                      │
       └───────────────────┼──────────────────────┘
                           │ HTTPS / SSE
                    ┌──────▼───────┐
                    │   FastAPI    │
                    │   Backend    │
                    │  ┌────────┐  │     ┌──────────────────┐
                    │  │ Agents │──┼────►│  LLM Provider    │
                    │  └────────┘  │     │  (GPT-4o via     │
                    │  ┌────────┐  │     │   litellm)       │
                    │  │Registry│  │     └──────────────────┘
                    │  └────────┘  │
                    └──────┬───────┘
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
  ┌──────▼──────┐   ┌─────▼─────┐   ┌──────▼──────┐
  │ PostgreSQL  │   │   Redis   │   │   Taskiq    │
  │ + pgvector  │   │  Cache /  │   │   Workers   │
  │ + BM25 FTS  │   │  Broker   │   │  (sync,     │
  │ + Graph     │   │           │   │  write-back)│
  └─────────────┘   └───────────┘   └──────┬──────┘
                                           │
                                ┌──────────┼──────────┐
                                │          │          │
                           ┌────▼──┐  ┌────▼──┐  ┌───▼────┐
                           │ Jira  │  │GitHub │  │ Zuul   │
                           │Conflu.│  │Gerrit │  │Codebm. │
                           └───────┘  └───────┘  └────────┘
```

**Deployment:** Current target is one team (~15 active users). Architecture supports horizontal scaling via stateless backend + connection pooling + task queue.

**For developers:** LLM provider is abstracted via litellm — swap between OpenAI, Azure, Anthropic, or local models without code changes. CopilotKit provides the AG-UI protocol for streaming agent responses.

---

## Slide 11 — Quality, Security & Performance

### Observability

| What's Tracked | Why It Matters |
|----------------|---------------|
| API latency (p50/p95/p99) | SLA monitoring |
| LLM tokens per agent/query/user | Cost control — track cost per engineer/day |
| Thumbs up/down per agent type | Agent quality trending |
| Retrieval metrics (chunks retrieved vs. used) | Retrieval pipeline tuning |
| Connector sync health | Early warning for stale data |
| Weekly golden dataset regression | >5% degradation triggers automatic alerts |

### Security

- **Credentials:** AES-256-GCM at rest; never exposed in API responses, logs, or LLM prompts
- **Data isolation:** Dual-scope — `workspace_id` for user data, `source_project_id` for connector data
- **Authentication:** JWT (24h expiry) with pluggable SSO/IAM interface
- **LLM policy:** Zero-data-retention agreement with provider
- **Write-back safety:** Risk-level HITL enforcement prevents accidental data corruption

### Design Targets

| Metric | Target |
|--------|--------|
| API response (non-LLM) | < 200ms p95 |
| Semantic search | < 500ms p95 (100K vectors) |
| Chat first-token | < 3s p95 |
| Agent response | < 45s p95 (standard analysis) |
| Concurrent users | 15 active + buffer |
| Uptime | ≥ 99% during business hours |

---

## Slide 12 — Roadmap & Status

| Wave | Scope | Status |
|------|-------|--------|
| **1 — Foundation & Triage** | Jira/Confluence connectors · Semantic search · Defect Analysis agent · Chat UI · Workspaces · Auth · Electron macOS | ✅ Shipped |
| **2 — Code Intelligence** | GitHub/Gerrit/Codebeamer/Zuul connectors · Code Review agent · URL ingestion · Tool config UI | ✅ Shipped |
| **3 — Deep Analysis** | DLT log processing · Full Defect Analysis · PO Analytics · Admin dashboard · Golden dataset evaluation | 🔄 In progress |
| **Future** | LightRAG · Graphiti · Property graph · Agent memory & Hive · Webhook sync · Local agent | 📋 Planned |

---

## Slide 13 — The Ask

**For managers evaluating adoption:**

1. **Does the 6-layer knowledge model match your pain?** — If your team loses knowledge to tool fragmentation, attrition, and rediscovery, this is the architecture that solves it.
2. **Which connectors matter most?** — We support 6 systems today. Which 2-3 would deliver the most value for a pilot?
3. **Where would self-learning agents make the biggest difference?** — Pick the domain with the most repeated triage, the most context-heavy workflows, or the most knowledge attrition.

**For developers evaluating the platform:**

1. **Try it** — `docker compose up` and connect a Jira project. Ask the Companion agent a question grounded in your actual data.
2. **Extend it** — add a connector, customize an agent, or contribute a Hive skill.
3. **Challenge it** — run the golden dataset evaluation against your own domain data.

---

## Summary Slide

| | |
|---|---|
| **Problem** | Engineering knowledge is fragmented across 6+ systems, doesn't compound, and walks away with people |
| **Solution** | 6-layer knowledge architecture with multi-strategy retrieval (text → embeddings → graphs) |
| **Differentiator** | Self-learning agents that accumulate expertise + Hive sharing that scales knowledge across the org |
| **Scope** | 4 specialized agents · 95 tools · 6 system connectors · Configurable per user |
| **Stack** | FastAPI · Next.js 15 · PostgreSQL + pgvector · CopilotKit · litellm |
| **Status** | Waves 1-2 shipped · Wave 3 in progress · Memory & Hive planned |
| **Tagline** | *Engineering knowledge that compounds.* |