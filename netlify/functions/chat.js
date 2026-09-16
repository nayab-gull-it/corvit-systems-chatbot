/**
 * Corvit Systems Rawalpindi - Netlify Serverless Chat Function
 * Connects to Groq API (gpt-oss-120b) with dataset grounding & graceful rule-based fallback.
 */

const fs = require('fs');
const path = require('path');

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
    // Fallback bundled dataset summary for standalone serverless deployment
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
6. Contextual Image Recommendations:
   When helpful, recommend relevant visual previews by including exact tags:
   - [IMAGE:schedule_flyer] -> For batch timetables, class times, or dates.
   - [IMAGE:fee_chart] -> For fee guidelines, pricing, or promotional discounts.
   - [IMAGE:campus_labs] -> For campus infrastructure, hardware racks, or Zarwar Center facilities.
   - [IMAGE:ccna_flyer] -> For Cisco CCNA or networking inquiries.

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

// Rule-based Fallback Knowledge Engine (Executes if Groq API is unavailable or unconfigured)
function generateDatasetFallbackReply(userText) {
  const q = (userText || '').toLowerCase();

  // 1. Fee questions
  if (q.includes('fee') || q.includes('cost') || q.includes('price') || q.includes('charges') || q.includes('discount')) {
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
  if (q.includes('schedule') || q.includes('time') || q.includes('timing') || q.includes('timetable') || q.includes('batch') || q.includes('when') || q.includes('date')) {
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

To check the next batch registration date, contact our Rawalpindi NAVTTC desk at **(051) 4928004** or WhatsApp **0311-1444473**.`;
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

[IMAGE:campus_labs]`;
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

Free demo lectures available! Call **(051) 4928004** to register.`;
  }

  // 7. Location & Contact
  if (q.includes('location') || q.includes('address') || q.includes('contact') || q.includes('where') || q.includes('phone') || q.includes('number') || q.includes('rawalpindi') || q.includes('rwp')) {
    return `📍 **Corvit Systems Rawalpindi Campus**:
- **Address**: 2nd Floor, Zarwar Center, Main Murree Road, 6th Road Stop, Block A, Satellite Town, Rawalpindi.
- **Landmark**: Next to 6th Road Metro Bus Station (easily accessible from Rawalpindi & Islamabad).
- **Phone Numbers**: **(051) 4928004**, **(051) 4928005**, **(051) 4928006**
- **WhatsApp**: **0311-1444473** (+92-311-1444473)
- **Email**: rwp@corvit.com
- **Working Hours**: Monday to Saturday: 09:00 AM – 09:00 PM (Closed on Sunday).

[IMAGE:campus_labs]`;
  }

  // 8. Beginner Course Recommendations
  if (q.includes('beginner') || q.includes('start') || q.includes('recommend') || q.includes('best course') || q.includes('fresh') || q.includes('career')) {
    return `For beginners starting their career in IT at **Corvit Systems Rawalpindi**, here are the top recommended tracks:

1. **Cisco CCNA 200-301 (with Free Linux)**: The most globally respected entry point into enterprise IT and network engineering. No prior coding experience required.
2. **Full Stack Web Development**: Ideal if you enjoy coding, building web apps, and freelancing (HTML/CSS/JS, React, Node.js, Python).
3. **Advanced Python & Data Science**: Perfect for beginners interested in data analytics and artificial intelligence.
4. **SEO with AEO & GEO**: Fastest entry into digital marketing, search optimization, and AI content strategy.

💡 We recommend attending a **Free Demo Class** at our 6th Road Zarwar Center campus. Call **(051) 4928004** or WhatsApp **0311-1444473** to speak with an advisor!`;
  }

  // Default helpful response
  return `Welcome to **Corvit Systems Rawalpindi**! I can assist you with:

- **Course Selection**: Cisco Networking (CCNA/CCNP), Cyber Security (CEH), Cloud & DevOps, Agentic AI, Full Stack Development, and SEO.
- **Batch Schedules**: Morning, Evening, and Weekend timings at Zarwar Center, 6th Road Rawalpindi.
- **Fees & Concessions**: Promotional bundles (Free Linux with CCNA; Free AWS with DevOps) and **100% Free NAVTTC Government Courses**.
- **Admissions & Demos**: How to reserve a free trial demo lecture before enrolling.

How can I help you today? Or contact the Rawalpindi admissions desk directly:
📞 **(051) 4928004** &bull; 💬 WhatsApp: **0311-1444473** &bull; ✉️ **rwp@corvit.com**`;
}

// Netlify Serverless Handler
exports.handler = async (event, context) => {
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

    // If GROQ_API_KEY is not configured, gracefully trigger the dataset fallback engine
    if (!apiKey || apiKey === 'your_groq_api_key_here') {
      const fallbackReply = generateDatasetFallbackReply(userMessage);
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          reply: fallbackReply,
          fallback: true,
          source: 'dataset-rule-engine',
          note: 'Groq API key pending configuration. Answer served from grounded Corvit dataset.'
        })
      };
    }

    // Load dataset grounding context
    const dataset = loadDatasetContext();
    const systemPrompt = buildSystemPrompt(dataset);

    // Format messages for Groq OpenAI-compatible API
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.slice(-6), // Send last 6 messages for context
      { role: 'user', content: userMessage }
    ];

    // Call Groq API with gpt-oss-120b and 10-second timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    let groqResponse;
    try {
      groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-oss-120b',
          messages: messages,
          temperature: 0.3,
          max_tokens: 1000
        }),
        signal: controller.signal
      });
    } finally {
      clearTimeout(timeoutId);
    }

    if (!groqResponse.ok) {
      console.warn(`Groq API returned HTTP ${groqResponse.status}. Falling back to dataset engine.`);
      const fallbackReply = generateDatasetFallbackReply(userMessage);
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          reply: fallbackReply,
          fallback: true,
          source: 'dataset-rule-engine-after-api-warning'
        })
      };
    }

    const data = await groqResponse.json();
    const aiReply = data.choices && data.choices[0] && data.choices[0].message
      ? data.choices[0].message.content
      : generateDatasetFallbackReply(userMessage);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        reply: aiReply,
        fallback: false,
        source: 'groq-gpt-oss-120b'
      })
    };

  } catch (error) {
    console.error('Chat function error:', error.message);

    // Never break: always return grounded dataset response
    const safeUserQuery = (event.body && JSON.parse(event.body).message) || '';
    const fallbackReply = generateDatasetFallbackReply(safeUserQuery);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        reply: fallbackReply,
        fallback: true,
        source: 'dataset-rule-engine-on-exception'
      })
    };
  }
};
