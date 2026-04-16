import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useCallback, useRef } from 'react';

export interface LessonResource {
  id: string;
  title: string;
  url: string;
  resource_type: string | null;
  position: number;
}

export interface SiblingLesson {
  id: string;
  title: string;
  position: number;
  completed: boolean;
}

export interface LessonData {
  id: string;
  title: string;
  description: string | null;
  text_content: string | null;
  module_id: string;
  moduleName: string;
  moduleEmoji: string | null;
  courseName: string;
  courseId: string;
  videoUrl: string | null;
  videoId: string | null;
  resources: LessonResource[];
  siblings: SiblingLesson[];
  currentIndex: number;
  prevLessonId: string | null;
  nextLessonId: string | null;
  completed: boolean;
}

export function useLesson(courseId: string | undefined, lessonId: string | undefined) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const lastLoggedRef = useRef<number>(0);

  const { data, isLoading } = useQuery({
    queryKey: ['lesson-detail', courseId, lessonId, user?.id],
    queryFn: async () => {
      // Fetch lesson
      const { data: lesson, error: lErr } = await supabase
        .from('lessons')
        .select('id, title, description, text_content, module_id')
        .eq('id', lessonId!)
        .single();
      if (lErr) throw lErr;

      // Fetch module + course in parallel
      const [moduleRes, videoRes, resourcesRes, progressRes] = await Promise.all([
        supabase.from('modules').select('id, title, emoji, course_id').eq('id', lesson.module_id).single(),
        supabase.from('videos').select('id, url').eq('lesson_id', lessonId!).limit(1).maybeSingle(),
        supabase.from('resources').select('id, title, url, resource_type, position').eq('lesson_id', lessonId!).order('position'),
        supabase.from('user_lesson_progress').select('lesson_id').eq('user_id', user!.id),
      ]);

      if (moduleRes.error) throw moduleRes.error;
      const mod = moduleRes.data;

      // Fetch course name
      const { data: course, error: cErr } = await supabase
        .from('courses')
        .select('id, course_name')
        .eq('id', mod.course_id)
        .single();
      if (cErr) throw cErr;

      // Fetch sibling lessons in same module
      const { data: siblings, error: sErr } = await supabase
        .from('lessons')
        .select('id, title, position')
        .eq('module_id', lesson.module_id)
        .eq('is_active', true)
        .order('position');
      if (sErr) throw sErr;

      const completedSet = new Set((progressRes.data || []).map(p => p.lesson_id));
      const siblingsList: SiblingLesson[] = (siblings || []).map(s => ({
        id: s.id,
        title: s.title,
        position: s.position,
        completed: completedSet.has(s.id),
      }));

      const currentIndex = siblingsList.findIndex(s => s.id === lessonId);

      return {
        id: lesson.id,
        title: lesson.title,
        description: lesson.description,
        text_content: lesson.text_content,
        module_id: lesson.module_id,
        moduleName: mod.title,
        moduleEmoji: mod.emoji,
        courseName: course.course_name,
        courseId: course.id,
        videoUrl: videoRes.data?.url || null,
        videoId: videoRes.data?.id || null,
        resources: (resourcesRes.data || []) as LessonResource[],
        siblings: siblingsList,
        currentIndex,
        prevLessonId: currentIndex > 0 ? siblingsList[currentIndex - 1].id : null,
        nextLessonId: currentIndex < siblingsList.length - 1 ? siblingsList[currentIndex + 1].id : null,
        completed: completedSet.has(lessonId!),
      } as LessonData;
    },
    enabled: !!courseId && !!lessonId && !!user?.id,
  });

  const markComplete = useMutation({
    mutationFn: async () => {
      if (!user || !lessonId) return;
      // Insert progress
      await supabase.from('user_lesson_progress').upsert(
        { user_id: user.id, lesson_id: lessonId },
        { onConflict: 'user_id,lesson_id' }
      );
      // Log activity
      await supabase.from('activity_log').insert({
        user_id: user.id,
        event_type: 'lesson_completed' as any,
        entity_type: 'lesson' as any,
        entity_id: lessonId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lesson-detail'] });
      queryClient.invalidateQueries({ queryKey: ['course-detail'] });
    },
  });

  const logVideoWatch = useCallback(() => {
    if (!user || !data?.videoId) return;
    const now = Date.now();
    // Throttle to once every 30 seconds
    if (now - lastLoggedRef.current < 30000) return;
    lastLoggedRef.current = now;

    supabase.from('activity_log').insert({
      user_id: user.id,
      event_type: 'video_watched' as any,
      entity_type: 'video' as any,
      entity_id: data.videoId,
    });
  }, [user, data?.videoId]);

  return { lesson: data, loading: isLoading, markComplete, logVideoWatch };
}
