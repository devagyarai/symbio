'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, MessageSquare, Send } from 'lucide-react';
import { Button, IconButton, Textarea, Avatar } from 'ui';

const typingVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      staggerChildren: 0.1,
      delayChildren: 0.3
    }
  }
};

const dotVariants = {
  hidden: { opacity: 0, y: 0 },
  visible: { 
    opacity: 1, 
    y: [0, -4, 0],
    transition: { 
      repeat: Infinity,
      duration: 1
    }
  }
};

export function AIAssistantWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'assistant', content: string}[]>([
    { role: 'assistant', content: 'Hi there! I am Symbio AI. How can I help you streamline your workflow today?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;
    
    setMessages(prev => [...prev, { role: 'user', content: input }]);
    setInput('');
    setIsTyping(true);

    // Simulate AI streaming delay
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, { role: 'assistant', content: "That's a great question. Based on your current workspace configuration, I recommend setting up automated audit logs." }]);
    }, 2500);
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        <AnimatePresence>
          {!isOpen && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                onClick={() => setIsOpen(true)}
                className="w-14 h-14 rounded-full shadow-lg bg-primary hover:bg-primary/90 flex items-center justify-center p-0"
              >
                <Sparkles className="w-6 h-6 text-primary-foreground" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-3rem)] h-[550px] max-h-[calc(100vh-3rem)] flex flex-col bg-surface border border-border shadow-2xl rounded-2xl overflow-hidden glass-2"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border bg-black/5 dark:bg-white/5 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Symbio AI</h3>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block animate-pulse"></span>
                    Online
                  </p>
                </div>
              </div>
              <IconButton variant="ghost" onClick={() => setIsOpen(false)} className="w-8 h-8 rounded-full">
                <X className="w-4 h-4" />
              </IconButton>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <Avatar className="w-8 h-8 shrink-0">
                    <span className="text-xs font-bold text-primary">{msg.role === 'assistant' ? 'AI' : 'U'}</span>
                  </Avatar>
                  <div className={`px-4 py-2.5 rounded-2xl max-w-[80%] text-sm ${
                    msg.role === 'user' 
                      ? 'bg-primary text-primary-foreground rounded-tr-sm' 
                      : 'bg-muted rounded-tl-sm'
                  }`}>
                    {msg.content}
                  </div>
                </motion.div>
              ))}

              {isTyping && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3"
                >
                  <Avatar className="w-8 h-8 shrink-0">
                    <span className="text-xs font-bold text-primary">AI</span>
                  </Avatar>
                  <div className="px-4 py-3.5 rounded-2xl rounded-tl-sm bg-muted flex items-center gap-1.5 h-10">
                    <motion.div variants={typingVariants} initial="hidden" animate="visible" className="flex gap-1.5">
                      <motion.div variants={dotVariants} className="w-1.5 h-1.5 rounded-full bg-primary/60" />
                      <motion.div variants={dotVariants} className="w-1.5 h-1.5 rounded-full bg-primary/60" />
                      <motion.div variants={dotVariants} className="w-1.5 h-1.5 rounded-full bg-primary/60" />
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-3 border-t border-border bg-black/5 dark:bg-white/5">
              <form onSubmit={handleSubmit} className="relative flex items-center">
                <Textarea 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask Symbio AI anything..."
                  className="min-h-[50px] max-h-[120px] resize-none rounded-xl pr-12 py-3 bg-background border-border shadow-sm focus-visible:ring-primary/50"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit();
                    }
                  }}
                />
                <IconButton 
                  type="submit" 
                  disabled={!input.trim() || isTyping}
                  className="absolute right-2 bottom-2 w-8 h-8 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:bg-muted disabled:text-muted-foreground"
                >
                  <Send className="w-4 h-4" />
                </IconButton>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
