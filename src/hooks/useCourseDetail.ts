import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface LessonDetail {
  id: string;
  title: string;
  description: string | null;
  thumbnail: string | null;
  position: number;
  completed: boolean;
}

export interface ModuleDetail {
  id: string;
  title: string;
  description: string | null;
  emoji: string | null;
  position: number;
  duration_days: number | null;
  lessons: LessonDetail[];
  totalLessons: number;
  completedLessons: number;
  progressPercent: number;
}

export interface CourseDetail {
  id: string;
  course_name: string;
  summary: string | null;
  thumbnail: string | null;
  tags: string[] | null;
  modules: ModuleDetail[];
  totalLessons: number;
  completedLessons: number;
  progressPercent: number;
}

export function useCourseDetail(courseId: string | undefined) {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['course-detail', courseId, user?.id],
    queryFn: async () => {
      const { data: course, error: cErr } = await supabase
        .from('courses')
        .select('id, course_name, summary, thumbnail, tags')
        .eq('id', courseId!)
        .single();

      if (cErr) throw cErr;

      const { data: modules, error: mErr } = await supabase
        .from('modules')
        .select('id, title, description, emoji, position, duration_days')
        .eq('course_id', courseId!)
        .eq('is_active', true)
        .order('position');

      if (mErr) throw mErr;

      const moduleIds = (modules || []).map(m => m.id);

      const { data: lessons, error: lErr } = await supabase
        .from('lessons')
        .select('id, title, description, thumbnail, position, module_id')
        .eq('is_active', true)
        .in('module_id', moduleIds.length > 0 ? moduleIds : ['__none__'])
        .order('position');

      if (lErr) throw lErr;

      const { data: progress, error: pErr } = await supabase
        .from('user_lesson_progress')
        .select('lesson_id')
        .eq('user_id', user!.id);

      if (pErr) throw pErr;

      const completedSet = new Set((progress || []).map(p => p.lesson_id));

      const lessonsByModule: Record<string, typeof lessons> = {};
      for (const l of lessons || []) {
        if (!lessonsByModule[l.module_id]) lessonsByModule[l.module_id] = [];
        lessonsByModule[l.module_id].push(l);
      }

      let totalAll = 0;
      let completedAll = 0;

      const modulesWithProgress: ModuleDetail[] = (modules || []).map(m => {
        const mLessons = (lessonsByModule[m.id] || []).map(l => ({
          id: l.id,
          title: l.title,
          description: l.description,
          thumbnail: l.thumbnail,
          position: l.position,
          completed: completedSet.has(l.id),
        }));

        const total = mLessons.length;
        const completed = mLessons.filter(l => l.completed).length;
        totalAll += total;
        completedAll += completed;

        return {
          id: m.id,
          title: m.title,
          description: m.description,
          emoji: m.emoji,
          position: m.position,
          duration_days: m.duration_days,
          lessons: mLessons,
          totalLessons: total,
          completedLessons: completed,
          progressPercent: total > 0 ? Math.round((completed / total) * 100) : 0,
        };
      });

      return {
        id: course.id,
        course_name: course.course_name,
        summary: course.summary,
        thumbnail: course.thumbnail,
        tags: course.tags,
        modules: modulesWithProgress,
        totalLessons: totalAll,
        completedLessons: completedAll,
        progressPercent: totalAll > 0 ? Math.round((completedAll / totalAll) * 100) : 0,
      } as CourseDetail;
    },
    enabled: !!courseId && !!user?.id,
  });

  return { course: data, loading: isLoading };
}
