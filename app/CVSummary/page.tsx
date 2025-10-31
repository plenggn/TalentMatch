// app/CVSummary/page.tsx (Minimalist AI Report Design - A4 Optimized Final)
"use client";
import React, { useState, useEffect, useRef, useMemo, Suspense } from "react"; 
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient'; 
import { FileText, Download, Printer, ChevronDown, X, BarChart2, Star, Zap, AlertTriangle, Check, ArrowLeft, Loader2, Mail, Users, HardHat, GraduationCap, Clock, TrendingUp, Cpu, Heart, MessageSquare, Eye, Send, Sparkles, Brain, ClipboardCheck, ArrowUpRight } from "lucide-react"; 
import Link from "next/link"; 
import Image from "next/image"; 

// --- Color & Style Definitions (New Minimalist Palette) ---
const PRIMARY_COLOR_LIGHT = '#14ADD6'; // Cyan-Blue
const PRIMARY_COLOR_DARK = '#384295'; // Deep Indigo
const GRADIENT_CLASS = 'bg-gradient-to-r from-[#14ADD6] to-[#384295]';

// --- Interfaces (ตรงกับ DB) ---
interface CandidateReport {
  id: string; 
  name: string;
  firstName: string;
  lastName: string;
  experience: string;
  position: string;
  education: string;
  matching_score: number;
  status: string;
  ai_summary: string;
  strengths: string[];
  overview: string;
  potential_gaps: string[];
  cv_url?: string;
  emp_id?: string;
  potential_prediction?: string; // ✅ PSS Source
  personality_inference?: string; // ✅ PSS Source
}

const STATUS_OPTIONS = ["Applied", "Shortlisted", "Interviewed", "Offered", "Rejected"];

// --- Localization Content (เหมือนเดิม) ---
const LOCALE = {
// ... (Localization Content เหมือนเดิม)
    EN: {
        TITLE: "AI HR Assistant Chat",
        GREETING: (name: string) => `Hello! I'm **TalentBot AI**, your HR assistant. I can analyze the CV of **${name}** based *only* on the provided document.`,
        PROMPT_HINT: "Try clicking a Quick Action button below!",
        QUICK_ACTIONS: {
            STRENGTHS: { label: "Summarize Key Strengths", prompt: "Summarize the candidate's key strengths relevant to the job.", color: "from-blue-500 to-cyan-500" },
            EXPERIENCE: { label: "Relevant Experience (Years)", prompt: "What is the candidate's total relevant experience based on the CV?", color: "from-cyan-500 to-blue-600" },
            GAPS: { label: "Identify Potential Gaps", prompt: "Are there any required skills from the job description missing or unclear in the CV?", color: "from-indigo-500 to-purple-500" },
            EDUCATION: { label: "Education & Certifications", prompt: "Summarize the candidate's educational background and certifications.", color: "from-blue-600 to-indigo-600" },
            PERSONALITY: { icon: Heart, label: "Personality Style", prompt: "What can you infer about the candidate's personality or work style based on the CV's tone?", color: "from-pink-500 to-red-500" },
            POTENTIAL: { icon: TrendingUp, label: "Growth Potential", prompt: "What is the candidate's projected growth or career potential?", color: "from-yellow-500 to-orange-500" },
        },
        TOOL_SHORTCUTS: {
            CV: "View Full CV",
            REPORT: "View AI Report",
            INFERENCE: "Personality Inference",
            PREDICTION: "Potential Prediction",
        },
        PLACEHOLDER: "Type your question about the CV...",
        ERROR: (err: string) => `**[Error]** ${err || 'Failed to get a response from the AI.'}`,
        SERVER_ERROR: "**[Server Error]** A server error occurred. Please try again.",
        SEND: "Send",
        SENDING: "Sending",
        TYPING: "Thinking...",
        ASSISTANT_NAME: "AI Assistant",
        HINT_HEADER: "Quick Actions (AI Prompts) / Tools",
    },
    TH: {
        TITLE: "แชทบอท AI ผู้ช่วย HR",
        GREETING: (name: string) => `สวัสดีค่ะ! ฉันคือ **TalentBot AI** ผู้ช่วย HR ที่จะวิเคราะห์ CV ของผู้สมัคร **${name}** ให้คุณ โดยอ้างอิงจาก CV เท่านั้น`,
        PROMPT_HINT: "ลองกด **ปุ่มแนะนำคำถาม** ด้านล่างได้เลยค่ะ!",
        QUICK_ACTIONS: {
            STRENGTHS: { label: "สรุปจุดแข็งหลัก", prompt: "สรุปจุดแข็งหลักของเขาสำหรับบทบาทนี้", color: "from-blue-500 to-cyan-500" },
            EXPERIENCE: { label: "ประสบการณ์ที่เกี่ยวข้อง (ปี)", prompt: "เขามีประสบการณ์ที่เกี่ยวข้องกับตำแหน่งนี้โดยตรงกี่ปี?", color: "from-cyan-500 to-blue-600" },
            GAPS: { label: "ทักษะที่ขาดไป", prompt: "มีทักษะสำคัญตาม JD ที่ CV ไม่ได้กล่าวถึงหรือไม่?", color: "from-indigo-500 to-purple-500" },
            EDUCATION: { label: "ประวัติการศึกษา", prompt: "ช่วยสรุปประวัติการศึกษาและการรับรองของเขา", color: "from-blue-600 to-indigo-600" },
            PERSONALITY: { icon: Heart, label: "สไตล์บุคลิกภาพ", prompt: "คุณสามารถอนุมานเกี่ยวกับบุคลิกภาพหรือสไตล์การทำงานของผู้สมัครจากโทนของ CV ได้อย่างไร?", color: "from-pink-500 to-red-500" },
            POTENTIAL: { icon: TrendingUp, label: "ศักยภาพการเติบโต", prompt: "ศักยภาพในการเติบโตในสายงานหรือในบริษัทของผู้สมัครคืออะไร?", color: "from-yellow-500 to-orange-500" },
        },
        TOOL_SHORTCUTS: {
            CV: "ดู CV ฉบับเต็ม",
            REPORT: "ดู AI Report",
            INFERENCE: "อนุมานบุคลิกภาพ",
            PREDICTION: "พยากรณ์ศักยภาพ",
        },
        PLACEHOLDER: "พิมพ์คำถามถึง CV ของผู้สมัคร...",
        ERROR: (err: string) => `**[ข้อผิดพลาด]** ${err || 'ไม่สามารถดึงข้อมูลจาก AI ได้ กรุณาลองใหม่อีกครั้ง'}`,
        SERVER_ERROR: "**[ข้อผิดพลาดเซิร์ฟเวอร์]** เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง",
        SEND: "ส่ง",
        SENDING: "กำลังส่ง",
        TYPING: "กำลังดึงข้อมูล...",
        ASSISTANT_NAME: "ผู้ช่วย AI",
        HINT_HEADER: "แนะนำคำถาม (AI Prompts) / เครื่องมือ",
    }
};

// --- CHATBOT UI COMPONENTS (เหมือนเดิม) ---
interface ChatMessage {
  id: string; 
  content: string;
  role: 'user' | 'assistant';
}

const AIHeadCharacter = ({ size = 'md', animated = false }) => {
    const sizes = { sm: 'w-8 h-8', md: 'w-12 h-12', lg: 'w-20 h-20' };
    const svgContent = (
      <svg viewBox="0 0 120 120" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="headGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" /> <stop offset="50%" stopColor="#2563eb" /> <stop offset="100%" stopColor="#1d4ed8" />
          </linearGradient>
          <linearGradient id="darkGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e40af" /> <stop offset="100%" stopColor="#1e3a8a" />
          </linearGradient>
        </defs>
        <path d="M 40 30 Q 40 15 50 15 L 70 15 Q 80 15 80 30 L 80 70 Q 80 85 70 90 Q 60 95 50 90 Q 40 85 40 70 Z" fill="url(#headGradient)" className={animated ? 'animate-pulse' : ''} opacity="0.95" />
        <path d="M 48 45 Q 52 42 56 45 Q 60 48 64 45" stroke="#60a5fa" strokeWidth="2" fill="none" opacity="0.7" />
        <path d="M 48 55 Q 52 52 56 55 Q 60 58 64 55" stroke="#60a5fa" strokeWidth="2" fill="none" opacity="0.7" />
        <circle cx="25" cy="40" r="3.5" fill="#1e40af" opacity="0.9" /> <circle cx="20" cy="50" r="3" fill="#2563eb" opacity="0.9" />
        <line x1="25" y1="40" x2="40" y2="45" stroke="#1e40af" strokeWidth="2" opacity="0.5" /> <line x1="20" y1="50" x2="40" y2="50" stroke="#2563eb" strokeWidth="2" opacity="0.5" />
        <ellipse cx="62" cy="42" rx="5" ry="6" fill="white" opacity="0.95" /> <circle cx="62" cy="43" r="2.5" fill="#1e3a8a" />
        <path d="M 52 65 Q 60 70 68 65" stroke="#1e40af" strokeWidth="2" fill="none" opacity="0.6" strokeLinecap="round" />
        <circle cx="60" cy="50" r="15" fill="none" stroke="#60a5fa" strokeWidth="2" opacity="0.3"/>
      </svg>
    );

    return (
      <div className={`relative ${sizes[size]}`}>
        {svgContent}
        {animated && ( <div className="absolute -top-1 -right-1"> <Sparkles className="h-4 w-4 text-cyan-400 animate-pulse" /> </div> )}
      </div>
    );
  };

interface ChatbotProps {
    applicantId: string;
    onClose: () => void;
    candidateName: string;
    onOpenCV: () => void;
    onOpenReport: () => void;
    candidateData: CandidateReport | null; // ✅ Pass full candidate data for analysis tools
}

const EnhancedChatbotModalContent = ({ applicantId, onClose, candidateName, onOpenCV, onOpenReport, candidateData }: ChatbotProps) => {
// ... (EnhancedChatbotModalContent Component ใช้งานเหมือนเดิม)
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [bounce, setBounce] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [language, setLanguage] = useState<'EN' | 'TH'>('EN');
  const T = LOCALE[language];

  // ... (Functions ภายใน Component เหมือนเดิม)

  const scrollToBottom = () => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); };
  useEffect(scrollToBottom, [messages]);
  
  useEffect(() => {
    if (isLoading) {
      setIsTyping(true);
      const interval = setInterval(() => { setBounce(prev => !prev); }, 500);
      return () => clearInterval(interval);
    } else {
      setIsTyping(false);
      setBounce(false);
    }
  }, [isLoading]);

  // Initial greeting (Runs when language changes or component mounts)
  useEffect(() => {
    const isInitialGreeting = messages.length === 0 || messages[0].id === 'init-1';
    
    if (isInitialGreeting) {
        setMessages([{
            id: 'init-1',
            role: 'assistant',
            content: T.GREETING(candidateName) + `\n\n${T.PROMPT_HINT}`,
        }]);
    }
  }, [applicantId, candidateName, language]);


  const callAiApi = async (userQuery: string, messageId: string) => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/cvChat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicantId, userQuery: userQuery }),
      });
      const result = await response.json();

      let aiMessageText = '';
      if (response.ok && result.responseText) {
        aiMessageText = result.responseText;
      } else {
        aiMessageText = T.ERROR(result.error || result.responseText);
      }

      const botMessage: ChatMessage = { id: (Date.now() + 1).toString(), role: 'assistant', content: aiMessageText };
      setMessages(prev => [...prev, botMessage]);

    } catch (error) {
      console.error("Chat API failed:", error);
      const errorMessage: ChatMessage = { id: (Date.now() + 1).toString(), role: 'assistant', content: T.SERVER_ERROR };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userQuery = input.trim();
    const userMessage: ChatMessage = { id: Date.now().toString(), role: 'user', content: userQuery };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    
    callAiApi(userQuery, userMessage.id);
  };

  const handleQuickAction = (actionPrompt: string) => {
    if (isLoading) return;
    
    const userMessage: ChatMessage = { id: Date.now().toString(), role: 'user', content: actionPrompt }; 
    
    setMessages(prev => [...prev, userMessage]);
    
    callAiApi(actionPrompt, userMessage.id);
  };
  
  // Custom Handler for new Analysis Tools
  const handleAnalysisTool = (type: 'prediction' | 'inference') => {
      const data = candidateData;
      let title = type === 'prediction' ? T.TOOL_SHORTCUTS.PREDICTION : T.TOOL_SHORTCUTS.INFERENCE;
      let content = '';

      if (!data) {
          content = T.SERVER_ERROR;
      } else if (type === 'prediction' && data.potential_prediction && data.potential_prediction !== "No prediction data available.") {
          content = data.potential_prediction;
      } else if (type === 'inference' && data.personality_inference && data.personality_inference !== "No inference data available.") {
          content = data.personality_inference;
      } else {
          content = T.ERROR("Analysis data is not available. Please run AI Matching to generate this analysis.");
      }
      
      const botMessage: ChatMessage = { 
          id: (Date.now() + 1).toString(), 
          role: 'assistant',
          content: `**${title}**: \n\n${content}` 
      };
      setMessages(prev => [...prev, botMessage]);
  };

  
  // Function to safely render markdown (simplified)
  const renderMessageContent = (content: string) => {
    let html = content;
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-extrabold text-gray-900">$1</strong>');
    html = html.replace(/^- (.*)/gm, '<li class="list-disc ml-5 pl-1 leading-relaxed">$1</li>');
    if (html.includes('<li>')) {
        html = `<ul class="list-disc space-y-1">${html}</ul>`;
    }
    html = html.replace(/### (.*)/g, '<h4 class="text-xl font-semibold text-indigo-700 mt-2 mb-1">$1</h4>');
    html = html.replace(/## (.*)/g, '<h3 class="text-xl font-bold text-blue-700 mt-3 mb-1">$1</h3>');
    
    return <div className="markdown-content text-lg leading-relaxed" dangerouslySetInnerHTML={{ __html: html }} />;
  };

  // ✅ 4x2 Grid Logic: Select 4 Quick Actions and 4 Tool Shortcuts
  const fullQuickActions = useMemo(() => [
        { icon: Zap, ...T.QUICK_ACTIONS.STRENGTHS, color: "from-blue-400 to-cyan-500" }, // Use custom minimalist colors here
        { icon: ClipboardCheck, ...T.QUICK_ACTIONS.EXPERIENCE, color: "from-cyan-500 to-blue-500" },
        { icon: AlertTriangle, ...T.QUICK_ACTIONS.GAPS, color: "from-indigo-400 to-purple-500" },
        { icon: GraduationCap, ...T.QUICK_ACTIONS.EDUCATION, color: "from-blue-500 to-indigo-500" },
        { icon: Heart, ...T.QUICK_ACTIONS.PERSONALITY, color: "from-pink-400 to-red-500" },
        { icon: TrendingUp, ...T.QUICK_ACTIONS.POTENTIAL, color: "from-yellow-400 to-orange-500" },
    ], [T]);
  
  const primaryQuickActions = fullQuickActions.slice(0, 4); // Select top 4 for the first row

  const toolShortcuts = useMemo(() => [
      { icon: Eye, label: T.TOOL_SHORTCUTS.CV, action: onOpenCV, color: "bg-gray-100 hover:bg-gray-200 text-gray-700" },
      { icon: FileText, label: T.TOOL_SHORTCUTS.REPORT, action: onOpenReport, color: `bg-[#14ADD6]/10 hover:bg-[#14ADD6]/20 text-[#14ADD6]` },
      { icon: Users, label: T.TOOL_SHORTCUTS.INFERENCE, action: () => handleAnalysisTool('inference'), color: `bg-[#384295]/10 hover:bg-[#384295]/20 text-[#384295]` },
      { icon: Cpu, label: T.TOOL_SHORTCUTS.PREDICTION, action: () => handleAnalysisTool('prediction'), color: "bg-gray-100 hover:bg-gray-200 text-gray-700" },
  ], [T, candidateData]); // Re-run memo if candidateData changes for tools that rely on it

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header (Minimalist Gradient) */}
        <div className={`relative p-4 border-b ${GRADIENT_CLASS} text-white rounded-t-2xl overflow-hidden flex-shrink-0`}>
          <div className="absolute inset-0 opacity-10">
             <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full blur-3xl animate-pulse"></div>
             <div className="absolute bottom-0 right-0 w-32 h-32 bg-cyan-300 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          </div>
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
               <div className={`h-12 w-12 rounded-full bg-white flex items-center justify-center shadow-lg transition-transform duration-300 p-1 ${bounce ? 'scale-110' : ''}`}>
                 <AIHeadCharacter size="md" animated={isTyping} />
               </div>
               <div>
                 <h3 className="font-bold text-xl flex items-center gap-2">
                   {T.TITLE} <Sparkles className="h-4 w-4 text-white/80 animate-pulse" />
                 </h3>
                 <p className="text-xs opacity-90">{isTyping ? T.TYPING : `${T.ASSISTANT_NAME} / ${candidateName}`}</p>
               </div>
            </div>
            
            <div className="flex gap-3 items-center">
                 {/* Language Toggle */}
                <button 
                    onClick={() => setLanguage(language === 'EN' ? 'TH' : 'EN')}
                    className="px-2 py-1 rounded-lg text-xs font-semibold bg-white/20 hover:bg-white/40 transition"
                    title="Toggle Language"
                >
                    {language === 'EN' ? 'TH' : 'EN'}
                </button>
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="hover:bg-white/20 text-white hover:rotate-90 transition-all duration-300 p-2 rounded-lg"
                 >
                   <X className="h-5 w-5" />
                </button>
            </div>
          </div>
        </div>
        
        {/* Quick Actions (ปุ่มแนะนำคำถาม) + Tool Shortcuts (4x2 Grid) */}
        <div className="p-3 border-b bg-gray-50 flex-shrink-0">
          <h4 className="text-sm font-bold text-gray-800 mb-2">{T.HINT_HEADER}</h4>
          
          <div className="grid grid-cols-4 gap-2 mb-2">
             {/* Row 1: 4 Quick Prompts (Span 1 each) */}
             {primaryQuickActions.map((action, idx) => {
                 const Icon = action.icon || MessageSquare; // Fallback Icon
                 return (
                   <button
                     key={`qa-${idx}`}
                     onClick={() => handleQuickAction(action.prompt)} 
                     disabled={isLoading}
                     className={`col-span-1 flex flex-col items-center justify-center gap-1 px-1 py-2 bg-gradient-to-r ${action.color} text-white rounded-lg hover:opacity-90 transition shadow-sm font-semibold text-xs disabled:opacity-50 text-center h-14`}
                     title={action.prompt}
                   >
                     <Icon size={14} /> 
                     {action.label}
                   </button>
                 );
             })}
          </div>

          <div className="grid grid-cols-4 gap-2">
             {/* Row 2: 4 Tool Shortcuts (Span 1 each) */}
             {toolShortcuts.map((tool, idx) => {
                 const Icon = tool.icon || MessageSquare; // Fallback Icon
                 return (
                     <button 
                         key={`tool-${idx}`}
                         onClick={tool.action}
                         className={`col-span-1 flex flex-col items-center justify-center gap-1 px-1 py-2 rounded-lg text-xs font-semibold shadow-sm transition ${tool.color} text-center h-14`}
                         title={tool.label}
                     >
                         <Icon size={14} />
                         {tool.label}
                     </button>
                 );
             })}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
          
           {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 animate-in ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.role === 'assistant' && (
                    <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center flex-shrink-0 shadow-md p-1 border border-gray-100">
                        <AIHeadCharacter size="sm" />
                    </div>
                  )}
                  <div
                    className={`rounded-2xl px-4 py-3 max-w-[80%] shadow-lg transition-all duration-300 ${
                      message.role === 'user'
                        ? `bg-[#384295] text-white rounded-br-md` // User message uses Dark Indigo
                        : `bg-white text-gray-900 rounded-tl-md border border-gray-100 hover:shadow-xl`
                    }`}
                  >
                    {renderMessageContent(message.content)}
                  </div>
                  {message.role === 'user' && (
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center flex-shrink-0 shadow-md">
                      <span className="text-sm font-bold text-white">HR</span>
                    </div>
                  )}
                </div>
            ))}

           {isLoading && (
             <div className="flex gap-3 justify-start">
               <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center flex-shrink-0 shadow-md animate-bounce p-1 border border-gray-100">
                 <AIHeadCharacter size="sm" animated />
               </div>
               <div className="rounded-2xl px-4 py-3 bg-white border border-gray-100 shadow-sm flex items-center">
                  <div className="flex gap-1">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#14ADD6] animate-pulse"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-[#384295] animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-[#14ADD6] animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                  </div>
               </div>
             </div>
           )}
           <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t bg-white rounded-b-2xl flex-shrink-0">
          <form onSubmit={handleSubmit}>
            <div className="flex gap-2 items-center">
             <input
               value={input}
               onChange={(e) => setInput(e.target.value)}
               placeholder={T.PLACEHOLDER}
               disabled={isLoading}
               className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#14ADD6]/50 focus:border-transparent disabled:bg-gray-100 text-lg transition-all" 
             />
             <button
               type="submit"
               disabled={isLoading || !input.trim()}
               className={`p-3 ${GRADIENT_CLASS} hover:opacity-90 text-white rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all`}
             >
               {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
             </button>
            </div>
          </form>
        </div>
        
         <style jsx global>{`
             .markdown-content ul {
                 list-style-type: disc;
                 padding-left: 25px; 
                 margin-top: 8px;
                 margin-bottom: 8px;
             }
             .markdown-content li {
                 margin-bottom: 5px;
                 font-size: 1.125rem; /* text-lg */
             }
             .markdown-content h3 {
                 font-size: 1.5rem; /* text-2xl */
                 font-weight: 800; /* font-extrabold */
                 margin-top: 15px;
                 margin-bottom: 7px;
             }
             .markdown-content h4 {
                 font-size: 1.25rem; /* text-xl */
                 font-weight: 700; /* font-bold */
                 margin-top: 10px;
                 margin-bottom: 5px;
             }
             @keyframes animate-in {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
             }
             .animate-in { animation: animate-in 0.3s ease-out; }
         `}</style>
    </div>
  );
};


// --- NEW COMPONENT: Email Draft Modal (Minimalist Redesign) ---
interface EmailDraftModalProps {
    draft: string;
    type: 'Offer' | 'Rejection';
    onClose: () => void;
    candidateName: string;
    newStatus: string;
}

const EmailDraftModal = ({ draft, type, onClose, candidateName, newStatus }: EmailDraftModalProps) => {
    const copyToClipboard = () => {
        navigator.clipboard.writeText(draft);
        alert('Email draft copied to clipboard!');
    };
    
    // Minimalist Colors for Offer/Rejection
    const isOffer = type === 'Offer';
    const HEADER_COLOR = isOffer ? 'text-green-600' : 'text-red-600';
    const BACKGROUND_TINT = isOffer ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200';
    const BUTTON_COLOR = isOffer ? GRADIENT_CLASS : 'bg-gray-400 hover:bg-gray-500';

    return (
        <div className="fixed inset-0 z-[9000] bg-black bg-opacity-70 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center mb-4 border-b pb-3">
                    <h3 className={`text-xl font-bold text-gray-800 flex items-center gap-2 ${HEADER_COLOR}`}>
                        {isOffer ? <Check className="w-5 h-5"/> : <X className="w-5 h-5"/>}
                        {type} Email Draft for {candidateName}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-800 p-1 rounded-full hover:bg-gray-100 transition">
                        <X size={24} />
                    </button>
                </div>

                <div className={`flex-1 overflow-y-auto p-4 border rounded-xl ${BACKGROUND_TINT} mb-4 text-sm whitespace-pre-wrap font-mono`}>
                    <div dangerouslySetInnerHTML={{ __html: draft.replace(/\n/g, '<br>') }} className="markdown-display text-gray-700 leading-relaxed" />
                </div>
                
                <p className={`text-xs font-semibold mt-2 mb-3 px-3 py-1 rounded w-fit ${isOffer ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    Status updated to: {newStatus}
                </p>

                <div className="flex gap-3">
                    <button 
                        onClick={copyToClipboard}
                        className={`flex-1 px-4 py-3 text-white rounded-xl font-semibold transition shadow-lg hover:opacity-90 ${BUTTON_COLOR}`}
                    >
                        Copy Draft & Close
                    </button>
                    <a 
                        href={`mailto:?subject=${encodeURIComponent(isOffer ? `Job Offer - ${candidateName}` : `Application Update`)}&body=${encodeURIComponent(draft.replace(/\*\*/g, '').replace(/<br>/g, '\n'))}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 px-4 py-3 text-center bg-gray-200 text-gray-800 rounded-xl font-semibold hover:bg-gray-300 transition shadow-md"
                    >
                        Open in Mail Client <ArrowUpRight size={16} className="inline-block ml-1"/>
                    </a>
                </div>
            </div>
        </div>
    );
};


export default function CVSummaryApp() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const applicantId = searchParams.get('applicantId');

  const [candidateData, setCandidateData] = useState<CandidateReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showCVModal, setShowCVModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false); 
  // ✅ NEW STATES
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailDraftData, setEmailDraftData] = useState<{ draft: string, type: 'Offer' | 'Rejection', newStatus: string } | null>(null);
  const [isDrafting, setIsDrafting] = useState(false);

  // --- PSS Calculation Logic ---
  const calculatePSS = useMemo(() => {
    if (!candidateData) return 0;

    const matchingScore = candidateData.matching_score || 0;
    
    // --- 1. Map Potential Prediction (0-100) ---
    const predText = candidateData.potential_prediction?.toLowerCase() || '';
    let potentialScore = 0;
    
    const defaultPrediction = "no prediction data available.";
    
    // ✅ FIX 1: PSS Score should be 0 if the profile is un-analyzed.
    if (matchingScore === 0 && predText.includes(defaultPrediction.toLowerCase())) {
        return 0; // Return 0 if matching hasn't run.
    }

    if (predText.includes('high potential') || predText.includes('senior ready') || predText.includes('excellent growth')) {
        potentialScore = 95;
    } else if (predText.includes('moderate potential') || predText.includes('stable growth')) {
        potentialScore = 70;
    } else {
        potentialScore = 40;
    }

    // --- 2. Map Personality Inference (0-100) ---
    const personalityText = candidateData.personality_inference?.toLowerCase() || '';
    let personalityScore = 0;
    if (personalityText.includes('result-oriented') || personalityText.includes('decisive') || personalityText.includes('leadership')) {
        personalityScore = 90;
    } else if (personalityText.includes('team-oriented') || personalityText.includes('collaborative') || personalityText.includes('detail-oriented')) {
        personalityScore = 75;
    } else {
        personalityScore = 50;
    }

    // --- 3. Weighted Average (Mock Formula) ---
    // PSS = (50% Match) + (30% Potential) + (20% Personality)
    const pss = (0.5 * matchingScore) + (0.3 * potentialScore) + (0.2 * personalityScore);
    
    return Math.round(pss);

  }, [candidateData]);


  // --- Data Fetching (เหมือนเดิม) ---
  useEffect(() => {
    if (!applicantId) { setError("Error: Applicant ID is missing in the URL."); setLoading(false); return; }
    const fetchApplicantData = async () => {
      setLoading(true);
      const { data, error: fetchError } = await supabase.from('applicants').select('*').eq('id', applicantId).single();
      if (fetchError || !data) { setError(fetchError?.message || `Applicant with ID ${applicantId} not found.`); setLoading(false); return; }

      const mappedData: CandidateReport = {
        id: data.id, name: `${data.firstName} ${data.lastName}`, firstName: data.firstName, lastName: data.lastName, experience: data.experience || "N/A", position: data.position || "N/A", education: data.education || "N/A", matching_score: data.matching_score || 0, status: data.status || "Applied", ai_summary: data.ai_summary || "No AI Summary available. Run AI Matching first.", overview: data.overview || "No detailed job fit overview available. Needs a full 1:1 match run.",
        strengths: Array.isArray(data.strengths) ? data.strengths : [], potential_gaps: Array.isArray(data.potential_gaps) ? data.potential_gaps : [], cv_url: data.cv_url, emp_id: data.emp_id,
        potential_prediction: data.potential_prediction || "No prediction data available.",
        personality_inference: data.personality_inference || "No inference data available.",
      };

      setCandidateData(mappedData);
      setLoading(false);
    };
    fetchApplicantData();
  }, [applicantId]);


  // --- Status Update Logic (เหมือนเดิม) ---
  const handleUpdateStatus = async (newStatus: string) => {
    if (!candidateData) return;
    const { error } = await supabase.from("applicants").update({ status: newStatus }).eq("id", candidateData.id);
    if (!error) {
        setCandidateData(prev => prev ? {...prev, status: newStatus} : null);
        alert(`Status updated to ${newStatus} for ${candidateData.name}`);
    } else {
        alert("Failed to update status: " + error.message);
    }
    setShowStatusDropdown(false);
  };
  
  // ✅ NEW FUNCTION: handleDraftEmail
  const handleDraftEmail = async (type: 'offer' | 'rejection') => {
    if (!applicantId || !candidateData) return;
    
    if (!confirm(`Are you sure you want to generate a ${type.toUpperCase()} email? This will set the applicant's status to '${type === 'offer' ? 'Offered' : 'Rejected'}'.`)) {
        return;
    }

    setIsDrafting(true);
    try {
        const response = await fetch('/api/draftEmail', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ applicantId, emailType: type }),
        });
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || `Failed to draft ${type} email.`);
        }

        // อัปเดต State หน้า CV Summary
        setCandidateData(prev => prev ? {...prev, status: result.statusUpdate} : null);
        
        // แสดง Modal
        setEmailDraftData({ 
            draft: result.draft, 
            type: type === 'offer' ? 'Offer' : 'Rejection', 
            newStatus: result.statusUpdate 
        });
        setShowEmailModal(true);

    } catch (error: any) {
        alert(`Error generating email: ${error.message}`);
    } finally {
        setIsDrafting(false);
    }
  };


  // --- Export and Print Functions (เหมือนเดิม) ---
  const exportToExcel = () => { 
      if (!candidateData) return;
      const csvContent = [
        ["Field", "Value"], ["Candidate Name", candidateData.name], ["Applicant ID", candidateData.id], ["Position", candidateData.position], ["Experience", candidateData.experience], ["Education", candidateData.education], ["Matching Score", candidateData.matching_score + "%"], ["Status", candidateData.status], ["AI Summary", candidateData.ai_summary], ["Strengths", candidateData.strengths.join("; ")], ["Overview", candidateData.overview], ["Potential Gaps", candidateData.potential_gaps.join("; ")],
      ].map(r => r.join(",")).join("\n");

      const blob = new Blob(['\uFEFF'+csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = `HR_Report_${candidateData.name.replace(/\s/g,'_')}.csv`; link.click();
  };

  const printToPDF = () => {
    window.print();
  };
  
  // Handlers for Modal Interactivity
  const openCVModal = () => { setShowChatModal(false); setShowCVModal(true); };
  const closeCVModal = () => setShowCVModal(false);
  const openScheduleModal = () => { setShowChatModal(false); setShowScheduleModal(true); };


  // --- Share to Email Function (เหมือนเดิม) ---
  const shareToEmail = () => {
      if (!candidateData) return;
      const subject = `HR Report: ${candidateData.name} (${candidateData.matching_score}%)`;
      const body = `Dear Team,\n\nPlease find the detailed AI analysis report for candidate ${candidateData.name} attached/below:\n\n` +
                   `Score: ${candidateData.matching_score}%\n` +
                   `Status: ${candidateData.status}\n` +
                   `AI Summary: ${candidateData.ai_summary}\n\n` +
                   `Link to CV: ${candidateData.cv_url || 'N/A'}\n\n` +
                   `Please review the attached Excel report for full details (Strengths/Gaps).`;
      
      window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };


  // --- Render Helpers (มีการใช้ PSS) ---
  const getStatusColor = (status: string) => {
    const colors: Record<string, {bg: string, text: string}> = {
      Applied: { bg: "bg-gray-100", text: "text-gray-600" }, 
      Shortlisted: { bg: "bg-blue-100", text: "text-[#14ADD6]" }, // Cyan tint
      Interviewed: { bg: "bg-yellow-100", text: "text-yellow-600" },
      Offered: { bg: "bg-green-100", text: "text-green-600" },
      Rejected: { bg: "bg-red-100", text: "text-red-600" }
    };
    return colors[status] || { bg: "bg-gray-100", text: "text-gray-600" };
  };
  const getMatchingColor = (score: number) => {
      if (score >= 90) return "bg-gradient-to-r from-green-500 to-emerald-600 shadow-emerald-400/50";
      // Use the requested colors for high/mid scores
      if (score >= 75) return `bg-gradient-to-r from-[#14ADD6] to-[#384295] shadow-[#384295]/50`; 
      if (score >= 60) return "bg-gradient-to-r from-yellow-500 to-orange-500 shadow-orange-400/50";
      return "bg-gray-500 shadow-gray-400/50";
  }
  const getScoreRating = (score: number) => {
      if (score >= 80) return "⭐⭐⭐⭐⭐ Excellent";
      if (score >= 60) return "⭐⭐⭐⭐☆ Good";
      if (score >= 40) return "⭐⭐⭐☆☆ Fair";
      return "⭐☆☆☆☆ Low";
  }
  
  const getInferredSkillDetails = (skill: string) => {
    const s = skill.toLowerCase();
    
    let proficiency = '⭐⭐☆☆☆'; 
    if (s.includes('expert') || s.includes('senior') || s.includes('strong')) {
        proficiency = '⭐⭐⭐⭐⭐';
    } else if (s.includes('used in') || s.includes('skill') || s.includes('familiar')) {
        proficiency = '⭐⭐⭐☆☆';
    }

    let tag = 'Experience Detail';
    if (s.includes('python') || s.includes('sql') || s.includes('react') || s.includes('tech')) tag = 'Core Tech';
    else if (s.includes('leadership') || s.includes('communication') || s.includes('team')) tag = 'Soft Skill';
    else if (s.includes('analysis') || s.includes('fintech')) tag = 'Industry Insight';
    
    return { proficiency, tag };
  };


  // --- Loading / Error States (เหมือนเดิม) ---
  if (loading) { 
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <Loader2 className={`w-10 h-10 animate-spin text-[${PRIMARY_COLOR_DARK}]`} />
            <p className="ml-3 text-gray-600">Loading Applicant Data...</p>
        </div>
    );
  }
  if (error || !candidateData) { 
    return (
        <div className="min-h-screen p-6 pt-24 bg-gray-50">
            <div className="max-w-6xl mx-auto p-8 rounded-2xl shadow-xl bg-white border border-red-200">
                <p className="text-red-600 font-semibold mb-4">Error loading data:</p>
                <p className="text-sm text-gray-700">{error || "No applicant data found for this ID."}</p>
                <button onClick={() => router.push('/AiMatching')} className={`mt-4 px-4 py-2 ${GRADIENT_CLASS} text-white rounded-xl hover:opacity-90 transition flex items-center gap-2 shadow-md`}>
                    <ArrowLeft size={16} /> Back to Matching
                </button>
            </div>
        </div>
    );
  }

  // --- Render Sections ---

  const RenderCandidateOverview = () => {
      const { bg: statusBg, text: statusText } = getStatusColor(candidateData.status);
      return (
          <div className="border-b pb-6 mb-6 border-gray-100 print:border-black print:pb-4 print:mb-4">
              
            {/* Action Bar (Minimalist Redesign) */}
            <div className="flex justify-between items-start mb-6 print:hidden">
                <h1 className={`text-3xl font-extrabold mb-1 ${GRADIENT_CLASS} inline-block bg-clip-text text-transparent`}>
                    AI HR MATCHING REPORT
                </h1>
                
                <div className="flex gap-3 items-center">
                    
                    {/* Status Update Dropdown (Primary Action) */}
                    <div className="relative w-40">
                        <button 
                            onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                            className={`w-full px-3 py-2.5 text-sm rounded-xl font-semibold flex items-center justify-between transition-colors ${GRADIENT_CLASS} text-white hover:opacity-90 shadow-md`}
                        >
                            Change Status <ChevronDown size={14} className="ml-1"/>
                        </button>
                        {showStatusDropdown && (
                            <div className="absolute z-20 mt-1 w-full bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
                                {STATUS_OPTIONS.map(opt => (
                                    <button
                                        key={opt}
                                        onClick={() => handleUpdateStatus(opt)}
                                        className={`block w-full text-left px-4 py-2 text-sm transition hover:bg-blue-50 ${opt === candidateData.status ? 'bg-blue-100 font-bold' : ''}`}
                                    >
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    
                    {/* Export Full Report (Secondary Action) */}
                    <button onClick={exportToExcel} className="px-3 py-2.5 bg-gray-100 text-gray-700 rounded-xl shadow-sm hover:bg-gray-200 transition font-medium text-sm flex items-center gap-2">
                        <Download size={16} className={`text-[#14ADD6]`} /> Export
                    </button>
                    
                    {/* Share via Email */}
                    <button onClick={shareToEmail} className="px-3 py-2.5 bg-gray-100 text-gray-700 rounded-xl shadow-sm hover:bg-gray-200 transition font-medium text-sm flex items-center gap-2">
                        <Mail size={16} className={`text-[#384295]`} /> Share
                    </button>
                     
                    {/* Print Report */}
                    <button onClick={printToPDF} className="px-3 py-2.5 bg-gray-100 text-gray-700 rounded-xl shadow-sm hover:bg-gray-200 transition font-medium text-sm flex items-center gap-2">
                        <Printer size={16} className={`text-gray-500`} /> Print
                    </button>

                </div>
            </div>
            {/* End of Action Bar */}

              
              <p className="text-sm text-gray-500 print:text-gray-700">Detailed Analysis for **{candidateData.name}** (ID: {candidateData.id})</p>
              
              <div className="grid grid-cols-5 gap-8 mt-6 items-start">
                  
                  {/* Col 1 & 2 & 4: Profile, Summary (80%) */}
                  <div className="col-span-4 space-y-3"> 
                      <div className="flex items-center gap-4">
                           <div className={`w-16 h-16 rounded-full bg-white flex items-center justify-center text-[${PRIMARY_COLOR_DARK}] font-bold text-xl border-4 border-[#14ADD6]/50 shadow-lg`}>
                              {candidateData.firstName[0]}{candidateData.lastName[0]}
                          </div>
                          <div>
                              <h3 className="text-2xl font-extrabold text-gray-900">{candidateData.name}</h3>
                              <p className={`text-base text-[${PRIMARY_COLOR_DARK}] font-semibold`}>{candidateData.position}</p>
                          </div>
                      </div>
                      
                      {/* AI Summary Box (Minimalist Tint) */}
                      <div className={`p-4 rounded-xl bg-[#14ADD6]/10 border border-[#14ADD6]/30 shadow-inner`}>
                          <p className={`text-gray-700 text-sm font-medium italic flex items-start gap-2`}>
                              <Sparkles size={16} className={`text-[#14ADD6] flex-shrink-0 mt-0.5`}/>
                              <span className="leading-relaxed">{candidateData.ai_summary}</span>
                          </p>
                      </div>
                      
                  </div>
                  
                  {/* Col 3: Match Score (20%) - Shifting to be the last column */}
                  <div className="col-span-1 flex flex-col items-center justify-center pt-3">
                      <div className={`${getMatchingColor(candidateData.matching_score)} text-white rounded-2xl p-4 flex flex-col items-center justify-center shadow-2xl w-full text-center print:shadow-none print:bg-gray-100 print:text-black print:border print:border-gray-300 transform hover:scale-105 transition-all duration-300`}>
                          <div className="text-6xl font-extrabold">{candidateData.matching_score}%</div>
                          <div className="text-sm mt-1 uppercase tracking-wider font-semibold">Match Score</div>
                      </div>
                      {/* PSS Display */}
                      <div className={`mt-3 p-2 rounded-xl shadow-md w-full text-center bg-gray-50 border border-gray-200 print:shadow-none print:bg-gray-100 transform hover:shadow-lg transition-all duration-300`}>
                          <div className={`text-xl font-bold text-[${PRIMARY_COLOR_DARK}]`}>{calculatePSS}%</div>
                          <div className="text-xs font-semibold text-gray-600">PSS (Potential)</div>
                      </div>
                  </div>

              </div>
          </div>
      );
    }

  const RenderDeepAnalysis = () => (
      // RenderDeepAnalysis ถูกเรียกให้เป็น Full Width โดยตรง
      <div className="space-y-8">
          
          {/* Section 1: Job Fit & Experience Summary */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 print:shadow-none print:border print:p-0 print:break-inside-avoid">
              <h3 className={`flex items-center gap-2 text-xl font-bold text-[${PRIMARY_COLOR_DARK}] mb-4 print:text-black`}>
                  <Star size={20} className={`text-[#14ADD6]`} /> Overall Job Fit Overview
              </h3>
              <p className="text-gray-700 text-base leading-relaxed mb-6">{candidateData.overview}</p>

              {/* Experience Highlights */}
              <h3 className={`flex items-center gap-2 text-xl font-bold text-[${PRIMARY_COLOR_DARK}] mb-4 pt-4 border-t border-gray-100 print:text-black`}>
                  <Clock size={20} className={`text-[#14ADD6]`} /> Experience Highlights
              </h3>
              
              <p className="text-gray-500 text-sm italic mb-4">
                  (Phrases the AI extracted as relevant strengths/achievements from the CV.)
              </p>
              
              <ul className="list-disc list-outside ml-5 space-y-2 text-gray-700 text-sm">
                  {candidateData.strengths.length > 0 ? (
                      candidateData.strengths.map((s, idx) => (
                          <li key={idx} className="font-medium hover:text-gray-900 transition">{s}</li>
                      ))
                  ) : (
                      <li className="text-gray-500 pl-6">No specific experience details were clearly extracted by the AI. Check CV document.</li>
                  )}
              </ul>
          </div>
          
          {/* Section 2: Skill Matrix & Gaps */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 print:shadow-none print:border print:p-0 print:break-inside-avoid">
              <h3 className={`flex items-center gap-2 text-xl font-bold text-[${PRIMARY_COLOR_DARK}] mb-4 print:text-black`}>
                  <BarChart2 size={20} className={`text-[#14ADD6]`} /> Skill Matrix & Proficiency
              </h3>

              {/* Skill Matrix Table (Minimalist) */}
              <div className="overflow-x-auto mb-6 border border-gray-100 rounded-lg">
                  <table className="min-w-full border-collapse">
                      <thead className="bg-gray-50">
                          <tr>
                              <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Skill/Trait (Source: AI Strengths)</th>
                              <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Proficiency (AI Estimated)</th>
                              <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Type Tag</th>
                          </tr>
                      </thead>
                      <tbody>
                          {candidateData.strengths.map((skill, index) => {
                              const details = getInferredSkillDetails(skill);
                              return (
                                  <tr key={index} className="border-t border-gray-100 hover:bg-gray-50/70 transition">
                                      <td className="px-4 py-3 text-sm font-medium text-gray-800">{skill}</td>
                                      <td className="px-4 py-3 text-sm text-yellow-600">{details.proficiency}</td> 
                                      <td className="px-4 py-3 text-sm text-gray-600 font-medium">{details.tag}</td>
                                  </tr>
                              );
                          })}
                      </tbody>
                  </table>
                  {candidateData.strengths.length === 0 && <p className="text-sm text-gray-500 p-4 text-center">No specific skills extracted from CV for this report.</p>}
              </div>

              {/* Personality & Potential (Minimalist Tint) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
                  <div className={`p-4 rounded-xl bg-[#14ADD6]/5 border border-[#14ADD6]/20 shadow-sm transition-all hover:shadow-lg`}>
                      <h3 className={`flex items-center gap-2 text-lg font-bold text-[${PRIMARY_COLOR_DARK}] mb-3`}>
                          <TrendingUp size={18} className={`text-[#14ADD6]`} /> Potential & Growth Prediction
                      </h3>
                      <p className="text-sm text-gray-700 leading-relaxed">
                          {candidateData.potential_prediction || "No prediction data available. Run AI Matching to generate this analysis."}
                      </p>
                  </div>
                  
                  <div className={`p-4 rounded-xl bg-[#384295]/5 border border-[#384295]/20 shadow-sm transition-all hover:shadow-lg`}>
                      <h3 className={`flex items-center gap-2 text-lg font-bold text-[${PRIMARY_COLOR_DARK}] mb-3`}>
                          <Users size={18} className={`text-[#384295]`} /> Personality Inference
                      </h3>
                      <p className="text-sm text-gray-700 leading-relaxed">
                          {candidateData.personality_inference || "No inference data available. Run AI Matching to generate this analysis."}
                      </p>
                      <p className="text-xs text-gray-500 mt-2 italic">*Disclaimer: AI assesses tone only.</p>
                  </div>
              </div>
          </div>

          
          {/* Section 3: Final Recommendation */}
           <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 print:shadow-none print:border print:p-0 print:break-inside-avoid">
               <h3 className={`flex items-center gap-2 text-2xl font-bold text-[${PRIMARY_COLOR_DARK}] mb-3`}>
                   <Check size={24} className={`text-[#14ADD6]`} /> AI Final Recommendation
               </h3>
               <div className={`p-4 rounded-xl bg-[#14ADD6]/10 border border-[#14ADD6]/30 text-gray-800 shadow-md`}>
                   <p className="text-lg font-extrabold mb-2">
                       Appropriate for Interview.
                   </p>
                   <p className="text-sm">
                       {candidateData.overview}
                   </p>
               </div>
           </div>
      </div>
  );
  
  // ✅ NEW: HR Automation Section (Full Width)
  const RenderHRAutomationSection = () => (
      <div className="mt-8 mb-8 space-y-6 print:hidden">
          
          <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
              <h3 className={`text-2xl font-bold text-[${PRIMARY_COLOR_DARK}] mb-6`}>HR Automation: Email Drafting & Actions</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  {/* Offer Letter */}
                  <div className="space-y-3 p-6 border border-gray-100 rounded-xl shadow-inner bg-gray-50">
                      <h4 className="text-lg font-semibold text-green-600 flex items-center gap-2">
                         <Check size={20}/> Final Offer Communication
                      </h4>
                      <p className="text-sm text-gray-600">Generate a personalized offer letter draft highlighting the candidate s specific strengths (based on AI analysis).</p>
                      <button 
                          onClick={() => handleDraftEmail('offer')}
                          disabled={isDrafting}
                          className={`w-full px-4 py-3 ${GRADIENT_CLASS} text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition shadow-lg disabled:opacity-50`}
                      >
                          {isDrafting ? <Loader2 className="w-5 h-5 animate-spin"/> : <Mail size={20} />} Generate Offer Letter
                      </button>
                  </div>
                  
                  {/* Rejection Letter */}
                  <div className="space-y-3 p-6 border border-gray-100 rounded-xl shadow-inner bg-gray-50">
                      <h4 className="text-lg font-semibold text-red-600 flex items-center gap-2">
                         <X size={20}/> Constructive Rejection
                      </h4>
                      <p className="text-sm text-gray-600">Generate a professional rejection email draft providing constructive feedback based on the identified Potential Gaps.</p>
                      <button 
                          onClick={() => handleDraftEmail('rejection')}
                          disabled={isDrafting}
                          className="w-full px-4 py-3 bg-red-500 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-red-600 transition shadow-lg disabled:opacity-50"
                      >
                          {isDrafting ? <Loader2 className="w-5 h-5 animate-spin"/> : <X size={20} />} Generate Rejection
                      </button>
                  </div>
              </div>
          </div>
      </div>
  );
  
  // ✅ NEW: CV Document Access Section (Full Width, อยู่ล่างสุด)
  const RenderCVDocumentSection = () => (
    <div className="mt-8 mb-8 space-y-6 print:hidden">
        
        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
            <h3 className={`text-2xl font-bold text-[${PRIMARY_COLOR_DARK}] mb-6`}>
                <FileText size={24} className="inline-block mr-2 text-[#14ADD6]"/> CV Document Access (File Reference)
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* 1. View CV Button (Primary Action) */}
                <div className="col-span-1">
                    {candidateData?.cv_url ? (
                        <button onClick={openCVModal} className={`w-full px-4 py-3 ${GRADIENT_CLASS} text-white rounded-xl font-semibold hover:opacity-90 transition shadow-lg flex items-center justify-center gap-2`}>
                            <Eye size={20} /> View Full CV (PDF Preview)
                        </button>
                    ) : (
                        <div className="px-4 py-3 bg-gray-100 text-gray-500 rounded-xl font-semibold text-center shadow-sm">No CV File</div>
                    )}
                </div>

                {/* 2. Download CV Button (Secondary Action) */}
                <div className="col-span-1">
                    {candidateData?.cv_url ? (
                        <button onClick={() => window.open(candidateData.cv_url)} className={`w-full px-4 py-3 bg-gray-100 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition shadow-sm flex items-center justify-center gap-2`}>
                            <Download size={20} /> Download Original File
                        </button>
                    ) : (
                         <div className="px-4 py-3 bg-gray-100 text-gray-500 rounded-xl font-semibold text-center shadow-sm">Download Unavailable</div>
                    )}
                </div>
                
                <div className="col-span-1 flex items-center justify-center text-sm text-gray-600">
                    {candidateData?.cv_url ? `File Link: ${candidateData.cv_url.substring(0, 40)}...` : 'File not found.'}
                </div>
            </div>
        </div>
    </div>
  );
  
  // ⛔️ RenderCVSection ถูกลบออกแล้ว


  return (
    <Suspense fallback={<div>Loading...</div>}>
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6 pt-12"> 
        {/* CSS สำหรับ Print Optimization (เหมือนเดิม) */}
        <style jsx global>{`
            /* ... (Print Styles) ... */
        `}</style>


      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* START OF A4 REPORT CONTAINER */}
        <div className="report-container bg-white rounded-3xl shadow-2xl p-10 border border-gray-100 print:shadow-none print:border-0 print:p-0 print:m-0">
            
            {/* Report Header & Overview (Section 1) */}
            {RenderCandidateOverview()}

            {/* AI Report and CV Preview Grid (ใช้ Col-span 3 และ 1) */}
            <div className="col-span-full"> 
                {/* ✅ FIX 2/3: RenderDeepAnalysis ถูกเรียกให้เป็น Full Width โดยตรง */}
                {RenderDeepAnalysis()}
            </div>
        </div>
        
        {/* ✅ HR Automation Section (Full Width) */}
        <div className="max-w-6xl mx-auto">
            {RenderHRAutomationSection()}
        </div>
        
        {/* ✅ CV Document Access Section (Full Width, อยู่ล่างสุด) */}
        <div className="max-w-6xl mx-auto">
            {RenderCVDocumentSection()}
        </div>
        
        
        {/* CV Full Modal (สำหรับ View CV) */}
        {showCVModal && candidateData.cv_url && (
          <div className="fixed inset-0 z-50 flex justify-center items-center bg-black bg-opacity-70 print:hidden">
            <div className="relative bg-white rounded-2xl p-6 max-w-6xl w-full h-[90vh] flex flex-col shadow-2xl">
              <div className="flex justify-between items-center p-2 border-b mb-3">
                  <h3 className={`text-xl font-bold text-[${PRIMARY_COLOR_DARK}]`}>Full CV Document Preview</h3>
                   <button onClick={closeCVModal} className="text-gray-400 hover:text-gray-800 p-2 bg-white rounded-full shadow-lg transition hover:bg-gray-50">
                    <X size={24} />
                  </button>
              </div>
               
              <div className="flex-1 overflow-hidden">
                <iframe
                  src={candidateData.cv_url}
                  width="100%"
                  height="100%"
                  className="border border-gray-200 rounded-xl shadow-inner"
                  title="Full CV Document"
                ></iframe>
              </div>
            </div>
          </div>
        )}

        {/* Floating Chatbot Button / Chatbot Modal / Email Draft Modal (เหมือนเดิม) */}
        <div className="fixed bottom-8 right-8 z-40 print:hidden">
            <button
                onClick={() => setShowChatModal(true)}
                className={`relative h-16 w-16 rounded-full shadow-2xl hover:scale-110 transition-all duration-300 ${GRADIENT_CLASS} hover:shadow-[#14ADD6]/70 group`}
                title="Open AI HR Assistant"
            >
                 <div className="absolute inset-0 flex items-center justify-center p-1">
                    <AIHeadCharacter size="md" animated />
                 </div>
                 <div className={`absolute -top-1 -right-1 h-5 w-5 rounded-full ${GRADIENT_CLASS} flex items-center justify-center text-white text-xs font-bold animate-bounce shadow-md`}>
                    <MessageSquare size={12} />
                 </div>
            </button>
        </div>


        {/* Chatbot Full Screen Modal */}
        {showChatModal && applicantId && candidateData && (
            <div className="fixed inset-0 z-50 flex justify-center items-center bg-black bg-opacity-70 print:hidden">
                <div className="relative bg-white rounded-2xl w-full max-w-4xl h-[90vh] flex flex-col shadow-2xl overflow-hidden">
                    <EnhancedChatbotModalContent 
                        applicantId={applicantId} 
                        onClose={() => setShowChatModal(false)}
                        candidateName={candidateData.name} 
                        onOpenCV={openCVModal} 
                        onOpenReport={() => router.push(`/CVSummary?applicantId=${applicantId}`)} 
                        candidateData={candidateData}
                    />
                </div>
            </div>
        )}

        {/* Email Draft Modal */}
        {showEmailModal && emailDraftData && candidateData && (
            <EmailDraftModal 
                draft={emailDraftData.draft}
                type={emailDraftData.type}
                candidateName={candidateData.name}
                newStatus={emailDraftData.newStatus}
                onClose={() => setShowEmailModal(false)}
            />
        )}


      </div>
    </div>
    </Suspense>
  );
}