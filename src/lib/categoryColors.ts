// Consistent color scheme for gear categories
export const CATEGORY_COLORS: Record<string, string> = {
  'microphone': '#8b5cf6',      // Purple
  'guitar': '#f97316',           // Orange
  'bass': '#06b6d4',             // Cyan
  'keyboard': '#ec4899',         // Pink
  'amplifier': '#ef4444',        // Red
  'cabinet': '#b91c1c',          // Dark Red
  'dynamics': '#3b82f6',         // Blue
  'eq': '#14b8a6',               // Teal
  'effects': '#a855f7',          // Violet
  'preamp': '#10b981',           // Emerald
  'monitoring': '#6366f1',       // Indigo
  'drum': '#f59e0b',             // Amber
  'needs-review': '#6b7280',     // Gray
};

export function getCategoryColor(category: string): string {
  return CATEGORY_COLORS[category.toLowerCase()] || '#6b7280'; // Default to gray
}




