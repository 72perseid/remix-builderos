import { useParams, useNavigate } from "react-router-dom";
import { useLesson } from "@/hooks/useLesson";
import { useUserFeatures } from "@/hooks/useUserFeatures";
import { useAuth } from "@/hooks/useAuth";
import { LockedOverlay } from "@/components/paywall/LockedOverlay";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  ExternalLink,
  FileText,
  Home,
  Loader2,
  SkipBack,
  SkipForward,
  X,
  Check,
} from "lucide-react";
import { useRef, useCallback, useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { LessonCTACard } from "@/components/programs/LessonCTACard";
import { LessonThumbnail } from "@/components/programs/LessonThumbnail";
import { isPaidCourse } from "@/lib/programAccess";

export default function LessonPage() {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { lesson, loading, markComplete, logVideoWatch } = useLesson(courseId, lessonId);
  const { hasUse, loading: featuresLoading } = useUserFeatures();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [allLessonsOpen, setAllLessonsOpen] = useState(false);

  const hasCtas = (lesson?.ctas?.length ?? 0) > 0;
  const storageKey = user?.id && lessonId ? `lesson-cta-completed:${user.id}:${lessonId}` : null;

  const [confirmedCtaIds, setConfirmedCtaIds] = useState<Set<string>>(new Set());
  const [pendingCtaId, setPendingCtaId] = useState<string | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  // Hydrate from localStorage; if lesson is server-completed, treat all CTAs as confirmed.
  useEffect(() => {
    if (!storageKey || !lesson) return;
    if (lesson.completed && hasCtas) {
      setConfirmedCtaIds(new Set(lesson.ctas.map((c) => c.id)));
      return;
    }
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) setConfirmedCtaIds(new Set(JSON.parse(raw) as string[]));
    } catch {
      // ignore
    }
  }, [storageKey, lesson, hasCtas]);

  // Trigger confirm dialog when user returns to tab after clicking a CTA.
  useEffect(() => {
    if (!pendingCtaId) return;
    const onVisible = () => {
      if (document.visibilityState === "visible") setConfirmDialogOpen(true);
    };
    window.addEventListener("focus", onVisible);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.removeEventListener("focus", onVisible);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [pendingCtaId]);

  const handleCtaClicked = (ctaId: string) => {
    setPendingCtaId(ctaId);
  };

  const handleConfirmYes = async () => {
    if (!pendingCtaId || !lesson) return;
    const next = new Set(confirmedCtaIds);
    next.add(pendingCtaId);
    setConfirmedCtaIds(next);
    if (storageKey) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(Array.from(next)));
      } catch {
        // ignore
      }
    }
    setPendingCtaId(null);
    setConfirmDialogOpen(false);

    const allDone = lesson.ctas.every((c) => next.has(c.id));
    if (allDone && !lesson.completed) {
      try {
        await markComplete.mutateAsync();
        toast.success("Lesson completed!");
      } catch {
        toast.error("Failed to mark lesson complete");
      }
    }
  };

  const handleConfirmNo = () => {
    setPendingCtaId(null);
    setConfirmDialogOpen(false);
  };


  const handleTimeUpdate = useCallback(() => {
    logVideoWatch();
  }, [logVideoWatch]);

  const handleMarkComplete = async () => {
    try {
      await markComplete.mutateAsync();
      toast.success("Lesson marked as completed!");
    } catch {
      toast.error("Failed to mark lesson complete");
    }
  };

  const handleVideoEnded = useCallback(async () => {
    if (lesson?.completed || markComplete.isPending) return;
    try {
      await markComplete.mutateAsync();
      toast.success("Lesson marked as completed!");
    } catch {
      // silent — manual button remains as fallback
    }
  }, [lesson?.completed, markComplete]);

  const goToLesson = (id: string) => {
    setAllLessonsOpen(false);
    navigate(`/programs/${courseId}/lessons/${id}`);
  };

  if (loading || featuresLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <Skeleton className="h-8 w-full max-w-lg" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-[400px] lg:col-span-2 rounded-xl" />
          <Skeleton className="h-[400px] rounded-xl" />
        </div>
      </div>
    );
  }

  const isLocked = isPaidCourse({ course_type: lesson?.courseType, tags: lesson?.courseTags }) && !hasUse("programs");

  if (!lesson && !isLocked) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
        <h1 className="text-xl font-bold text-foreground mb-2">Lesson not found</h1>
        <Button variant="secondary" onClick={() => navigate(`/programs/${courseId}`)}>
          Back to Course
        </Button>
      </div>
    );
  }

  const moduleTotal = lesson?.siblings.length ?? 0;
  const moduleIdx = (lesson?.currentIndex ?? 0) >= 0 ? (lesson?.currentIndex ?? 0) : 0;

  if (!lesson) {
    return (
      <div className="relative min-h-[calc(100vh-120px)]">
        <div
          className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6 blur-md select-none pointer-events-none"
          aria-hidden
        >
          <Skeleton className="h-8 w-full max-w-lg" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Skeleton className="h-[400px] lg:col-span-2 rounded-xl" />
            <Skeleton className="h-[400px] rounded-xl" />
          </div>
        </div>
        <LockedOverlay feature="programs" />
      </div>
    );
  }

  return (
    <div className="relative min-h-[calc(100vh-120px)]">
      <div
        className={cn(
          "max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6",
          isLocked && "blur-md select-none pointer-events-none"
        )}
        aria-hidden={isLocked}
      >
      {/* Top bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground min-w-0">
          <button onClick={() => navigate("/programs")} className="hover:text-foreground transition-colors">
            <Home className="h-4 w-4" />
          </button>
          <ChevronRight className="h-3 w-3 flex-shrink-0" />
          <button
            onClick={() => navigate(`/programs/${courseId}`)}
            className="hover:text-foreground transition-colors truncate max-w-[140px]"
          >
            {lesson.courseName}
          </button>
          <ChevronRight className="h-3 w-3 flex-shrink-0" />
          <button
            onClick={() => navigate(`/programs/${courseId}#module-${lesson.module_id}`)}
            className="hover:text-foreground transition-colors truncate max-w-[140px]"
          >
            {lesson.moduleEmoji} {lesson.moduleName}
          </button>
          <ChevronRight className="h-3 w-3 flex-shrink-0" />
          <span className="text-foreground font-medium truncate max-w-[180px]">{lesson.title}</span>
        </div>

        {/* Right-side pills */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 rounded-full border-border bg-secondary/40 text-primary hover:bg-secondary disabled:opacity-40"
            disabled={!lesson.prevLessonId}
            onClick={() => lesson.prevLessonId && goToLesson(lesson.prevLessonId)}
          >
            <SkipBack className="h-4 w-4 fill-current" />
          </Button>

          <span className="text-sm font-medium text-primary px-2">
            Lesson {moduleIdx + 1} of {moduleTotal}
          </span>

          <Button
            variant="outline"
            className="h-10 rounded-full border-border bg-secondary/40 text-primary hover:bg-secondary gap-2 px-5 disabled:opacity-40"
            disabled={!lesson.nextLessonId}
            onClick={() => lesson.nextLessonId && goToLesson(lesson.nextLessonId)}
          >
            Next Lesson
            <SkipForward className="h-4 w-4 fill-current" />
          </Button>

          <Popover open={allLessonsOpen} onOpenChange={setAllLessonsOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="h-10 rounded-full border-primary/60 bg-transparent text-primary hover:bg-primary/10 gap-2 px-5"
              >
                All Lessons
                <ChevronDown className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              align="end"
              sideOffset={12}
              className="w-[420px] p-0 rounded-xl border-primary/40 bg-card shadow-2xl shadow-primary/20"
            >
              <div className="flex items-center justify-between px-5 pt-4 pb-3">
                <h3 className="text-base font-semibold text-foreground">In this section</h3>
                <button
                  onClick={() => setAllLessonsOpen(false)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="border-t border-border/50" />
              <div className="p-3 max-h-[70vh] overflow-y-auto space-y-2">
                {lesson.siblings.map((s, i) => {
                  const isCurrent = s.id === lessonId;
                  return (
                    <button
                      key={s.id}
                      onClick={() => goToLesson(s.id)}
                      className={`w-full flex items-center gap-3 p-2 rounded-lg text-left transition-colors ${
                        isCurrent
                          ? "bg-primary/10 ring-1 ring-primary/40"
                          : "hover:bg-muted/40"
                      }`}
                    >
                      <div className="relative w-28 h-16 flex-shrink-0 rounded-lg overflow-hidden border border-border">
                        {s.thumbnail ? (
                          <img src={s.thumbnail} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <LessonThumbnail title={s.title} />
                        )}
                        {s.completed && (
                          <span className="absolute top-1 right-1 bg-emerald-500 text-white rounded-full p-0.5">
                            <Check className="h-3 w-3" strokeWidth={3} />
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{s.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Lesson {i + 1}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Two-column layout: content + action card */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
        {/* Main content */}
        <div className="space-y-4">
          {lesson.videoUrl ? (
            <div className="rounded-xl overflow-hidden border border-border bg-black aspect-video">
              <video
                key={lesson.videoUrl}
                ref={videoRef}
                src={lesson.videoUrl}
                controls
                autoPlay
                playsInline
                className="w-full h-full"
                onTimeUpdate={handleTimeUpdate}
                onPlay={handleTimeUpdate}
                onEnded={handleVideoEnded}
              />
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-card aspect-video flex items-center justify-center">
              <p className="text-muted-foreground text-sm">No video available for this lesson</p>
            </div>
          )}

          <div className="space-y-2">
            <h1 className="text-xl font-bold text-foreground">{lesson.title}</h1>
            {lesson.description && (
              <p className="text-sm text-muted-foreground leading-relaxed">{lesson.description}</p>
            )}
            {lesson.text_content && (
              <div className="mt-4 text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap border-t border-border pt-4">
                {lesson.text_content}
              </div>
            )}
          </div>
        </div>

        {/* Right action card */}
        <div className="rounded-xl border border-border bg-card p-4 h-fit">
          <Tabs defaultValue="progress" className="w-full">
            <TabsList className="w-full grid grid-cols-2 rounded-full bg-secondary/40 p-1 h-auto">
              <TabsTrigger
                value="progress"
                className="rounded-full data-[state=active]:bg-secondary data-[state=active]:text-primary text-muted-foreground py-2"
              >
                Progress
              </TabsTrigger>
              <TabsTrigger
                value="resources"
                className="rounded-full data-[state=active]:bg-secondary data-[state=active]:text-primary text-muted-foreground py-2"
              >
                Resources
              </TabsTrigger>
            </TabsList>

            <TabsContent value="progress" className="mt-4 space-y-3">
              {lesson.completed ? (
                <div className="w-full flex items-center justify-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-500">
                  <CheckCircle2 className="h-4 w-4" />
                  Lesson Completed
                </div>
              ) : (
                <Button
                  className="w-full gap-2 rounded-full h-12"
                  disabled={markComplete.isPending}
                  onClick={handleMarkComplete}
                >
                  {markComplete.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Marking complete...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      Mark This Lesson Complete
                    </>
                  )}
                </Button>
              )}
              {lesson.completed &&
                lesson.ctas?.map((cta) => (
                  <LessonCTACard key={cta.id} cta={cta} completed={lesson.completed} />
                ))}
            </TabsContent>

            <TabsContent value="resources" className="mt-4 space-y-3">
              {lesson.resources.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">
                  No resources for this lesson.
                </p>
              ) : (
                lesson.resources.map((r) => (
                  <a
                    key={r.id}
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 p-2.5 rounded-lg border border-border hover:bg-muted/40 transition-colors group"
                  >
                    <FileText className="h-4 w-4 text-primary flex-shrink-0" />
                    <span className="text-sm text-foreground truncate flex-1">{r.title}</span>
                    <ExternalLink className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
      </div>

      {isLocked && <LockedOverlay feature="programs" />}
    </div>
  );
}
