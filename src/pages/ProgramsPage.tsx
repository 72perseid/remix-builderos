import { BookOpen, Sparkles, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePrograms, type CourseWithProgress } from "@/hooks/usePrograms";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useUserFeatures } from "@/hooks/useUserFeatures";
import { cn } from "@/lib/utils";
import { isPaidCourse } from "@/lib/programAccess";
import coursePlaceholder from "@/assets/course-placeholder.jpg";

function ProgramCardLockOverlay() {
  const navigate = useNavigate();

  return (
    <div
      className="absolute inset-0 z-20 flex items-center justify-center bg-background/45 p-4"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="w-full max-w-[240px] rounded-xl border border-border bg-card/95 p-4 text-center shadow-2xl backdrop-blur">
        <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full border border-primary/20 bg-primary/10">
          <Lock className="h-5 w-5 text-primary" />
        </div>
        <h4 className="mb-1 text-sm font-semibold text-foreground">Premium Program</h4>
        <p className="mb-3 text-xs text-muted-foreground">Upgrade to access this course.</p>
        <Button
          size="sm"
          className="h-8 w-full text-xs"
          onClick={(e) => {
            e.stopPropagation();
            navigate("/coaching");
          }}
        >
          Talk to an Expert
        </Button>
      </div>
    </div>
  );
}

function CourseCard({ course, locked }: { course: CourseWithProgress; locked?: boolean }) {
  const navigate = useNavigate();
  return (
    <div
      onClick={() => navigate(`/programs/${course.id}`)}
      className={cn(
        "relative rounded-xl border border-border bg-card overflow-hidden transition-all duration-300 flex flex-col",
        locked
          ? "cursor-pointer"
          : "hover:border-primary/40 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/5 cursor-pointer"
      )}
    >
      <div className={cn("flex flex-col flex-1", locked && "blur-md select-none pointer-events-none")} aria-hidden={locked}>
        <div className="relative">
          <img
            src={course.thumbnail?.trim() ? course.thumbnail : coursePlaceholder}
            alt={course.course_name}
            loading="lazy"
            onError={(e) => {
              const img = e.currentTarget;
              if (img.src !== coursePlaceholder) img.src = coursePlaceholder;
            }}
            className="w-full h-40 object-cover"
          />
        </div>
        <div className="p-4 flex flex-col flex-1 gap-3">
          <div className="flex-1">
            {course.tags && course.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {course.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="bg-secondary/60 text-muted-foreground text-[10px] font-medium"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
            <h4 className="text-sm font-semibold text-foreground mb-1">
              {course.course_name}
            </h4>
            {course.summary && (
              <p className="text-xs text-muted-foreground line-clamp-2">
                {course.summary}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span className="text-xs font-semibold text-foreground">
                {course.progressPercent}%
              </span>
              <Progress
                value={course.progressPercent}
                className="h-1.5 flex-1 bg-secondary"
              />
              <span className="text-[10px] text-muted-foreground flex-shrink-0">
                {course.completedLessons}/{course.totalLessons}
              </span>
            </div>
            <Button size="sm" variant="secondary" className="w-full text-xs h-8">
              {course.progressPercent > 0 ? "Continue" : "Start"}
            </Button>
          </div>
        </div>
      </div>
      {locked && <ProgramCardLockOverlay />}
    </div>
  );
}

function FeaturedCourseCard({ course, locked }: { course: CourseWithProgress; locked?: boolean }) {
  const navigate = useNavigate();
  return (
    <div
      onClick={() => navigate(`/programs/${course.id}`)}
      className={cn(
        "rounded-2xl border border-primary/30 bg-gradient-to-br from-card via-card to-primary/5 overflow-hidden transition-all duration-300 flex flex-col md:flex-row",
        locked
          ? "cursor-pointer"
          : "hover:border-primary/60 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/10 cursor-pointer"
      )}
    >
      <div className={cn("flex flex-col md:flex-row flex-1", locked && "blur-md select-none pointer-events-none")} aria-hidden={locked}>
        <div className="md:w-2/5 relative">
          <img
            src={course.thumbnail?.trim() ? course.thumbnail : coursePlaceholder}
            alt={course.course_name}
            loading="lazy"
            onError={(e) => {
              const img = e.currentTarget;
              if (img.src !== coursePlaceholder) img.src = coursePlaceholder;
            }}
            className="w-full h-48 md:h-full object-cover"
          />
          <Badge className="absolute top-3 left-3 bg-primary/90 text-primary-foreground gap-1">
            <Sparkles className="h-3 w-3" /> Featured
          </Badge>
        </div>
        <div className="md:w-3/5 p-6 flex flex-col gap-4">
          <div className="flex-1">
            {course.tags && course.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {course.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="bg-secondary/60 text-muted-foreground text-[10px] font-medium"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
            <h3 className="text-xl font-bold text-foreground mb-2">
              {course.course_name}
            </h3>
            {course.summary && (
              <p className="text-sm text-muted-foreground line-clamp-3">
                {course.summary}
              </p>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span className="text-xs font-semibold text-foreground">
                {course.progressPercent}%
              </span>
              <Progress
                value={course.progressPercent}
                className="h-1.5 flex-1 bg-secondary"
              />
              <span className="text-[10px] text-muted-foreground flex-shrink-0">
                {course.completedLessons}/{course.totalLessons}
              </span>
            </div>
            <Button size="sm" className="w-full md:w-auto">
              {course.progressPercent > 0 ? "Continue" : "Start"}
            </Button>
          </div>
        </div>
      </div>
      {locked && <ProgramCardLockOverlay />}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-8 p-6">
      <Skeleton className="h-8 w-48" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="h-72 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export default function ProgramsPage() {
  const { courses, loading: coursesLoading } = usePrograms();
  const { hasUse, loading: featuresLoading } = useUserFeatures();

  if (coursesLoading || featuresLoading) return <LoadingSkeleton />;

  const canUsePrograms = hasUse("programs");
  const isCourseLocked = (c: CourseWithProgress) =>
    isPaidCourse(c) && !canUsePrograms;

  if (courses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
        <div className="rounded-full bg-primary/10 p-4 mb-6">
          <BookOpen className="h-10 w-10 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Programs</h1>
        <p className="text-muted-foreground max-w-md">
          No programs available yet. Check back soon!
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-1">Programs</h1>
        <p className="text-sm text-muted-foreground">
          Comprehensive programs and supplementary courses to take you from idea to launch.
        </p>
      </div>
      <div className="space-y-8">
        {courses.filter((c) => c.is_featured).length > 0 && (
          <div className="space-y-4">
            {courses
              .filter((c) => c.is_featured)
              .map((course) => (
                <FeaturedCourseCard
                  key={course.id}
                  course={course}
                  locked={isCourseLocked(course)}
                />
              ))}
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses
            .filter((c) => !c.is_featured)
            .map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                locked={isCourseLocked(course)}
              />
            ))}
        </div>
      </div>
    </div>
  );
}

