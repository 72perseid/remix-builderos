import { BookOpen, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePrograms, type CourseWithProgress } from "@/hooks/usePrograms";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useUserFeatures } from "@/hooks/useUserFeatures";
import { LockedOverlay } from "@/components/paywall/LockedOverlay";
import { isPaidCourse } from "@/lib/programAccess";
import coursePlaceholder from "@/assets/course-placeholder.jpg";

function CourseCard({ course }: { course: CourseWithProgress }) {
  const navigate = useNavigate();
  return (
    <div
      onClick={() => navigate(`/programs/${course.id}`)}
      className="relative rounded-xl border border-border bg-card overflow-hidden transition-all duration-300 flex flex-col hover:border-primary/40 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/5 cursor-pointer"
    >
      <div className="flex flex-col flex-1">
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
    </div>
  );
}

function FeaturedCourseCard({ course }: { course: CourseWithProgress }) {
  const navigate = useNavigate();
  return (
    <div
      onClick={() => navigate(`/programs/${course.id}`)}
      className="rounded-2xl border border-primary/30 bg-gradient-to-br from-card via-card to-primary/5 overflow-hidden transition-all duration-300 flex flex-col md:flex-row relative hover:border-primary/60 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/10 cursor-pointer"
    >
      <div className="flex flex-col md:flex-row flex-1">
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

  const isFlagship = (c: CourseWithProgress) =>
    (c.course_name ?? "").trim().toLowerCase() === "dia vibe coding mba";

  let flagshipCourses = courses.filter(isFlagship);
  if (flagshipCourses.length === 0) {
    flagshipCourses = courses.filter((c) => c.is_featured && isPaidCourse(c));
  }
  const flagshipIds = new Set(flagshipCourses.map((c) => c.id));
  const complementaryCourses = courses
    .filter((c) => !flagshipIds.has(c.id))
    .sort((a, b) => Number(isPaidCourse(a)) - Number(isPaidCourse(b)));

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
      <div className="space-y-10">
        {flagshipCourses.length > 0 && (
          <section className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Flagship programs</h2>
              <p className="text-sm text-muted-foreground">
                Our signature accelerator programs designed to transform your app idea into a thriving business
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {flagshipCourses.map((course) => {
                const locked = isPaidCourse(course) && !canUsePrograms;
                return (
                  <div key={course.id} className="relative">
                    <div
                      className={locked ? "blur-md select-none pointer-events-none" : ""}
                      aria-hidden={locked}
                    >
                      <CourseCard course={course} />
                    </div>
                    {locked && <LockedOverlay feature="programs" />}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {complementaryCourses.length > 0 && (
          <section className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Complementary Courses</h2>
              <p className="text-sm text-muted-foreground">
                Specialized courses to enhance specific skills and knowledge areas.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {complementaryCourses.map((course) => {
                const locked = isPaidCourse(course) && !canUsePrograms;
                return (
                  <div key={course.id} className="relative">
                    <div
                      className={locked ? "blur-md select-none pointer-events-none" : ""}
                      aria-hidden={locked}
                    >
                      <CourseCard course={course} />
                    </div>
                    {locked && <LockedOverlay feature="programs" />}
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
