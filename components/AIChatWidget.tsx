
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { useLocation } from 'wouter';
import { storage } from '../services/mockData';
import { 
  X, 
  Send, 
  Sparkles, 
  Bot, 
  User,
  ExternalLink,
  Beer
} from 'lucide-react';

interface Message {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

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
              className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md font-bold border transition-all hover:scale-105 active:scale-95 mx-0.5 ${bgColor}`}
            >
              {cleanContent}
              <ExternalLink className="w-2.5 h-2.5 opacity-60" />
            </button>
          );
        }
        return <strong key={i} className="font-bold text-slate-900 dark:text-white">{cleanContent}</strong>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  const lines = text.split('\n');
  return (
    <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (trimmed.startsWith('###')) {
          return (
            <h3 key={i} className="text-[11px] font-black text-primary dark:text-blue-400 uppercase tracking-wider mt-3 mb-1.5 border-b border-slate-100 dark:border-slate-700 pb-1">
              {trimmed.replace('###', '').trim()}
            </h3>
          );
        }
        if (trimmed === '') return <div key={i} className="h-1" />;
        return <p key={i}>{renderLineContent(line)}</p>;
      })}
    </div>
  );
};

const AIChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'model', 
      text: '¡Hola! Soy tu **Asistente Cervecero**. \n\n¿Tienes dudas sobre el stock, alguna receta o un evento?\n\n### Ejemplos:\n- ¿Qué barriles tengo en la **Bodega Principal**?\n- Muéstrame los pasos de la **Golden Ale Clásica**.', 
      timestamp: new Date() 
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage, timestamp: new Date() }]);
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // Obtener datos reales del almacenamiento local
      const currentData = {
        barrels: storage.getBarrels(),
        locations: storage.getLocations(),
        events: storage.getEvents(),
        recipes: storage.getRecipes()
      };

      const systemInstruction = `
        Eres un Asistente Experto en Gestión de Cervecerías para BarrelTrack. 
        Tu misión es responder dudas operativas basándote exclusivamente en estos datos reales:
        DATOS DE LA BODEGA: ${JSON.stringify(currentData)}
        
        INSTRUCCIONES:
        - Si te preguntan por un barril específico (ej: BRL-001), da su estado y ubicación.
        - Si te preguntan por stock en una ubicación, lista los barriles allí.
        - Usa Markdown. Resalta nombres de barriles, recetas y eventos con **doble asterisco**.
        - Tono profesional, conciso y útil.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [
          ...messages.slice(-6).map(m => ({ role: m.role, parts: [{ text: m.text }] })),
          { role: 'user', parts: [{ text: userMessage }] }
        ],
        config: {
          systemInstruction,
          temperature: 0.2
        }
      });

      setMessages(prev => [...prev, { role: 'model', text: response.text || "Lo siento, no pude procesar esa información.", timestamp: new Date() }]);
    } catch (error) {
      console.error("AI Widget Error:", error);
      setMessages(prev => [...prev, { role: 'model', text: "Lo siento, hubo un error de conexión con el núcleo de datos.", timestamp: new Date() }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 md:bottom-8 right-6 z-[60] w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all duration-200 group shadow-lg"
      >
        <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
      </button>
    );
  }

  return (
    <div 
      className="fixed right-4 md:right-8 bottom-24 md:bottom-8 w-[calc(100%-2rem)] md:w-[380px] h-[540px] rounded-[2rem] z-[100] transition-all duration-300 ease-in-out flex flex-col border border-slate-200 dark:border-slate-700 overflow-hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-2xl"
    >
      <div className="flex items-center justify-between w-full shrink-0 p-4 border-b border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white">
             <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-black text-slate-800 dark:text-white leading-tight uppercase tracking-tight">
              Soporte Inteligente
            </h3>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-500 rounded-xl text-slate-400 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/10 dark:bg-slate-950/20 custom-scrollbar">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex gap-2.5 max-w-[92%] ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`p-3.5 rounded-2xl text-[13px] leading-relaxed shadow-sm
                ${m.role === 'user' 
                  ? 'bg-primary text-white rounded-tr-none font-semibold' 
                  : 'bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-tl-none'}`}
              >
                {m.role === 'model' ? <MarkdownContent text={m.text} /> : m.text}
                <div className={`text-[8px] mt-2 font-black uppercase tracking-widest ${m.role === 'user' ? 'text-white/50 text-right' : 'text-slate-300 dark:text-slate-500'}`}>
                  {new Date(m.timestamp).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false })}
                </div>
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
              <Sparkles className="w-3 h-3 text-primary animate-pulse" />
              <span className="text-[10px] font-bold text-slate-400 animate-pulse">Sincronizando datos...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 shrink-0">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="¿En qué puedo ayudarte?"
            className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-3.5 pl-4 pr-12 text-[13px] font-medium text-slate-800 dark:text-white placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-700 focus:ring-1 focus:ring-primary/20 outline-none transition-all"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className={`absolute right-1.5 top-1.5 p-2 rounded-xl transition-all
              ${input.trim() && !isLoading ? 'bg-primary text-white' : 'text-slate-300 dark:text-slate-600'}`}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default AIChatWidget;
