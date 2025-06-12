import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, Plus, Eye, Edit, Mail, Phone, 
  Star, Users, Building, UserCircle,
  Grid3X3, List, Download, Upload, MoreHorizontal,
  MapPin
} from 'lucide-react';
import { Contact, ContactType, ContactStatus, ContactFilters } from '../../../types/contacts';
import { contactService } from '../../../services/contactService';

const UnifiedContactsPage: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [view, setView] = useState<'grid' | 'list'>('list');
  const [searchTerm, setSearchTerm] = useState('');  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set());
  const [filters] = useState<ContactFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    candidates: 0,
    clients: 0,
    interested: 0,
  });

  // Load contacts and stats
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [contactsData, statsData] = await Promise.all([
          contactService.getAllContacts(),
          contactService.getContactStats()
        ]);
        
        setContacts(contactsData);
        setStats({
          total: statsData.total,
          candidates: statsData.candidates,
          clients: statsData.clients,
          interested: statsData.interested,
        });
      } catch (error) {
        console.error('Failed to load contacts:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Search and filter contacts
  useEffect(() => {
    const searchAndFilter = async () => {
      try {
        const filteredContacts = await contactService.searchContacts(searchTerm, filters);
        setContacts(filteredContacts);
      } catch (error) {
        console.error('Failed to search contacts:', error);
      }
    };

    const debounceTimer = setTimeout(searchAndFilter, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm, filters]);
  // Helper functions for type-safe property access
  const getContactPosition = (contact: Contact): string => {
    if (contact.type === 'candidate') {
      return contact.currentPosition || 'Position not specified';
    } else if (contact.type === 'client') {
      return contact.position || 'Position not specified';
    } else if (contact.type === 'both') {
      return contact.candidateInfo?.currentPosition || contact.clientInfo?.position || 'Position not specified';
    }
    return 'Position not specified';
  };

  const getContactCompany = (contact: Contact): string => {
    if (contact.type === 'candidate') {
      return contact.currentCompany || 'Company not specified';
    } else if (contact.type === 'client') {
      return contact.company || 'Company not specified';
    } else if (contact.type === 'both') {
      return contact.candidateInfo?.currentCompany || contact.clientInfo?.company || 'Company not specified';
    }
    return 'Company not specified';
  };

  const getContactTypeIcon = (type: ContactType) => {
    switch (type) {
      case 'candidate': return <UserCircle className="w-4 h-4 text-blue-600" />;
      case 'client': return <Building className="w-4 h-4 text-green-600" />;
      case 'both': return <Users className="w-4 h-4 text-purple-600" />;
    }
  };

  const getStatusBadge = (status: ContactStatus) => {
    const statusColors = {
      new: 'bg-gray-100 text-gray-700',
      contacted: 'bg-blue-100 text-blue-700',
      responded: 'bg-yellow-100 text-yellow-700',
      interested: 'bg-green-100 text-green-700',
      not_interested: 'bg-red-100 text-red-700',
      closed: 'bg-purple-100 text-purple-700',
      active: 'bg-emerald-100 text-emerald-700',
      inactive: 'bg-gray-100 text-gray-500',
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[status]}`}>
        {status.replace('_', ' ')}
      </span>
    );
  };

  const getRelationshipScore = (score?: number) => {
    if (!score) return null;
    
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-3 h-3 ${
              i < score ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = 
      contact.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (contact.type === 'candidate' && contact.currentCompany?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (contact.type === 'client' && contact.company?.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType = !filters.type?.length || filters.type.includes(contact.type);
    const matchesStatus = !filters.status?.length || filters.status.includes(contact.status);

    return matchesSearch && matchesType && matchesStatus;
  });

  const ContactCard = ({ contact }: { contact: Contact }) => (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
            {contact.avatar ? (
              <img src={contact.avatar} alt={contact.fullName} className="w-10 h-10 rounded-full" />
            ) : (
              <span className="text-sm font-medium text-gray-600">
                {contact.firstName[0]}{contact.lastName[0]}
              </span>
            )}
          </div>          <div>
            <h3 className="font-medium text-gray-900">{contact.fullName}</h3>
            <p className="text-sm text-gray-600">
              {getContactPosition(contact)}
            </p>
            <p className="text-xs text-gray-500">
              {getContactCompany(contact)}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {getContactTypeIcon(contact.type)}
          {getStatusBadge(contact.status)}
        </div>
      </div>

      <div className="space-y-2 mb-3">
        <div className="flex items-center text-sm text-gray-600">
          <Mail className="w-4 h-4 mr-2" />
          {contact.email}
        </div>
        {contact.phone && (
          <div className="flex items-center text-sm text-gray-600">
            <Phone className="w-4 h-4 mr-2" />
            {contact.phone}
          </div>
        )}
        {contact.location && (
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="w-4 h-4 mr-2" />
            {contact.location}
          </div>
        )}
      </div>

      {contact.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {contact.tags.slice(0, 3).map((tag, index) => (
            <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
              {tag}
            </span>
          ))}
          {contact.tags.length > 3 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded">
              +{contact.tags.length - 3}
            </span>
          )}
        </div>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex items-center space-x-1">
          {getRelationshipScore(contact.relationshipScore)}
        </div>
        <div className="flex items-center space-x-2">
          <button className="p-1 hover:bg-gray-100 rounded text-gray-600" title="Send Email">
            <Mail className="w-4 h-4" />
          </button>
          <button className="p-1 hover:bg-gray-100 rounded text-gray-600" title="Call">
            <Phone className="w-4 h-4" />
          </button>
          <button className="p-1 hover:bg-gray-100 rounded text-gray-600" title="View Profile">
            <Eye className="w-4 h-4" />
          </button>
          <button className="p-1 hover:bg-gray-100 rounded text-gray-600" title="More">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  const ContactRow = ({ contact }: { contact: Contact }) => (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <input
            type="checkbox"
            className="h-4 w-4 text-purple-600 border-gray-300 rounded"
            checked={selectedContacts.has(contact.id)}
            onChange={() => {
              const newSelection = new Set(selectedContacts);
              if (newSelection.has(contact.id)) {
                newSelection.delete(contact.id);
              } else {
                newSelection.add(contact.id);
              }
              setSelectedContacts(newSelection);
            }}
          />
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
            <span className="text-sm font-medium text-gray-600">
              {contact.firstName[0]}{contact.lastName[0]}
            </span>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">{contact.fullName}</div>
            <div className="text-sm text-gray-500">{contact.email}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          {getContactTypeIcon(contact.type)}
          <span className="ml-2 text-sm text-gray-900 capitalize">{contact.type}</span>
        </div>
      </td>      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">
          {getContactPosition(contact)}
        </div>
        <div className="text-sm text-gray-500">
          {getContactCompany(contact)}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {getStatusBadge(contact.status)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {getRelationshipScore(contact.relationshipScore)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {contact.lastContact ? new Date(contact.lastContact).toLocaleDateString() : 'Never'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <div className="flex items-center space-x-2">
          <button className="text-blue-600 hover:text-blue-900" title="Send Email">
            <Mail className="w-4 h-4" />
          </button>
          <button className="text-green-600 hover:text-green-900" title="Call">
            <Phone className="w-4 h-4" />
          </button>
          <button className="text-gray-600 hover:text-gray-900" title="View">
            <Eye className="w-4 h-4" />
          </button>
          <button className="text-gray-600 hover:text-gray-900" title="Edit">
            <Edit className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
  return (
    <div className="w-full p-6">
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading contacts...</div>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">All Contacts</h1>
          <p className="text-gray-600 mt-1">Manage both candidate and client contacts in one place</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <Upload className="w-4 h-4 mr-2" />
            Import
          </button>
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
          <button className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Contact
          </button>
        </div>
      </div>      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-600">Total Contacts</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-blue-600">
            {stats.candidates}
          </div>
          <div className="text-sm text-gray-600">Candidates</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-green-600">
            {stats.clients}
          </div>
          <div className="text-sm text-gray-600">Clients</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-purple-600">
            {stats.interested}
          </div>
          <div className="text-sm text-gray-600">Interested</div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <div className="flex items-center space-x-4 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-80">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search contacts..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </button>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="flex border border-gray-300 rounded-lg overflow-hidden">
            <button
              onClick={() => setView('list')}
              className={`px-3 py-2 text-sm ${view === 'list' ? 'bg-purple-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setView('grid')}
              className={`px-3 py-2 text-sm ${view === 'grid' ? 'bg-purple-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {view === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredContacts.map(contact => (
            <ContactCard key={contact.id} contact={contact} />
          ))}
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-purple-600 border-gray-300 rounded"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedContacts(new Set(filteredContacts.map(c => c.id)));
                      } else {
                        setSelectedContacts(new Set());
                      }
                    }}
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Position/Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Relationship
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredContacts.map(contact => (
                <ContactRow key={contact.id} contact={contact} />
              ))}
            </tbody>
          </table>
        </div>
      )}          {filteredContacts.length === 0 && !loading && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No contacts found</h3>
              <p className="text-gray-500">Get started by adding your first contact.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default UnifiedContactsPage;
