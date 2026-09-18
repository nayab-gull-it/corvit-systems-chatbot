// Corvit Systems Rawalpindi - Flagship AI Chatbot Client Logic
// Features: Multi-Tier Cascading Fallback Telemetry, Two-Way Voice AI (Urdu/English),
// Interactive High-Res Lightbox, 1-Click WhatsApp Booking, Message Copy, Session Export, Expanded Mode

(function() {
  // DOM Elements
  const chatLauncherBtn = document.getElementById('chat-launcher-btn');
  const chatTeaserPill = document.getElementById('chat-teaser-pill');
  const chatbotWidget = document.getElementById('chatbot-widget');
  const chatCloseBtn = document.getElementById('chat-close-btn');
  const chatClearBtn = document.getElementById('chat-clear-btn');
  const chatExpandBtn = document.getElementById('chat-expand-btn');
  const expandIcon = document.getElementById('expand-icon');
  const chatExportBtn = document.getElementById('chat-export-btn');
  const chatTtsToggleBtn = document.getElementById('chat-tts-toggle-btn');
  const ttsIcon = document.getElementById('tts-icon');
  const engineStatusText = document.getElementById('engine-status-text');
  const chatMessages = document.getElementById('chat-messages');
  const chatInputForm = document.getElementById('chat-input-form');
  const chatInputText = document.getElementById('chat-input-text');
  const chatSendBtn = document.getElementById('chat-send-btn');
  const chatLangBtn = document.getElementById('chat-lang-btn');
  const chatLangLabel = document.getElementById('chat-lang-label');
  const chatMicBtn = document.getElementById('chat-mic-btn');
  const chatVoiceStatus = document.getElementById('chat-voice-status');
  const chatVoiceStatusText = document.getElementById('chat-voice-status-text');
  const chatTypingIndicator = document.getElementById('chat-typing-indicator');
  const suggestionChips = document.querySelectorAll('.suggestion-chip');
  const heroChatTrigger = document.getElementById('hero-chat-trigger');
  const headerAskAiBtn = document.getElementById('header-ask-ai-btn');
  const mobileAskAiBtn = document.getElementById('mobile-ask-ai-btn');

  // Lightbox Modal Elements
  const lightboxModal = document.getElementById('lightbox-modal');
  const lightboxImage = document.getElementById('lightbox-image');
  const lightboxTitle = document.getElementById('lightbox-title');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const lightboxDownloadBtn = document.getElementById('lightbox-download-btn');
  const lightboxWhatsappBtn = document.getElementById('lightbox-whatsapp-btn');
  const lightboxCloseBtn = document.getElementById('lightbox-close-btn');

  // State
  let conversationHistory = [];
  let isAwaitingResponse = false;
  let isVoiceOutputEnabled = true;
  let selectedVoiceLang = 'ur-PK'; // Default to Urdu for Pakistani students
  let isListeningVoice = false;
  let speechRecognitionInstance = null;
  let activeSpeakingBtn = null;
  let isExpandedMode = false;

  // Real & High-Res Image Catalog for Contextual Rendering
  const imageAssets = {
    schedule_flyer: {
      title: "Corvit Rawalpindi Batch Timetable Flyer",
      url: "https://corvit.com/systems/wp-content/uploads/2026/09/Lahore-Sep-2026.png",
      caption: "Official Morning, Evening & Weekend Batch Timetable",
      whatsapp: "Assalam-o-Alaikum Corvit RWP, I want to confirm the upcoming batch schedule for your courses at Zarwar Center (6th Road)."
    },
    fee_chart: {
      title: "Corvit Systems Official Fee Structure",
      url: "https://corvit.com/systems/wp-content/uploads/2026/07/Lahore-Fee-2026.png",
      caption: "Official Fee Flyer & Promotional Concessions",
      whatsapp: "Assalam-o-Alaikum Corvit RWP, please share current course fee details and installment plans for Rawalpindi campus."
    },
    campus_labs: {
      title: "Corvit Systems Enterprise Hardware Labs",
      url: "https://corvit.com/systems/wp-content/uploads/2023/04/photo_2020-07-28_20-01-38.jpg",
      caption: "Enterprise Hardware Labs & Server Racks at Zarwar Center",
      whatsapp: "Assalam-o-Alaikum Corvit RWP, I would like to visit the campus and labs at Zarwar Center (6th Road) for a free demo class."
    },
    ccna_flyer: {
      title: "Cisco CCNA + Free Linux Bundle Banner",
      url: "https://corvit.com/systems/wp-content/uploads/2023/04/sCCNA.png",
      caption: "Cisco CCNA 200-301 with Bundled Free RHCSA Linux",
      whatsapp: "Assalam-o-Alaikum Corvit RWP, I am interested in enrolling in Cisco CCNA 200-301 with the Free Linux bundle. Please share admission details."
    },
    cyber_security: {
      title: "Cyber Security & CEH Ethical Hacking",
      url: "/dataset/cyber-security-banner.svg",
      caption: "CEH Ethical Hacking & Next-Gen Firewalls (Fortinet/Palo Alto)",
      whatsapp: "Assalam-o-Alaikum Corvit RWP, I want details regarding the Cyber Security & CEH course batch at Rawalpindi."
    },
    agentic_ai: {
      title: "Agentic AI & Autonomous LLMs Track",
      url: "/dataset/agentic-ai-banner.svg",
      caption: "Cutting-Edge Agentic AI, LangChain, CrewAI & Vector RAG",
      whatsapp: "Assalam-o-Alaikum Corvit RWP, I am interested in the Agentic AI & LLMs weekend course. Please book my demo seat."
    },
    cloud_devops: {
      title: "DevOps Engineering & AWS Cloud Track",
      url: "/dataset/devops-cloud-banner.svg",
      caption: "Docker, Kubernetes, CI/CD with Free AWS Cloud Module",
      whatsapp: "Assalam-o-Alaikum Corvit RWP, I want to enroll in DevOps Engineering with Free AWS Cloud. Please share batch timings."
    },
    navttc_free: {
      title: "NAVTTC 100% Free Government IT Courses",
      url: "/dataset/navttc-scholarship-banner.svg",
      caption: "Prime Minister Youth Program - 100% Tuition-Free IT Batches",
      whatsapp: "Assalam-o-Alaikum Corvit RWP, please share information and registration criteria for NAVTTC 100% Free Government courses."
    },
    training_modes: {
      title: "Flexible Training Delivery Modes",
      url: "https://corvit.com/systems/wp-content/uploads/2023/03/class-room-mode.png",
      caption: "Classroom (Zarwar Center) vs Interactive Live Online",
      whatsapp: "Assalam-o-Alaikum Corvit RWP, I want to understand the difference between online live classes and physical labs."
    }
  };

  // Lightbox Modal Controls
  function openLightbox(imageId) {
    const item = imageAssets[imageId];
    if (!item || !lightboxModal) return;

    if (lightboxImage) lightboxImage.src = item.url;
    if (lightboxTitle) lightboxTitle.textContent = item.title;
    if (lightboxCaption) lightboxCaption.textContent = item.caption;
    if (lightboxDownloadBtn) lightboxDownloadBtn.href = item.url;
    if (lightboxWhatsappBtn) {
      const text = item.whatsapp || 'Assalam-o-Alaikum Corvit RWP, I want to inquire about this program.';
      lightboxWhatsappBtn.href = `https://wa.me/923111444473?text=${encodeURIComponent(text)}`;
    }

    lightboxModal.classList.remove('hidden');
    document.body.classList.add('overflow-hidden');
  }

  function closeLightbox() {
    if (lightboxModal) {
      lightboxModal.classList.add('hidden');
      document.body.classList.remove('overflow-hidden');
    }
  }

  if (lightboxCloseBtn) {
    lightboxCloseBtn.addEventListener('click', closeLightbox);
  }

  if (lightboxModal) {
    lightboxModal.addEventListener('click', (e) => {
      if (e.target === lightboxModal) {
        closeLightbox();
      }
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (lightboxModal && !lightboxModal.classList.contains('hidden')) {
        closeLightbox();
      } else if (chatbotWidget && chatbotWidget.classList.contains('widget-open')) {
        closeChat();
      }
    }
  });

  // Toggle Widget Visibility
  function openChat() {
    if (chatbotWidget) {
      chatbotWidget.classList.remove('widget-closed');
      chatbotWidget.classList.add('widget-open');
      if (chatInputText) {
        setTimeout(() => chatInputText.focus(), 250);
      }
    }
    if (chatTeaserPill) {
      chatTeaserPill.classList.add('teaser-hidden');
      chatTeaserPill.style.display = 'none';
    }
    const launcherIcon = document.getElementById('chat-launcher-icon');
    if (launcherIcon) {
      launcherIcon.className = 'fa-solid fa-chevron-down';
    }
    if (chatLauncherBtn) {
      chatLauncherBtn.setAttribute('title', 'Close Corvit AI Chat');
      chatLauncherBtn.setAttribute('aria-expanded', 'true');
    }
  }

  function closeChat() {
    if (chatbotWidget) {
      chatbotWidget.classList.remove('widget-open');
      chatbotWidget.classList.add('widget-closed');
      stopVoiceSpeaking();
      stopVoiceListening();
    }
    if (chatTeaserPill) {
      chatTeaserPill.classList.remove('teaser-hidden');
      chatTeaserPill.style.display = '';
    }
    const launcherIcon = document.getElementById('chat-launcher-icon');
    if (launcherIcon) {
      launcherIcon.className = 'fa-solid fa-robot';
    }
    if (chatLauncherBtn) {
      chatLauncherBtn.setAttribute('title', 'Open Corvit AI Chat');
      chatLauncherBtn.setAttribute('aria-expanded', 'false');
    }
  }

  function toggleChat(e) {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
      e.stopPropagation();
    }
    if (chatbotWidget && chatbotWidget.classList.contains('widget-open')) {
      closeChat();
    } else {
      openChat();
    }
  }

  window.openCorvitChat = openChat;
  window.closeCorvitChat = closeChat;
  window.toggleCorvitChat = toggleChat;

  // Toggle Fullscreen / Wide Mode
  function toggleExpandMode() {
    if (!chatbotWidget) return;
    isExpandedMode = !isExpandedMode;
    if (isExpandedMode) {
      chatbotWidget.classList.add('widget-expanded');
      if (expandIcon) {
        expandIcon.className = 'fa-solid fa-down-left-and-up-right-to-center';
      }
      if (chatExpandBtn) chatExpandBtn.title = 'Dock Window Size';
    } else {
      chatbotWidget.classList.remove('widget-expanded');
      if (expandIcon) {
        expandIcon.className = 'fa-solid fa-up-right-and-down-left-from-center';
      }
      if (chatExpandBtn) chatExpandBtn.title = 'Expand to Wide Mode';
    }
  }

  // Export Chat Session as Clean Markdown Transcript
  function exportChatSession() {
    if (conversationHistory.length === 0) {
      alert('Conversation is empty. Ask a question first to export your consultation summary!');
      return;
    }

    const timestamp = new Date().toLocaleString();
    let transcript = `# Corvit Systems Rawalpindi - AI Academic Consultation\n`;
    transcript += `*Date & Time:* ${timestamp}\n`;
    transcript += `*Campus:* 2nd Floor, Zarwar Center, 6th Road, Rawalpindi\n`;
    transcript += `*Contact:* (051) 4928004 | WhatsApp: 0311-1444473 | rwp@corvit.com\n\n`;
    transcript += `---\n\n`;

    conversationHistory.forEach((item, index) => {
      if (item.role === 'user') {
        transcript += `### 👤 Student Inquiry:\n${item.content}\n\n`;
      } else {
        // Strip image tags from export
        const cleanReply = item.content.replace(/\[IMAGE:[^\]]+\]/g, '');
        transcript += `### 🤖 Corvit AI Advisor:\n${cleanReply}\n\n---\n\n`;
      }
    });

    transcript += `\n*End of Session Summary. To confirm admissions, visit Zarwar Center (6th Road) or chat with a human counselor on WhatsApp: https://wa.me/923111444473*\n`;

    const blob = new Blob([transcript], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Corvit_Rawalpindi_AI_Advice_${Date.now()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Clear Chat History
  function clearChat() {
    conversationHistory = [];
    stopVoiceSpeaking();
    if (chatMessages) {
      chatMessages.innerHTML = `
        <div class="flex gap-2.5 items-start">
          <div class="w-7 h-7 rounded-full bg-corvit-red text-white flex items-center justify-center text-xs shrink-0 mt-0.5 shadow-sm">
            <i class="fa-solid fa-robot"></i>
          </div>
          <div class="bg-white rounded-2xl rounded-tl-sm p-3.5 border border-slate-200 shadow-sm text-slate-800 text-xs leading-relaxed max-w-[88%]">
            <div class="flex items-center justify-between mb-1">
              <p class="font-semibold text-slate-900">Conversation reset 🔄</p>
              <span class="text-[10px] px-1.5 py-0.5 rounded bg-red-50 text-corvit-red font-medium">Bilingual AI</span>
            </div>
            <p class="text-slate-600">I am ready to help you with Corvit Rawalpindi courses, batch schedules, fees, or admissions. You can type or speak in Urdu / English!</p>
          </div>
        </div>
      `;
    }
  }

  // Text-To-Speech (TTS) Voice Readout & Stop Functionality
  function stopVoiceSpeaking() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (activeSpeakingBtn) {
      activeSpeakingBtn.innerHTML = '<i class="fa-solid fa-volume-high"></i>';
      activeSpeakingBtn.classList.remove('text-corvit-red', 'animate-pulse');
      activeSpeakingBtn.classList.add('text-slate-400');
      activeSpeakingBtn.title = 'Awaaz sunein (Listen to answer)';
      activeSpeakingBtn = null;
    }
  }

  function toggleSpeakMessage(rawText, btnElement) {
    if (!('speechSynthesis' in window)) return;

    if (window.speechSynthesis.speaking && activeSpeakingBtn === btnElement) {
      stopVoiceSpeaking();
      return;
    }

    stopVoiceSpeaking();

    // Clean markdown, links, images, tables, emojis from spoken text
    let clean = rawText
      .replace(/\[IMAGE:[^\]]+\]/g, '')
      .replace(/https?:\/\/\S+/g, '')
      .replace(/\|[^\n]+\|/g, '')
      .replace(/[\*\_~`#]/g, '')
      .replace(/[📍📞💬✉️🕒💡🇵🇰🎓🚀✅⚡]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (!clean) return;

    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const hasUrduChars = /[\u0600-\u06FF]/.test(clean);
    if (hasUrduChars) {
      const urVoice = voices.find(v => v.lang.startsWith('ur'));
      if (urVoice) utterance.voice = urVoice;
    } else {
      const enVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('David') || v.name.includes('Mark')));
      if (enVoice) utterance.voice = enVoice;
    }

    utterance.onstart = function() {
      activeSpeakingBtn = btnElement;
      if (btnElement) {
        btnElement.innerHTML = '<i class="fa-solid fa-circle-stop text-corvit-red"></i>';
        btnElement.classList.add('text-corvit-red', 'animate-pulse');
        btnElement.classList.remove('text-slate-400');
        btnElement.title = 'Awaaz band karein (Click to Stop Voice)';
      }
    };

    utterance.onend = function() {
      stopVoiceSpeaking();
    };

    utterance.onerror = function() {
      stopVoiceSpeaking();
    };

    window.speechSynthesis.speak(utterance);
  }

  // Toggle Global Voice Output (Mute/Unmute)
  function toggleVoiceOutput() {
    isVoiceOutputEnabled = !isVoiceOutputEnabled;
    if (ttsIcon) {
      if (isVoiceOutputEnabled) {
        ttsIcon.className = 'fa-solid fa-volume-high text-white';
        chatTtsToggleBtn.title = 'Voice Readout: ON (Click to Mute)';
      } else {
        ttsIcon.className = 'fa-solid fa-volume-xmark text-slate-400';
        chatTtsToggleBtn.title = 'Voice Readout: MUTED (Click to Unmute)';
        stopVoiceSpeaking();
      }
    }
  }

  // Toggle Speech Recognition Language (Urdu vs English)
  function toggleVoiceLanguage() {
    if (selectedVoiceLang === 'ur-PK') {
      selectedVoiceLang = 'en-US';
      if (chatLangLabel) chatLangLabel.textContent = 'EN';
      if (chatLangBtn) chatLangBtn.title = 'Voice Language: English (Click for Urdu)';
    } else {
      selectedVoiceLang = 'ur-PK';
      if (chatLangLabel) chatLangLabel.textContent = 'UR';
      if (chatLangBtn) chatLangBtn.title = 'Voice Language: Urdu (Click for English)';
    }
    if (isListeningVoice) {
      stopVoiceListening();
      startVoiceListening();
    }
  }

  // Speech-To-Text (Voice Dictation via Mic)
  function startVoiceListening() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Voice dictation is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    stopVoiceSpeaking();

    try {
      speechRecognitionInstance = new SpeechRecognition();
      speechRecognitionInstance.continuous = false;
      speechRecognitionInstance.interimResults = true;
      speechRecognitionInstance.lang = selectedVoiceLang;

      speechRecognitionInstance.onstart = function() {
        isListeningVoice = true;
        if (chatMicBtn) chatMicBtn.classList.add('mic-listening');
        if (chatVoiceStatus) chatVoiceStatus.classList.remove('hidden');
        if (chatVoiceStatusText) {
          chatVoiceStatusText.textContent = selectedVoiceLang === 'ur-PK' 
            ? 'Urdu mein bolein... (Listening in Urdu)' 
            : 'Speak in English... (Listening in English)';
        }
      };

      speechRecognitionInstance.onresult = function(event) {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        if (chatInputText) {
          chatInputText.value = transcript;
        }
      };

      speechRecognitionInstance.onerror = function(event) {
        console.warn('Speech recognition error:', event.error);
        stopVoiceListening();
      };

      speechRecognitionInstance.onend = function() {
        stopVoiceListening();
        if (chatInputText && chatInputText.value.trim().length > 1) {
          sendMessage(chatInputText.value);
        }
      };

      speechRecognitionInstance.start();
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      stopVoiceListening();
    }
  }

  function stopVoiceListening() {
    isListeningVoice = false;
    if (speechRecognitionInstance) {
      try { speechRecognitionInstance.stop(); } catch(e) {}
      speechRecognitionInstance = null;
    }
    if (chatMicBtn) chatMicBtn.classList.remove('mic-listening');
    if (chatVoiceStatus) chatVoiceStatus.classList.add('hidden');
  }

  function toggleVoiceListening() {
    if (isListeningVoice) {
      stopVoiceListening();
    } else {
      startVoiceListening();
    }
  }

  // Generate 1-Click WhatsApp Pre-filled Action Link
  function generateWhatsAppCTA(userQuery, replyText) {
    const text = (userQuery + ' ' + replyText).toLowerCase();
    let courseTopic = 'upcoming batches and admissions';

    if (text.includes('ccna') || text.includes('cisco') || text.includes('routing')) {
      courseTopic = 'Cisco CCNA 200-301 (with Free Linux bundle)';
    } else if (text.includes('security') || text.includes('ceh') || text.includes('cyber') || text.includes('ethical')) {
      courseTopic = 'Cyber Security & CEH Ethical Hacking';
    } else if (text.includes('navttc') || text.includes('free') || text.includes('scholarship')) {
      courseTopic = 'NAVTTC 100% Free Government IT Program';
    } else if (text.includes('devops') || text.includes('cloud') || text.includes('aws')) {
      courseTopic = 'DevOps Engineering with AWS Cloud';
    } else if (text.includes('ai') || text.includes('agentic') || text.includes('python')) {
      courseTopic = 'Agentic AI & Advanced Python Track';
    } else if (text.includes('firewall') || text.includes('palo') || text.includes('fortinet')) {
      courseTopic = 'Fortinet & Palo Alto Next-Gen Firewalls';
    }

    const prefilledMessage = `Assalam-o-Alaikum Corvit Rawalpindi, I was exploring the website and I am interested in ${courseTopic} at Zarwar Center (6th Road). Please share registration and batch confirmation details.`;
    const waUrl = `https://wa.me/923111444473?text=${encodeURIComponent(prefilledMessage)}`;

    return `
      <div class="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between">
        <a href="${waUrl}" target="_blank" rel="noopener" class="whatsapp-cta-btn">
          <i class="fa-brands fa-whatsapp text-sm"></i>
          <span>Book Seat / Chat on WhatsApp</span>
        </a>
        <button type="button" class="repeat-voice-btn p-1.5 text-slate-400 hover:text-corvit-red rounded transition text-xs cursor-pointer" title="Awaaz sunein (Listen to answer)">
          <i class="fa-solid fa-volume-high"></i>
        </button>
      </div>
    `;
  }

  // Parse Markdown Tables
  function parseMarkdownTables(text) {
    return text.replace(/((\|[^\n]+\|\r?\n)+)/g, function(tableBlock) {
      const lines = tableBlock.trim().split(/\r?\n/).filter(l => l.trim().startsWith('|'));
      if (lines.length < 2) return tableBlock;

      let html = '<div class="overflow-x-auto my-2"><table class="w-full text-[11px] border border-slate-200 rounded-lg overflow-hidden">';
      
      const headerCols = lines[0].split('|').slice(1, -1).map(c => c.trim());
      html += '<thead><tr class="bg-slate-100 font-semibold text-slate-800">';
      headerCols.forEach(col => {
        html += `<th class="px-2 py-1.5 border-b border-slate-200 text-left">${col}</th>`;
      });
      html += '</tr></thead><tbody>';

      const startIndex = lines[1].includes('---') ? 2 : 1;
      for (let i = startIndex; i < lines.length; i++) {
        const cols = lines[i].split('|').slice(1, -1).map(c => c.trim());
        html += '<tr class="border-b border-slate-100 even:bg-slate-50/50">';
        cols.forEach(col => {
          html += `<td class="px-2 py-1.5">${col}</td>`;
        });
        html += '</tr>';
      }
      html += '</tbody></table></div>';
      return html;
    });
  }

  // Contextual Image Fallback Engine (attaches visual preview if LLM omitted it)
  function ensureContextualImageTag(userQuery, replyText) {
    if (/\[IMAGE:[a-zA-Z0-9_]+\]/i.test(replyText)) {
      return replyText; // Already has an image tag
    }

    const text = (userQuery + ' ' + replyText).toLowerCase();
    let attachedTag = '';

    if (text.includes('ccna') || text.includes('cisco') || text.includes('routing')) {
      attachedTag = '[IMAGE:ccna_flyer]';
    } else if (text.includes('security') || text.includes('ceh') || text.includes('cyber') || text.includes('hacker') || text.includes('firewall')) {
      attachedTag = '[IMAGE:cyber_security]';
    } else if (text.includes('agentic') || text.includes('llm') || text.includes('ai') || text.includes('machine learning')) {
      attachedTag = '[IMAGE:agentic_ai]';
    } else if (text.includes('devops') || text.includes('cloud') || text.includes('docker') || text.includes('kubernetes')) {
      attachedTag = '[IMAGE:cloud_devops]';
    } else if (text.includes('navttc') || text.includes('free') || text.includes('scholarship') || text.includes('kamyab')) {
      attachedTag = '[IMAGE:navttc_free]';
    } else if (text.includes('fee') || text.includes('cost') || text.includes('price') || text.includes('discount') || text.includes('kitni')) {
      attachedTag = '[IMAGE:fee_chart]';
    } else if (text.includes('schedule') || text.includes('timing') || text.includes('timetable') || text.includes('batch')) {
      attachedTag = '[IMAGE:schedule_flyer]';
    } else if (text.includes('location') || text.includes('zarwar') || text.includes('murree road') || text.includes('campus') || text.includes('lab')) {
      attachedTag = '[IMAGE:campus_labs]';
    }

    return attachedTag ? `${replyText}\n\n${attachedTag}` : replyText;
  }

  // Rich Markdown Formatter Utility
  function formatMarkdown(text) {
    if (!text) return '';

    // First clean any accidental backticks around image tags: `[IMAGE:xyz]` -> [IMAGE:xyz]
    let formatted = text.replace(/`\[IMAGE:([a-zA-Z0-9_]+)\]`/g, '[IMAGE:$1]');

    // Handle tables
    formatted = parseMarkdownTables(formatted);

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

    // Replace [IMAGE:tag] with rich interactive visual recommendation cards
    formatted = formatted.replace(/\[IMAGE:([a-zA-Z0-9_]+)\]/g, (match, imageId) => {
      const img = imageAssets[imageId];
      if (!img) return '';
      return `
        <div class="my-3 p-2.5 bg-slate-100/90 rounded-xl border border-slate-200/90 shadow-sm overflow-hidden group">
          <div class="relative overflow-hidden rounded-lg cursor-pointer image-lightbox-trigger" data-img-id="${imageId}">
            <img src="${img.url}" alt="${img.title}" class="w-full h-36 object-cover rounded-lg group-hover:scale-105 transition-transform duration-300 bg-slate-900/10" loading="lazy">
            <div class="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-2">
              <i class="fa-solid fa-expand text-sm"></i>
              <span>Click for High-Res Lightbox</span>
            </div>
          </div>
          <div class="pt-2 px-1 flex items-center justify-between text-[11px] text-slate-600">
            <span class="font-bold text-slate-800 truncate">${img.caption}</span>
            <button type="button" class="text-corvit-red font-semibold hover:underline shrink-0 ml-2 inline-flex items-center gap-1 image-lightbox-trigger cursor-pointer" data-img-id="${imageId}">
              <span>View Full</span> &rarr;
            </button>
          </div>
        </div>
      `;
    });

    return formatted;
  }

  // Streaming Message Renderer with Architecture Telemetry & Action Bar
  function streamAssistantMessage(userQuery, fullText, meta = {}, isError = false) {
    if (!chatMessages) return;

    const messageRow = document.createElement('div');
    messageRow.className = 'flex gap-2.5 items-start animate-fadeIn';

    const avatar = `
      <div class="w-7 h-7 rounded-full bg-corvit-red text-white flex items-center justify-center text-xs shrink-0 mt-0.5 shadow-sm">
        <i class="fa-solid fa-robot"></i>
      </div>
    `;

    const bubble = document.createElement('div');
    bubble.className = `chat-bubble bg-white rounded-2xl rounded-tl-sm p-3.5 border ${isError ? 'border-red-300 bg-red-50 text-red-800' : 'border-slate-200 text-slate-800'} shadow-sm text-xs leading-relaxed max-w-[88%] break-words`;

    const textContainer = document.createElement('div');
    bubble.appendChild(textContainer);

    messageRow.innerHTML = avatar;
    messageRow.appendChild(bubble);
    chatMessages.appendChild(messageRow);

    // Apply contextual image check
    const textWithImages = ensureContextualImageTag(userQuery, fullText);

    // Prepare text for word-by-word streaming
    const cleanStreamText = textWithImages.replace(/\[IMAGE:[^\]]+\]/g, '');
    const words = cleanStreamText.split(' ');
    let wordIndex = 0;
    let accumulated = '';

    const streamInterval = setInterval(() => {
      if (wordIndex < words.length) {
        accumulated += (wordIndex === 0 ? '' : ' ') + words[wordIndex];
        textContainer.innerHTML = formatMarkdown(accumulated) + '<span class="streaming-cursor"></span>';
        chatMessages.scrollTop = chatMessages.scrollHeight;
        wordIndex++;
      } else {
        clearInterval(streamInterval);
        textContainer.innerHTML = formatMarkdown(textWithImages);

        // Attach Lightbox triggers
        const triggers = bubble.querySelectorAll('.image-lightbox-trigger');
        triggers.forEach(tr => {
          tr.addEventListener('click', () => {
            const imgId = tr.getAttribute('data-img-id');
            if (imgId) openLightbox(imgId);
          });
        });

        // Add Telemetry & Action Bar if not an error
        if (!isError) {
          const actionBar = document.createElement('div');
          actionBar.className = 'msg-action-bar';

          // Telemetry badge
          const latencySec = meta.latencyMs ? (meta.latencyMs / 1000).toFixed(1) + 's' : '<1s';
          const modelBadge = meta.fallback
            ? `<span class="telemetry-badge bg-amber-50 text-amber-800 border-amber-200" title="Cascaded to Tier ${meta.fallbackTier}: ${meta.modelName}"><i class="fa-solid fa-shield-halved text-amber-600"></i> ${meta.modelName || 'Fallback 20B'} &bull; ${latencySec}</span>`
            : `<span class="telemetry-badge" title="Tier 1: ${meta.modelName}"><i class="fa-solid fa-bolt text-amber-500"></i> ${meta.modelName || 'Groq 120B Flagship'} &bull; ${latencySec}</span>`;

          actionBar.innerHTML = `
            <div>${modelBadge}</div>
            <div class="flex items-center gap-1.5">
              <button type="button" class="copy-msg-btn copy-tooltip p-1 text-slate-400 hover:text-slate-700 transition rounded text-xs cursor-pointer" title="Copy answer to clipboard">
                <i class="fa-regular fa-copy"></i>
              </button>
              <button type="button" class="feedback-btn p-1 text-slate-400 hover:text-emerald-600 transition rounded text-xs cursor-pointer" title="Helpful answer">
                <i class="fa-regular fa-thumbs-up"></i>
              </button>
              <button type="button" class="feedback-btn p-1 text-slate-400 hover:text-rose-500 transition rounded text-xs cursor-pointer" title="Not helpful">
                <i class="fa-regular fa-thumbs-down"></i>
              </button>
            </div>
          `;

          // Copy Button Handler
          const copyBtn = actionBar.querySelector('.copy-msg-btn');
          if (copyBtn) {
            copyBtn.addEventListener('click', () => {
              const plainText = textWithImages.replace(/\[IMAGE:[^\]]+\]/g, '').trim();
              navigator.clipboard.writeText(plainText).then(() => {
                copyBtn.classList.add('show-tooltip');
                copyBtn.innerHTML = '<i class="fa-solid fa-check text-emerald-500"></i>';
                setTimeout(() => {
                  copyBtn.classList.remove('show-tooltip');
                  copyBtn.innerHTML = '<i class="fa-regular fa-copy"></i>';
                }, 2000);
              });
            });
          }

          // Feedback Buttons Handler
          const feedbackBtns = actionBar.querySelectorAll('.feedback-btn');
          feedbackBtns.forEach(fBtn => {
            fBtn.addEventListener('click', () => {
              feedbackBtns.forEach(b => b.classList.remove('text-emerald-600', 'text-rose-500'));
              fBtn.classList.add('text-emerald-600');
            });
          });

          bubble.appendChild(actionBar);

          // Append 1-Click WhatsApp Action CTA
          const ctaHtml = generateWhatsAppCTA(userQuery, textWithImages);
          const ctaDiv = document.createElement('div');
          ctaDiv.innerHTML = ctaHtml;

          const repeatVoiceBtn = ctaDiv.querySelector('.repeat-voice-btn');
          if (repeatVoiceBtn) {
            repeatVoiceBtn.addEventListener('click', () => {
              toggleSpeakMessage(textWithImages, repeatVoiceBtn);
            });
          }

          bubble.appendChild(ctaDiv);

          // Voice output auto-play
          if (isVoiceOutputEnabled && repeatVoiceBtn) {
            toggleSpeakMessage(textWithImages, repeatVoiceBtn);
          }
        }

        chatMessages.scrollTop = chatMessages.scrollHeight;
      }
    }, 18);
  }

  // Append Simple User Message
  function appendUserMessage(text) {
    if (!chatMessages) return;

    const messageRow = document.createElement('div');
    messageRow.className = 'flex justify-end';
    messageRow.innerHTML = `
      <div class="bg-corvit-navy text-white rounded-2xl rounded-tr-sm px-4 py-2.5 shadow-sm text-xs leading-relaxed max-w-[85%] break-words">
        ${text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}
      </div>
    `;
    chatMessages.appendChild(messageRow);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  // Client-side Fallback Knowledge Engine (Used if offline or endpoint unreachable)
  function getClientFallbackResponse(userText) {
    const q = (userText || '').toLowerCase();
    const isRomanUrdu = /kahan|kab|kitni|kitna|shuru|start|dakhla|paisa|paise|batao|bataen|chahiye|mein|hai|hain|karna|karne|sakta|sakty|raha|rahe|kuch|kya|kia|walay|wale|rabta/.test(q);

    if (q.includes('fee') || q.includes('cost') || q.includes('price') || q.includes('discount') || q.includes('kitni') || q.includes('paise')) {
      if (isRomanUrdu) {
        return `**Corvit Systems Rawalpindi** (Zarwar Center, 6th Road) mein fees standardized hain, sath mein easy installments aur special bundles bhi available hain:\n\n- **CCNA ke sath Free Linux**: CCNA 200-301 mein Red Hat Linux (RHCSA) bilkul free shamil hai.\n- **DevOps ke sath Free AWS**: DevOps course ke sath AWS Cloud training free hai.\n- **100% Free NAVTTC Programs**: Government funded tracks eligible Pakistani youth ke liye 100% free hain (koi fees nahi).\n\nApne course ki exact fee aur installment details ke liye Rawalpindi desk se rabta karein:\n📞 Call: **(051) 4928004**\n💬 WhatsApp: **0311-1444473**\n📍 Zarwar Center, 2nd Floor, 6th Road Stop, Murree Road, Rawalpindi\n\n[IMAGE:fee_chart]`;
      }
      return `At **Corvit Systems Rawalpindi**, course fees are standardized with regular student installment plans and promotional bundles:\n\n- **Free RHCSA Linux with CCNA**: Full Red Hat Linux administration included free when enrolling in CCNA 200-301.\n- **Free AWS Cloud with DevOps**: Full AWS Cloud module included free with the DevOps track.\n- **100% Free NAVTTC Courses**: Tuition-free technical training funded by the Government of Pakistan for eligible youth.\n\nFor official commercial course fee quotes:\n📞 Call Rawalpindi: **(051) 4928004** / **(051) 4928005**\n💬 WhatsApp: **0311-1444473**\n📍 Visit: 2nd Floor, Zarwar Center, 6th Road, Murree Road, Rawalpindi\n\n[IMAGE:fee_chart]`;
    }

    if (q.includes('schedule') || q.includes('time') || q.includes('timing') || q.includes('timetable') || q.includes('batch') || q.includes('when') || q.includes('kab') || q.includes('shuru')) {
      if (isRomanUrdu) {
        return `**Corvit Systems Rawalpindi** mein multi-shift batch timings available hain Zarwar Center campus aur Live Online:\n\n- **CCNA Morning Batch**: Mon - Thu @ 11:00 AM (Free Linux ke sath)\n- **CCNA Evening Batch**: Mon - Thu @ 07:30 PM\n- **Certified Ethical Hacker (CEH)**: Mon - Thu @ 08:45 PM\n- **Fortinet & Palo Alto Firewalls**: Mon - Thu @ 09:30 PM\n- **SEO with AEO & GEO**: Mon - Thu @ 06:00 PM\n- **Agentic AI & LLMs (Weekend)**: Saturdays & Sundays @ 04:00 PM\n- **DevOps + AWS Cloud (Weekend)**: Saturdays & Sundays @ 08:00 PM\n\n💡 *Admission se pehle aap Free Demo Class attend kar sakte hain!*\nDemo seat reserve karne ke liye: Call **(051) 4928004** ya WhatsApp **0311-1444473**.\n\n[IMAGE:schedule_flyer]`;
      }
      return `**Corvit Systems Rawalpindi** offers flexible batch timings at our Zarwar Center 6th Road campus and live online:\n\n- **CCNA Morning**: Mon - Thu @ 11:00 AM (Free Linux included)\n- **CCNA Evening**: Mon - Thu @ 07:30 PM\n- **Certified Ethical Hacker (CEH)**: Mon - Thu @ 08:45 PM\n- **Fortinet & Palo Alto Firewalls**: Mon - Thu @ 09:30 PM\n- **SEO with AEO & GEO**: Mon - Thu @ 06:00 PM\n- **Agentic AI & LLMs (Weekend)**: Sat & Sun @ 04:00 PM\n- **DevOps + AWS Cloud (Weekend)**: Sat & Sun @ 08:00 PM\n\n💡 *Free Demo Lectures are available before registration.*\nReserve your seat: Call **(051) 4928004** or WhatsApp **0311-1444473**.\n\n[IMAGE:schedule_flyer]`;
    }

    if (q.includes('navttc') || q.includes('free') || q.includes('scholarship') || q.includes('kamyab')) {
      return `Yes! **Corvit Systems Rawalpindi** is an authorized partner for **NAVTTC** (National Vocational & Technical Training Commission) in the Twin Cities:\n\n- **Tuition**: 100% Free (Government Funded).\n- **Available Tracks**: AI (ML/DL), Cyber Security & Ethical Hacking, Cloud Computing, and Full Stack Web Development.\n- **Benefits**: Zero tuition fee, free course materials, physical enterprise lab access at 6th Road Zarwar Center, and government certificates.\n- **Eligibility**: Pakistani nationals with valid CNIC/B-Form meeting merit criteria.\n\nContact the Rawalpindi NAVTTC desk at **(051) 4928004** or WhatsApp **0311-1444473**.\n\n[IMAGE:navttc_free]`;
    }

    if (q.includes('ccna') || q.includes('cisco') || q.includes('network') || q.includes('routing')) {
      return `**Cisco CCNA 200-301 at Corvit Rawalpindi** is the premier foundational track for modern network engineers:\n\n- **Special Promo**: Includes **Free RHCSA (Red Hat Linux)** training bundle!\n- **Key Topics**: Enterprise routing & switching, IPv4/IPv6 subnetting, OSPF, VLANs, ACLs, NAT/DHCP, and network automation.\n- **Hardware Labs**: Live Cisco physical routers and switches at Zarwar Center campus.\n- **Shifts**: Morning (11:00 AM) and Evening (7:30 PM).\n\n[IMAGE:ccna_flyer]`;
    }

    if (q.includes('security') || q.includes('cyber') || q.includes('ceh') || q.includes('ethical') || q.includes('firewall')) {
      return `**Cyber Security & Defensive Technologies at Corvit Rawalpindi**:\n\n- **Certified Ethical Hacker (CEH v10/v12)**: Footprinting, network vulnerability scanning, system exploitation, malware analysis, social engineering, web app hacking, and cryptography.\n- **Next-Gen Firewalls**: Dual track covering **Fortinet FortiGate (NSE-4)** & **Palo Alto (PAN-OS)** security policies, SSL decryption, and IPsec VPNs.\n- **Advanced Tracks**: Certified Network Defender (CND), CHFI (Forensics), and CISSP/CISA.\n\n[IMAGE:cyber_security]`;
    }

    if (q.includes('ai') || q.includes('agentic') || q.includes('llm') || q.includes('python')) {
      return `**Agentic AI & Autonomous LLMs Track at Corvit Rawalpindi**:\n\n- **Multi-Agent Architectures**: LangChain, CrewAI, AutoGen, and LangGraph workflows.\n- **Model Context Protocol (MCP)**: Native tool calling, enterprise agents, and vector databases (Pinecone, ChromaDB).\n- **Schedule**: Saturdays & Sundays @ 04:00 PM Onwards.\n\n[IMAGE:agentic_ai]`;
    }

    if (q.includes('devops') || q.includes('cloud') || q.includes('aws') || q.includes('docker')) {
      return `**Cloud & DevOps Engineering at Corvit Rawalpindi**:\n\n- **Special Offer**: Enrolling in DevOps includes the **AWS Cloud module Free of Charge**!\n- **Syllabus**: Docker, Kubernetes cluster orchestration, Jenkins CI/CD pipelines, and Terraform IaC.\n- **Schedule**: Saturdays & Sundays @ 08:00 PM Onwards.\n\n[IMAGE:cloud_devops]`;
    }

    if (q.includes('location') || q.includes('address') || q.includes('contact') || q.includes('where') || q.includes('phone') || q.includes('rwp') || q.includes('rawalpindi') || q.includes('kahan')) {
      if (isRomanUrdu) {
        return `📍 **Corvit Systems Rawalpindi Campus** ka pata aur rabta:\n\n- **Address**: 2nd Floor, Zarwar Center, Main Murree Road, 6th Road Stop, Block A, Satellite Town, Rawalpindi.\n- **Landmark**: 6th Road Metro Bus Station ke bilkul qareeb (Islamabad aur Rawalpindi dono se aasan rasta).\n- **Phone**: **(051) 4928004**, **(051) 4928005**, **(051) 4928006**\n- **WhatsApp**: **0311-1444473** (+92-311-1444473)\n- **Email**: rwp@corvit.com\n- **Timings**: Monday se Saturday: 09:00 AM se 09:00 PM tak open rehta hai.\n\n[IMAGE:campus_labs]`;
      }
      return `📍 **Corvit Systems Rawalpindi Campus**:\n- **Address**: 2nd Floor, Zarwar Center, Main Murree Road, 6th Road Stop, Block A, Satellite Town, Rawalpindi.\n- **Landmark**: Near 6th Road Metro Bus Station (easily accessible from Rawalpindi & Islamabad).\n- **Phone**: **(051) 4928004**, **(051) 4928005**, **(051) 4928006**\n- **WhatsApp**: **0311-1444473** (+92-311-1444473)\n- **Email**: rwp@corvit.com\n- **Hours**: Monday to Saturday: 09:00 AM – 09:00 PM (Closed Sunday).\n\n[IMAGE:campus_labs]`;
    }

    return `Welcome to **Corvit Systems Rawalpindi**! I can assist you with:\n\n- **Course Guidance**: Cisco Networking, Cyber Security, Cloud, DevOps, AI, Full Stack Development, and SEO.\n- **Batch Schedules**: Morning, Evening, and Weekend timings at Zarwar Center, 6th Road Rawalpindi.\n- **Fees & Concessions**: Promotional bundles (Free Linux with CCNA; Free AWS with DevOps) and **100% Free NAVTTC Government Courses**.\n- **Admissions**: Reserving a free trial demo lecture before enrolling.\n\nHow can I help you today? Or contact the Rawalpindi admissions desk directly:\n📞 **(051) 4928004** &bull; 💬 WhatsApp: **0311-1444473** &bull; ✉️ **rwp@corvit.com**\n\n[IMAGE:training_modes]`;
  }

  // Send Message to Serverless Function (with Multi-Tier Telemetry & Fallback)
  async function sendMessage(text) {
    const trimmed = text.trim();
    if (!trimmed || isAwaitingResponse) return;

    appendUserMessage(trimmed);
    conversationHistory.push({ role: 'user', content: trimmed });

    if (chatInputText) chatInputText.value = '';
    isAwaitingResponse = true;

    if (chatSendBtn) chatSendBtn.disabled = true;
    if (chatTypingIndicator) chatTypingIndicator.classList.remove('hidden');
    if (chatMessages) chatMessages.scrollTop = chatMessages.scrollHeight;

    const reqStartTime = Date.now();

    try {
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
        const meta = {
          modelUsed: data.modelUsed,
          modelName: data.modelName,
          fallbackTier: data.fallbackTier,
          fallback: data.fallback,
          latencyMs: data.latencyMs || (Date.now() - reqStartTime)
        };

        // Update live header badge if available
        if (engineStatusText && data.modelName) {
          const cleanName = data.modelName.replace(' (Flagship)', '').replace(' (High-Speed)', '').replace(' (Backup)', '');
          engineStatusText.textContent = data.fallback ? `Fallback: ${cleanName}` : `${cleanName} Online`;
        }

        streamAssistantMessage(trimmed, reply, meta);
        conversationHistory.push({ role: 'assistant', content: reply });
      } else {
        console.warn('Serverless endpoint returned non-200, running client fallback engine.');
        if (engineStatusText) {
          engineStatusText.textContent = 'Dataset Engine';
        }
        const fallbackReply = getClientFallbackResponse(trimmed);
        const meta = {
          modelUsed: 'local-dataset-rag',
          modelName: 'Grounded Dataset Engine',
          fallbackTier: 4,
          fallback: true,
          latencyMs: Date.now() - reqStartTime
        };
        streamAssistantMessage(trimmed, fallbackReply, meta);
        conversationHistory.push({ role: 'assistant', content: fallbackReply });
      }
    } catch (networkError) {
      console.warn('Network fetch error, switching to dataset fallback engine:', networkError.message);
      if (engineStatusText) {
        engineStatusText.textContent = 'Dataset Engine';
      }
      const fallbackReply = getClientFallbackResponse(trimmed);
      const meta = {
        modelUsed: 'local-dataset-rag',
        modelName: 'Grounded Dataset Engine',
        fallbackTier: 4,
        fallback: true,
        latencyMs: Date.now() - reqStartTime
      };
      streamAssistantMessage(trimmed, fallbackReply, meta);
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

  // Event Listeners - direct handlers to eliminate multiple event firing / race conditions
  if (chatLauncherBtn) {
    chatLauncherBtn.onclick = toggleChat;
  }

  if (chatTeaserPill) {
    chatTeaserPill.onclick = (e) => {
      e.preventDefault();
      openChat();
    };
  }

  if (chatCloseBtn) {
    chatCloseBtn.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      closeChat();
    };
  }

  if (chatClearBtn) {
    chatClearBtn.addEventListener('click', clearChat);
  }

  if (chatExpandBtn) {
    chatExpandBtn.addEventListener('click', toggleExpandMode);
  }

  if (chatExportBtn) {
    chatExportBtn.addEventListener('click', exportChatSession);
  }

  if (chatTtsToggleBtn) {
    chatTtsToggleBtn.addEventListener('click', toggleVoiceOutput);
  }

  if (chatMicBtn) {
    chatMicBtn.addEventListener('click', toggleVoiceListening);
  }

  if (chatLangBtn) {
    chatLangBtn.addEventListener('click', toggleVoiceLanguage);
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
