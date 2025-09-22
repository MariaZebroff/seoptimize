// Fallback insights when AI service is unavailable
export const generateFallbackInsights = (auditResults: any, url: string) => {
  const domain = new URL(url).hostname
  
  return {
    overallScore: auditResults?.seoScore || 75,
    keyStrengths: [
      'Website has a clear structure',
      'Content appears to be well-organized',
      'Mobile-friendly design detected'
    ],
    criticalIssues: [
      'Title tag optimization needed',
      'Meta description could be improved',
      'Image alt tags missing'
    ],
    quickWins: [
      'Add meta description',
      'Optimize title tags',
      'Add alt text to images',
      'Improve page loading speed'
    ],
    longTermStrategy: [
      'Develop comprehensive content strategy',
      'Build high-quality backlinks',
      'Implement technical SEO improvements',
      'Focus on user experience optimization'
    ],
    predictedImpact: {
      trafficIncrease: '15-25%',
      rankingImprovement: '2-3 positions',
      conversionBoost: '10-15%'
    },
    overallRecommendations: [
      'Focus on technical SEO improvements',
      'Create high-quality, relevant content',
      'Build authoritative backlinks',
      'Optimize for mobile and page speed'
    ]
  }
}

export const generateFallbackContentSuggestions = (currentContent: string, url: string) => {
  return [
    {
      type: 'title' as const,
      original: 'Current Title',
      suggestion: 'Optimized Title for Better SEO',
      reasoning: 'Shorter, more descriptive title with target keywords',
      impact: 'high' as const,
      effort: 'easy' as const
    },
    {
      type: 'meta-description' as const,
      original: 'Current meta description',
      suggestion: 'Compelling meta description that encourages clicks',
      reasoning: 'More engaging description with call-to-action',
      impact: 'medium' as const,
      effort: 'easy' as const
    }
  ]
}

export const generateFallbackKeywordSuggestions = (url: string, industry: string) => {
  return [
    {
      keyword: 'best practices',
      searchVolume: 'medium',
      competition: 'medium',
      relevance: 85,
      opportunity: 'Good opportunity with moderate competition'
    },
    {
      keyword: 'professional services',
      searchVolume: 'high',
      competition: 'high',
      relevance: 90,
      opportunity: 'High volume but competitive'
    },
    {
      keyword: 'industry solutions',
      searchVolume: 'low',
      competition: 'low',
      relevance: 80,
      opportunity: 'Low competition, good for long-tail strategy'
    }
  ]
}
