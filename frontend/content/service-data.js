// ============================================
// TECHSARA — Service page data
// One entry per service / solution. Keyed by URL slug.
// ============================================

window.SERVICES = {

  // ---------- AI SERVICES ----------
  "generative-ai": {
    category: "AI Service",
    name: "Generative AI & LLM Development",
    headline: "Production LLM systems that ship — not science projects.",
    intro: "We design, fine-tune and deploy generative AI applications on Claude, GPT, Llama and open-source models. Every system is built with eval pipelines, retrieval grounding and safety guardrails so it can actually go live.",
    icon: `<path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/><circle cx="12" cy="12" r="4"/>`,
    capabilities: [
      { title: "Retrieval-augmented generation", desc: "Grounded chat over your docs, tickets and knowledge base — with citations and hallucination checks." },
      { title: "Fine-tuning & alignment", desc: "Custom instruction tuning, DPO and LoRA adapters on Llama, Mistral and Claude-grade base models." },
      { title: "Multi-agent workflows", desc: "Tool-using agents that orchestrate across CRMs, ticketing and internal APIs with full audit trails." },
      { title: "Eval harness & red-teaming", desc: "Automated benchmarks, safety probes and regression suites running in CI on every model push." },
    ],
    stack: ["Claude Opus 4", "GPT-5", "Llama 4", "Mistral", "LangGraph", "DSPy", "Weaviate", "Pinecone"],
    deliverables: [
      "Architecture diagram & data flow",
      "Production API with auth & rate limits",
      "Eval suite + dashboards",
      "Runbook & on-call handover",
    ],
    metrics: [
      { num: "47%", lbl: "avg. cost reduction vs. raw API calls" },
      { num: "98.2%", lbl: "factual accuracy on retrieval tasks" },
      { num: "<300ms", lbl: "P95 latency at production load" },
    ],
    related: ["ai-agents", "chatbots", "document-ai"],
  },

  "computer-vision": {
    category: "AI Service",
    name: "Computer Vision",
    headline: "Eyes for your operations — at the edge or in the cloud.",
    intro: "Detection, segmentation, OCR and quality inspection systems trained on your imagery. We optimize for the deployment target — cloud GPUs, factory edge devices or mobile.",
    icon: `<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>`,
    capabilities: [
      { title: "Object detection & tracking", desc: "Real-time YOLO/DETR-based pipelines, including multi-camera tracking and re-identification." },
      { title: "Defect & quality inspection", desc: "Anomaly detection on production lines with synthetic data augmentation for rare defects." },
      { title: "Medical & document imaging", desc: "DICOM and document segmentation with regulatory-grade audit logs." },
      { title: "Edge optimization", desc: "TensorRT, ONNX and CoreML packaging — same model, 10× faster on-device." },
    ],
    stack: ["PyTorch", "YOLO v10", "Segment Anything 2", "TensorRT", "NVIDIA Jetson", "Roboflow", "OpenCV"],
    deliverables: [
      "Annotated dataset & labeling spec",
      "Trained model + ONNX/TensorRT bundle",
      "Inference SDK or REST endpoint",
      "Monitoring & drift alerts",
    ],
    metrics: [
      { num: "99.4%", lbl: "detection precision (mfg. line case)" },
      { num: "8ms", lbl: "edge inference on Jetson Orin" },
      { num: "10×", lbl: "throughput vs. manual inspection" },
    ],
    related: ["predictive-ml", "document-ai", "mlops"],
  },

  "nlp": {
    category: "AI Service",
    name: "NLP & Language Understanding",
    headline: "Turn unstructured text into structured outcomes.",
    intro: "Classification, entity extraction, summarization and multilingual pipelines that plug into your existing data warehouse. Built for accuracy, throughput and explainability.",
    icon: `<path d="M4 4h16v12H7l-3 3z"/><path d="M8 9h8M8 12h5"/>`,
    capabilities: [
      { title: "Entity & relation extraction", desc: "Pull structured fields from contracts, emails and free-text fields with span-level confidence." },
      { title: "Multilingual classification", desc: "40+ language coverage with consistent precision across English, Arabic, Mandarin and Hindi." },
      { title: "Topic modeling & summarization", desc: "Long-document and call-transcript summarization with controllable focus and length." },
      { title: "Privacy-preserving PII handling", desc: "On-device redaction, tokenization and reversible pseudonymization." },
    ],
    stack: ["spaCy", "Hugging Face Transformers", "Claude", "Anthropic Tokenizer", "LangChain", "DuckDB"],
    deliverables: [
      "Labelled training corpus",
      "Inference API + batch jobs",
      "Confidence calibration & thresholds",
      "Quarterly retraining cadence",
    ],
    metrics: [
      { num: "F1 0.94", lbl: "on custom entity extraction" },
      { num: "40+", lbl: "languages supported" },
      { num: "12×", lbl: "faster than human analyst review" },
    ],
    related: ["document-ai", "chatbots", "generative-ai"],
  },

  "predictive-ml": {
    category: "AI Service",
    name: "Predictive Analytics & ML Models",
    headline: "Forecasts you can actually plan against.",
    intro: "Forecasting, churn, fraud, recommendation and propensity models tuned on your data with full reproducibility, feature stores and continuous monitoring.",
    icon: `<path d="M3 3v18h18"/><path d="M7 15l4-4 3 3 6-8"/>`,
    capabilities: [
      { title: "Time-series forecasting", desc: "Demand, capacity and revenue forecasts with probabilistic intervals — not point estimates." },
      { title: "Churn & propensity", desc: "Customer lifetime, churn and next-best-action models wired into CRM workflows." },
      { title: "Fraud & anomaly detection", desc: "Real-time scoring on payment rails with sub-100ms decisioning." },
      { title: "Causal & uplift modeling", desc: "Measure incremental impact — not just correlation — before you roll out." },
    ],
    stack: ["XGBoost", "LightGBM", "Prophet", "PyTorch Forecasting", "Feast", "MLflow", "dbt"],
    deliverables: [
      "Feature store schema",
      "Trained models with reproducibility metadata",
      "Production scoring service",
      "Drift & performance dashboards",
    ],
    metrics: [
      { num: "+23%", lbl: "forecast accuracy vs. baseline" },
      { num: "$24M", lbl: "fraud prevented in FY (client case)" },
      { num: "<40ms", lbl: "real-time scoring latency" },
    ],
    related: ["recommendations", "computer-vision", "mlops"],
  },

  "ai-agents": {
    category: "AI Service",
    name: "AI Agents & Automation",
    headline: "Agents that work inside the tools your team already uses.",
    intro: "Multi-step agents that plan, call APIs and complete real workflows — across email, ticketing, ERP and CRM. Every action is audited; humans stay in the loop where it matters.",
    icon: `<rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4M8 16h.01M16 16h.01"/>`,
    capabilities: [
      { title: "Workflow agents", desc: "End-to-end agents for ticket triage, order exception handling and procurement approvals." },
      { title: "Tool-use & function calling", desc: "Structured tool calls across REST, GraphQL, SQL and legacy SOAP integrations." },
      { title: "Human-in-the-loop review", desc: "Approval queues, confidence gates and shadow-mode rollouts before full autonomy." },
      { title: "Memory & state management", desc: "Long-running, multi-session agents with structured memory and replayable traces." },
    ],
    stack: ["LangGraph", "OpenAI Swarm", "Claude Computer Use", "Temporal", "Postgres + pgvector"],
    deliverables: [
      "Agent flow diagrams",
      "Tool integrations with auth",
      "Audit logs & trace viewer",
      "Cost & action dashboards",
    ],
    metrics: [
      { num: "70%", lbl: "of exceptions resolved autonomously" },
      { num: "3.4×", lbl: "throughput per ops analyst" },
      { num: "100%", lbl: "audit coverage on every action" },
    ],
    related: ["chatbots", "generative-ai", "document-ai"],
  },

  "chatbots": {
    category: "AI Service",
    name: "Chatbots & Assistants",
    headline: "Conversational interfaces customers and employees actually use.",
    intro: "Voice and text assistants connected to your CRM, knowledge base and support stack. Designed for high deflection without the uncanny valley.",
    icon: `<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>`,
    capabilities: [
      { title: "Customer support assistants", desc: "Tier-1 deflection bots wired to Zendesk, Intercom and Salesforce." },
      { title: "Internal copilots", desc: "Slack and Teams assistants grounded in your internal wiki and docs." },
      { title: "Voice agents", desc: "Realtime voice-to-voice agents for inbound and outbound calls under 300ms latency." },
      { title: "Personality & brand tuning", desc: "Prompt and persona design that matches your voice — not the default ChatGPT tone." },
    ],
    stack: ["Claude", "GPT-5 Realtime", "ElevenLabs", "Deepgram", "Vapi", "Twilio", "Zendesk SDK"],
    deliverables: [
      "Conversation flow design",
      "Knowledge ingestion pipeline",
      "Channel integrations (web/voice/Slack)",
      "QA suite & deflection metrics",
    ],
    metrics: [
      { num: "62%", lbl: "tier-1 ticket deflection" },
      { num: "4.7/5", lbl: "avg. CSAT score post-launch" },
      { num: "24/7", lbl: "coverage with no headcount growth" },
    ],
    related: ["generative-ai", "speech-ai", "ai-agents"],
  },

  "document-ai": {
    category: "AI Service",
    name: "Document AI & OCR",
    headline: "Extract structured data from any document — at enterprise scale.",
    intro: "Invoices, contracts, clinical records, ID documents. We extract fields with 98%+ accuracy and route them straight into your systems of record.",
    icon: `<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/><line x1="8" y1="9" x2="10" y2="9"/>`,
    capabilities: [
      { title: "Form & table extraction", desc: "Key-value, table and checkbox extraction from semi-structured PDFs and scans." },
      { title: "Long-form contract analysis", desc: "Clause-level extraction, obligation tracking and redline workflows." },
      { title: "Clinical & financial records", desc: "HIPAA / PCI-compliant pipelines for sensitive document workloads." },
      { title: "Hand-written & low-quality scans", desc: "Multi-pass OCR with confidence routing and human review for low-certainty fields." },
    ],
    stack: ["Azure Document Intelligence", "AWS Textract", "Anthropic Vision", "LayoutLMv3", "Tesseract"],
    deliverables: [
      "Field schema & extraction spec",
      "Document AI pipeline with retries",
      "Reviewer UI for low-confidence fields",
      "Integration with your DMS / ERP",
    ],
    metrics: [
      { num: "98.1%", lbl: "field-level accuracy" },
      { num: "68%", lbl: "reduction in manual triage time" },
      { num: "3s", lbl: "avg. end-to-end processing" },
    ],
    related: ["nlp", "ai-agents", "computer-vision"],
  },

  "speech-ai": {
    category: "AI Service",
    name: "Speech AI",
    headline: "Realtime voice — transcription, synthesis, understanding.",
    intro: "ASR, TTS, voice cloning and voice analytics pipelines built for sub-300ms latency. Deployed in cloud or on-prem for compliance-sensitive voice workloads.",
    icon: `<path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v3"/>`,
    capabilities: [
      { title: "Streaming transcription", desc: "Diarized, punctuated transcription for calls, meetings and field recordings." },
      { title: "Voice synthesis & cloning", desc: "Studio-grade TTS with brand voices and multilingual support." },
      { title: "Conversation intelligence", desc: "Topic, sentiment and compliance flagging on every call." },
      { title: "Low-latency voice agents", desc: "End-to-end voice-to-voice agents for call centers and IVR replacement." },
    ],
    stack: ["Whisper Large v3", "Deepgram Nova", "ElevenLabs", "Cartesia", "WebRTC", "LiveKit"],
    deliverables: [
      "ASR/TTS service endpoints",
      "Voice persona configuration",
      "Compliance & redaction layer",
      "Integration with telephony stack",
    ],
    metrics: [
      { num: "97%", lbl: "WER on domain-tuned models" },
      { num: "260ms", lbl: "voice-to-voice latency" },
      { num: "12", lbl: "languages production-ready" },
    ],
    related: ["chatbots", "nlp", "ai-agents"],
  },

  "recommendations": {
    category: "AI Service",
    name: "Recommendations",
    headline: "Personalization engines tuned for the metric that matters.",
    intro: "Recommender systems built around your business objective — revenue, retention or engagement — with explainable ranking and A/B-ready experimentation.",
    icon: `<path d="M12 2 L2 7 L12 12 L22 7 Z"/><path d="M2 17 L12 22 L22 17"/><path d="M2 12 L12 17 L22 12"/>`,
    capabilities: [
      { title: "Two-tower & sequence models", desc: "Modern retrieval + ranking architectures over your full catalog." },
      { title: "Cold-start strategies", desc: "Content embeddings and bandit policies for new users and new items." },
      { title: "Multi-objective ranking", desc: "Balance revenue, margin, diversity and freshness with tunable weights." },
      { title: "Experimentation framework", desc: "Native A/B and contextual bandits with statistical guardrails." },
    ],
    stack: ["PyTorch", "TensorFlow Recommenders", "Vespa", "Vector DBs", "Feature stores", "Statsig"],
    deliverables: [
      "Recommendation API",
      "Offline + online evaluation",
      "Bandit & A/B framework",
      "Catalog ingestion pipeline",
    ],
    metrics: [
      { num: "+18%", lbl: "click-through vs. heuristic baseline" },
      { num: "+11%", lbl: "revenue per session" },
      { num: "<60ms", lbl: "ranking latency at P95" },
    ],
    related: ["predictive-ml", "nlp", "mlops"],
  },

  "mlops": {
    category: "AI Service",
    name: "MLOps & Deployment",
    headline: "Move models from notebooks to production — and keep them there.",
    intro: "CI/CD for models, feature stores, versioning, drift monitoring and rollback. We bring engineering rigor to data science workflows.",
    icon: `<path d="M14 2v6h6"/><path d="M4 13.5V4a2 2 0 0 1 2-2h8l6 6v11.5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"/><path d="M9 17l2 2 4-4"/>`,
    capabilities: [
      { title: "Model CI/CD", desc: "Automated training, eval and deployment pipelines triggered by data or code." },
      { title: "Feature stores", desc: "Online + offline parity, point-in-time correctness and lineage out of the box." },
      { title: "Drift & quality monitoring", desc: "Data drift, prediction drift and concept drift dashboards with paging." },
      { title: "Shadow & canary deployment", desc: "Safe rollouts with auto-rollback on metric regression." },
    ],
    stack: ["MLflow", "Feast", "Kubeflow", "Argo", "Prometheus", "Grafana", "Evidently"],
    deliverables: [
      "MLOps platform architecture",
      "CI/CD pipelines for training & serving",
      "Monitoring & alert wiring",
      "Runbook + on-call rotation handover",
    ],
    metrics: [
      { num: "10×", lbl: "faster model release cycle" },
      { num: "99.95%", lbl: "model-service uptime" },
      { num: "<5min", lbl: "automated rollback time" },
    ],
    related: ["predictive-ml", "computer-vision", "cloud-deployment"],
  },

  // ---------- SOLUTIONS / DEPLOYMENT ----------
  "cloud-deployment": {
    category: "Deployment",
    name: "Cloud Deployment",
    headline: "AI on AWS, Azure and GCP — built like the rest of your platform.",
    intro: "Multi-cloud architectures using Bedrock, Vertex AI, SageMaker and Azure OpenAI. Infrastructure-as-code, auto-scaling, cost-tuned and observable from day one.",
    icon: `<path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/>`,
    capabilities: [
      { title: "Reference architectures", desc: "Battle-tested IaC modules for RAG, training and inference workloads." },
      { title: "Cost engineering", desc: "Spot, reserved and savings-plan strategies that cut spend without sacrificing latency." },
      { title: "Observability stack", desc: "Unified logs, traces and model metrics across CloudWatch, Stackdriver and Azure Monitor." },
      { title: "Security & networking", desc: "VPC, PrivateLink, KMS and IAM patterns reviewed by senior cloud architects." },
    ],
    stack: ["AWS Bedrock", "Azure OpenAI", "GCP Vertex AI", "Terraform", "Pulumi", "Datadog"],
    deliverables: [
      "Cloud account topology",
      "IaC modules in your repo",
      "SLO dashboards",
      "Cost-guardrail policies",
    ],
    metrics: [
      { num: "99.95%", lbl: "platform SLA" },
      { num: "-38%", lbl: "cloud spend post-engagement" },
      { num: "<48h", lbl: "incident MTTR" },
    ],
    related: ["mlops", "on-premise", "hybrid-edge"],
  },

  "on-premise": {
    category: "Deployment",
    name: "On-Premise & Local Server AI",
    headline: "Air-gapped AI for data-sovereign workloads.",
    intro: "We deploy production AI on your hardware — finance, healthcare, defense and other regulated environments. Open-source models, your metal, full control.",
    icon: `<rect x="2" y="3" width="20" height="6" rx="1"/><rect x="2" y="15" width="20" height="6" rx="1"/><path d="M6 6h.01M6 18h.01"/>`,
    capabilities: [
      { title: "GPU cluster setup", desc: "NVIDIA H100/H200 and AMD MI300X cluster provisioning, networking and scheduling." },
      { title: "Open-source LLM hosting", desc: "Llama 4, Mistral and Qwen running on your hardware with quantization & batching." },
      { title: "Compliance posture", desc: "HIPAA, SOC 2 Type II, ISO 27001 and FedRAMP-aligned deployment patterns." },
      { title: "Operations & runbooks", desc: "24/7 monitoring, paging and quarterly capacity reviews." },
    ],
    stack: ["NVIDIA H100/H200", "vLLM", "TensorRT-LLM", "Kubernetes", "Slurm", "Triton Inference Server"],
    deliverables: [
      "Cluster build & burn-in report",
      "Model packaging & serving stack",
      "Compliance evidence package",
      "Operational runbooks",
    ],
    metrics: [
      { num: "100%", lbl: "data residency guarantee" },
      { num: "24ms", lbl: "inference latency on-prem" },
      { num: "0", lbl: "external API dependencies" },
    ],
    related: ["cloud-deployment", "hybrid-edge", "mlops"],
  },

  "hybrid-edge": {
    category: "Deployment",
    name: "Hybrid Cloud & Edge AI",
    headline: "Train in cloud. Infer at the edge. Sync continuously.",
    intro: "Federated learning, model distillation and offline-ready devices for global rollouts. Same engineering rigor across cloud, edge and on-device.",
    icon: `<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>`,
    capabilities: [
      { title: "Edge optimization", desc: "Quantization, distillation and pruning to fit Jetson, Coral and custom SoC targets." },
      { title: "Federated learning", desc: "Train across distributed devices and sites without centralizing raw data." },
      { title: "OTA model updates", desc: "Signed, staged rollouts to fleets of devices with automatic rollback." },
      { title: "Offline-first design", desc: "Local-first inference with eventual cloud sync for telemetry and retraining." },
    ],
    stack: ["NVIDIA Jetson", "Google Coral", "TensorFlow Lite", "Core ML", "Edge Impulse", "Flower"],
    deliverables: [
      "Edge SDK & device images",
      "Cloud training pipeline",
      "OTA update infrastructure",
      "Fleet telemetry dashboard",
    ],
    metrics: [
      { num: "<50ms", lbl: "on-device inference" },
      { num: "10K+", lbl: "device fleets supported" },
      { num: "100%", lbl: "offline-capable" },
    ],
    related: ["cloud-deployment", "on-premise", "computer-vision"],
  },

  "ai-strategy": {
    category: "Consulting",
    name: "AI Strategy & Readiness",
    headline: "A pragmatic roadmap, not a vendor pitch deck.",
    intro: "We assess your data, processes and competitive position — then deliver a prioritized AI roadmap with ROI models, build/buy decisions and a 90-day execution plan.",
    icon: `<path d="M12 2L2 7v10l10 5 10-5V7L12 2z"/><path d="M2 7l10 5 10-5M12 12v10"/>`,
    capabilities: [
      { title: "Readiness assessment", desc: "Data, infrastructure, talent and process maturity audit with gap analysis." },
      { title: "Use-case prioritization", desc: "Impact × feasibility scoring across your portfolio of ideas." },
      { title: "Build / buy / partner analysis", desc: "Honest recommendations — including when not to build at all." },
      { title: "Governance & risk framework", desc: "Model risk, data lineage and responsible AI policies that satisfy your board." },
    ],
    stack: ["Workshops", "Stakeholder interviews", "Data audits", "Financial modeling", "Risk frameworks"],
    deliverables: [
      "AI readiness scorecard",
      "Prioritized use-case roadmap",
      "ROI & business-case models",
      "90-day execution plan",
    ],
    metrics: [
      { num: "$4.2M", lbl: "median first-year ROI" },
      { num: "2", lbl: "doomed projects killed (avg.)" },
      { num: "90 days", lbl: "to first measurable outcome" },
    ],
    related: ["cloud-consulting", "mlops", "generative-ai"],
  },

  "cloud-consulting": {
    category: "Consulting",
    name: "Cloud Architecture & Cost Engineering",
    headline: "Engineered cloud bills. Engineered cloud architecture.",
    intro: "Migration plans, multi-cloud architectures and FinOps audits that turn unpredictable bills into engineered, observable line items — without slowing your team down.",
    icon: `<path d="M2 22h20M4 22V10l8-6 8 6v12M9 22v-6h6v6"/>`,
    capabilities: [
      { title: "Migration architecture", desc: "From data-center exit to multi-cloud — phased, reversible, with clear cutover gates." },
      { title: "FinOps cost teardown", desc: "Line-by-line spend analysis with quantified savings opportunities and owners." },
      { title: "Security & compliance", desc: "CIS benchmarks, SOC 2 readiness and least-privilege IAM at scale." },
      { title: "Performance benchmarking", desc: "Realistic load tests on the actual workloads — not synthetic benchmarks." },
    ],
    stack: ["AWS", "Azure", "GCP", "Terraform", "Kubernetes", "Datadog", "CloudHealth"],
    deliverables: [
      "Target architecture diagrams",
      "FinOps savings report with owners",
      "Compliance gap analysis",
      "Migration runbook",
    ],
    metrics: [
      { num: "-38%", lbl: "average cloud spend reduction" },
      { num: "0", lbl: "production incidents during migration" },
      { num: "6×", lbl: "ROI on consulting engagement" },
    ],
    related: ["ai-strategy", "cloud-deployment", "mlops"],
  },

};
