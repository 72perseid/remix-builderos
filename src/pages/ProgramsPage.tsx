import { BookOpen } from "lucide-react";

export default function ProgramsPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
      <div className="rounded-full bg-primary/10 p-4 mb-6">
        <BookOpen className="h-10 w-10 text-primary" />
      </div>
      <h1 className="text-2xl font-bold text-foreground mb-2">Programs</h1>
      <p className="text-muted-foreground max-w-md">
        Coming soon — your learning programs will appear here.
      </p>
    </div>
  );
}
