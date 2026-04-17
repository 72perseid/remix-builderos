import { useParams, useNavigate } from "react-router-dom";
import { useLesson } from "@/hooks/useLesson";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Circle,
  ExternalLink,
  FileText,
  Home,
  Loader2,
} from "lucide-react";
import { useRef, useCallback } from "react";
import { toast } from "sonner";

export default function LessonPage() {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const navigate = useNavigate();
  const { lesson, loading, markComplete, logVideoWatch } = useLesson(courseId, lessonId);
  const videoRef = useRef<HTMLVideoElement>(null);

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

  const goToLesson = (id: string) => navigate(`/programs/${courseId}/lessons/${id}`);

  if (loading) {
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

  if (!lesson) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
        <h1 className="text-xl font-bold text-foreground mb-2">Lesson not found</h1>
        <Button variant="secondary" onClick={() => navigate(`/programs/${courseId}`)}>
          Back to Course
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Breadcrumb bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
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

        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-xs text-muted-foreground">
            Lesson {lesson.currentIndex + 1} of {lesson.siblings.length}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled={!lesson.prevLessonId}
            onClick={() => lesson.prevLessonId && goToLesson(lesson.prevLessonId)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled={!lesson.nextLessonId}
            onClick={() => lesson.nextLessonId && goToLesson(lesson.nextLessonId)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main video area */}
        <div className="lg:col-span-2 space-y-4">
          {lesson.videoUrl ? (
            <div className="rounded-xl overflow-hidden border border-border bg-black aspect-video">
              <video
                ref={videoRef}
                src={lesson.videoUrl}
                controls
                className="w-full h-full"
                onTimeUpdate={handleTimeUpdate}
                onPlay={handleTimeUpdate}
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

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="border-b border-border h-11 flex items-center px-4">
              <span className="text-sm font-medium text-foreground">Progress</span>
            </div>
            <div className="p-4 space-y-1.5 max-h-[50vh] overflow-y-auto">
              {lesson.siblings.map((s, i) => (
                <button
                  key={s.id}
                  onClick={() => goToLesson(s.id)}
                  className={`w-full flex items-center gap-2.5 p-2.5 rounded-lg text-left transition-colors ${
                    s.id === lessonId
                      ? "bg-primary/10 border border-primary/30"
                      : "hover:bg-muted/40"
                  }`}
                >
                  {s.completed ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                  ) : (
                    <Circle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  )}
                  <span className="text-sm text-foreground truncate">
                    {i + 1}. {s.title}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {lesson.resources.length > 0 && (
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="border-b border-border h-11 flex items-center px-4">
                <span className="text-sm font-medium text-foreground">Resources</span>
              </div>
              <div className="p-4 space-y-2 max-h-[40vh] overflow-y-auto">
                {lesson.resources.map((r) => (
                  <a
                    key={r.id}
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 p-2.5 rounded-lg hover:bg-muted/40 transition-colors group"
                  >
                    <FileText className="h-4 w-4 text-primary flex-shrink-0" />
                    <span className="text-sm text-foreground truncate flex-1">{r.title}</span>
                    <ExternalLink className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {lesson.completed ? (
            <div className="w-full flex items-center justify-center gap-2 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-sm font-medium text-emerald-500">
              <CheckCircle2 className="h-4 w-4" />
              Lesson Completed
            </div>
          ) : (
            <Button
              className="w-full gap-2"
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

          {lesson.nextLessonId && lesson.completed && (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => goToLesson(lesson.nextLessonId!)}
            >
              Next Lesson
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
