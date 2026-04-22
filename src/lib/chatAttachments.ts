import { toast } from '@/hooks/use-toast';

export interface ChatAttachment {
  type: 'image' | 'markdown';
  name: string;
  data: string; // base64 data-url for images, raw text for markdown
}

export const MAX_ATTACHMENT_SIZE = 5 * 1024 * 1024; // 5MB
export const MAX_ATTACHMENTS_PER_MESSAGE = 3;
export const ACCEPTED_ATTACHMENT_TYPES = 'image/png,image/jpeg,image/webp,.md,.markdown';

function readFileAsync(file: File, asText: boolean): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    if (asText) reader.readAsText(file);
    else reader.readAsDataURL(file);
  });
}

/**
 * Validate + read selected files into ChatAttachment objects.
 * Skips files that exceed size limits or push past MAX_ATTACHMENTS_PER_MESSAGE
 * (counted against the existingCount). Surfaces toast errors to the user.
 */
export async function processSelectedFiles(
  files: File[],
  existingCount: number
): Promise<ChatAttachment[]> {
  const accepted: ChatAttachment[] = [];
  let count = existingCount;

  for (const file of files) {
    if (count >= MAX_ATTACHMENTS_PER_MESSAGE) {
      toast({
        title: 'Limit reached',
        description: `Max ${MAX_ATTACHMENTS_PER_MESSAGE} attachments per message.`,
        variant: 'destructive',
      });
      break;
    }
    if (file.size > MAX_ATTACHMENT_SIZE) {
      toast({
        title: 'File too large',
        description: `"${file.name}" exceeds 5MB limit.`,
        variant: 'destructive',
      });
      continue;
    }
    const isMarkdown = file.name.endsWith('.md') || file.name.endsWith('.markdown');
    try {
      const data = await readFileAsync(file, isMarkdown);
      accepted.push({
        type: isMarkdown ? 'markdown' : 'image',
        name: file.name,
        data,
      });
      count += 1;
    } catch (err) {
      console.error('processSelectedFiles error:', err);
      toast({
        title: 'Read failed',
        description: `Could not read "${file.name}".`,
        variant: 'destructive',
      });
    }
  }

  return accepted;
}

/** Strip large data fields before persisting to chat_messages.metadata. */
export function summarizeAttachmentsForMetadata(attachments: ChatAttachment[]) {
  return attachments.map((a) => ({
    type: a.type,
    name: a.name,
    // Keep image data-url so resumed sessions can re-render thumbnails;
    // markdown payloads can be large, so just store a short preview.
    data: a.type === 'image' ? a.data : a.data.slice(0, 500),
  }));
}
