import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useOnboardingChat } from '@/hooks/useOnboardingChat';
import { useAuth } from '@/hooks/useAuth';
import { useProjectContext } from '@/contexts/ProjectContext';
import { supabase } from '@/integrations/supabase/client';
import { OnboardingMessage } from '@/components/onboarding/OnboardingMessage';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';

import { Send, Loader2, Sparkles, ArrowRight, Bug, Check } from 'lucide-react';
import logoHorizontal from '@/assets/logo-horizontal.png';
import logoIcon from '@/assets/logo-icon-onboarding.png';
import { cn } from '@/lib/utils';
import { useDebugMode } from '@/hooks/useDebugMode';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';

export default function OnboardingPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const isNewAppMode = searchParams.get('mode') === 'new';

  const { user } = useAuth();
  const { refreshApps, selectApp } = useProjectContext();
  const { isDebug } = useDebugMode();
  const {
    messages,
    isStreaming,
    sendMessage,
    startSession,
    error,
    workflowMode,
    modeLoading,
    bmCompletion,
    uvCompletion,
    pbCompletion,
    suggestions: dynamicSuggestions,
  } = useOnboardingChat(isNewAppMode);

  const [inputValue, setInputValue] = useState('');
  const [showCompletion, setShowCompletion] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [isSkipping, setIsSkipping] = useState(false);
  const [isSessionComplete, setIsSessionComplete] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [showSkipWarning, setShowSkipWarning] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const MAX_INPUT_LINES = 7;

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
  }, [messages]);

  // No need for mode=new effect — handled by useOnboardingChat(forceNew)

  // Auto-start session once workflowMode is resolved
  useEffect(() => {
    if (!sessionStarted && user?.id && !modeLoading && workflowMode) {
      setSessionStarted(true);
      startSession().catch(console.error);
    }
  }, [sessionStarted, user?.id, startSession, modeLoading, workflowMode]);

  // Focus input when not streaming
  useEffect(() => {
    if (!isStreaming && !showCompletion) {
      inputRef.current?.focus();
    }
  }, [isStreaming, showCompletion]);

  // Auto-resize input up to 7 lines
  useEffect(() => {
    const textarea = inputRef.current;
    if (!textarea) return;

    textarea.style.height = 'auto';

    const styles = window.getComputedStyle(textarea);
    const computedLineHeight = Number.parseFloat(styles.lineHeight || '24') || 24;
    const verticalPadding = (Number.parseFloat(styles.paddingTop || '0') || 0) + (Number.parseFloat(styles.paddingBottom || '0') || 0);
    const maxHeight = (computedLineHeight * MAX_INPUT_LINES) + verticalPadding;

    textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`;
    textarea.style.overflowY = textarea.scrollHeight > maxHeight ? 'auto' : 'hidden';
  }, [inputValue, MAX_INPUT_LINES]);

  const [showCompletionPopup, setShowCompletionPopup] = useState(false);

  // Show completion popup when session is complete (replaces immediate countdown)
  useEffect(() => {
    if (!isSessionComplete) return;
    setShowCompletionPopup(true);
  }, [isSessionComplete]);

  const handleDismissPopup = () => {
    setShowCompletionPopup(false);
    // Start countdown after dismissing
    setCountdown(5);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          // Navigate directly — don't go through performFinalTransition
          navigate('/project-board', { replace: true });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSkipToBoard = () => {
    // Navigate directly — performFinalTransition is too slow/fragile for button clicks
    navigate('/project-board', { replace: true });
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isStreaming || isFinalizing) return;
    const content = inputValue.trim();
    setInputValue('');
    try {
      const response = await sendMessage(content, false);

      const isCompletionMessage = (text: string): boolean => {
        const lower = text.toLowerCase();
        const patterns = [
          'onboarding is complete',
          'onboarding for',
          "you're all set",
          "you've finished onboarding",
          'everything for onboarding is complete',
          'finished onboarding',
        ];
        return patterns.some(p => lower.includes(p));
      };

      if (response.sessionComplete || isCompletionMessage(response.text)) {
        // Session is complete — keep messages visible, disable input, start countdown
        setIsSessionComplete(true);

        // Update profile as onboarded
        if (user?.id && !isNewAppMode) {
          await supabase.from('profiles').update({ onboarded: true }).eq('id', user.id);
        }
      } else if (response.text.includes('JSON_GENERATION_COMPLETE')) {
        // Legacy fallback
        setIsFinalizing(true);
        setShowCompletion(true);

        if (user?.id && !isNewAppMode) {
          await supabase.from('profiles').update({
            onboarded: true
          }).eq('id', user.id);
        }

        await performFinalTransition();
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const performFinalTransition = async () => {
    // Step 1: Brief wait for backend to start writing to Supabase
    await new Promise((resolve) => setTimeout(resolve, 5000));

    console.log('5s wait complete, attempting data refresh...');

    // Step 2: Try to refresh data, but don't block navigation
    try {
      // Attempt to invalidate queries with timeout
      await Promise.race([
      Promise.all([
      queryClient.invalidateQueries({ queryKey: ['app_ideas'] }),
      queryClient.invalidateQueries({ queryKey: ['artifacts'] })]
      ),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Query invalidation timeout')), 3000))]
      );

      // Attempt to refresh apps with timeout
      await Promise.race([
      refreshApps(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Refresh timeout')), 3000))]
      );

      // Try to auto-select the latest app
      const { data: latestApps } = await supabase.
      from('app_ideas').
      select('id').
      eq('user_id', user?.id || '').
      order('created_at', { ascending: false }).
      limit(1);

      if (latestApps && latestApps.length > 0) {
        selectApp(latestApps[0].id);
      }
    } catch (err) {
      console.warn('Pre-navigation data fetch failed (non-critical):', err);
    }

    // Step 3: ALWAYS navigate, regardless of data fetch success
    console.log('Navigating to artifacts...');
    navigate('/project-board', { replace: true });
  };

  // Backup navigation effect - guarantees redirect even if primary method fails
  useEffect(() => {
    if (showCompletion) {
      const backupTimer = setTimeout(() => {
        console.log('Backup navigation triggered after 30s');
        navigate('/project-board', { replace: true });
      }, 30000);

      return () => clearTimeout(backupTimer);
    }
  }, [showCompletion, navigate]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const confirmSkip = async () => {
    if (isSkipping) return;
    setIsSkipping(true);

    try {
      // Mark user as NOT onboarded when skipping
      if (user?.id && !isNewAppMode) {
        const { error } = await supabase.
        from('profiles').
        update({ onboarded: false }).
        eq('id', user.id);

        if (error) console.error("Update failed, skipping anyway:", error);
      }

      // Mark that user explicitly skipped (prevents redirect loop)
      sessionStorage.setItem('onboarding_skipped', 'true');

    } catch (err) {
      console.error("Skip error:", err);
    } finally {
      // CRITICAL: This MUST run to unblock the user
      navigate('/project-board', { replace: true });
      setIsSkipping(false);
    }
  };

  const pageTitle = isNewAppMode ? "Create a New App" : "Let's build your app";
  const pageSubtitle = isNewAppMode ?
  "Tell our BuilderOS about your new app idea." :
  "Our BuilderOS will guide you through creating your perfect product roadmap.";

  const currentPhase = useMemo(() => {
    if (bmCompletion < 100) return 'business_model';
    if (uvCompletion < 100) return 'validation';
    return 'product_brief';
  }, [bmCompletion, uvCompletion]);

  const phaseLabels = [
    { key: 'business_model', label: 'Business Model', completion: bmCompletion },
    { key: 'validation', label: 'Target User', completion: uvCompletion },
    { key: 'product_brief', label: 'Product Scope', completion: pbCompletion },
  ];

  const overallProgress = Math.round((bmCompletion + uvCompletion + pbCompletion) / 3);
  const currentStepIndex = phaseLabels.findIndex(p => p.completion < 100);
  const currentStepNum = currentStepIndex === -1 ? 3 : currentStepIndex + 1;

  const suggestions = dynamicSuggestions;
  const showChips = !isStreaming && !isFinalizing && !isSessionComplete &&
    (messages.length === 0 || messages[messages.length - 1]?.role === 'assistant');

  const handleChipClick = (text: string) => {
    setInputValue('');
    sendMessage(text, false).then((response) => {
      if (response.sessionComplete) {
        setIsSessionComplete(true);
        if (user?.id && !isNewAppMode) {
          supabase.from('profiles').update({ onboarded: true }).eq('id', user.id);
        }
      }
    }).catch(console.error);
  };

  const handleSkipQuestion = () => {
    handleChipClick("I'd like to skip this question and move on");
  };

  return (
    <div className="min-h-screen bg-[hsl(222,47%,11%)] flex flex-col relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-slate-700/50 bg-[hsl(222,47%,11%)]/80 backdrop-blur-sm">
        <img src={logoHorizontal} alt="Logo" className="h-8" />
        <div className="flex items-center gap-2">
          {isDebug && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsSessionComplete(true)}
              className="text-amber-400 border-amber-400/30 hover:bg-amber-400/10 gap-1"
            >
              <Bug className="w-3 h-3" />
              Test Popup
            </Button>
          )}
          <Button
            variant="ghost"
            onClick={() => setShowSkipWarning(true)}
            disabled={isSkipping}
            className="text-muted-foreground hover:text-foreground">
            {isSkipping ?
            <Loader2 className="w-4 h-4 animate-spin mr-2" /> :
            null}
            {isNewAppMode ? 'Cancel' : 'Skip'}
          </Button>
        </div>
      </header>

      {/* Progress Indicator */}
      {isDebug && messages.length > 0 && !isFinalizing && !showCompletion && (
        <div className="relative z-10 px-6 py-3 border-b border-slate-700/50 bg-[hsl(222,47%,11%)]/80 backdrop-blur-sm">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">
                Step {currentStepNum} of 3 — {phaseLabels[currentStepNum - 1]?.label ?? 'Complete'}
              </span>
              <span className="text-xs text-muted-foreground">{overallProgress}%</span>
            </div>
            <Progress value={overallProgress} className="h-1.5 bg-slate-800" />
            <div className="flex justify-between mt-2">
              {phaseLabels.map((phase) => (
                <div key={phase.key} className="flex items-center gap-1.5">
                  <div className={cn(
                    'w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold border',
                    phase.completion >= 100
                      ? 'bg-blue-500 border-blue-500 text-white'
                      : phase.completion > 0
                        ? 'border-blue-500 text-blue-400'
                        : 'border-slate-600 text-slate-500'
                  )}>
                    {phase.completion >= 100 ? <Check className="w-2.5 h-2.5" /> : null}
                  </div>
                  <span className={cn(
                    'text-xs',
                    phase.completion >= 100 ? 'text-blue-400' : phase.completion > 0 ? 'text-foreground' : 'text-muted-foreground'
                  )}>
                    {phase.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Chat Container - Hidden when finalizing to prevent flash */}
      {!isFinalizing &&
      <main className="relative z-10 flex-1 flex flex-col max-w-3xl mx-auto w-full px-4 py-6">
          {/* Welcome Header */}
          {messages.length === 0 && !isStreaming &&
        <div className="flex-1 flex items-center justify-center">
              <div className="text-center space-y-4 animate-in fade-in-0 duration-500">
                <div className="w-16 h-16 mx-auto flex items-center justify-center">
                  <img src={logoIcon} alt="Logo" className="w-16 h-16 object-contain" />
                </div>
                <h1 className="text-3xl font-bold text-primary-foreground">{pageTitle}</h1>
                <p className="text-lg max-w-md text-primary-foreground">
                  {pageSubtitle}
                </p>
                {isStreaming &&
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Architect is thinking...</span>
                  </div>
            }
              </div>
            </div>
        }

          {/* Messages */}
          {(messages.length > 0 || isStreaming) &&
        <div className="flex-1 overflow-y-auto space-y-6 pb-4">
              {messages.map((message) =>
          <OnboardingMessage key={message.id} role={message.role} content={message.content} />
          )}

              {isStreaming &&
          <div className="flex gap-4 justify-start animate-in fade-in-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                    <Loader2 className="w-5 h-5 text-white animate-spin" />
                  </div>
                  <div className="bg-card border border-border rounded-2xl rounded-bl-md px-5 py-4 shadow-md">
                    <p className="text-xs font-semibold text-blue-400 mb-1.5 uppercase tracking-wide">
                      Architect
                    </p>
                    <div className="flex items-center gap-1">
                      <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
          }

              <div ref={messagesEndRef} />
            </div>
        }

          {/* Error Display */}
          {error &&
        <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 mb-4 text-destructive text-sm">
              {error.message}
            </div>
        }
        </main>
      }

      {/* Suggestion Chips + Input Area - Hidden when finalizing */}
      {!isFinalizing && !isSessionComplete &&
      <div className="relative z-10 border-t border-slate-700/50 bg-[hsl(222,47%,11%)]/80 backdrop-blur-sm px-4 py-3">
          <div className="max-w-3xl mx-auto">
            {/* Suggestion chips */}
            {showChips && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {suggestions.map((text) => (
                  <button
                    key={text}
                    onClick={() => handleChipClick(text)}
                    className="text-xs px-3 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/50 transition-colors cursor-pointer"
                  >
                    {text}
                  </button>
                ))}
                <button
                  onClick={handleSkipQuestion}
                  className="text-xs px-3 py-1.5 rounded-full bg-transparent hover:bg-slate-800 text-muted-foreground border border-slate-600/50 transition-colors cursor-pointer"
                >
                  Skip this question →
                </button>
              </div>
            )}

            <div className="flex gap-3">
              <Textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              disabled={isStreaming || showCompletion}
              rows={1}
              className="flex-1 min-h-[48px] max-h-[calc(7*1.5em+1.5rem)] resize-none text-base bg-[#293445] border-border/50 focus-visible:ring-blue-500 text-white placeholder:text-muted-foreground py-3" />

              <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isStreaming || showCompletion}
              className="h-12 px-6 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 shadow-lg">

                {isStreaming ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>
      }

      {/* Session Complete Banner */}
      {isSessionComplete && (
        <div className="relative z-10 border-t border-slate-700/50 bg-[hsl(222,47%,11%)]/80 backdrop-blur-sm px-4 py-4">
          <div className="max-w-3xl mx-auto flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Redirecting in <span className="font-semibold text-foreground">{countdown ?? 0}s</span>...
            </p>
            <Button
              onClick={handleSkipToBoard}
              className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 shadow-lg"
            >
              Go to Dashboard →
            </Button>
          </div>
        </div>
      )}

      {/* Completion Popup */}
      <Dialog open={showCompletionPopup} onOpenChange={(open) => { if (!open) handleDismissPopup(); }}>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-xl text-foreground">Your idea is taking shape!</DialogTitle>
            <DialogDescription className="text-muted-foreground leading-relaxed pt-2">
              Your Business Model, User Validation and Product Scope are ready to refine.
              This is where the real building begins — dig into each artifact to unlock your
              Kanban board, database design and master prompt.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 pt-2">
            <p className="text-sm text-muted-foreground">Still unsure about the path forward?</p>
            <Button
              onClick={() => navigate('/coaching')}
              className="gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600"
            >
              Let's Build This Together
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button variant="ghost" onClick={handleDismissPopup} className="text-muted-foreground">
              Continue to Project Board
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Skip Warning Dialog */}
      <AlertDialog open={showSkipWarning} onOpenChange={setShowSkipWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Skip Onboarding?</AlertDialogTitle>
            <AlertDialogDescription>
              If you skip, you'll need to manually fill in all of the following sections yourself — without any AI-generated content:
              <ul className="mt-3 space-y-1 list-disc list-inside text-sm">
                <li>Business Modeling</li>
                <li>Target Persona</li>
                <li>Product Planning</li>
                <li>Database Design</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Stay &amp; Continue</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmSkip}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {isNewAppMode ? 'Cancel Anyway' : 'Skip Anyway'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Completion Overlay */}
      <div className={cn(
        'fixed inset-0 z-50 bg-[hsl(222,47%,11%)]/95 backdrop-blur-xl flex items-center justify-center transition-all duration-500',
        showCompletion ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      )}>
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
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-[loading_2s_ease-in-out_infinite]"
              style={{ animation: 'loading 2s ease-in-out infinite' }} />

          </div>

          {/* Manual redirect button */}
          <Button
            onClick={() => navigate('/project-board')}
            className="mt-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 text-lg">

            Go to Dashboard
          </Button>
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
    </div>);

}