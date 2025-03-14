
export function calculateTimeLeft(openingDate: string): { months: number; days: number } | null {
  if (!openingDate) return null;
  
  const targetDate = new Date(openingDate);
  const now = new Date();
  
  if (targetDate <= now) {
    return null;
  }
  
  const diffTime = targetDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const months = Math.floor(diffDays / 30);
  const days = diffDays % 30;
  
  return { months, days };
}
