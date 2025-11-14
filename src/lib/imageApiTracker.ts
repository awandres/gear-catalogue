import { prisma } from './db';

const DAILY_LIMIT = 95;
const BULK_UPLOAD_MAX = 40;
const DAILY_AUTO_FETCH = 20;

interface ApiUsageStats {
  date: string;
  totalCalls: number;
  remainingCalls: number;
}

// Get current date string (YYYY-MM-DD)
function getCurrentDate(): string {
  return new Date().toISOString().split('T')[0];
}

// Track API usage in a simple way using the database or file system
// For simplicity, we'll use a JSON field in the database or create a simple tracking table
export async function getApiUsage(): Promise<ApiUsageStats> {
  const today = getCurrentDate();
  
  // Store in a simple file or database field
  // For now, we'll use localStorage-like approach with a tracking mechanism
  // In production, you'd want a dedicated table or Redis
  
  try {
    // Check if we have usage data for today
    const usageKey = `image_api_usage_${today}`;
    
    // For this implementation, we'll store in a simple way
    // You could create a dedicated ApiUsage table in Prisma
    // For now, let's return from memory/file
    
    // Read from a tracking source (simplified)
    const storedUsage = typeof window !== 'undefined' 
      ? localStorage.getItem(usageKey)
      : null;
    
    if (storedUsage) {
      const usage = JSON.parse(storedUsage);
      return {
        date: today,
        totalCalls: usage.totalCalls || 0,
        remainingCalls: DAILY_LIMIT - (usage.totalCalls || 0),
      };
    }
  } catch (error) {
    console.error('Error getting API usage:', error);
  }
  
  return {
    date: today,
    totalCalls: 0,
    remainingCalls: DAILY_LIMIT,
  };
}

export async function trackApiCall(callCount: number = 1): Promise<boolean> {
  const today = getCurrentDate();
  const usageKey = `image_api_usage_${today}`;
  
  try {
    const current = await getApiUsage();
    
    if (current.remainingCalls < callCount) {
      return false; // Would exceed limit
    }
    
    const newTotal = current.totalCalls + callCount;
    
    // Store updated usage
    if (typeof window !== 'undefined') {
      localStorage.setItem(usageKey, JSON.stringify({ totalCalls: newTotal }));
    }
    
    return true;
  } catch (error) {
    console.error('Error tracking API call:', error);
    return false;
  }
}

export function getBulkUploadLimit(): number {
  return BULK_UPLOAD_MAX;
}

export function getDailyAutoFetchLimit(): number {
  return DAILY_AUTO_FETCH;
}

export function getDailyLimit(): number {
  return DAILY_LIMIT;
}




