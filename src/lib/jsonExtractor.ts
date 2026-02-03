/**
 * Extracts JSON from mixed text content.
 * Handles responses like "Here is your updated model: {...}"
 */
export interface ExtractedJson {
  json: Record<string, unknown> | null;
  fullText: string;
}

export function extractJsonFromText(text: string): ExtractedJson {
  if (!text || typeof text !== 'string') {
    return { json: null, fullText: text || '' };
  }

  // Find the first { and last }
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');

  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    return { json: null, fullText: text };
  }

  const potentialJson = text.slice(firstBrace, lastBrace + 1);

  try {
    const parsed = JSON.parse(potentialJson);
    
    // Ensure it's an object (not a primitive wrapped in braces)
    if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
      return { json: parsed, fullText: text };
    }
    
    return { json: null, fullText: text };
  } catch {
    // Try to find a valid JSON object by looking for nested braces
    // This handles cases where there might be multiple JSON-like structures
    let depth = 0;
    let jsonStart = -1;
    
    for (let i = 0; i < text.length; i++) {
      if (text[i] === '{') {
        if (depth === 0) {
          jsonStart = i;
        }
        depth++;
      } else if (text[i] === '}') {
        depth--;
        if (depth === 0 && jsonStart !== -1) {
          const candidate = text.slice(jsonStart, i + 1);
          try {
            const parsed = JSON.parse(candidate);
            if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
              return { json: parsed, fullText: text };
            }
          } catch {
            // Continue looking
          }
        }
      }
    }
    
    return { json: null, fullText: text };
  }
}
