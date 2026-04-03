/**
 * Calcule le taux d'engagement : (likes + comments + shares + saves) / reach
 */
export function calculateEngagementRate(
  likes: number,
  comments: number,
  shares: number,
  saves: number,
  reach: number
): number {
  if (reach === 0) return 0;
  return (likes + comments + shares + saves) / reach;
}

/**
 * CPL organique = temps investi (en heures) × taux horaire / nombre de leads
 */
export function calculateCPL(
  hoursInvested: number,
  hourlyRate: number,
  leadsGenerated: number
): number {
  if (leadsGenerated === 0) return 0;
  return (hoursInvested * hourlyRate) / leadsGenerated;
}

/**
 * VPL = revenu total / nombre de leads
 */
export function calculateVPL(
  totalRevenue: number,
  totalLeads: number
): number {
  if (totalLeads === 0) return 0;
  return totalRevenue / totalLeads;
}

/**
 * Taux de closing = deals closés / calls complétés
 */
export function calculateClosingRate(
  dealsClosed: number,
  callsCompleted: number
): number {
  if (callsCompleted === 0) return 0;
  return dealsClosed / callsCompleted;
}
