import { SourcingProspect, SourcingStats } from './sourcingApiService';
import { CandidateStats } from './candidatesService';

export interface OutreachAnalyticsData {
  overallMetrics: OverallMetric[];
  campaignPerformance: CampaignPerformance[];
  channelPerformance: ChannelPerformance[];
  topPerformers: TopPerformer[];
}

export interface OverallMetric {
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
}

export interface CampaignPerformance {
  name: string;
  sent: number;
  opened: number;
  replied: number;
  interested: number;
  responseRate: number;
}

export interface ChannelPerformance {
  channel: string;
  sent: number;
  responses: number;
  rate: number;
}

export interface TopPerformer {
  name: string;
  position: string;
  score: number;
  status: string;
}

export class CandidateOutreachAnalyticsService {
  static calculateAnalyticsData(
    prospects: SourcingProspect[],
    prospectStats: SourcingStats,
    candidateStats: CandidateStats
  ): OutreachAnalyticsData {
    if (!prospects || !prospectStats || !candidateStats) {
      return {
        overallMetrics: [],
        campaignPerformance: [],
        channelPerformance: [],
        topPerformers: []
      };
    }

    const totalProspects = prospects.length;

    // Calculate overall metrics
    const overallMetrics = this.calculateOverallMetrics(prospects, totalProspects);

    // Calculate channel performance from sources
    const channelPerformance = this.calculateChannelPerformance(prospects, prospectStats);

    // Calculate campaign performance by grouping prospects by skills/positions
    const campaignPerformance = this.calculateCampaignPerformance(prospects);

    // Get top performing candidates
    const topPerformers = this.calculateTopPerformers(prospects);

    return {
      overallMetrics,
      campaignPerformance,
      channelPerformance,
      topPerformers
    };
  }

  private static calculateOverallMetrics(prospects: SourcingProspect[], totalProspects: number): OverallMetric[] {
    const respondedProspects = prospects.filter(p => 
      p.status === 'responded' || p.status === 'interested'
    ).length;
    const interestedProspects = prospects.filter(p => p.status === 'interested').length;
    const responseRate = totalProspects > 0 ? ((respondedProspects / totalProspects) * 100) : 0;
    const interestRate = totalProspects > 0 ? ((interestedProspects / totalProspects) * 100) : 0;
    const activeProspects = prospects.filter(p => 
      p.status !== 'closed' && p.status !== 'not_interested'
    ).length;

    return [
      { 
        label: 'Total Candidates Contacted', 
        value: totalProspects.toLocaleString(), 
        change: '+12%', 
        trend: 'up' as const 
      },
      { 
        label: 'Overall Response Rate', 
        value: `${responseRate.toFixed(1)}%`, 
        change: '+2.8%', 
        trend: 'up' as const 
      },
      { 
        label: 'Interest Rate', 
        value: `${interestRate.toFixed(1)}%`, 
        change: '+1.2%', 
        trend: 'up' as const 
      },
      { 
        label: 'Active Prospects', 
        value: activeProspects.toString(), 
        change: '+8%', 
        trend: 'up' as const 
      },
    ];
  }

  private static calculateChannelPerformance(prospects: SourcingProspect[], prospectStats: SourcingStats): ChannelPerformance[] {
    const channelData = prospectStats.bySource || {};
    
    return Object.entries(channelData)
      .map(([source, count]) => {
        const sourceProspects = prospects.filter(p => p.source === source);
        const sourceResponses = sourceProspects.filter(p => 
          p.status === 'responded' || p.status === 'interested'
        ).length;
        const rate = sourceProspects.length > 0 ? ((sourceResponses / sourceProspects.length) * 100) : 0;
        
        return {
          channel: this.formatChannelName(source),
          sent: sourceProspects.length,
          responses: sourceResponses,
          rate: Number(rate.toFixed(1))
        };
      })
      .sort((a, b) => b.sent - a.sent);
  }

  private static formatChannelName(source: string): string {
    switch (source) {
      case 'linkedin': return 'LinkedIn';
      case 'linkedin_chrome_extension': return 'LinkedIn Extension';
      case 'direct_application': return 'Direct Application';
      case 'referral': return 'Referral';
      case 'recruitment_agency': return 'Recruitment Agency';
      case 'github': return 'GitHub';
      case 'indeed': return 'Indeed';
      default: return source.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  }

  private static calculateCampaignPerformance(prospects: SourcingProspect[]): CampaignPerformance[] {
    const skillGroups: { [key: string]: SourcingProspect[] } = {};
    
    // Group prospects by primary skill
    prospects.forEach(prospect => {
      const candidate = prospect.candidate;
      if (candidate && candidate.skillMappings) {
        const skills = candidate.skillMappings.map((sm: any) => sm.skill?.name).filter(Boolean);
        const primarySkill = skills[0] || 'General';
        if (!skillGroups[primarySkill]) {
          skillGroups[primarySkill] = [];
        }
        skillGroups[primarySkill].push(prospect);
      } else {
        // Group by current position if no skills available
        const position = candidate?.currentPosition || 'General';
        const skillCategory = this.extractSkillFromPosition(position);
        if (!skillGroups[skillCategory]) {
          skillGroups[skillCategory] = [];
        }
        skillGroups[skillCategory].push(prospect);
      }
    });

    return Object.entries(skillGroups)
      .slice(0, 5) // Limit to top 5 groups
      .map(([skill, skillProspects]) => {
        const sent = skillProspects.length;
        const responded = skillProspects.filter(p => 
          p.status === 'responded' || p.status === 'interested'
        ).length;
        const interested = skillProspects.filter(p => p.status === 'interested').length;
        const responseRate = sent > 0 ? ((responded / sent) * 100) : 0;
        
        return {
          name: `${skill} Specialists`,
          sent,
          opened: Math.floor(sent * 0.65), // Estimated open rate
          replied: responded,
          interested,
          responseRate: Number(responseRate.toFixed(1))
        };
      })
      .sort((a, b) => b.sent - a.sent);
  }

  private static extractSkillFromPosition(position: string): string {
    const lowerPosition = position.toLowerCase();
    
    if (lowerPosition.includes('react') || lowerPosition.includes('frontend') || lowerPosition.includes('front-end')) {
      return 'React/Frontend';
    }
    if (lowerPosition.includes('backend') || lowerPosition.includes('back-end') || lowerPosition.includes('api')) {
      return 'Backend';
    }
    if (lowerPosition.includes('fullstack') || lowerPosition.includes('full-stack') || lowerPosition.includes('full stack')) {
      return 'Full Stack';
    }
    if (lowerPosition.includes('devops') || lowerPosition.includes('infrastructure')) {
      return 'DevOps';
    }
    if (lowerPosition.includes('product manager') || lowerPosition.includes('pm')) {
      return 'Product Management';
    }
    if (lowerPosition.includes('data') || lowerPosition.includes('analytics')) {
      return 'Data Science';
    }
    if (lowerPosition.includes('mobile') || lowerPosition.includes('ios') || lowerPosition.includes('android')) {
      return 'Mobile Development';
    }
    if (lowerPosition.includes('qa') || lowerPosition.includes('test')) {
      return 'QA/Testing';
    }
    
    return 'General';
  }

  private static calculateTopPerformers(prospects: SourcingProspect[]): TopPerformer[] {
    return prospects
      .filter(p => 
        (p.status === 'interested' || p.status === 'responded') && 
        p.candidate && 
        p.rating > 0
      )
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 10) // Get top 10, component will limit to 5
      .map(prospect => ({
        name: prospect.candidate?.fullName || 'Unknown',
        position: prospect.candidate?.currentPosition || 'Not specified',
        score: prospect.rating,
        status: this.formatProspectStatus(prospect.status)
      }));
  }

  private static formatProspectStatus(status: string): string {
    switch (status) {
      case 'interested': return 'Interested';
      case 'responded': return 'Responded';
      case 'contacted': return 'Contacted';
      case 'new': return 'New';
      case 'not_interested': return 'Not Interested';
      case 'closed': return 'Closed';
      default: return status.charAt(0).toUpperCase() + status.slice(1);
    }
  }

  static getStatusColor(status: string): string {
    switch (status) {
      case 'Interested': return 'bg-green-100 text-green-700';
      case 'Responded': return 'bg-blue-100 text-blue-700';
      case 'Contacted': return 'bg-yellow-100 text-yellow-700';
      case 'New': return 'bg-gray-100 text-gray-700';
      case 'Not Interested': return 'bg-red-100 text-red-700';
      case 'Closed': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  }

  static getProgressWidth(status: string): string {
    switch (status) {
      case 'Interested': return '100%';
      case 'Responded': return '75%';
      case 'Contacted': return '50%';
      case 'New': return '25%';
      default: return '10%';
    }
  }

  static getProgressColor(status: string): string {
    switch (status) {
      case 'Interested': return 'bg-green-500';
      case 'Responded': return 'bg-blue-500';
      case 'Contacted': return 'bg-yellow-500';
      case 'New': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  }
}

export default CandidateOutreachAnalyticsService;
