import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useCourseDetail, type ModuleDetail } from "@/hooks/useCourseDetail";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronLeft, ChevronDown, ChevronUp, CheckCircle2, Circle } from "lucide-react";
import { useState, useEffect, useRef } from "react";

function ModuleRow({ module, index, courseId, defaultOpen }: { module: ModuleDetail; index: number; courseId: string; defaultOpen?: boolean }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(!!defaultOpen);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (defaultOpen) {
      setOpen(true);
      setTimeout(() => {
        ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  }, [defaultOpen]);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div ref={ref} id={`module-${module.id}`} className="rounded-xl border border-border bg-card overflow-hidden scroll-mt-6">
        <CollapsibleTrigger asChild>
          <div
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setOpen((v) => !v);
              }
            }}
            className="w-full p-5 md:p-6 flex items-center gap-6 cursor-pointer hover:bg-muted/20 transition-colors"
          >
            {/* Emoji */}
            {module.emoji && (
              <div className="text-3xl flex-shrink-0 hidden sm:block">{module.emoji}</div>
            )}

            {/* Module label + title + description */}
            <div className="flex-1 min-w-0">
              <div className="text-xs text-muted-foreground mb-2">
                Module {index + 1}
                {module.duration_days && (
                  <>
                    <span className="mx-2">·</span>
                    {module.duration_days} {module.duration_days === 1 ? "Day" : "Days"}
                  </>
                )}
              </div>
              <div className="flex items-center gap-2 mb-1.5">
                {module.emoji && <span className="text-xl sm:hidden">{module.emoji}</span>}
                <h3 className="text-lg font-semibold text-foreground truncate">{module.title}</h3>
              </div>
              {module.description && (
                <p className="text-sm text-muted-foreground leading-relaxed">{module.description}</p>
              )}
            </div>

            {/* Progress bar */}
            <div className="hidden md:flex items-center gap-3 flex-shrink-0 w-64">
              <span className="text-sm font-medium text-foreground w-10 text-right">
                {module.progressPercent}%
              </span>
              <Progress value={module.progressPercent} className="h-1 flex-1 bg-secondary" />
            </div>

            {/* Show/Hide details button (visual only — wrapper handles toggle) */}
            <Button
              variant="outline"
              size="sm"
              tabIndex={-1}
              className="flex-shrink-0 rounded-full border-border bg-transparent hover:bg-muted/40 text-foreground gap-1.5 px-4 pointer-events-none"
            >
              {open ? "Hide details" : "Show details"}
              {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="border-t border-border px-4 md:px-5 py-4">
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
              {module.lessons.map((lesson) => (
                <div
                  key={lesson.id}
                  onClick={() => navigate(`/programs/${courseId}/lessons/${lesson.id}`)}
                  className="flex-shrink-0 w-44 rounded-lg border border-border bg-background overflow-hidden group cursor-pointer hover:border-primary/40 transition-colors"
                >
                  {/* Thumbnail or placeholder */}
                  <div className="h-24 w-full relative overflow-hidden">
                    {lesson.thumbnail ? (
                      <img
                        src={lesson.thumbnail}
                        alt={lesson.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5" />
                    )}
                    {/* Status badge */}
                    <div className="absolute top-2 left-2">
                      {lesson.completed ? (
                        <Badge className="bg-emerald-500/90 text-white text-[10px] gap-1 px-1.5 py-0.5 border-0">
                          <CheckCircle2 className="h-3 w-3" />
                          Completed
                        </Badge>
                      ) : lesson.started ? (
                        <Badge className="bg-amber-500/90 text-white text-[10px] gap-1 px-1.5 py-0.5 border-0">
                          <Circle className="h-3 w-3 fill-current" />
                          In Progress
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-secondary/80 text-muted-foreground text-[10px] gap-1 px-1.5 py-0.5">
                          <Circle className="h-3 w-3" />
                          Not Started
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="p-2.5">
                    <p className="text-xs font-medium text-foreground line-clamp-2 leading-snug">
                      {lesson.title}
                    </p>
                  </div>
                </div>
              ))}
              {module.lessons.length === 0 && (
                <p className="text-xs text-muted-foreground py-2">No lessons in this module yet.</p>
              )}
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

function LoadingSkeleton() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <Skeleton className="h-6 w-48" />
      <Skeleton className="h-40 w-full rounded-xl" />
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-20 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export default function CourseDetailPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { course, loading } = useCourseDetail(courseId);

  const openModuleId = location.hash.startsWith("#module-")
    ? location.hash.replace("#module-", "")
    : null;

  if (loading) return <LoadingSkeleton />;

  if (!course) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
        <h1 className="text-xl font-bold text-foreground mb-2">Course not found</h1>
        <Button variant="secondary" onClick={() => navigate("/programs")}>
          Back to Programs
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <button
          onClick={() => navigate("/programs")}
          className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
        >
          <ChevronLeft className="h-4 w-4" />
          Courses
        </button>
        <span className="text-muted-foreground">/</span>
        <span className="text-foreground font-medium truncate">{course.course_name}</span>
      </div>

      {/* Hero banner */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <div>
          {course.tags && course.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {course.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="bg-secondary/60 text-muted-foreground text-xs font-medium"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )}
          <h1 className="text-2xl font-bold text-foreground">{course.course_name}</h1>
          {course.summary && (
            <p className="text-sm text-muted-foreground mt-1 max-w-2xl">{course.summary}</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-sm font-semibold text-foreground">{course.progressPercent}%</span>
          </div>
          <Progress value={course.progressPercent} className="h-2 flex-1 bg-secondary" />
          <span className="text-xs text-muted-foreground flex-shrink-0">
            {course.completedLessons}/{course.totalLessons} lessons
          </span>
        </div>
      </div>

      {/* Program Content */}
      <section>
        <h2 className="text-lg font-bold text-foreground mb-4">
          Program Content
          <span className="text-sm font-normal text-muted-foreground ml-2">
            {course.modules.length} modules · {course.totalLessons} lessons
          </span>
        </h2>
        <div className="space-y-3">
          {course.modules.map((mod, i) => (
            <ModuleRow key={mod.id} module={mod} index={i} courseId={course.id} />
          ))}
        </div>
      </section>
    </div>
  );
}
