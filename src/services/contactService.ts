// Contact Service - Centralized contact management
import { Contact, ContactType, ContactStatus, ContactFilters } from '../types/contacts';

// Mock data for development - replace with real API calls
const mockContacts: Contact[] = [
  {
    id: '1',
    type: 'candidate',
    firstName: 'Sarah',
    lastName: 'Johnson',
    fullName: 'Sarah Johnson',
    email: 'sarah.johnson@email.com',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    linkedIn: 'https://linkedin.com/in/sarah-johnson',
    currentPosition: 'Senior React Developer',
    currentCompany: 'TechCorp Inc.',
    skills: ['React', 'TypeScript', 'Node.js', 'GraphQL'],
    experience: '5+ years',
    status: 'contacted',
    source: 'linkedin',
    addedDate: new Date('2024-01-15'),
    lastContact: new Date('2024-01-20'),
    tags: ['frontend', 'senior', 'react'],
    salaryExpectation: '$120k - $140k',
    availability: 'Available in 2 weeks',
    relationshipScore: 4,
  } as Contact,
  {
    id: '2',
    type: 'client',
    firstName: 'John',
    lastName: 'Smith',
    fullName: 'John Smith',
    email: 'john.smith@startup.com',
    phone: '+1 (555) 987-6543',
    location: 'Austin, TX',
    company: 'GrowthStartup',
    position: 'VP of Engineering',
    companySize: '50-100',
    industry: 'FinTech',
    hiringNeeds: ['Frontend Developer', 'Backend Developer'],
    status: 'interested',
    source: 'referral',
    addedDate: new Date('2024-01-12'),
    lastContact: new Date('2024-01-18'),
    tags: ['startup', 'fintech', 'urgent'],
    decisionMaker: true,
    urgency: 'high',
    budget: '$80k - $120k',
    relationshipScore: 5,
  } as Contact,
  {
    id: '3',
    type: 'candidate',
    firstName: 'Alex',
    lastName: 'Chen',
    fullName: 'Alex Chen',
    email: 'alex.chen@email.com',
    phone: '+1 (555) 456-7890',
    location: 'Seattle, WA',
    linkedIn: 'https://linkedin.com/in/alex-chen',
    currentPosition: 'Full Stack Developer',
    currentCompany: 'Microsoft',
    skills: ['JavaScript', 'Python', 'AWS', 'Docker'],
    experience: '3+ years',
    status: 'new',
    source: 'github',
    addedDate: new Date('2024-01-10'),
    tags: ['fullstack', 'cloud', 'microsoft'],
    salaryExpectation: '$90k - $110k',
    availability: 'Open to opportunities',
    relationshipScore: 3,
  } as Contact,
  {
    id: '4',
    type: 'client',
    firstName: 'Maria',
    lastName: 'Rodriguez',
    fullName: 'Maria Rodriguez',
    email: 'maria.rodriguez@enterprise.com',
    phone: '+1 (555) 321-6549',
    location: 'New York, NY',
    company: 'Enterprise Solutions',
    position: 'CTO',
    companySize: '500+',
    industry: 'Enterprise Software',
    hiringNeeds: ['Senior Architect', 'DevOps Engineer', 'Product Manager'],
    status: 'responded',
    source: 'networking',
    addedDate: new Date('2024-01-08'),
    lastContact: new Date('2024-01-22'),
    tags: ['enterprise', 'large-company', 'multiple-roles'],
    decisionMaker: true,
    urgency: 'medium',
    budget: '$150k - $200k',
    relationshipScore: 4,
  } as Contact
];

class ContactService {
  private contacts: Contact[] = mockContacts;

  // Get all contacts
  async getAllContacts(): Promise<Contact[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));
    return [...this.contacts];
  }

  // Get contacts by type
  async getContactsByType(type: ContactType): Promise<Contact[]> {
    await new Promise(resolve => setTimeout(resolve, 100));
    return this.contacts.filter(contact => 
      contact.type === type || contact.type === 'both'
    );
  }

  // Get candidate contacts for outreach
  async getCandidateContacts(): Promise<Contact[]> {
    return this.getContactsByType('candidate');
  }

  // Get client contacts for outreach
  async getClientContacts(): Promise<Contact[]> {
    return this.getContactsByType('client');
  }

  // Search contacts
  async searchContacts(searchTerm: string, filters?: ContactFilters): Promise<Contact[]> {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    let filteredContacts = [...this.contacts];

    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filteredContacts = filteredContacts.filter(contact =>
        contact.fullName.toLowerCase().includes(term) ||
        contact.email.toLowerCase().includes(term) ||
        (contact.type === 'candidate' && contact.currentCompany?.toLowerCase().includes(term)) ||
        (contact.type === 'client' && contact.company?.toLowerCase().includes(term)) ||
        contact.tags.some(tag => tag.toLowerCase().includes(term))
      );
    }

    // Apply filters
    if (filters) {
      if (filters.type?.length) {
        filteredContacts = filteredContacts.filter(contact =>
          filters.type!.includes(contact.type)
        );
      }

      if (filters.status?.length) {
        filteredContacts = filteredContacts.filter(contact =>
          filters.status!.includes(contact.status)
        );
      }

      if (filters.source?.length) {
        filteredContacts = filteredContacts.filter(contact =>
          filters.source!.includes(contact.source)
        );
      }

      if (filters.tags?.length) {
        filteredContacts = filteredContacts.filter(contact =>
          filters.tags!.some(tag => contact.tags.includes(tag))
        );
      }

      if (filters.location?.length) {
        filteredContacts = filteredContacts.filter(contact =>
          contact.location && filters.location!.some(loc => 
            contact.location!.toLowerCase().includes(loc.toLowerCase())
          )
        );
      }

      if (filters.skills?.length && filters.type?.includes('candidate')) {
        filteredContacts = filteredContacts.filter(contact =>
          contact.type === 'candidate' && 
          contact.skills?.some(skill => 
            filters.skills!.some(filterSkill => 
              skill.toLowerCase().includes(filterSkill.toLowerCase())
            )
          )
        );
      }

      if (filters.industry?.length && filters.type?.includes('client')) {
        filteredContacts = filteredContacts.filter(contact =>
          contact.type === 'client' && 
          contact.industry && filters.industry!.some(ind => 
            contact.industry!.toLowerCase().includes(ind.toLowerCase())
          )
        );
      }
    }

    return filteredContacts;
  }

  // Get contact by ID
  async getContactById(id: string): Promise<Contact | null> {
    await new Promise(resolve => setTimeout(resolve, 50));
    return this.contacts.find(contact => contact.id === id) || null;
  }

  // Add new contact
  async addContact(contact: Omit<Contact, 'id' | 'addedDate'>): Promise<Contact> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const newContact: Contact = {
      ...contact,
      id: `contact_${Date.now()}`,
      addedDate: new Date(),
    } as Contact;

    this.contacts.push(newContact);
    return newContact;
  }
  // Update contact
  async updateContact(id: string, updates: Partial<Contact>): Promise<Contact | null> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const index = this.contacts.findIndex(contact => contact.id === id);
    if (index === -1) return null;

    // Type-safe update that preserves the contact type
    const updatedContact = { ...this.contacts[index] } as Contact;
    Object.keys(updates).forEach(key => {
      if (updates[key as keyof Contact] !== undefined) {
        (updatedContact as any)[key] = updates[key as keyof Contact];
      }
    });
    
    this.contacts[index] = updatedContact;
    return this.contacts[index];
  }

  // Delete contact
  async deleteContact(id: string): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const index = this.contacts.findIndex(contact => contact.id === id);
    if (index === -1) return false;

    this.contacts.splice(index, 1);
    return true;
  }

  // Update contact status (for outreach tracking)
  async updateContactStatus(id: string, status: ContactStatus): Promise<Contact | null> {
    return this.updateContact(id, { status, lastContact: new Date() });
  }

  // Add tags to contact
  async addTagsToContact(id: string, tags: string[]): Promise<Contact | null> {
    const contact = await this.getContactById(id);
    if (!contact) return null;

    const newTags = [...new Set([...contact.tags, ...tags])];
    return this.updateContact(id, { tags: newTags });
  }

  // Remove tags from contact
  async removeTagsFromContact(id: string, tags: string[]): Promise<Contact | null> {
    const contact = await this.getContactById(id);
    if (!contact) return null;

    const newTags = contact.tags.filter(tag => !tags.includes(tag));
    return this.updateContact(id, { tags: newTags });
  }

  // Get contacts for campaign (with filtering)
  async getContactsForCampaign(
    type: 'candidate' | 'client',
    filters?: ContactFilters
  ): Promise<Contact[]> {
    const typeFilter = { ...filters, type: [type] };
    return this.searchContacts('', typeFilter);
  }

  // Bulk update contacts (for campaign assignments)
  async bulkUpdateContacts(
    contactIds: string[],
    updates: Partial<Contact>
  ): Promise<Contact[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const updatedContacts: Contact[] = [];
    
    for (const id of contactIds) {
      const updated = await this.updateContact(id, updates);
      if (updated) {
        updatedContacts.push(updated);
      }
    }
    
    return updatedContacts;
  }

  // Get contact statistics
  async getContactStats(): Promise<{
    total: number;
    candidates: number;
    clients: number;
    contacted: number;
    interested: number;
    bySource: Record<string, number>;
    byStatus: Record<string, number>;
  }> {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const stats = {
      total: this.contacts.length,
      candidates: this.contacts.filter(c => c.type === 'candidate').length,
      clients: this.contacts.filter(c => c.type === 'client').length,
      contacted: this.contacts.filter(c => c.status === 'contacted').length,
      interested: this.contacts.filter(c => c.status === 'interested').length,
      bySource: {} as Record<string, number>,
      byStatus: {} as Record<string, number>,
    };

    // Count by source
    this.contacts.forEach(contact => {
      stats.bySource[contact.source] = (stats.bySource[contact.source] || 0) + 1;
    });

    // Count by status
    this.contacts.forEach(contact => {
      stats.byStatus[contact.status] = (stats.byStatus[contact.status] || 0) + 1;
    });

    return stats;
  }
}

// Export singleton instance
export const contactService = new ContactService();
export default contactService;
