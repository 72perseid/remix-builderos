import { getLessonThumbnail } from "@/lib/lessonThumbnail";

interface LessonThumbnailProps {
  title: string;
  className?: string;
}

export function LessonThumbnail({ title, className }: LessonThumbnailProps) {
  const { gradient, Icon } = getLessonThumbnail(title);

  return (
    <div
      className={`relative w-full h-full overflow-hidden ${className ?? ""}`}
      style={{ background: gradient }}
      aria-hidden="true"
    >
      <span className="absolute inset-0 flex items-center justify-center">
        <Icon className="h-8 w-8 text-white/90" strokeWidth={1.75} />
      </span>
    </div>
  );
}
