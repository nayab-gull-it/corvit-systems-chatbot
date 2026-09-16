// Corvit Systems Rawalpindi - Chatbot Client-side Logic

(function() {
  // DOM Elements
  const chatLauncherBtn = document.getElementById('chat-launcher-btn');
  const chatTeaserPill = document.getElementById('chat-teaser-pill');
  const chatbotWidget = document.getElementById('chatbot-widget');
  const chatCloseBtn = document.getElementById('chat-close-btn');
  const chatClearBtn = document.getElementById('chat-clear-btn');
  const chatMessages = document.getElementById('chat-messages');
  const chatInputForm = document.getElementById('chat-input-form');
  const chatInputText = document.getElementById('chat-input-text');
  const chatSendBtn = document.getElementById('chat-send-btn');
  const chatTypingIndicator = document.getElementById('chat-typing-indicator');
  const suggestionChips = document.querySelectorAll('.suggestion-chip');
  const heroChatTrigger = document.getElementById('hero-chat-trigger');
  const headerAskAiBtn = document.getElementById('header-ask-ai-btn');
  const mobileAskAiBtn = document.getElementById('mobile-ask-ai-btn');

  // State
  let conversationHistory = [];
  let isAwaitingResponse = false;

  // Real Image Catalog for Contextual Rendering
  const imageAssets = {
    schedule_flyer: {
      title: "Corvit Rawalpindi Batch Schedule Flyer",
      url: "https://corvit.com/systems/wp-content/uploads/2026/09/Lahore-Sep-2026.png",
      caption: "Monthly Batch Timings Flyer"
    },
    fee_chart: {
      title: "Corvit Systems Official Fee Structure",
      url: "https://corvit.com/systems/wp-content/uploads/2026/07/Lahore-Fee-2026.png",
      caption: "Official Fee Flyer & Promos"
    },
    campus_labs: {
      title: "Corvit Systems Enterprise Hardware Labs",
      url: "https://corvit.com/systems/wp-content/uploads/2023/04/photo_2020-07-28_20-01-38.jpg",
      caption: "Enterprise Hardware Labs & Equipment"
    },
    ccna_flyer: {
      title: "Cisco CCNA + Free Linux Bundle Flyer",
      url: "https://corvit.com/systems/wp-content/uploads/2023/04/sCCNA.png",
      caption: "CCNA 200-301 Track Banner"
    }
  };

  // Toggle Widget Visibility
  function openChat() {
    if (chatbotWidget) {
      chatbotWidget.classList.remove('widget-closed');
      chatbotWidget.classList.add('widget-open');
      if (chatInputText) {
        setTimeout(() => chatInputText.focus(), 350);
      }
    }
    if (chatTeaserPill) {
      chatTeaserPill.classList.add('hidden');
    }
  }

  function closeChat() {
    if (chatbotWidget) {
      chatbotWidget.classList.remove('widget-open');
      chatbotWidget.classList.add('widget-closed');
    }
  }

  function toggleChat() {
    if (chatbotWidget && chatbotWidget.classList.contains('widget-open')) {
      closeChat();
    } else {
      openChat();
    }
  }

  // Clear Chat History
  function clearChat() {
    conversationHistory = [];
    if (chatMessages) {
      chatMessages.innerHTML = `
        <div class="flex gap-2.5 items-start">
          <div class="w-7 h-7 rounded-full bg-corvit-red text-white flex items-center justify-center text-xs shrink-0 mt-0.5 shadow-sm">
            <i class="fa-solid fa-robot"></i>
          </div>
          <div class="bg-white rounded-2xl rounded-tl-sm p-3.5 border border-slate-200 shadow-sm text-slate-800 text-xs leading-relaxed max-w-[85%]">
            <p class="font-semibold text-slate-900 mb-1">Conversation cleared 🔄</p>
            <p class="text-slate-600">I am ready to help you with Corvit Rawalpindi courses, batch schedules, fees, or admissions. What would you like to know?</p>
          </div>
        </div>
      `;
    }
  }

  // Markdown Formatter Utility
  function formatMarkdown(text) {
    if (!text) return '';

    let formatted = text
      // Escape basic HTML
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Bold **text**
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-slate-900">$1</strong>');

    // Italic *text*
    formatted = formatted.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');

    // Markdown links [text](url)
    formatted = formatted.replace(/\[(.*?)\]\((https?:\/\/.*?)\)/g, '<a href="$2" target="_blank" rel="noopener" class="text-corvit-red underline hover:text-corvit-red-dark font-medium">$1</a>');

    // Bullet points (lines starting with - or * )
    formatted = formatted.replace(/^[-\*]\s+(.*)$/gm, '<li class="ml-4 list-disc text-slate-700 leading-snug">$1</li>');

    // Numbered lists (lines starting with 1. 2. )
    formatted = formatted.replace(/^(\d+)\.\s+(.*)$/gm, '<li class="ml-4 list-decimal text-slate-700 leading-snug"><strong class="text-slate-900">$1.</strong> $2</li>');

    // Paragraph breaks
    formatted = formatted.replace(/\n\n/g, '<div class="h-2"></div>');
    formatted = formatted.replace(/\n/g, '<br>');

    // Replace [IMAGE:tag] with visual preview cards
    formatted = formatted.replace(/\[IMAGE:([a-zA-Z0-9_]+)\]/g, (match, imageId) => {
      const img = imageAssets[imageId];
      if (!img) return '';
      return `
        <div class="my-3 p-2 bg-slate-100 rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <a href="${img.url}" target="_blank" rel="noopener" class="block group relative overflow-hidden rounded-lg">
            <img src="${img.url}" alt="${img.title}" class="w-full h-36 object-cover rounded-lg group-hover:scale-105 transition-transform duration-300" loading="lazy">
            <div class="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1.5">
              <i class="fa-solid fa-up-right-and-down-left-from-center"></i> Click to Enlarge
            </div>
          </a>
          <div class="pt-2 px-1 flex items-center justify-between text-[11px] text-slate-600">
            <span class="font-bold text-slate-800 truncate">${img.caption}</span>
            <a href="${img.url}" target="_blank" rel="noopener" class="text-corvit-red font-semibold hover:underline shrink-0 ml-2">Open &rarr;</a>
          </div>
        </div>
      `;
    });

    return formatted;
  }

  // Append Message Bubble to UI
  function appendMessage(sender, text, isError = false) {
    if (!chatMessages) return;

    const messageRow = document.createElement('div');
    messageRow.className = sender === 'user' ? 'flex justify-end' : 'flex gap-2.5 items-start';

    if (sender === 'user') {
      messageRow.innerHTML = `
        <div class="bg-corvit-navy text-white rounded-2xl rounded-tr-sm px-4 py-2.5 shadow-sm text-xs leading-relaxed max-w-[85%] break-words">
          ${text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}
        </div>
      `;
    } else {
      const formattedContent = formatMarkdown(text);
      messageRow.innerHTML = `
        <div class="w-7 h-7 rounded-full bg-corvit-red text-white flex items-center justify-center text-xs shrink-0 mt-0.5 shadow-sm">
          <i class="fa-solid fa-robot"></i>
        </div>
        <div class="bg-white rounded-2xl rounded-tl-sm p-3.5 border ${isError ? 'border-red-300 bg-red-50 text-red-800' : 'border-slate-200 text-slate-800'} shadow-sm text-xs leading-relaxed max-w-[85%] break-words">
          ${formattedContent}
        </div>
      `;
    }

    chatMessages.appendChild(messageRow);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  // Client-side Fallback Knowledge Engine (used if backend serverless endpoint is unavailable)
  function getClientFallbackResponse(userText) {
    const q = (userText || '').toLowerCase();

    if (q.includes('fee') || q.includes('cost') || q.includes('price') || q.includes('discount')) {
      return `At **Corvit Systems Rawalpindi**, course fees are standardized with regular student installment plans and promotional bundles:\n\n- **Free RHCSA Linux with CCNA**: Full Red Hat Linux administration included free when enrolling in CCNA 200-301.\n- **Free AWS Cloud with DevOps**: Full AWS Cloud module included free with the DevOps track.\n- **100% Free NAVTTC Courses**: Tuition-free technical training funded by the Government of Pakistan for eligible youth.\n\nFor official commercial course fee quotes:\n📞 Call Rawalpindi: **(051) 4928004** / **(051) 4928005**\n💬 WhatsApp: **0311-1444473**\n📍 Visit: 2nd Floor, Zarwar Center, 6th Road, Murree Road, Rawalpindi\n\n[IMAGE:fee_chart]`;
    }

    if (q.includes('schedule') || q.includes('time') || q.includes('timing') || q.includes('batch') || q.includes('when')) {
      return `**Corvit Systems Rawalpindi** offers flexible batch timings at our Zarwar Center 6th Road campus and live online:\n\n- **CCNA Morning**: Mon - Thu @ 11:00 AM (Free Linux included)\n- **CCNA Evening**: Mon - Thu @ 07:30 PM\n- **Certified Ethical Hacker (CEH)**: Mon - Thu @ 08:45 PM\n- **Fortinet & Palo Alto Firewalls**: Mon - Thu @ 09:30 PM\n- **SEO with AEO & GEO**: Mon - Thu @ 06:00 PM\n- **Agentic AI & LLMs (Weekend)**: Sat & Sun @ 04:00 PM\n- **DevOps + AWS Cloud (Weekend)**: Sat & Sun @ 08:00 PM\n\n💡 *Free Demo Lectures are available before registration.*\nReserve your seat: Call **(051) 4928004** or WhatsApp **0311-1444473**.\n\n[IMAGE:schedule_flyer]`;
    }

    if (q.includes('navttc') || q.includes('free') || q.includes('scholarship') || q.includes('kamyab')) {
      return `Yes! **Corvit Systems Rawalpindi** is an authorized partner for **NAVTTC** (National Vocational & Technical Training Commission) in the Twin Cities:\n\n- **Tuition**: 100% Free (Government Funded).\n- **Available Tracks**: AI (ML/DL), Cyber Security & Ethical Hacking, Cloud Computing, and Full Stack Web Development.\n- **Benefits**: Zero tuition fee, free course materials, physical enterprise lab access at 6th Road Zarwar Center, and government certificates.\n- **Eligibility**: Pakistani nationals with valid CNIC/B-Form meeting merit criteria.\n\nContact the Rawalpindi NAVTTC desk at **(051) 4928004** or WhatsApp **0311-1444473**.`;
    }

    if (q.includes('ccna') || q.includes('cisco') || q.includes('network') || q.includes('routing')) {
      return `**Cisco CCNA 200-301 at Corvit Rawalpindi** is the premier foundational track for modern network engineers:\n\n- **Special Promo**: Includes **Free RHCSA (Red Hat Linux)** training bundle!\n- **Key Topics**: Enterprise routing & switching, IPv4/IPv6 subnetting, OSPF, VLANs, ACLs, NAT/DHCP, and network automation.\n- **Hardware Labs**: Live Cisco physical routers and switches at Zarwar Center campus.\n- **Shifts**: Morning (11:00 AM) and Evening (7:30 PM).\n\n[IMAGE:ccna_flyer]`;
    }

    if (q.includes('security') || q.includes('cyber') || q.includes('ceh') || q.includes('ethical') || q.includes('firewall')) {
      return `**Cyber Security & Defensive Technologies at Corvit Rawalpindi**:\n\n- **Certified Ethical Hacker (CEH v10/v12)**: Footprinting, network vulnerability scanning, system exploitation, malware analysis, social engineering, web app hacking, and cryptography.\n- **Next-Gen Firewalls**: Dual track covering **Fortinet FortiGate (NSE-4)** & **Palo Alto (PAN-OS)** security policies, SSL decryption, and IPsec VPNs.\n- **Advanced Tracks**: Certified Network Defender (CND), CHFI (Forensics), and CISSP/CISA.\n\n[IMAGE:campus_labs]`;
    }

    if (q.includes('location') || q.includes('address') || q.includes('contact') || q.includes('where') || q.includes('phone') || q.includes('rwp') || q.includes('rawalpindi')) {
      return `📍 **Corvit Systems Rawalpindi Campus**:\n- **Address**: 2nd Floor, Zarwar Center, Main Murree Road, 6th Road Stop, Block A, Satellite Town, Rawalpindi.\n- **Landmark**: Near 6th Road Metro Bus Station (easily accessible from Rawalpindi & Islamabad).\n- **Phone**: **(051) 4928004**, **(051) 4928005**, **(051) 4928006**\n- **WhatsApp**: **0311-1444473** (+92-311-1444473)\n- **Email**: rwp@corvit.com\n- **Hours**: Monday to Saturday: 09:00 AM – 09:00 PM (Closed Sunday).\n\n[IMAGE:campus_labs]`;
    }

    if (q.includes('beginner') || q.includes('start') || q.includes('recommend') || q.includes('fresh')) {
      return `For beginners starting their career in IT at **Corvit Systems Rawalpindi**, here are our top recommended tracks:\n\n1. **Cisco CCNA 200-301 (with Free Linux)**: The most globally respected entry point into enterprise IT and network engineering. No prior coding required.\n2. **Full Stack Web Development**: Ideal if you enjoy building web apps and freelancing (HTML/CSS/JS, React, Node.js, Python).\n3. **Advanced Python & Data Science**: Perfect for beginners interested in data analytics and artificial intelligence.\n4. **SEO with AEO & GEO**: Fastest entry into digital marketing, search optimization, and AI content strategy.\n\n💡 Attend a **Free Demo Class** at our 6th Road Zarwar Center campus. Call **(051) 4928004** or WhatsApp **0311-1444473** to speak with an advisor!`;
    }

    return `Welcome to **Corvit Systems Rawalpindi**! I can assist you with:\n\n- **Course Guidance**: Cisco Networking, Cyber Security, Cloud, DevOps, AI, Full Stack Development, and SEO.\n- **Batch Schedules**: Morning, Evening, and Weekend timings at Zarwar Center, 6th Road Rawalpindi.\n- **Fees & Concessions**: Promotional bundles (Free Linux with CCNA; Free AWS with DevOps) and **100% Free NAVTTC Government Courses**.\n- **Admissions**: Reserving a free trial demo lecture before enrolling.\n\nHow can I help you today? Or contact the Rawalpindi admissions desk directly:\n📞 **(051) 4928004** &bull; 💬 WhatsApp: **0311-1444473** &bull; ✉️ **rwp@corvit.com**`;
  }

  // Send Message to Serverless Function (with Automatic Fallback)
  async function sendMessage(text) {
    const trimmed = text.trim();
    if (!trimmed || isAwaitingResponse) return;

    // Display user message in UI
    appendMessage('user', trimmed);
    conversationHistory.push({ role: 'user', content: trimmed });

    if (chatInputText) chatInputText.value = '';
    isAwaitingResponse = true;

    if (chatSendBtn) chatSendBtn.disabled = true;
    if (chatTypingIndicator) chatTypingIndicator.classList.remove('hidden');
    if (chatMessages) chatMessages.scrollTop = chatMessages.scrollHeight;

    try {
      // Attempt to call Netlify serverless function
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          history: conversationHistory.slice(-6)
        })
      });

      if (response.ok) {
        const data = await response.json();
        const reply = data.reply || getClientFallbackResponse(trimmed);
        appendMessage('assistant', reply);
        conversationHistory.push({ role: 'assistant', content: reply });
      } else {
        // HTTP error (e.g. 404 if running on simple static server without Netlify dev)
        console.warn('Serverless endpoint not reachable, running client fallback engine.');
        const fallbackReply = getClientFallbackResponse(trimmed);
        appendMessage('assistant', fallbackReply);
        conversationHistory.push({ role: 'assistant', content: fallbackReply });
      }
    } catch (networkError) {
      // Network/CORS/fetch error -> run instant dataset fallback
      console.warn('Network fetch error, switching to dataset fallback engine:', networkError.message);
      const fallbackReply = getClientFallbackResponse(trimmed);
      appendMessage('assistant', fallbackReply);
      conversationHistory.push({ role: 'assistant', content: fallbackReply });
    } finally {
      isAwaitingResponse = false;
      if (chatSendBtn) chatSendBtn.disabled = false;
      if (chatTypingIndicator) chatTypingIndicator.classList.add('hidden');
      if (chatInputText) chatInputText.focus();
    }
  }

  // Public helper to open chat and immediately query
  window.openChatWithPrompt = function(promptText) {
    openChat();
    if (promptText) {
      sendMessage(promptText);
    }
  };

  // Event Listeners
  if (chatLauncherBtn) {
    chatLauncherBtn.addEventListener('click', toggleChat);
  }

  if (chatTeaserPill) {
    chatTeaserPill.addEventListener('click', openChat);
  }

  if (chatCloseBtn) {
    chatCloseBtn.addEventListener('click', closeChat);
  }

  if (chatClearBtn) {
    chatClearBtn.addEventListener('click', clearChat);
  }

  if (heroChatTrigger) {
    heroChatTrigger.addEventListener('click', openChat);
  }

  if (headerAskAiBtn) {
    headerAskAiBtn.addEventListener('click', openChat);
  }

  if (mobileAskAiBtn) {
    mobileAskAiBtn.addEventListener('click', openChat);
  }

  if (chatInputForm) {
    chatInputForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (chatInputText) {
        sendMessage(chatInputText.value);
      }
    });
  }

  suggestionChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const prompt = chip.getAttribute('data-prompt');
      if (prompt) {
        sendMessage(prompt);
      }
    });
  });

})();
