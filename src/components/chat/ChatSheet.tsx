import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ChatMessage } from './ChatMessage';
import { useChat } from '@/hooks/useChat';
import { useChatContext } from '@/contexts/ChatContext';
import { useProfile } from '@/hooks/useProfile';
import { Send, Loader2, AlertCircle, Rocket, Paperclip, X, FileText } from 'lucide-react';
import logoIcon from '@/assets/logo-icon.png';
import {
  type ChatAttachment,
  processSelectedFiles,
  ACCEPTED_ATTACHMENT_TYPES,
  MAX_ATTACHMENTS_PER_MESSAGE,
} from '@/lib/chatAttachments';

interface ChatSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ChatSheet({ open, onOpenChange }: ChatSheetProps) {
  const navigate = useNavigate();
  const { messages, loading, isStreaming, isFinalizing, newAppId, isNewAppMode, sendMessage, startNewAppMode, resetFinalizing, hasSelectedApp } = useChat();
  const { shouldClearOnOpen, setShouldClearOnOpen } = useChatContext();
  const { profile } = useProfile();
  const [input, setInput] = useState('');
  const [pendingAttachments, setPendingAttachments] = useState<ChatAttachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [transitionComplete, setTransitionComplete] = useState(false);

  // Start new app mode when opened with shouldClearOnOpen flag (New App flow)
  useEffect(() => {
    if (open && shouldClearOnOpen) {
      startNewAppMode();
      setShouldClearOnOpen(false);
    }
  }, [open, shouldClearOnOpen, startNewAppMode, setShouldClearOnOpen]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isStreaming]);

  // Handle transition completion
  useEffect(() => {
    if (isFinalizing && newAppId) {
      // Wait a moment then complete the transition
      const timer = setTimeout(() => {
        setTransitionComplete(true);
        
        // Close sheet and navigate after showing success
        setTimeout(() => {
          onOpenChange(false);
          resetFinalizing();
          setTransitionComplete(false);
          navigate('/artifacts');
          // Force a page refresh to ensure all data is loaded
          window.location.reload();
        }, 1500);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [isFinalizing, newAppId, onOpenChange, resetFinalizing, navigate]);

  const handleSend = async () => {
    if ((!input.trim() && pendingAttachments.length === 0) || isStreaming || !hasSelectedApp) return;
    const message = input.trim() || (pendingAttachments.length > 0 ? 'Please review these attachments' : '');
    const atts = pendingAttachments.length > 0 ? [...pendingAttachments] : undefined;
    setInput('');
    setPendingAttachments([]);
    await sendMessage(message, atts);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (fileInputRef.current) fileInputRef.current.value = '';
    const accepted = await processSelectedFiles(files, pendingAttachments.length);
    if (accepted.length > 0) {
      setPendingAttachments((prev) => [...prev, ...accepted]);
    }
  };

  const removeAttachment = (index: number) => {
    setPendingAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md flex flex-col p-0 bg-[#0f1219] border-slate-800">
        <SheetHeader className="px-4 py-3 border-b border-slate-800">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-lg text-white">BuilderOS</SheetTitle>
          </div>
        </SheetHeader>

        {/* Show Building overlay when finalizing */}
        {isFinalizing ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="relative mb-6">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-blue-500/30">
                <img src={logoIcon} alt="BuilderOS" className="w-12 h-12" />
              </div>
              {!transitionComplete && (
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center animate-pulse">
                  <Loader2 className="w-4 h-4 text-white animate-spin" />
                </div>
              )}
              {transitionComplete && (
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <Rocket className="w-3 h-3 text-white" />
                </div>
              )}
            </div>
            
            <h3 className="text-xl font-semibold text-white mb-2">
              {transitionComplete ? 'Ready for Launch!' : 'Building Your Headquarters...'}
            </h3>
            <p className="text-slate-400 text-sm max-w-[250px]">
              {transitionComplete 
                ? 'Your app is ready. Redirecting to dashboard...'
                : 'Setting up your app, generating artifacts, and preparing your dashboard.'
              }
            </p>

            {/* Progress bar */}
            <div className="w-full max-w-[200px] mt-6">
              <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-1000 ease-out ${
                    transitionComplete ? 'w-full' : 'w-3/4 animate-pulse'
                  }`}
                />
              </div>
              <p className="text-xs text-slate-500 mt-2">
                {transitionComplete ? 'Complete!' : 'Please wait...'}
              </p>
            </div>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
              {!hasSelectedApp && !isNewAppMode ? (
                // No app selected state (only show when NOT in new app mode)
                <div className="flex flex-col items-center justify-center h-48 text-center">
                  <AlertCircle className="w-10 h-10 text-yellow-500 mb-3" />
                  <p className="text-slate-300 font-medium">No App Selected</p>
                  <p className="text-sm text-slate-500 mt-1 max-w-[250px]">
                    Please select an App from the header to start chatting.
                  </p>
                </div>
              ) : loading ? (
                // Loading state with spinner
                <div className="flex flex-col items-center justify-center h-32">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-2" />
                  <p className="text-sm text-slate-400">Loading chat history...</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center text-slate-400 py-8">
                  <p className="text-sm">Start a conversation with BuilderOS.</p>
                  <p className="text-xs mt-1 text-slate-500">Ask about your app, features, or get help building.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <ChatMessage
                      key={msg.id}
                      role={msg.role as 'user' | 'assistant'}
                      content={msg.content}
                      timestamp={msg.created_at}
                      userAvatar={profile?.profile_image}
                      attachments={msg.metadata?.attachments}
                      onDashboardClick={() => onOpenChange(false)}
                    />
                  ))}
                  {isStreaming && (
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-blue-500/20">
                        <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                      </div>
                      <div className="bg-slate-800 rounded-2xl rounded-bl-md px-4 py-2">
                        <p className="text-sm text-slate-300">Thinking...</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>

            {/* Attachment previews */}
            {pendingAttachments.length > 0 && (
              <div className="px-4 pt-2 border-t border-slate-800">
                <div className="flex flex-wrap gap-2">
                  {pendingAttachments.map((att, i) => (
                    <div key={i} className="relative group">
                      {att.type === 'image' ? (
                        <img
                          src={att.data}
                          alt={att.name}
                          className="h-12 w-12 rounded object-cover border border-slate-700"
                        />
                      ) : (
                        <div className="flex items-center gap-1 text-xs bg-slate-800 rounded px-2 py-1.5 border border-slate-700">
                          <FileText className="h-3 w-3 text-slate-400" />
                          <span className="text-slate-300 max-w-[80px] truncate">{att.name}</span>
                        </div>
                      )}
                      <button
                        onClick={() => removeAttachment(i)}
                        className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-100 transition-opacity"
                      >
                        <X className="h-2.5 w-2.5" />
                      </button>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-slate-500 mt-1">PNG, JPG, WEBP, or Markdown • Max 5MB each</p>
              </div>
            )}

            <div className="p-4 border-t border-slate-800">
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED_ATTACHMENT_TYPES}
                multiple
                className="hidden"
                onChange={handleFileSelect}
              />
              <div className="flex gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isStreaming || !hasSelectedApp || pendingAttachments.length >= MAX_ATTACHMENTS_PER_MESSAGE}
                        className="text-slate-400 hover:text-white hover:bg-slate-800"
                      >
                        <Paperclip className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p>Attach image or .md (max 5MB, up to {MAX_ATTACHMENTS_PER_MESSAGE})</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={hasSelectedApp ? "Type your message..." : "Select an app first..."}
                  disabled={isStreaming || !hasSelectedApp}
                  className="flex-1 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-blue-500 disabled:opacity-50"
                />
                <Button
                  onClick={handleSend}
                  disabled={(!input.trim() && pendingAttachments.length === 0) || isStreaming || !hasSelectedApp}
                  size="icon"
                  className="bg-white text-black hover:bg-slate-200 disabled:opacity-50"
                >
                  {isStreaming ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
