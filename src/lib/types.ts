// Type definitions based on the gear catalog schema

export type GearStatus = 'available' | 'in-use' | 'archived' | 'maintenance' | 'broken';

export type ParameterType = 'knob' | 'switch' | 'slider' | 'button' | 'wheel' | 'jack';

export interface GearParameter {
  name: string;
  type: ParameterType;
  range: string;
}

export interface SoundCharacteristics {
  tone: string[];
  qualities: string[];
}

export interface GearUsage {
  songTitle: string;
  artist: string;
  timestamp: string;
  context: string;
}

export interface GearMedia {
  photos?: string[];
  demoAudio?: string;
  demoVideo?: string;
  manualPdf?: string;
}

export interface GearConnections {
  pairedWith?: string[];
}

export interface GearItem {
  // Essential Fields (Required)
  id: string;
  name: string;
  brand: string;
  category: string;
  subcategory: string;
  description: string;
  soundCharacteristics: SoundCharacteristics;
  tags: string[];
  status: GearStatus;
  
  // Recommended Fields (Optional)
  parameters?: GearParameter[];
  specifications?: Record<string, any>;
  usage?: GearUsage[];
  media?: GearMedia;
  connections?: GearConnections;
  notes?: string;
  dateAdded?: string;
  lastUsed?: string;
}

// Categories and subcategories
export const GEAR_CATEGORIES = {
  dynamics: ['compressor', 'limiter', 'gate'],
  eq: ['equalizer', 'filter'],
  effects: ['reverb', 'delay', 'modulation', 'tape-echo'],
  guitar: ['electric-guitar', 'acoustic-guitar'],
  bass: ['electric-bass', 'acoustic-bass'],
  keyboard: ['analog-synthesizer', 'digital-synthesizer', 'piano', 'organ'],
  amplifier: ['guitar-head', 'bass-head', 'combo'],
  cabinet: ['guitar-cabinet', 'bass-cabinet'],
  microphone: ['large-diaphragm-condenser', 'small-diaphragm-condenser', 'dynamic', 'ribbon'],
  preamp: ['microphone-preamp', 'di-preamp', 'channel-strip'],
  monitoring: ['studio-monitor', 'headphones'],
  drum: ['drum-kit', 'percussion']
} as const;

export type GearCategory = keyof typeof GEAR_CATEGORIES;
export type GearSubcategory = typeof GEAR_CATEGORIES[GearCategory][number];

// Filter types
export interface GearFilters {
  category?: GearCategory;
  status?: GearStatus[];
  tags?: string[];
  tone?: string[];
  search?: string;
}

// API response types
export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

// Tag with count for display
export interface TagWithCount {
  tag: string;
  count: number;
}
