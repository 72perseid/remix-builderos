import { useState, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Pencil } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";

interface LogoUploaderProps {
  appId: string;
  appName: string;
  currentLogo?: string | null;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "w-8 h-8",
  md: "w-10 h-10",
  lg: "w-16 h-16",
};

const iconSizeClasses = {
  sm: "w-3 h-3",
  md: "w-4 h-4",
  lg: "w-5 h-5",
};

export function LogoUploader({ appId, appName, currentLogo, size = "md" }: LogoUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const appInitial = appName?.charAt(0).toUpperCase() || "A";

  const handleClick = () => {
    if (!isUploading) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ["image/png", "image/jpeg", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PNG, JPG, or WEBP image.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      // Generate unique file path
      const timestamp = Date.now();
      const fileExt = file.name.split('.').pop();
      const filePath = `public/${appId}/${timestamp}.${fileExt}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("app-logos")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("app-logos")
        .getPublicUrl(filePath);

      const publicUrl = urlData.publicUrl;

      // Update app_ideas table
      const { error: updateError } = await supabase
        .from("app_ideas")
        .update({ logo: publicUrl })
        .eq("id", appId);

      if (updateError) {
        throw updateError;
      }

      // Invalidate queries to refresh UI
      await queryClient.invalidateQueries({ queryKey: ["app_ideas"] });
      await queryClient.invalidateQueries({ queryKey: ["appIdea"] });

      toast({
        title: "Logo updated",
        description: "Your app logo has been updated successfully.",
      });
    } catch (error) {
      console.error("Error uploading logo:", error);
      toast({
        title: "Upload failed",
        description: "Failed to upload logo. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div
      className="relative cursor-pointer group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      <Avatar className={`${sizeClasses[size]} rounded-lg transition-opacity ${isHovered && !isUploading ? 'opacity-75' : ''}`}>
        <AvatarImage src={currentLogo || ""} className="rounded-lg object-cover" />
        <AvatarFallback className="rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold">
          {appInitial}
        </AvatarFallback>
      </Avatar>

      {/* Loading overlay */}
      {isUploading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
          <Loader2 className={`${iconSizeClasses[size]} text-white animate-spin`} />
        </div>
      )}

      {/* Edit overlay on hover */}
      {isHovered && !isUploading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
          <Pencil className={`${iconSizeClasses[size]} text-white`} />
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
