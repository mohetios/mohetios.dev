export type LeadSource =
  | 'email'
  | 'contact_form'
  | 'manual'

export type LeadStatus =
  | 'new'
  | 'qualified'
  | 'contacted'
  | 'waiting'
  | 'won'
  | 'lost'
  | 'archived'

export type LeadPriority =
  | 'low'
  | 'normal'
  | 'high'

export type LeadType =
  | 'freelance'
  | 'collaboration'
  | 'partnership'
  | 'speaking'
  | 'support'
  | 'other'

export type Lead = {
  id: string
  name: string
  email: string
  company?: string | null
  website?: string | null
  location?: string | null
  title: string
  summary: string
  source: LeadSource
  status: LeadStatus
  priority: LeadPriority
  type: LeadType
  budget?: string | null
  lastContactedAt?: string | null
  createdAt: string
  relatedInboxThreadId?: string | null
  tags: string[]
  notes?: string[]
}

export const leads: Lead[] = [
  {
    id: 'lead_001',
    name: 'Jane Smith',
    email: 'jane@brandstudio.com',
    company: 'Brand Studio',
    website: 'https://brandstudio.example',
    location: 'New York, NY',
    title: 'Collaboration inquiry',
    summary: 'Potential content and product collaboration around thoughtful creator tools.',
    source: 'email',
    status: 'qualified',
    priority: 'high',
    type: 'collaboration',
    budget: null,
    lastContactedAt: 'May 18, 2025',
    createdAt: 'May 18, 2025',
    relatedInboxThreadId: 'thread_001',
    tags: ['creator tools', 'content', 'partnership'],
    notes: [
      'Good fit with Mohetios audience.',
      'Ask for scope, expected timeline, and budget.'
    ]
  },
  {
    id: 'lead_002',
    name: 'Omar Khalid',
    email: 'omar@northstar.dev',
    company: 'Northstar Labs',
    website: 'https://northstar.example',
    location: 'Berlin, Germany',
    title: 'Product engineering contract',
    summary: 'Needs help with a Nuxt/Cloudflare dashboard and API integration workflow.',
    source: 'contact_form',
    status: 'new',
    priority: 'high',
    type: 'freelance',
    budget: '$3K–$6K',
    lastContactedAt: null,
    createdAt: 'May 17, 2025',
    relatedInboxThreadId: 'thread_002',
    tags: ['nuxt', 'cloudflare', 'dashboard'],
    notes: ['Strong technical fit. Reply with qualification questions.']
  },
  {
    id: 'lead_003',
    name: 'Maya Chen',
    email: 'maya@systemsletter.example',
    company: 'Systems Letter',
    website: null,
    location: 'Remote',
    title: 'Newsletter interview request',
    summary: 'Wants to interview Ali about building public engineering notebooks.',
    source: 'email',
    status: 'contacted',
    priority: 'normal',
    type: 'speaking',
    budget: null,
    lastContactedAt: 'May 16, 2025',
    createdAt: 'May 15, 2025',
    relatedInboxThreadId: 'thread_003',
    tags: ['interview', 'writing', 'public work'],
    notes: ['Good brand signal, not direct revenue.']
  },
  {
    id: 'lead_004',
    name: 'Daniel Weber',
    email: 'daniel@workflowkit.example',
    company: 'WorkflowKit',
    website: 'https://workflowkit.example',
    location: 'London, UK',
    title: 'Automation consulting',
    summary: 'Looking for a senior engineer to improve internal workflow automation.',
    source: 'contact_form',
    status: 'waiting',
    priority: 'normal',
    type: 'freelance',
    budget: '$1K–$2K',
    lastContactedAt: 'May 13, 2025',
    createdAt: 'May 12, 2025',
    relatedInboxThreadId: 'thread_004',
    tags: ['automation', 'api integration', 'consulting'],
    notes: ['Waiting for technical details.']
  },
  {
    id: 'lead_005',
    name: 'Sara Miller',
    email: 'sara@indiecollective.example',
    company: 'Indie Collective',
    website: null,
    location: 'Toronto, Canada',
    title: 'Community partnership',
    summary: 'Potential partnership around indie builders and technical writing.',
    source: 'email',
    status: 'archived',
    priority: 'low',
    type: 'partnership',
    budget: null,
    lastContactedAt: 'May 8, 2025',
    createdAt: 'May 5, 2025',
    relatedInboxThreadId: 'thread_005',
    tags: ['community', 'indie', 'writing'],
    notes: ['Interesting but not urgent.']
  }
]

export const leadSummary = {
  total: leads.length,
  new: leads.filter((lead) => lead.status === 'new').length,
  qualified: leads.filter((lead) => lead.status === 'qualified').length,
  waiting: leads.filter((lead) => lead.status === 'waiting').length,
  highPriority: leads.filter((lead) => lead.priority === 'high').length
}
