import { BookOpen, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePrograms, type CourseWithProgress } from "@/hooks/usePrograms";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useEnrollment } from "@/hooks/useEnrollment";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { usePaywall } from "@/hooks/usePaywall";
import { PaywallDialog } from "@/components/paywall/PaywallDialog";

function CourseCardLarge({ course, locked, onClick }: { course: CourseWithProgress; locked?: boolean; onClick?: () => void }) {
  const navigate = useNavigate();
  const handleClick = onClick ?? (() => navigate(`/programs/${course.id}`));
  return (
    <div
      onClick={handleClick}
      className="rounded-xl border border-border bg-card overflow-hidden hover:border-primary/40 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/5 cursor-pointer relative">
      {locked && (
        <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 bg-background/90 backdrop-blur border border-border rounded-full px-3 py-1">
          <Lock className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-medium text-foreground">Locked</span>
        </div>
      )}
      <div className="flex flex-col md:flex-row">
        {course.thumbnail && (
          <div className="md:w-80 lg:w-96 flex-shrink-0">
            <img
              src={course.thumbnail}
              alt={course.course_name}
              className="w-full h-48 md:h-full object-cover"
            />
          </div>
        )}
        <div className="flex-1 p-6 flex flex-col justify-between gap-4">
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
            <h3 className="text-xl font-bold text-foreground mb-2">
              {course.course_name}
            </h3>
            {course.summary && (
              <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                {course.summary}
              </p>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-sm font-semibold text-foreground">
                  {course.progressPercent}%
                </span>
              </div>
              <Progress
                value={course.progressPercent}
                className="h-2 flex-1 bg-secondary"
              />
              <span className="text-xs text-muted-foreground flex-shrink-0">
                {course.completedLessons}/{course.totalLessons} lessons
              </span>
            </div>
            <Button size="sm" className="w-fit">
              {course.progressPercent > 0 ? "Continue" : "Start"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CourseCardSmall({ course }: { course: CourseWithProgress }) {
  const navigate = useNavigate();
  return (
    <div
      onClick={() => navigate(`/programs/${course.id}`)}
      className="rounded-xl border border-border bg-card overflow-hidden hover:border-primary/40 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/5 flex flex-col cursor-pointer">
      {course.thumbnail && (
        <img
          src={course.thumbnail}
          alt={course.course_name}
          className="w-full h-36 object-cover"
        />
      )}
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
          </div>
          <Button size="sm" variant="secondary" className="w-full text-xs h-8">
            {course.progressPercent > 0 ? "Continue" : "Start"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-8 p-6">
      <Skeleton className="h-64 w-full rounded-xl" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-56 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export default function ProgramsPage() {
  const { courses, loading } = usePrograms();

  const flagship = courses.filter((c) => c.course_type === "paid");
  const complementary = courses.filter((c) => c.course_type !== "paid");

  if (loading) return <LoadingSkeleton />;

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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-10">
      {/* Flagship Programs */}
      {flagship.length > 0 && (
        <section>
          <h1 className="text-2xl font-bold text-foreground mb-1">
            Flagship Programs
          </h1>
          <p className="text-sm text-muted-foreground mb-6">
            Our comprehensive programs to take you from idea to launch.
          </p>
          <div className="space-y-4">
            {flagship.map((course) => (
              <CourseCardLarge key={course.id} course={course} />
            ))}
          </div>
        </section>
      )}

      {/* Complementary Courses */}
      {complementary.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-foreground mb-1">
            Complementary Courses
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            Free and supplementary courses to support your journey.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {complementary.map((course) => (
              <CourseCardSmall key={course.id} course={course} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
