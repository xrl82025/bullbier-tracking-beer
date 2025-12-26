
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { useLocation } from 'wouter';
import { storage } from '../services/mockData';
import { 
  Sparkles, 
  Bot, 
  User, 
  Send, 
  Loader2, 
  ExternalLink, 
  Zap, 
  ShieldCheck, 
  Database,
  BarChart3,
  Search,
  ChevronRight,
  Info,
  RotateCcw,
  MessageSquarePlus,
  ArrowRight
} from 'lucide-react';

interface Message {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

const STORAGE_KEY = 'barreltrack_ai_conversation';

const INITIAL_MESSAGE: Message = { 
  role: 'model', 
  text: '### Bienvenido al Centro de Inteligencia Operativa\n\nEstoy conectado al núcleo de datos de **BarrelTrack** en tiempo real. He analizado la flota y esto es lo que puedo hacer por ti:\n\n- **Auditoría de Barriles:** Rastrea el historial de cualquier activo como el **BRL-001**.\n- **Análisis de Producción:** Consulta ingredientes y pasos de recetas como la **Golden Ale Clásica**.\n- **Planificación Logística:** Checklist para eventos como el **Festival Cerveza Invierno**.\n\n¿En qué área operativa necesitas apoyo hoy?', 
  timestamp: new Date() 
};

/**
 * Enhanced Markdown Content for the Main AI Agent Page
 */
const MarkdownContent: React.FC<{ text: string }> = ({ text }) => {
  const [, setLocation] = useLocation();
  const barrels = storage.getBarrels();
  const recipes = storage.getRecipes();
  const events = storage.getEvents();

  const handleInternalLink = (entityType: string, value: string) => {
    if (entityType === 'barrel') {
      const barrel = barrels.find(b => b.code === value);
      if (barrel) setLocation(`/barrels/${barrel.id}`);
    } else if (entityType === 'recipe') {
      setLocation('/recipes');
    } else if (entityType === 'event') {
      setLocation('/events');
    }
  };

  const renderLineContent = (line: string) => {
    const parts = line.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        const cleanContent = part.slice(2, -2);
        const isBarrel = /^BRL-\d{3}$/.test(cleanContent);
        const isRecipe = recipes.some(r => r.name.toLowerCase() === cleanContent.toLowerCase());
        const isEvent = events.some(e => e.name.toLowerCase() === cleanContent.toLowerCase());

        if (isBarrel || isRecipe || isEvent) {
          let type = isBarrel ? 'barrel' : isRecipe ? 'recipe' : 'event';
          let bgColor = isBarrel ? 'bg-primary/10 text-primary border-primary/20 dark:bg-primary/20 dark:text-blue-400' : 
                        isRecipe ? 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400' : 
                        'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400';

          return (
            <button
              key={i}
              onClick={() => handleInternalLink(type, cleanContent)}
              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg font-black border transition-all hover:scale-105 active:scale-95 mx-0.5 ${bgColor} text-[10px]`}
            >
              {cleanContent}
              <ExternalLink className="w-2 h-2 opacity-60" />
            </button>
          );
        }
        return <strong key={i} className="font-bold text-slate-900 dark:text-white">{cleanContent}</strong>;
      }
      return <span key={i} className="break-words">{part}</span>;
    });
  };

  const lines = text.split('\n');
  return (
    <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300 leading-relaxed overflow-x-hidden">
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (trimmed.startsWith('###')) {
          return (
            <h3 key={i} className="text-sm font-black text-primary dark:text-blue-400 uppercase tracking-wider mt-4 mb-2 border-b border-slate-100 dark:border-slate-700 pb-1.5 flex items-center gap-2">
              <Zap className="w-3.5 h-3.5" />
              {trimmed.replace('###', '').trim()}
            </h3>
          );
        }
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          return (
            <div key={i} className="flex gap-2 ml-1 items-start bg-slate-50/50 dark:bg-slate-900/50 p-2 rounded-xl border border-transparent hover:border-slate-100 dark:hover:border-slate-700 transition-all">
              <span className="text-primary mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0 shadow-sm shadow-primary/40" />
              <span className="break-words w-full">{renderLineContent(trimmed.substring(2))}</span>
            </div>
          );
        }
        if (trimmed.includes('|') && trimmed.split('|').length > 2) {
          const cells = trimmed.split('|').filter(c => c.trim() !== '');
          if (trimmed.includes('---')) return <div key={i} className="h-px bg-slate-100 dark:bg-slate-700 my-1" />;
          return (
            <div key={i} className="grid grid-cols-2 gap-2 bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700 my-1 shadow-sm overflow-hidden">
              {cells.map((cell, ci) => (
                <span key={ci} className={`${ci === 0 ? 'font-black text-slate-400 dark:text-slate-500 text-[8px] uppercase tracking-widest' : 'text-slate-800 dark:text-slate-200 font-bold text-[11px]'} break-words truncate`}>
                  {renderLineContent(cell.trim())}
                </span>
              ))}
            </div>
          );
        }
        if (trimmed === '') return <div key={i} className="h-1" />;
        return <p key={i} className="break-words">{renderLineContent(line)}</p>;
      })}
    </div>
  );
};

const AIAgent: React.FC = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp)
        }));
      } catch (e) {
        console.error("Error parsing saved conversation", e);
      }
    }
    return [INITIAL_MESSAGE];
  });
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  const startNewConversation = () => {
    if (confirm("¿Seguro que quieres iniciar una nueva conversación? Se borrará el historial actual.")) {
      setMessages([INITIAL_MESSAGE]);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent, prompt?: string) => {
    if (e) e.preventDefault();
    const userMessage = prompt || input.trim();
    if (!userMessage || isLoading) return;

    setInput('');
    const newMessage: Message = { role: 'user', text: userMessage, timestamp: new Date() };
    setMessages(prev => [...prev, newMessage]);
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // EXTRACCIÓN DE DATOS REALES DEL STORAGE
      const currentSnapshot = {
        barrels: storage.getBarrels(),
        locations: storage.getLocations(),
        activities: storage.getActivities().slice(0, 30), // Contexto histórico relevante
        recipes: storage.getRecipes(),
        events: storage.getEvents()
      };

      const systemInstruction = `
        Eres el "Cerebro Operativo de BarrelTrack", una IA de análisis logístico cervecero.
        
        CONTEXTO OPERATIVO ACTUAL: ${JSON.stringify(currentSnapshot)}
        
        TUS RESPONSABILIDADES:
        1. Analizar el estado de la flota de barriles.
        2. Proporcionar detalles de recetas y procesos de producción.
        3. Ayudar en la logística de eventos y checklists.
        4. Identificar inconsistencias (ej: un barril sucio asignado a un evento).
        
        FORMATO DE RESPUESTA:
        - Usa Markdown estructurado.
        - Resalta códigos de barriles (ej: **BRL-001**), recetas (ej: **Golden Ale**) y eventos (ej: **Festival**) en negrita.
        - Si el usuario pregunta por stock, genera una tabla o lista clara.
        - Sé directo, técnico y proactivo.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [
          ...messages.slice(-10).map(m => ({ role: m.role, parts: [{ text: m.text }] })),
          { role: 'user', parts: [{ text: userMessage }] }
        ],
        config: { 
          systemInstruction, 
          temperature: 0.2,
          topP: 0.95
        },
      });

      setMessages(prev => [...prev, { role: 'model', text: response.text || "No se pudo obtener una respuesta del servidor analítico.", timestamp: new Date() }]);
    } catch (error) {
      console.error("AI Agent Error:", error);
      setMessages(prev => [...prev, { role: 'model', text: "Error crítico de conexión con la base de datos de inteligencia.", timestamp: new Date() }]);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestions = [
    { label: "¿Estado actual?", prompt: "¿Podrías darme un resumen de cuántos barriles hay por estado y dónde están?" },
    { label: "Barril BRL-001", prompt: "Dame el historial detallado y estado actual del barril BRL-001" },
    { label: "Próximos eventos", prompt: "¿Qué eventos tenemos programados y qué barriles están asignados?" },
    { label: "Ingredientes Golden", prompt: "¿Qué ingredientes necesito para la Golden Ale y en qué cantidades?" }
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100dvh-64px)] md:h-[calc(100vh-120px)] animate-in fade-in duration-700 w-full overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex w-72 flex-col gap-5 shrink-0 h-full">
        <div className="bg-white dark:bg-slate-800 rounded-[2rem] p-5 border border-slate-100 dark:border-slate-700 shadow-sm space-y-5 h-full overflow-y-auto custom-scrollbar flex flex-col">
          <div>
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Bot className="w-3.5 h-3.5 text-primary" />
              Estado del Núcleo
            </h3>
            <div className="flex items-center gap-2 p-2.5 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
              <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-white shrink-0">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-black text-slate-800 dark:text-white tracking-tight truncate">Omni-Brain v4.0</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-[7px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Sincronizado</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5 px-1">Consultas Sugeridas</h3>
            <div className="space-y-1.5">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(undefined, s.prompt)}
                  disabled={isLoading}
                  className="w-full text-left p-3 rounded-xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-primary/30 dark:hover:border-primary/30 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all group flex justify-between items-center"
                >
                  <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 group-hover:text-primary transition-colors leading-relaxed pr-2">
                    {s.label}
                  </span>
                  <ChevronRight className="w-3 h-3 text-slate-300 group-hover:text-primary transition-colors shrink-0" />
                </button>
              ))}
            </div>

            <div className="mt-4 px-1">
              <button 
                onClick={startNewConversation}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-50/50 dark:bg-slate-900/50 text-slate-400 rounded-xl font-bold text-[9px] uppercase tracking-[0.15em] hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-500 transition-all border border-slate-100/50 dark:border-slate-700 group"
              >
                <RotateCcw className="w-3 h-3 group-hover:rotate-180 transition-transform duration-500" />
                <span>Reiniciar Canal</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="flex-1 flex flex-col bg-white dark:bg-slate-800 md:rounded-[2.5rem] border-x-0 md:border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden relative h-full w-full">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
        
        <div className="p-4 md:p-6 border-b border-slate-50 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm flex justify-between items-center z-10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary-light dark:bg-primary/20 flex items-center justify-center text-primary">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs md:text-sm font-black text-slate-900 dark:text-white tracking-tight uppercase">INTELIGENCIA DE DATOS</h2>
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-0.5">LECTURA EN TIEMPO REAL</p>
            </div>
          </div>
          
          <button 
            onClick={startNewConversation}
            className="lg:hidden p-2 text-slate-400 hover:text-rose-500 transition-colors"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 custom-scrollbar z-10 bg-slate-50/10 dark:bg-slate-950/20 overflow-x-hidden w-full">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300 w-full`}>
              <div className={`flex gap-3 max-w-full md:max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start`}>
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 shadow-sm
                  ${m.role === 'user' ? 'bg-slate-100 dark:bg-slate-700 text-slate-400' : 'bg-primary text-white'}`}
                >
                  {m.role === 'user' ? <User className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
                </div>
                <div className={`p-4 rounded-2xl shadow-sm relative overflow-hidden break-words w-full
                  ${m.role === 'user' 
                    ? 'bg-primary text-white rounded-tr-none font-semibold text-xs md:text-sm' 
                    : 'bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-tl-none'}`}
                >
                  {m.role === 'model' ? <MarkdownContent text={m.text} /> : <p className="break-words text-xs md:text-sm">{m.text}</p>}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start animate-pulse w-full">
              <div className="flex gap-3 items-center bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                <Loader2 className="w-4 h-4 text-primary animate-spin" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Calculando métricas...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="px-4 py-4 md:px-6 md:py-6 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700 z-10 shrink-0 w-full">
          <form onSubmit={handleSendMessage} className="relative group max-w-4xl mx-auto w-full">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Pregunta sobre stock, recetas o logística..."
              className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-transparent rounded-2xl py-3.5 pl-12 pr-14 text-sm font-semibold text-slate-800 dark:text-white placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-800 focus:border-primary/20 outline-none transition-all"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className={`absolute right-1.5 top-1/2 -translate-y-1/2 p-2.5 rounded-xl transition-all
                ${input.trim() && !isLoading ? 'bg-primary text-white active:scale-95 shadow-lg shadow-primary/20' : 'bg-slate-100 dark:bg-slate-700 text-slate-300 dark:text-slate-500'}`}
            >
              <Send className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AIAgent;
