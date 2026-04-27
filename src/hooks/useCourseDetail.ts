import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useEnrollment } from '@/hooks/useEnrollment';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { isPaidCourse } from '@/lib/programAccess';

export interface LessonDetail {
  id: string;
  title: string;
  description: string | null;
  thumbnail: string | null;
  position: number;
  completed: boolean;
  started: boolean;
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
  course_type: string | null;
  lockedPreview?: boolean;
  modules: ModuleDetail[];
  totalLessons: number;
  completedLessons: number;
  progressPercent: number;
}

export function useCourseDetail(courseId: string | undefined) {
  const { user } = useAuth();
  const { accessGroupId } = useEnrollment();
  const { isAdmin } = useIsAdmin();

  const { data, isLoading } = useQuery({
    queryKey: ['course-detail', courseId, user?.id, accessGroupId, isAdmin],
    queryFn: async () => {
      const { data: course, error: cErr } = await supabase
        .from('courses')
        .select('id, course_name, summary, thumbnail, tags, course_type')
        .eq('id', courseId!)
        .single();

      if (cErr) throw cErr;

      const coursePreview = {
        id: course.id,
        course_name: course.course_name,
        summary: course.summary,
        thumbnail: course.thumbnail,
        tags: course.tags,
        course_type: (course as any).course_type ?? null,
        modules: [],
        totalLessons: 0,
        completedLessons: 0,
        progressPercent: 0,
      } as CourseDetail;

      if (isPaidCourse(coursePreview)) {
        const { data: enrollment, error: eErr } = await supabase
          .from('enrollments')
          .select('programs_access')
          .eq('user_id', user!.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        if (eErr) throw eErr;

        if (enrollment?.programs_access !== true) {
          return { ...coursePreview, lockedPreview: true } as CourseDetail;
        }
      }

      const { data: modules, error: mErr } = await supabase
        .from('modules')
        .select('id, title, description, emoji, position, duration_days')
        .eq('course_id', courseId!)
        .eq('is_active', true)
        .order('position');

      if (mErr) throw mErr;

      const moduleIds = (modules || []).map(m => m.id);

      const { data: rawLessons, error: lErr } = await supabase
        .from('lessons')
        .select('id, title, description, thumbnail, position, module_id')
        .eq('is_active', true)
        .in('module_id', moduleIds.length > 0 ? moduleIds : ['__none__'])
        .order('position');

      if (lErr) throw lErr;

      const rawLessonIds = (rawLessons || []).map(l => l.id);

      // Layer-2 access-group filtering: fetch lesson_access_groups for these lessons
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

      // Filter: admin sees all; otherwise show untagged lessons OR lessons tagged to user's group.
      const lessons = (rawLessons || []).filter(l => {
        if (isAdmin) return true;
        const groups = lessonGroupsMap.get(l.id);
        if (!groups || groups.size === 0) return true;
        return accessGroupId ? groups.has(accessGroupId) : false;
      });

      const lessonIds = lessons.map(l => l.id);

      const [progressRes, activityCompletedRes, videosRes] = await Promise.all([
        supabase.from('user_lesson_progress').select('lesson_id').eq('user_id', user!.id),
        supabase
          .from('activity_log')
          .select('entity_id')
          .eq('user_id', user!.id)
          .eq('event_type', 'lesson_completed')
          .eq('entity_type', 'lesson'),
        lessonIds.length > 0
          ? supabase.from('videos').select('id, lesson_id').in('lesson_id', lessonIds)
          : Promise.resolve({ data: [], error: null } as const),
      ]);

      if (progressRes.error) throw progressRes.error;
      if (activityCompletedRes.error) throw activityCompletedRes.error;
      if (videosRes.error) throw videosRes.error;

      // Build map: video_id -> lesson_id
      const videoToLesson = new Map<string, string>();
      for (const v of videosRes.data || []) videoToLesson.set(v.id, v.lesson_id);

      // Fetch video_watched events to derive "started" lessons
      const videoIds = (videosRes.data || []).map(v => v.id);
      const startedSet = new Set<string>();
      if (videoIds.length > 0) {
        const { data: watched, error: wErr } = await supabase
          .from('activity_log')
          .select('entity_id')
          .eq('user_id', user!.id)
          .eq('event_type', 'video_watched')
          .eq('entity_type', 'video')
          .in('entity_id', videoIds);
        if (wErr) throw wErr;
        for (const w of watched || []) {
          const lessonId = videoToLesson.get(w.entity_id as string);
          if (lessonId) startedSet.add(lessonId);
        }
      }

      const completedSet = new Set<string>([
        ...(progressRes.data || []).map(p => p.lesson_id),
        ...(activityCompletedRes.data || []).map(a => a.entity_id as string),
      ]);

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
          started: startedSet.has(l.id) && !completedSet.has(l.id),
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
        course_type: (course as any).course_type ?? null,
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
