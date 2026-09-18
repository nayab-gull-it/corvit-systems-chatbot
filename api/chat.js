/**
 * Corvit Systems Rawalpindi - Vercel Serverless AI Function
 * Direct native handler for Vercel deployment with Multi-Tier Cascading Fallback:
 * Tier 1: openai/gpt-oss-120b (Flagship Reasoning)
 * Tier 2: openai/gpt-oss-20b (High-Speed Fallback)
 * Tier 3: qwen/qwen3.8-27b (Resilience Backup)
 * Tier 4: Grounded Local Dataset RAG Engine
 */

const fs = require('fs');
const path = require('path');

// Auto-load local .env if present
if (!process.env.GROQ_API_KEY) {
  try {
    const envPath = path.resolve(__dirname, '../.env');
    if (fs.existsSync(envPath)) {
      const envText = fs.readFileSync(envPath, 'utf8');
      const match = envText.match(/GROQ_API_KEY=([^\r\n]+)/);
      if (match) {
        process.env.GROQ_API_KEY = match[1].trim();
      }
    }
  } catch (e) {}
}

const MODEL_TIERS = [
  {
    id: 'openai/gpt-oss-120b',
    displayName: 'Groq GPT-OSS 120B (Flagship)',
    timeoutMs: 18000,
    temperature: 0.3,
    maxTokens: 1200
  },
  {
    id: 'openai/gpt-oss-20b',
    displayName: 'Groq GPT-OSS 20B (High-Speed Fallback)',
    timeoutMs: 10000,
    temperature: 0.3,
    maxTokens: 1000
  },
  {
    id: 'qwen/qwen3.8-27b',
    displayName: 'Qwen 3.8 27B (Resilience Backup)',
    timeoutMs: 10000,
    temperature: 0.3,
    maxTokens: 1000
  }
];

function buildSystemPrompt() {
  return `You are the official AI Academic Advisor for Corvit Systems Rawalpindi (RWP).
Your mission is to assist prospective students, university undergraduates, and IT professionals with accurate, concise, and courteous information regarding courses, batch schedules, fees, admissions, and campus facilities.

=== CRITICAL GROUNDING RULES ===
1. ALWAYS base your answers strictly on the verified Corvit Systems dataset.
2. NEVER hallucinate fake fees, fake trainers, or unverified programs.
3. Highlight NAVTTC Free Courses (100% Free Government-Funded tuition) and Prime Minister Kamyab Jawan programs.
4. Highlight active promotional bundles:
   - Cisco CCNA includes Free RHCSA (Red Hat Linux) training.
   - DevOps Engineering includes Free AWS Cloud training.
5. VISUAL RECOMMENDATIONS (CRITICAL):
   Attach matching image recommendation token on its own line (do NOT wrap in backticks):
   - Batch timetables, class timings -> [IMAGE:schedule_flyer]
   - Fee guidelines, promotional discounts -> [IMAGE:fee_chart]
   - Campus location, Zarwar Center labs, server racks -> [IMAGE:campus_labs]
   - Cisco CCNA, networking, routing, Linux bundle -> [IMAGE:ccna_flyer]
   - Cyber Security, CEH, Ethical Hacking, Firewalls -> [IMAGE:cyber_security]
   - Agentic AI, Autonomous LLMs, Python Data Science -> [IMAGE:agentic_ai]
   - DevOps Engineering, Docker, Kubernetes, AWS -> [IMAGE:cloud_devops]
   - NAVTTC Free Courses, Government programs -> [IMAGE:navttc_free]
   - Training modes (Classroom, Online, 1-on-1) -> [IMAGE:training_modes]

6. BILINGUAL FLUENCY (Roman Urdu & English):
   - If the student writes in Roman Urdu, respond warmly and fluently in natural, respectful Roman Urdu.
   - If the student writes in English, reply in clear, professional English.

=== CORVIT RAWALPINDI CAMPUS FACTS ===
- Campus Location: 2nd Floor, Zarwar Center, Main Murree Road, 6th Road Stop, Block A, Satellite Town, Rawalpindi.
- Phone Numbers: (051) 4928004, (051) 4928005, (051) 4928006
- WhatsApp / Mobile: 0311-1444473 (+92-311-1444473)
- Email: rwp@corvit.com
- Working Hours: Monday - Saturday: 09:00 AM - 09:00 PM (Closed Sundays)
- Free Demo Lecture: Students can attend a free trial class before enrolling.
`;
}

function generateDatasetFallbackReply(userText) {
  const q = (userText || '').toLowerCase();
  const isRomanUrdu = /kahan|kab|kitni|kitna|shuru|start|dakhla|paisa|paise|batao|bataen|chahiye|mein|hai|hain|karna|karne|sakta|sakty|raha|rahe|kuch|kya|kia|walay|wale|rabta/.test(q);

  if (q.includes('fee') || q.includes('cost') || q.includes('price') || q.includes('discount') || q.includes('kitni') || q.includes('paise')) {
    if (isRomanUrdu) {
      return `**Corvit Systems Rawalpindi** (Zarwar Center, 6th Road) mein fees standardized hain, sath mein easy installments aur special bundles bhi available hain:\n\n- **CCNA ke sath Free Linux**: CCNA 200-301 mein Red Hat Linux (RHCSA) bilkul free shamil hai.\n- **DevOps ke sath Free AWS**: DevOps course ke sath AWS Cloud training free hai.\n- **100% Free NAVTTC Programs**: Government funded tracks eligible Pakistani youth ke liye 100% free hain.\n\nRawalpindi accounts counter se rabta karein:\n📞 Call: **(051) 4928004**\n💬 WhatsApp: **0311-1444473**\n📍 Zarwar Center, 2nd Floor, 6th Road Stop, Murree Road, Rawalpindi\n\n[IMAGE:fee_chart]`;
    }
    return `At **Corvit Systems Rawalpindi**, course fees are standardized with student installment plans and promotional bundles:\n\n- **Free RHCSA Linux with CCNA**: Full Red Hat Linux administration included free with CCNA 200-301.\n- **Free AWS Cloud with DevOps**: Full AWS module included free with DevOps.\n- **100% Free NAVTTC Courses**: Tuition-free government programs for eligible Pakistani youth.\n\nContact the Rawalpindi admissions desk:\n📞 **(051) 4928004** &bull; 💬 WhatsApp: **0311-1444473**\n📍 2nd Floor, Zarwar Center, 6th Road, Rawalpindi\n\n[IMAGE:fee_chart]`;
  }

  if (q.includes('schedule') || q.includes('time') || q.includes('timing') || q.includes('timetable') || q.includes('batch') || q.includes('when') || q.includes('kab')) {
    return `**Corvit Systems Rawalpindi** offers flexible batch timings at our Zarwar Center 6th Road campus and live online:\n\n- **CCNA Morning**: Mon - Thu @ 11:00 AM (Free Linux included)\n- **CCNA Evening**: Mon - Thu @ 07:30 PM\n- **Certified Ethical Hacker (CEH)**: Mon - Thu @ 08:45 PM\n- **Fortinet & Palo Alto Firewalls**: Mon - Thu @ 09:30 PM\n- **Agentic AI & LLMs (Weekend)**: Sat & Sun @ 04:00 PM\n- **DevOps + AWS Cloud (Weekend)**: Sat & Sun @ 08:00 PM\n\n💡 *Free Demo Lectures are available before registration!*\nReserve your demo seat: Call **(051) 4928004** or WhatsApp **0311-1444473**.\n\n[IMAGE:schedule_flyer]`;
  }

  if (q.includes('navttc') || q.includes('free') || q.includes('scholarship') || q.includes('kamyab')) {
    return `Yes! **Corvit Systems Rawalpindi** is an authorized partner for **NAVTTC** (National Vocational & Technical Training Commission):\n\n- **Tuition**: 100% Free (Government Funded).\n- **Available Tracks**: AI (ML/DL), Cyber Security & Ethical Hacking, Cloud Computing, and Full Stack Web Development.\n- **Benefits**: Zero tuition fee, free course materials, physical enterprise lab access at Zarwar Center 6th Road, and recognized certificates.\n\nContact the Rawalpindi NAVTTC desk at **(051) 4928004** or WhatsApp **0311-1444473**.\n\n[IMAGE:navttc_free]`;
  }

  if (q.includes('ccna') || q.includes('cisco') || q.includes('network') || q.includes('routing')) {
    return `**Cisco CCNA 200-301 at Corvit Rawalpindi** is the premier foundational track for modern network engineers:\n\n- **Special Promo**: Includes **Free RHCSA (Red Hat Linux)** training bundle!\n- **Key Topics**: Enterprise routing & switching, IPv4/IPv6 subnetting, OSPF, VLANs, ACLs, and network automation.\n- **Hardware Labs**: Live Cisco physical routers and switches at Zarwar Center campus.\n- **Shifts**: Morning (11:00 AM) and Evening (7:30 PM).\n\n[IMAGE:ccna_flyer]`;
  }

  if (q.includes('security') || q.includes('cyber') || q.includes('ceh') || q.includes('ethical') || q.includes('firewall')) {
    return `**Cyber Security & Defensive Technologies at Corvit Rawalpindi**:\n\n- **Certified Ethical Hacker (CEH v10/v12)**: Vulnerability scanning, system exploitation, malware analysis, and web app hacking.\n- **Next-Gen Firewalls**: Dual track covering **Fortinet FortiGate (NSE-4)** & **Palo Alto (PAN-OS)**.\n- **Timing**: Evening batches (8:45 PM for CEH, 9:30 PM for Firewalls).\n\n[IMAGE:cyber_security]`;
  }

  if (q.includes('ai') || q.includes('agentic') || q.includes('llm') || q.includes('python')) {
    return `**Agentic AI & Autonomous LLMs Track at Corvit Rawalpindi**:\n\n- **Multi-Agent Architectures**: LangChain, CrewAI, AutoGen, and LangGraph workflows.\n- **Model Context Protocol (MCP)**: Native tool calling, enterprise agents, and vector databases.\n- **Schedule**: Saturdays & Sundays @ 04:00 PM Onwards.\n\n[IMAGE:agentic_ai]`;
  }

  if (q.includes('location') || q.includes('address') || q.includes('contact') || q.includes('where') || q.includes('phone') || q.includes('rwp') || q.includes('kahan')) {
    return `📍 **Corvit Systems Rawalpindi Campus**:\n- **Address**: 2nd Floor, Zarwar Center, Main Murree Road, 6th Road Stop, Block A, Satellite Town, Rawalpindi.\n- **Landmark**: Near 6th Road Metro Bus Station (easily accessible from Rawalpindi & Islamabad).\n- **Phone**: **(051) 4928004**, **(051) 4928005**, **(051) 4928006**\n- **WhatsApp**: **0311-1444473** (+92-311-1444473)\n- **Email**: rwp@corvit.com\n- **Hours**: Monday to Saturday: 09:00 AM – 09:00 PM (Closed Sunday).\n\n[IMAGE:campus_labs]`;
  }

  return `Welcome to **Corvit Systems Rawalpindi**! I can assist you with:\n\n- **Course Guidance**: Cisco Networking, Cyber Security, Cloud, DevOps, AI, Full Stack Development, and SEO.\n- **Batch Schedules**: Morning, Evening, and Weekend timings at Zarwar Center, 6th Road Rawalpindi.\n- **Fees & Concessions**: Promotional bundles (Free Linux with CCNA; Free AWS with DevOps) and **100% Free NAVTTC Government Courses**.\n- **Admissions**: Reserving a free trial demo lecture before enrolling.\n\nHow can I help you today? Contact the Rawalpindi desk directly:\n📞 **(051) 4928004** &bull; 💬 WhatsApp: **0311-1444473** &bull; ✉️ **rwp@corvit.com**\n\n[IMAGE:training_modes]`;
}

module.exports = async (req, res) => {
  const startTime = Date.now();

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const userMessage = body.message || body.userMessage || '';
    const conversationHistory = Array.isArray(body.history) ? body.history : [];

    if (!userMessage.trim()) {
      return res.status(400).json({ error: 'Message cannot be empty.' });
    }

    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey || apiKey === 'your_groq_api_key_here') {
      const fallbackReply = generateDatasetFallbackReply(userMessage);
      return res.status(200).json({
        reply: fallbackReply,
        modelUsed: 'local-dataset-rag',
        modelName: 'Corvit Grounded Dataset Engine',
        fallbackTier: 4,
        fallback: true,
        latencyMs: Date.now() - startTime,
        source: 'dataset-rule-engine-no-key'
      });
    }

    const systemPrompt = buildSystemPrompt();
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.slice(-6),
      { role: 'user', content: userMessage }
    ];

    let finalReply = null;
    let successfulModel = null;
    let usedTier = 0;

    for (let i = 0; i < MODEL_TIERS.length; i++) {
      const tierConfig = MODEL_TIERS[i];
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), tierConfig.timeoutMs);

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: tierConfig.id,
            messages: messages,
            temperature: tierConfig.temperature,
            max_tokens: tierConfig.maxTokens
          }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          if (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
            finalReply = data.choices[0].message.content;
            successfulModel = tierConfig;
            usedTier = i + 1;
            break;
          }
        }
      } catch (err) {
        console.warn(`Vercel tier ${i + 1} (${tierConfig.id}) error: ${err.message}`);
      }
    }

    const latencyMs = Date.now() - startTime;

    if (finalReply && successfulModel) {
      return res.status(200).json({
        reply: finalReply,
        modelUsed: successfulModel.id,
        modelName: successfulModel.displayName,
        fallbackTier: usedTier,
        fallback: usedTier > 1,
        latencyMs: latencyMs,
        source: `groq-${successfulModel.id}`
      });
    }

    const fallbackReply = generateDatasetFallbackReply(userMessage);
    return res.status(200).json({
      reply: fallbackReply,
      modelUsed: 'local-dataset-rag',
      modelName: 'Corvit Grounded Dataset Engine',
      fallbackTier: 4,
      fallback: true,
      latencyMs: latencyMs,
      source: 'dataset-rule-engine-all-tiers-failed'
    });

  } catch (error) {
    const fallbackReply = generateDatasetFallbackReply('');
    return res.status(200).json({
      reply: fallbackReply,
      modelUsed: 'local-dataset-rag',
      modelName: 'Corvit Grounded Dataset Engine',
      fallbackTier: 4,
      fallback: true,
      latencyMs: Date.now() - startTime,
      source: 'dataset-rule-engine-exception'
    });
  }
};
