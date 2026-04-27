import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useEnrollment } from '@/hooks/useEnrollment';
import { useIsAdmin } from '@/hooks/useIsAdmin';

export interface CourseWithProgress {
  id: string;
  course_name: string;
  short_name: string | null;
  summary: string | null;
  thumbnail: string | null;
  tags: string[] | null;
  course_type: string | null;
  is_featured: boolean | null;
  program_id: string;
  totalLessons: number;
  completedLessons: number;
  progressPercent: number;
}

export function usePrograms() {
  const { user } = useAuth();
  const { accessGroupId } = useEnrollment();
  const { isAdmin } = useIsAdmin();

  const { data, isLoading } = useQuery({
    queryKey: ['programs-page', user?.id, accessGroupId, isAdmin],
    queryFn: async () => {
      // Fetch programs
      const { data: programs, error: pErr } = await supabase
        .from('programs')
        .select('id, title, description, position')
        .eq('is_active', true)
        .order('position');

      if (pErr) throw pErr;

      // Fetch courses
      const { data: courses, error: cErr } = await supabase
        .from('courses')
        .select('id, course_name, short_name, summary, thumbnail, tags, course_type, is_featured, program_id')
        .eq('is_active', true);

      if (cErr) throw cErr;

      // Fetch modules
      const { data: modules, error: mErr } = await supabase
        .from('modules')
        .select('id, course_id')
        .eq('is_active', true);

      if (mErr) throw mErr;

      // Fetch lessons
      const { data: rawLessons, error: lErr } = await supabase
        .from('lessons')
        .select('id, module_id')
        .eq('is_active', true);

      if (lErr) throw lErr;

      // Layer-2 access-group filtering
      const rawLessonIds = (rawLessons || []).map(l => l.id);
      const { data: lagRows, error: lagErr } = rawLessonIds.length > 0
        ? await supabase
            .from('access_groups_artifacts')
            .select('lesson_id, access_group_id')
            .in('lesson_id', rawLessonIds)
        : { data: [] as { lesson_id: string; access_group_id: string }[], error: null };
      if (lagErr) throw lagErr;

      const lessonGroupsMap = new Map<string, Set<string>>();
      for (const row of lagRows || []) {
        const set = lessonGroupsMap.get(row.lesson_id) ?? new Set<string>();
        set.add(row.access_group_id);
        lessonGroupsMap.set(row.lesson_id, set);
      }

      const lessons = (rawLessons || []).filter(l => {
        if (isAdmin) return true;
        const groups = lessonGroupsMap.get(l.id);
        if (!groups || groups.size === 0) return true;
        return accessGroupId ? groups.has(accessGroupId) : false;
      });

      // Fetch user progress + lesson_completed activity events
      const [progressRes, activityRes] = await Promise.all([
        supabase.from('user_lesson_progress').select('lesson_id').eq('user_id', user!.id),
        supabase
          .from('activity_log')
          .select('entity_id')
          .eq('user_id', user!.id)
          .eq('event_type', 'lesson_completed')
          .eq('entity_type', 'lesson'),
      ]);

      if (progressRes.error) throw progressRes.error;
      if (activityRes.error) throw activityRes.error;

      const completedSet = new Set<string>([
        ...(progressRes.data || []).map(p => p.lesson_id),
        ...(activityRes.data || []).map(a => a.entity_id as string),
      ]);

      // Map modules to courses
      const modulesByCourse: Record<string, string[]> = {};
      for (const m of modules || []) {
        if (!modulesByCourse[m.course_id]) modulesByCourse[m.course_id] = [];
        modulesByCourse[m.course_id].push(m.id);
      }

      // Map lessons to modules
      const lessonsByModule: Record<string, string[]> = {};
      for (const l of lessons || []) {
        if (!lessonsByModule[l.module_id]) lessonsByModule[l.module_id] = [];
        lessonsByModule[l.module_id].push(l.id);
      }

      // Build course data with progress
      const coursesWithProgress: CourseWithProgress[] = (courses || []).map(c => {
        const courseModuleIds = modulesByCourse[c.id] || [];
        const courseLessonIds = courseModuleIds.flatMap(mId => lessonsByModule[mId] || []);
        const totalLessons = courseLessonIds.length;
        const completedLessons = courseLessonIds.filter(lId => completedSet.has(lId)).length;
        const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

        return {
          id: c.id,
          course_name: c.course_name,
          short_name: c.short_name,
          summary: c.summary,
          thumbnail: c.thumbnail,
          tags: c.tags,
          course_type: c.course_type,
          is_featured: (c as any).is_featured ?? false,
          program_id: c.program_id,
          totalLessons,
          completedLessons,
          progressPercent,
        };
      });

      return { programs: programs || [], courses: coursesWithProgress };
    },
    enabled: !!user?.id,
  });

  return {
    programs: data?.programs || [],
    courses: data?.courses || [],
    loading: isLoading,
  };
}
