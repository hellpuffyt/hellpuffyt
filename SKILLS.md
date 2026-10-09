<picture>
  <source media="(prefers-color-scheme: dark)" srcset="assets/hellpuff-wordmark.svg">
  <img src="assets/hellpuff-wordmark-ink.svg" alt="hellpuff" height="36">
</picture>

# Skills and evidence

Every entry below points to the work it comes from. Nothing here is a rating, and nothing is listed because it is popular.

**How to read the labels**

| Label | Meaning |
| :-- | :-- |
| **Built** | Implemented in code I wrote, in a public repository you can read. |
| **Shipped** | Used to build one of the commercial products. Those codebases are private, so the evidence is the product and its case study on [hellpuff.dev](https://www.hellpuff.dev/work). |
| **Prototype** | Used in a small or early project only. |
| **Exploring** | Partly in use, still learning. |

## Languages

| Skill | Level | Evidence |
| :-- | :-- | :-- |
| TypeScript | Built · Shipped | [modelharbor](https://github.com/hellpuffyt/modelharbor), [tsconfig-doctor](https://github.com/hellpuffyt/tsconfig-doctor), [bundle-forensics](https://github.com/hellpuffyt/bundle-forensics), [emberline-engine](https://github.com/hellpuffyt/emberline-engine); DataJewellers, DataRestro, TimeTravel |
| Python | Built · Shipped | [model-bench](https://github.com/hellpuffyt/model-bench), [dataset-profiler](https://github.com/hellpuffyt/dataset-profiler), [shadowlab](https://github.com/hellpuffyt/shadowlab), [rag-eval](https://github.com/hellpuffyt/rag-eval); DataUdaan, DataItemize |
| Rust | Built · Shipped | [bellows-compiler](https://github.com/hellpuffyt/bellows-compiler), [tesseradb](https://github.com/hellpuffyt/tesseradb), [halyard-vm](https://github.com/hellpuffyt/halyard-vm), [packetlens](https://github.com/hellpuffyt/packetlens); Sugar OS |
| Go | Built | [tarn-lang](https://github.com/hellpuffyt/tarn-lang), [spindrift](https://github.com/hellpuffyt/spindrift), [certwatch](https://github.com/hellpuffyt/certwatch), [dnsdrift](https://github.com/hellpuffyt/dnsdrift) |
| SQL | Built · Shipped | [tesseradb](https://github.com/hellpuffyt/tesseradb) (SQL engine), [sql-migrate-lint](https://github.com/hellpuffyt/sql-migrate-lint); PostgreSQL in every commercial product |
| JavaScript | Built · Prototype | [vercel-slm](https://github.com/hellpuffyt/vercel-slm), early projects; underneath all TypeScript work |
| Java | Built | [schemaevo](https://github.com/hellpuffyt/schemaevo) |
| C++ | Built | [imgpipe](https://github.com/hellpuffyt/imgpipe) (C++20, sanitizer builds) |
| C# | Built | [evtlog-triage](https://github.com/hellpuffyt/evtlog-triage) |
| PowerShell, Bash | Built | [win-audit](https://github.com/hellpuffyt/win-audit), [bootstrap-dev](https://github.com/hellpuffyt/bootstrap-dev) |

## Frontend and apps

| Skill | Level | Evidence |
| :-- | :-- | :-- |
| React | Built · Shipped | [modelharbor](https://github.com/hellpuffyt/modelharbor), [repograph](https://github.com/hellpuffyt/repograph), [tokenpit](https://github.com/hellpuffyt/tokenpit), [structdiff](https://github.com/hellpuffyt/structdiff); DataJewellers |
| Next.js | Shipped | DataRestro, DataUdaan, DataAccommodation, TimeTravel, Sita Shree Jewellers, hellpuff.dev |
| Tailwind CSS | Shipped | DataJewellers, DataItemize, TimeTravel, hellpuff.dev |
| Vite | Built · Shipped | The React tools above; DataJewellers |
| Expo / React Native | Shipped | Mobile clients for DataJewellers, DataRestro and DataUdaan |
| Tauri | Shipped | DataJewellers desktop client, Sugar OS |
| three.js | Shipped | hellpuff.dev, Sita Shree Jewellers storefront |
| Accessibility | Built | [a11y-sweep](https://github.com/hellpuffyt/a11y-sweep) |
| Offline-first PWAs | Shipped | DataJewellers |

## Backend and APIs

| Skill | Level | Evidence |
| :-- | :-- | :-- |
| Node.js | Built · Shipped | `node:http` servers in [apiary-mock](https://github.com/hellpuffyt/apiary-mock), [webhook-lens](https://github.com/hellpuffyt/webhook-lens) and [modelharbor](https://github.com/hellpuffyt/modelharbor); every TypeScript backend |
| NestJS | Shipped | DataRestro, DataAccommodation, TimeTravel |
| FastAPI | Shipped | DataUdaan, DataItemize, Kinamna |
| Express | Shipped | DataJewellers, Geoland System |
| REST API design, OpenAPI | Built · Shipped | [apiary-mock](https://github.com/hellpuffyt/apiary-mock); every commercial product |
| Real-time (Socket.IO, SSE) | Built · Shipped | [spindrift](https://github.com/hellpuffyt/spindrift) (server-sent events); DataRestro kitchen display |
| Background jobs and queues | Shipped | Redis- and Postgres-backed workers in DataUdaan, DataAccommodation, DataAttendance |
| Multi-tenant architecture | Shipped | DataJewellers, DataRestro, DataAccommodation, TimeTravel |
| Payments and ledgers | Shipped | Exact-decimal wallet ledger (TimeTravel), immutable stock ledger (DataItemize), Khalti, eSewa and Fonepay settlement (Kinamna) |
| HTTP from the RFC up | Built | [spindrift](https://github.com/hellpuffyt/spindrift) |

## Data

| Skill | Level | Evidence |
| :-- | :-- | :-- |
| PostgreSQL | Shipped | Every commercial product, including schema-per-tenant and row-level security designs |
| Prisma | Shipped | DataJewellers, DataRestro, DataAccommodation, TimeTravel |
| SQLAlchemy and Alembic | Shipped | DataUdaan, DataItemize, Kinamna |
| Redis | Shipped | Caching and queues in DataRestro, DataUdaan, TimeTravel |
| Database internals | Built | [tesseradb](https://github.com/hellpuffyt/tesseradb): MVCC, write-ahead log, crash recovery |
| Migration safety | Built | [sql-migrate-lint](https://github.com/hellpuffyt/sql-migrate-lint) |
| Data quality and profiling | Built | [dataset-profiler](https://github.com/hellpuffyt/dataset-profiler), [label-audit](https://github.com/hellpuffyt/label-audit), [feature-drift](https://github.com/hellpuffyt/feature-drift), [csvsurgeon](https://github.com/hellpuffyt/csvsurgeon) |
| Supabase | Prototype | [vercel-slm](https://github.com/hellpuffyt/vercel-slm) |

## Infrastructure and delivery

| Skill | Level | Evidence |
| :-- | :-- | :-- |
| GitHub Actions CI | Built · Shipped | Linux, macOS and Windows test matrices on the public tools; CI on the commercial products |
| Docker and Compose | Built · Shipped | [spindrift](https://github.com/hellpuffyt/spindrift), [confaudit](https://github.com/hellpuffyt/confaudit); local stacks for the commercial products |
| Vercel | Shipped | hellpuff.dev, DataJewellers, Sita Shree Jewellers |
| Linux | Built | Linux x86-64 code generation in [bellows-compiler](https://github.com/hellpuffyt/bellows-compiler); nginx and sshd auditing in [confaudit](https://github.com/hellpuffyt/confaudit) |
| Kubernetes manifests | Built | [k8s-lint](https://github.com/hellpuffyt/k8s-lint) |
| DNS and TLS | Built | [dnsdrift](https://github.com/hellpuffyt/dnsdrift), [tlsprobe](https://github.com/hellpuffyt/tlsprobe), [certwatch](https://github.com/hellpuffyt/certwatch) |
| Cloudflare | Exploring | Workers and R2 storage in commercial projects, partly in progress |

## Security

| Skill | Level | Evidence |
| :-- | :-- | :-- |
| Authentication and RBAC | Shipped | httpOnly cookie sessions with refresh rotation, custom roles, permissions enforced in the API |
| JWT threat modelling | Built | [tokenpit](https://github.com/hellpuffyt/tokenpit) |
| Webhook signature verification | Built | [webhook-lens](https://github.com/hellpuffyt/webhook-lens) (constant-time HMAC checks) |
| Transport security | Built | [tlsprobe](https://github.com/hellpuffyt/tlsprobe), [headerscan](https://github.com/hellpuffyt/headerscan), [certwatch](https://github.com/hellpuffyt/certwatch) |
| Configuration hardening | Built | [confaudit](https://github.com/hellpuffyt/confaudit), [k8s-lint](https://github.com/hellpuffyt/k8s-lint), [win-audit](https://github.com/hellpuffyt/win-audit) |
| Detection and monitoring | Built · Prototype | [evtlog-triage](https://github.com/hellpuffyt/evtlog-triage), [logtail-rs](https://github.com/hellpuffyt/logtail-rs), [packetlens](https://github.com/hellpuffyt/packetlens), [vercel-slm](https://github.com/hellpuffyt/vercel-slm) |
| Secrets and personal data | Built | [dotenv-doctor](https://github.com/hellpuffyt/dotenv-doctor), [notebook-lint](https://github.com/hellpuffyt/notebook-lint), [pii-redactor](https://github.com/hellpuffyt/pii-redactor) |
| Sandboxing and capabilities | Built | [halyard-vm](https://github.com/hellpuffyt/halyard-vm), [tarn-lang](https://github.com/hellpuffyt/tarn-lang); Cedar policy in Sugar OS |
| Rate limiting | Built | [ratelimit-rs](https://github.com/hellpuffyt/ratelimit-rs) |

## AI and automation

| Skill | Level | Evidence |
| :-- | :-- | :-- |
| LLM provider routing and failover | Built | [modelharbor](https://github.com/hellpuffyt/modelharbor) (Ollama and OpenAI-compatible APIs) |
| Local model benchmarking | Built | [model-bench](https://github.com/hellpuffyt/model-bench) |
| Evaluation (prompts, RAG) | Built | [promptdiff](https://github.com/hellpuffyt/promptdiff), [rag-eval](https://github.com/hellpuffyt/rag-eval) |
| LLM cost tracking | Built | [llm-cost-ledger](https://github.com/hellpuffyt/llm-cost-ledger) |
| Agent orchestration | Exploring | Sugar OS: policy-gated agents and a durable workflow engine, in development |
| Applied ML without frameworks | Built | [doc-classifier](https://github.com/hellpuffyt/doc-classifier), [timeseries-anomaly](https://github.com/hellpuffyt/timeseries-anomaly), [embed-explorer](https://github.com/hellpuffyt/embed-explorer) |
| Document extraction | Built | [receipt-ocr](https://github.com/hellpuffyt/receipt-ocr), [pdf-tables](https://github.com/hellpuffyt/pdf-tables), [whisper-index](https://github.com/hellpuffyt/whisper-index) |
| Developer tooling | Built | [repograph](https://github.com/hellpuffyt/repograph), [docatlas](https://github.com/hellpuffyt/docatlas), [changelog-forge](https://github.com/hellpuffyt/changelog-forge), [bootstrap-dev](https://github.com/hellpuffyt/bootstrap-dev) |

## Engineering practice

| Skill | Level | Evidence |
| :-- | :-- | :-- |
| Testing | Built · Shipped | Vitest, pytest, cargo test, go test, xUnit, JUnit 5, Pester and bats in the public repositories; Playwright end-to-end tests in commercial work |
| Fuzz, golden and recovery tests | Built | [bellows-compiler](https://github.com/hellpuffyt/bellows-compiler), [tesseradb](https://github.com/hellpuffyt/tesseradb) |
| Static analysis | Built | clippy, cargo audit, ruff, mypy, ESLint, shellcheck, SpotBugs |
| Compilers and language design | Built | [bellows-compiler](https://github.com/hellpuffyt/bellows-compiler), [tarn-lang](https://github.com/hellpuffyt/tarn-lang) |
| Documentation | Built | Architecture notes and READMEs across the public repositories; [docatlas](https://github.com/hellpuffyt/docatlas) |

---

<sub>The toolkit on the profile is generated from <code>tools/profile.json</code>. The full public repository list is in <a href="PROJECTS.md">PROJECTS.md</a>.</sub>
