export type PaidCourseFields = {
  course_type?: string | null;
  tags?: Array<string | null> | null;
};

export const isPaidValue = (value?: string | null) =>
  (value ?? '').trim().toLowerCase() === 'paid';

export const isPaidCourse = (course?: PaidCourseFields | null) =>
  !!course && (isPaidValue(course.course_type) || (course.tags ?? []).some(isPaidValue));