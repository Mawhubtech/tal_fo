import React, { useState, useEffect } from 'react';
import user1Data from '../../../data/user1.json';
import user2Data from '../../../data/user2.json';
import user3Data from '../../../data/user3.json';
import { Search, Filter, RefreshCw, Linkedin, Globe, Mail, Plus, ChevronDown } from 'lucide-react';
import Button from '../../../components/Button';
import ProfileSidePanel, { UserStructuredData, PanelState } from '../../../components/ProfileSidePanel'; // Added import

interface Contact {
  id: string;
  fullName: string;
  linkedIn?: string;
  website?: string;
  email?: string;
  projectName?: string;
  currentRole?: string;
  organization?: string;
  educationInstitution?: string;
  structuredData: UserStructuredData; // Added to hold full structured data for the panel
}

const ContactsPage: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set());
  const [selectedContactData, setSelectedContactData] = useState<UserStructuredData | null>(null); // State for panel data
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null); // State for selected contact ID
  const [panelState, setPanelState] = useState<PanelState>('closed'); // State for panel visibility

  useEffect(() => {
    const dummyUsers = [user1Data, user2Data, user3Data];
    const formattedContacts: Contact[] = dummyUsers.map((user, index) => ({
      id: `user${index + 1}`,
      fullName: user.structuredData.personalInfo?.fullName || 'N/A',
      linkedIn: user.structuredData.personalInfo?.linkedIn,
      website: user.structuredData.personalInfo?.website,
      email: user.structuredData.personalInfo?.email,
      projectName: user.structuredData.projects?.[0]?.name || 'First Project',
      currentRole: user.structuredData.experience?.[0]?.position || 'N/A',
      organization: user.structuredData.experience?.[0]?.company || 'N/A',
      educationInstitution: user.structuredData.education?.[0]?.institution || 'N/A',
      structuredData: user.structuredData, // Store the full structured data
    }));
    setContacts(formattedContacts);
  }, []);

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelectedContacts(new Set(contacts.map(c => c.id)));
    } else {
      setSelectedContacts(new Set());
    }
  };

  const handleSelectContact = (contactId: string) => {
    const newSelection = new Set(selectedContacts);
    if (newSelection.has(contactId)) {
      newSelection.delete(contactId);
    } else {
      newSelection.add(contactId);
    }
    setSelectedContacts(newSelection);
  };
  
  const handleContactNameClick = (contact: Contact) => {
    setSelectedContactData(contact.structuredData);
    setSelectedContactId(contact.id);
    setPanelState('expanded'); // Or 'collapsed' based on preference
  };

  const handlePanelStateChange = (newState: PanelState) => {
    setPanelState(newState);
    if (newState === 'closed') {
      setSelectedContactData(null);
      setSelectedContactId(null);
    }
  };

  const filteredContacts = contacts.filter(contact => 
    contact.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (contact.organization && contact.organization.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (contact.currentRole && contact.currentRole.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen w-full">
      <div className="flex justify-between items-center mb-6">        <div className="flex items-center space-x-2">
          <h1 className="text-2xl font-semibold text-gray-800">All Contacts</h1>
          <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
            <RefreshCw className="w-5 h-5" />
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" className="flex items-center text-sm">
            Actions <ChevronDown className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>

      <div className="mb-4 flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-3">
        <div className="relative flex-grow w-full sm:w-auto">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search by name, company, etc."
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" className="bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100 text-sm w-full sm:w-auto justify-center">
          <Filter className="w-4 h-4 mr-2" />
          Add Filter
        </Button>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="p-4 text-left">
                <input 
                  type="checkbox" 
                  className="h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  onChange={handleSelectAll}
                  checked={contacts.length > 0 && selectedContacts.size === filteredContacts.length && filteredContacts.length > 0}
                  disabled={contacts.length === 0}
                />
              </th>
              {['Full Name', 'Profiles', 'Projects', 'Tags', 'Current Role', 'Organization', 'Education'].map(header => (
                <th key={header} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{header}</th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredContacts.map((contact) => (
              <tr key={contact.id} className="hover:bg-gray-50">
                <td className="p-4">
                  <input 
                    type="checkbox" 
                    className="h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    checked={selectedContacts.has(contact.id)}
                    onChange={() => handleSelectContact(contact.id)}
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  <button onClick={() => handleContactNameClick(contact)} className="text-purple-600 hover:text-purple-800 hover:underline">
                    {contact.fullName}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center space-x-3">
                    {contact.linkedIn && (
                      <a href={contact.linkedIn} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800" title="LinkedIn">
                        <Linkedin className="w-5 h-5" />
                      </a>
                    )}
                    {contact.website && (
                      <a href={contact.website} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-700" title="Website">
                        <Globe className="w-5 h-5" />
                      </a>
                    )}
                    {!contact.linkedIn && !contact.website && contact.email && (
                       <a href={`mailto:${contact.email}`} className="text-gray-500 hover:text-gray-700" title="Email">
                        <Mail className="w-5 h-5" />
                      </a>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{contact.projectName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <Button variant="outline" size="sm" className="text-xs px-2 py-1 border-gray-300 hover:bg-gray-100">
                    <Plus className="w-3 h-3 mr-1" /> Add
                  </Button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{contact.currentRole}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{contact.organization}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{contact.educationInstitution}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {filteredContacts.length === 0 && (
        <div className="text-center py-10 text-gray-500">
          No contacts found{searchTerm && ' for your search'}.
        </div>
      )}
      <ProfileSidePanel 
        userData={selectedContactData} 
        panelState={panelState} 
        onStateChange={handlePanelStateChange}
        candidateId={selectedContactId}
      />
    </div>
  );
};

export default ContactsPage;
