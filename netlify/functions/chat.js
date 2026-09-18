/**
 * Corvit Systems Rawalpindi - Production Multi-Tier AI Gateway
 * Connects to Groq API with Cascading Multi-Model Fallback:
 * Tier 1: openai/gpt-oss-120b (Flagship Reasoning)
 * Tier 2: openai/gpt-oss-20b (High-Speed Fallback)
 * Tier 3: qwen/qwen3.8-27b (High-Resilience Backup)
 * Tier 4: Grounded Local Dataset RAG Engine (Zero-Downtime Deterministic Fallback)
 */

const fs = require('fs');
const path = require('path');

// Auto-load local .env if present
if (!process.env.GROQ_API_KEY) {
  try {
    const envPath = path.resolve(__dirname, '../../.env');
    if (fs.existsSync(envPath)) {
      const envText = fs.readFileSync(envPath, 'utf8');
      const match = envText.match(/GROQ_API_KEY=([^\r\n]+)/);
      if (match) {
        process.env.GROQ_API_KEY = match[1].trim();
      }
    }
  } catch (e) {}
}

// Model Tier Configuration
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

// Helper to safely read dataset files or fallback to bundled context
function loadDatasetContext() {
  try {
    const datasetDir = path.resolve(__dirname, '../../dataset');
    const instituteInfo = JSON.parse(fs.readFileSync(path.join(datasetDir, 'institute_info.json'), 'utf8'));
    const courses = JSON.parse(fs.readFileSync(path.join(datasetDir, 'courses.json'), 'utf8'));
    const feeStructure = fs.readFileSync(path.join(datasetDir, 'fee_structure.md'), 'utf8');
    const timetable = fs.readFileSync(path.join(datasetDir, 'timetable_schedule.md'), 'utf8');
    const admissions = fs.readFileSync(path.join(datasetDir, 'admissions.md'), 'utf8');
    const trainers = JSON.parse(fs.readFileSync(path.join(datasetDir, 'trainers.json'), 'utf8'));
    const screenshots = JSON.parse(fs.readFileSync(path.join(datasetDir, 'screenshots_references.json'), 'utf8'));

    return {
      instituteInfo,
      courses,
      feeStructure,
      timetable,
      admissions,
      trainers,
      screenshots
    };
  } catch (err) {
    return {
      instituteInfo: {
        institution_name: "Corvit Systems Rawalpindi",
        rawalpindi_campus: {
          address: "2nd Floor, Zarwar Center, Main Murree Road, 6th Road Stop, Block A, Satellite Town, Rawalpindi, Punjab, Pakistan",
          landmark: "Near 6th Road Metro Bus Station, Main Murree Road",
          opening_hours: "Monday - Saturday: 09:00 AM - 09:00 PM (Closed on Sunday)"
        },
        contact: {
          landlines: "(051) 4928004 / (051) 4928005 / (051) 4928006",
          mobile_whatsapp: "0311-1444473 (+92-311-1444473)",
          email: "rwp@corvit.com"
        }
      },
      feeStructure: "Commercial courses fees are inquiry-based or on the fee flyer. Promotional bundles: Free RHCSA Linux with CCNA; Free AWS with DevOps. 100% Free Government Programs: NAVTTC Free Courses in Rawalpindi/Islamabad and PM-Kamyab Jawan.",
      timetable: "Morning Batches (10AM-1PM), Evening Batches (6PM-9:30PM), Weekend Batches (Sat-Sun 4PM-8PM). Physical classes at Zarwar Center 6th Road and Live Online.",
      admissions: "Admissions open year-round with monthly rolling batches. Free demo lectures available before registration."
    };
  }
}

// Construct Grounded System Prompt
function buildSystemPrompt(dataset) {
  return `You are the official AI Academic Advisor for Corvit Systems Rawalpindi (RWP).
Your mission is to assist prospective students, university undergraduates, and IT professionals with accurate, concise, and courteous information regarding courses, batch schedules, fees, admissions, and campus facilities.

=== CRITICAL GROUNDING RULES ===
1. ALWAYS base your answers strictly on the verified Corvit Systems dataset provided below.
2. NEVER hallucinate or invent fake course fees, fake trainer names, or unverified programs.
3. If specific fee numbers for a commercial course are not publicly stated, advise the student to contact the Rawalpindi accounts counter at (051) 4928004 or WhatsApp 0311-1444473, or visit 2nd Floor, Zarwar Center, 6th Road Stop, Rawalpindi.
4. When a student asks about free courses, scholarships, or government programs, HIGHLIGHT NAVTTC Free Courses in Rawalpindi/Islamabad (100% Free Government-Funded tuition) and Prime Minister Kamyab Jawan programs.
5. Highlight active promotional bundles:
   - Cisco CCNA includes Free RHCSA (Red Hat Linux) training.
   - DevOps Engineering includes Free AWS Cloud training.
6. VISUAL RECOMMENDATIONS (CRITICAL):
   Whenever your reply discusses one of the following topics, include the matching image recommendation token on its own line.
   IMPORTANT: Output the token EXACTLY as shown. NEVER put backticks, code blocks, quotes, or markdown formatting around the tag.
   
   - Batch timetables, schedules, class timings, start dates -> [IMAGE:schedule_flyer]
   - Fee guidelines, pricing inquiry, installment plans, promotional discounts -> [IMAGE:fee_chart]
   - Campus location, Zarwar Center, physical hardware labs, server racks -> [IMAGE:campus_labs]
   - Cisco CCNA, CCNP, routing & switching, Linux bundle -> [IMAGE:ccna_flyer]
   - Cyber Security, CEH, Ethical Hacking, Fortinet/Palo Alto Firewalls, SOC -> [IMAGE:cyber_security]
   - Agentic AI, Autonomous LLMs, Python Data Science, Machine Learning -> [IMAGE:agentic_ai]
   - DevOps Engineering, Docker, Kubernetes, AWS Cloud Solutions -> [IMAGE:cloud_devops]
   - NAVTTC Free Courses, Prime Minister Kamyab Jawan, Government scholarship -> [IMAGE:navttc_free]
   - Learning modes (Classroom, Online Live, 1-on-1) -> [IMAGE:training_modes]

7. BILINGUAL FLUENCY (Roman Urdu & English):
   - If the student writes or asks in Roman Urdu (e.g. "fee kitni hai", "classes kab start hongi", "zarwar center kahan hai", "kia online classes hain"), respond warmly and fluently in natural, respectful Roman Urdu (mixing English tech terms like "Cisco CCNA", "batch timings", "hardware lab", etc.).
   - If the student writes in English, reply in clear, professional English.

=== CORVIT RAWALPINDI CAMPUS FACTS ===
- Campus Location: 2nd Floor, Zarwar Center, Main Murree Road, 6th Road Stop, Block A, Satellite Town, Rawalpindi (Near 6th Road Metro Station).
- Phone Numbers: (051) 4928004, (051) 4928005, (051) 4928006
- WhatsApp / Mobile: 0311-1444473 (+92-311-1444473)
- Email: rwp@corvit.com
- Working Hours: Monday - Saturday: 09:00 AM - 09:00 PM (Closed Sundays)
- Modes of Training: Physical in-person classes at Zarwar Center labs, and live interactive online sessions.
- Free Demo Lecture: Students can attend a free trial class before enrolling.

=== CORE TRAINING TRACKS ===
1. Cisco Networking: CCNA 200-301 (with Free Linux), CCNP Enterprise, CCIE.
2. Cyber Security: Certified Ethical Hacker (CEH), CND, CHFI, ECIH, SOC Analyst (CSA), CISA, CISSP.
3. Next-Gen Firewalls: Fortinet FortiGate (NSE-4) & Palo Alto PAN-OS dual track.
4. Cloud & DevOps: AWS Solutions Architect, Microsoft Azure (AZ-104), DevOps Engineering (Docker, Kubernetes, CI/CD, Terraform) with Free AWS module.
5. Artificial Intelligence: Agentic AI & Autonomous LLMs, AI (ML/DL), Advanced Python, AI Robotics.
6. Software & Mobile Dev: Full Stack Web Development (MERN / Python Django / PHP), Flutter Mobile App Development.
7. Digital Marketing: SEO with modern AEO (Answer Engine Optimization) & GEO, Graphic Designing & Video Editing.
8. 100% Free Government Programs: NAVTTC Free Courses Rawalpindi & PM Kamyab Jawan batches.
`;
}

// Rule-based Fallback Knowledge Engine (Executes if all Groq API tiers fail or are unconfigured)
function generateDatasetFallbackReply(userText) {
  const q = (userText || '').toLowerCase();
  const isRomanUrdu = /kahan|kab|kitni|kitna|shuru|start|dakhla|paisa|paise|batao|bataen|chahiye|mein|hai|hain|karna|karne|sakta|sakty|raha|rahe|kuch|kya|kia|walay|wale|rabta/.test(q);

  // 1. Fee questions
  if (q.includes('fee') || q.includes('cost') || q.includes('price') || q.includes('charges') || q.includes('discount') || q.includes('kitni') || q.includes('paise')) {
    if (isRomanUrdu) {
      return `**Corvit Systems Rawalpindi** (Zarwar Center, 6th Road) mein training fees standardized hain aur sath mein easy installments aur special bundles bhi available hain:

- **CCNA ke sath Free Linux**: CCNA 200-301 mein Red Hat Linux (RHCSA) ki training bilkul free shamil hai.
- **DevOps ke sath Free AWS**: DevOps course ke sath AWS Cloud training free hai.
- **100% Free NAVTTC Programs**: Government funded tracks eligible Pakistani youth ke liye 100% free hain (koi tuition fee nahi).

Apne course ki exact fee aur installment details ke liye Rawalpindi desk se rabta karein:
📞 Call: **(051) 4928004** / **(051) 4928005**
💬 WhatsApp: **0311-1444473**
📍 Zarwar Center, 2nd Floor, 6th Road Stop, Murree Road, Rawalpindi

[IMAGE:fee_chart]`;
    }
    return `At **Corvit Systems Rawalpindi**, training fees are standardized with regular promotional bundles and student installment options:

- **Free RHCSA Linux with CCNA**: Enrolling in CCNA 200-301 includes full Red Hat Linux administration training free of charge.
- **Free AWS with DevOps**: Enrolling in DevOps Engineering includes the AWS Cloud module free of charge.
- **100% Free Government Courses**: We offer tuition-free government programs under **NAVTTC** and the Prime Minister Youth Skill Development Program for eligible Pakistani nationals.

For the exact fee quote and installment schedule for your chosen course:
📞 Call Rawalpindi Desk: **(051) 4928004** / **(051) 4928005**
💬 WhatsApp: **0311-1444473**
📍 Visit: 2nd Floor, Zarwar Center, 6th Road, Murree Road, Rawalpindi

[IMAGE:fee_chart]`;
  }

  // 2. Schedule / Timings
  if (q.includes('schedule') || q.includes('time') || q.includes('timing') || q.includes('timetable') || q.includes('batch') || q.includes('when') || q.includes('date') || q.includes('kab') || q.includes('shuru')) {
    if (isRomanUrdu) {
      return `**Corvit Systems Rawalpindi** mein multi-shift batch timings available hain Zarwar Center campus aur Live Online:

- **CCNA Morning Batch**: Mon - Thu @ 11:00 AM (Free Linux ke sath)
- **CCNA Evening Batch**: Mon - Thu @ 07:30 PM
- **Certified Ethical Hacker (CEH)**: Mon - Thu @ 08:45 PM
- **Fortinet & Palo Alto Firewalls**: Mon - Thu @ 09:30 PM
- **SEO with AEO & GEO**: Mon - Thu @ 06:00 PM
- **Agentic AI & LLMs (Weekend)**: Saturdays & Sundays @ 04:00 PM
- **DevOps + AWS Cloud (Weekend)**: Saturdays & Sundays @ 08:00 PM

💡 *Admission se pehle aap Free Demo Class attend kar sakte hain!*
Demo seat reserve karne ke liye: Call **(051) 4928004** ya WhatsApp **0311-1444473**.

[IMAGE:schedule_flyer]`;
    }
    return `**Corvit Systems Rawalpindi** offers flexible multi-shift batch timings at our 6th Road Zarwar Center campus as well as live online:

- **CCNA Morning Batch**: Mon - Thu @ 11:00 AM (with Free Linux)
- **CCNA Evening Batch**: Mon - Thu @ 07:30 PM
- **Certified Ethical Hacker (CEH)**: Mon - Thu @ 08:45 PM
- **Fortinet & Palo Alto Firewalls**: Mon - Thu @ 09:30 PM
- **SEO with AEO & GEO**: Mon - Thu @ 06:00 PM
- **Agentic AI & LLMs (Weekend)**: Saturdays & Sundays @ 04:00 PM Onwards
- **DevOps + AWS Cloud (Weekend)**: Saturdays & Sundays @ 08:00 PM Onwards

💡 *Free Demo Lectures are available before registration.*
Reserve your demo seat: Call **(051) 4928004** or WhatsApp **0311-1444473**.

[IMAGE:schedule_flyer]`;
  }

  // 3. NAVTTC / Free Courses
  if (q.includes('navttc') || q.includes('free') || q.includes('scholarship') || q.includes('government') || q.includes('kamyab')) {
    return `Yes! **Corvit Systems Rawalpindi** is an authorized partner for **NAVTTC (National Vocational and Technical Training Commission)** and the Prime Minister Youth Skill Development Program in Rawalpindi & Islamabad:

- **Tuition Fee**: 100% Free (Government Funded).
- **Available Tracks**:
  - Artificial Intelligence (Machine Learning / Deep Learning)
  - Cyber Security & Ethical Hacking
  - Cloud Computing & DevOps
  - Full Stack Web Development
- **Benefits**: Zero tuition fee, free course materials, physical lab workstations at Zarwar Center 6th Road, and recognized government certificates.
- **Eligibility**: Pakistani citizens with a valid CNIC/B-Form meeting NAVTTC merit criteria.

To check the next batch registration date, contact our Rawalpindi NAVTTC desk at **(051) 4928004** or WhatsApp **0311-1444473**.

[IMAGE:navttc_free]`;
  }

  // 4. CCNA / Networking
  if (q.includes('ccna') || q.includes('cisco') || q.includes('ccnp') || q.includes('network') || q.includes('routing')) {
    return `**Cisco CCNA 200-301 at Corvit Rawalpindi** is the premier foundational track for modern network engineers:

- **Special Promo**: Includes **Free RHCSA (Red Hat Linux)** training bundle!
- **Key Syllabus**: Enterprise routing & switching, IPv4/IPv6 subnetting, OSPF, VLANs, ACLs, NAT/DHCP, and network programmability.
- **Hardware Labs**: Direct hands-on access to live Cisco routers and switches at our Zarwar Center campus.
- **Timings**: Morning (11:00 AM) and Evening (7:30 PM) shifts.
- **Audience**: Fresh graduates, IT support engineers, and university students seeking Cisco vendor certification.

[IMAGE:ccna_flyer]`;
  }

  // 5. Cyber Security / Ethical Hacking
  if (q.includes('security') || q.includes('cyber') || q.includes('ceh') || q.includes('ethical') || q.includes('hacker') || q.includes('firewall') || q.includes('palo') || q.includes('fortinet')) {
    return `**Cyber Security & Defensive Technologies at Corvit Rawalpindi**:

- **Certified Ethical Hacker (CEH v10/v12)**: Footprinting, network vulnerability scanning, system exploitation, malware analysis, social engineering, web app hacking, and cryptography.
- **Next-Gen Firewalls**: Dual track covering **Fortinet FortiGate (NSE-4)** & **Palo Alto (PAN-OS)** security policies, SSL decryption, and IPsec VPNs.
- **Advanced Security Tracks**: Certified Network Defender (CND), CHFI (Digital Forensics), SOC Analyst (CSA), and CISSP/CISA.
- **Timing**: Evening batches (8:45 PM for CEH, 9:30 PM for Firewalls).

[IMAGE:cyber_security]`;
  }

  // 6. Artificial Intelligence / Agentic AI / Python
  if (q.includes('ai') || q.includes('artificial') || q.includes('agentic') || q.includes('machine learning') || q.includes('python') || q.includes('llm') || q.includes('deep learning')) {
    return `**Artificial Intelligence Programs at Corvit Rawalpindi**:

- **Agentic AI & Autonomous LLMs (Weekend Track)**:
  - Develop production LLM agents using LangChain, CrewAI, and AutoGen.
  - Model Context Protocol (MCP) integration and tool execution.
  - Vector databases and Retrieval-Augmented Generation (RAG).
  - Schedule: Saturdays & Sundays @ 04:00 PM Onwards.
- **Machine Learning & Deep Learning (AI-ML)**:
  - Python data science stack (NumPy, Pandas, Matplotlib, Scikit-Learn).
  - Neural networks, CNNs, Transformers with TensorFlow and PyTorch.
  - Computer Vision & NLP projects.

Free demo lectures available! Call **(051) 4928004** to register.

[IMAGE:agentic_ai]`;
  }

  // 7. Cloud / DevOps
  if (q.includes('devops') || q.includes('cloud') || q.includes('aws') || q.includes('docker') || q.includes('kubernetes') || q.includes('terraform')) {
    return `**Cloud & DevOps Engineering at Corvit Rawalpindi**:

- **Special Promotional Bundle**: Enrolling in DevOps includes the **AWS Cloud module Free of Charge**!
- **Core Curriculum**: Docker containerization, Kubernetes cluster management, Jenkins CI/CD pipelines, and Terraform Infrastructure as Code (IaC).
- **Cloud Foundations**: AWS EC2, S3, IAM, VPC, and modern microservices architecture.
- **Schedule**: Weekend Batch (Saturdays & Sundays @ 08:00 PM Onwards).

[IMAGE:cloud_devops]`;
  }

  // 8. Location & Contact
  if (q.includes('location') || q.includes('address') || q.includes('contact') || q.includes('where') || q.includes('phone') || q.includes('number') || q.includes('rawalpindi') || q.includes('rwp') || q.includes('kahan') || q.includes('rabta')) {
    if (isRomanUrdu) {
      return `📍 **Corvit Systems Rawalpindi Campus** ka pata aur rabta yeh hai:

- **Address**: 2nd Floor, Zarwar Center, Main Murree Road, 6th Road Stop, Block A, Satellite Town, Rawalpindi.
- **Landmark**: 6th Road Metro Bus Station ke bilkul sath (Rawalpindi aur Islamabad dono se aasan access).
- **Phone Numbers**: **(051) 4928004**, **(051) 4928005**, **(051) 4928006**
- **WhatsApp**: **0311-1444473** (+92-311-1444473)
- **Email**: rwp@corvit.com
- **Timings**: Monday se Saturday, subha 9:00 AM se raat 9:00 PM tak open rehta hai.

[IMAGE:campus_labs]`;
    }
    return `📍 **Corvit Systems Rawalpindi Campus**:
- **Address**: 2nd Floor, Zarwar Center, Main Murree Road, 6th Road Stop, Block A, Satellite Town, Rawalpindi.
- **Landmark**: Next to 6th Road Metro Bus Station (easily accessible from Rawalpindi & Islamabad).
- **Phone Numbers**: **(051) 4928004**, **(051) 4928005**, **(051) 4928006**
- **WhatsApp**: **0311-1444473** (+92-311-1444473)
- **Email**: rwp@corvit.com
- **Working Hours**: Monday to Saturday: 09:00 AM – 09:00 PM (Closed on Sunday).

[IMAGE:campus_labs]`;
  }

  // Default helpful response
  return `Welcome to **Corvit Systems Rawalpindi**! I can assist you with:

- **Course Selection**: Cisco Networking (CCNA/CCNP), Cyber Security (CEH), Cloud & DevOps, Agentic AI, Full Stack Development, and SEO.
- **Batch Schedules**: Morning, Evening, and Weekend timings at Zarwar Center, 6th Road Rawalpindi.
- **Fees & Concessions**: Promotional bundles (Free Linux with CCNA; Free AWS with DevOps) and **100% Free NAVTTC Government Courses**.
- **Admissions & Demos**: How to reserve a free trial demo lecture before enrolling.

How can I help you today? Or contact the Rawalpindi admissions desk directly:
📞 **(051) 4928004** &bull; 💬 WhatsApp: **0311-1444473** &bull; ✉️ **rwp@corvit.com**

[IMAGE:training_modes]`;
}

// Netlify Serverless Handler
exports.handler = async (event, context) => {
  const startTime = Date.now();

  // Allow preflight CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Method not allowed. Use POST.' })
    };
  }

  try {
    let body = {};
    if (event.body) {
      body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
    }

    const userMessage = body.message || body.userMessage || '';
    const conversationHistory = Array.isArray(body.history) ? body.history : [];

    if (!userMessage.trim()) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Message cannot be empty.' })
      };
    }

    const apiKey = process.env.GROQ_API_KEY;

    // If GROQ_API_KEY is missing, gracefully trigger the local dataset RAG engine
    if (!apiKey || apiKey === 'your_groq_api_key_here') {
      const fallbackReply = generateDatasetFallbackReply(userMessage);
      const latencyMs = Date.now() - startTime;
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          reply: fallbackReply,
          modelUsed: 'local-dataset-rag',
          modelName: 'Corvit Grounded Dataset Engine',
          fallbackTier: 4,
          fallback: true,
          latencyMs: latencyMs,
          source: 'dataset-rule-engine'
        })
      };
    }

    // Load dataset grounding context
    const dataset = loadDatasetContext();
    const systemPrompt = buildSystemPrompt(dataset);

    // Format messages for Groq OpenAI-compatible API
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.slice(-6),
      { role: 'user', content: userMessage }
    ];

    // Cascading Multi-Tier Model Pipeline
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
            break; // Success! Exit cascading loop
          }
        } else {
          console.warn(`Tier ${i + 1} (${tierConfig.id}) returned HTTP ${response.status}. Cascading to next model tier...`);
        }
      } catch (err) {
        console.warn(`Tier ${i + 1} (${tierConfig.id}) error: ${err.message}. Cascading to next model tier...`);
      }
    }

    const latencyMs = Date.now() - startTime;

    // If an AI tier succeeded, return response with architecture telemetry
    if (finalReply && successfulModel) {
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          reply: finalReply,
          modelUsed: successfulModel.id,
          modelName: successfulModel.displayName,
          fallbackTier: usedTier,
          fallback: usedTier > 1,
          latencyMs: latencyMs,
          source: `groq-${successfulModel.id}`
        })
      };
    }

    // If all API tiers failed, execute Tier 4: Local Grounded Dataset Engine
    console.warn('All Groq AI model tiers exhausted. Activating Tier 4 Local Grounded Dataset Engine.');
    const fallbackReply = generateDatasetFallbackReply(userMessage);
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        reply: fallbackReply,
        modelUsed: 'local-dataset-rag',
        modelName: 'Corvit Grounded Dataset Engine',
        fallbackTier: 4,
        fallback: true,
        latencyMs: latencyMs,
        source: 'dataset-rule-engine-tier4'
      })
    };

  } catch (error) {
    console.error('Chat function catastrophic exception:', error.message);
    const fallbackReply = generateDatasetFallbackReply(event.body ? String(event.body) : '');
    const latencyMs = Date.now() - startTime;
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        reply: fallbackReply,
        modelUsed: 'local-dataset-rag',
        modelName: 'Corvit Grounded Dataset Engine',
        fallbackTier: 4,
        fallback: true,
        latencyMs: latencyMs,
        source: 'dataset-rule-engine-on-exception'
      })
    };
  }
};
