import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboardingChat } from '@/hooks/useOnboardingChat';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { OnboardingMessage } from '@/components/onboarding/OnboardingMessage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Loader2, Sparkles } from 'lucide-react';
import logoHorizontal from '@/assets/logo-horizontal.png';
import logoIcon from '@/assets/logo-icon-onboarding.png';
import { cn } from '@/lib/utils';
export default function OnboardingPage() {
  const navigate = useNavigate();
  const {
    user
  } = useAuth();
  const {
    messages,
    isStreaming,
    sendMessage,
    startSession,
    error
  } = useOnboardingChat();
  const [inputValue, setInputValue] = useState('');
  const [showCompletion, setShowCompletion] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
  }, [messages]);

  // Auto-start session on mount
  useEffect(() => {
    if (!sessionStarted && user?.id) {
      setSessionStarted(true);
      startSession().catch(console.error);
    }
  }, [sessionStarted, user?.id, startSession]);

  // Focus input when not streaming
  useEffect(() => {
    if (!isStreaming && !showCompletion) {
      inputRef.current?.focus();
    }
  }, [isStreaming, showCompletion]);
  const handleSendMessage = async () => {
    if (!inputValue.trim() || isStreaming) return;
    const content = inputValue.trim();
    setInputValue('');
    try {
      const response = await sendMessage(content);

      // Check for completion trigger
      if (response.includes('JSON_GENERATION_COMPLETE')) {
        setShowCompletion(true);

        // Update profile as onboarded
        if (user?.id) {
          await supabase.from('profiles').update({
            onboarded: true
          }).eq('id', user.id);
        }

        // Redirect after 4 seconds
        setTimeout(() => {
          navigate('/dashboard');
        }, 4000);
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  const handleSkip = async () => {
    // Mark as onboarded even if skipping
    if (user?.id) {
      await supabase.from('profiles').update({
        onboarded: true
      }).eq('id', user.id);
    }
    navigate('/dashboard');
  };
  return <div className="min-h-screen bg-[hsl(222,47%,11%)] flex flex-col relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-slate-700/50 bg-[hsl(222,47%,11%)]/80 backdrop-blur-sm">
        <img src={logoHorizontal} alt="Logo" className="h-8" />
        <Button variant="ghost" onClick={handleSkip} className="text-muted-foreground hover:text-foreground">
          Skip
        </Button>
      </header>

      {/* Chat Container */}
      <main className="relative z-10 flex-1 flex flex-col max-w-3xl mx-auto w-full px-4 py-6">
        {/* Welcome Header */}
        {messages.length === 0 && !isStreaming && <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-4 animate-in fade-in-0 duration-500">
              <div className="w-16 h-16 mx-auto flex items-center justify-center">
                <img src={logoIcon} alt="Logo" className="w-16 h-16 object-contain" />
              </div>
              <h1 className="text-3xl font-bold text-primary-foreground">Let's build your app</h1>
              <p className="text-lg max-w-md text-secondary">
                Our BuilderOS will guide you through creating your perfect product roadmap.
              </p>
              {isStreaming && <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Architect is thinking...</span>
                </div>}
            </div>
          </div>}

        {/* Messages */}
        {(messages.length > 0 || isStreaming) && <div className="flex-1 overflow-y-auto space-y-6 pb-4">
            {messages.map(message => <OnboardingMessage key={message.id} role={message.role} content={message.content} />)}

            {isStreaming && <div className="flex gap-4 justify-start animate-in fade-in-0">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                  <Loader2 className="w-5 h-5 text-white animate-spin" />
                </div>
                <div className="bg-card border border-border rounded-2xl rounded-bl-md px-5 py-4 shadow-md">
                  <p className="text-xs font-semibold text-blue-400 mb-1.5 uppercase tracking-wide">
                    Architect
                  </p>
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{
                animationDelay: '0ms'
              }} />
                    <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{
                animationDelay: '150ms'
              }} />
                    <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{
                animationDelay: '300ms'
              }} />
                  </div>
                </div>
              </div>}

            <div ref={messagesEndRef} />
          </div>}

        {/* Error Display */}
        {error && <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 mb-4 text-destructive text-sm">
            {error.message}
          </div>}
      </main>

      {/* Input Area */}
      <div className="relative z-10 border-t border-slate-700/50 bg-[hsl(222,47%,11%)]/80 backdrop-blur-sm px-4 py-4">
        <div className="max-w-3xl mx-auto flex gap-3">
          <Input ref={inputRef} value={inputValue} onChange={e => setInputValue(e.target.value)} onKeyDown={handleKeyDown} placeholder="Type your message..." disabled={isStreaming || showCompletion} className="flex-1 h-12 text-base bg-[#293445] border-border/50 focus-visible:ring-blue-500 text-foreground placeholder:text-muted-foreground" />
          <Button onClick={handleSendMessage} disabled={!inputValue.trim() || isStreaming || showCompletion} className="h-12 px-6 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 shadow-lg">
            {isStreaming ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Completion Overlay */}
      <div className={cn('fixed inset-0 z-50 bg-[hsl(222,47%,11%)]/95 backdrop-blur-xl flex items-center justify-center transition-all duration-500', showCompletion ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none')}>
        <div className="text-center space-y-8 animate-in fade-in-0 zoom-in-95 duration-700">
          {/* Premium Pulsing Animation */}
          <div className="relative">
            {/* Outer glow rings */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-40 h-40 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 animate-ping" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 rounded-full bg-gradient-to-r from-blue-500/30 to-purple-500/30 animate-pulse" />
            </div>
            
            {/* Center icon */}
            <div className="relative w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-blue-600 flex items-center justify-center shadow-2xl animate-pulse">
              <Sparkles className="w-12 h-12 text-white" />
            </div>
          </div>

          {/* Text */}
          <div className="space-y-3">
            <h2 className="text-3xl font-bold text-foreground">
              Construction in progress...
            </h2>
            <p className="text-xl text-muted-foreground max-w-md mx-auto">
              Generating your Roadmap & Database.
            </p>
          </div>

          {/* Loading bar */}
          <div className="w-64 h-1.5 mx-auto bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-[loading_2s_ease-in-out_infinite]" style={{
            animation: 'loading 2s ease-in-out infinite'
          }} />
          </div>
        </div>
      </div>

      {/* Custom animation styles */}
      <style>{`
        @keyframes loading {
          0% { width: 0%; margin-left: 0; }
          50% { width: 100%; margin-left: 0; }
          100% { width: 0%; margin-left: 100%; }
        }
      `}</style>
    </div>;
}