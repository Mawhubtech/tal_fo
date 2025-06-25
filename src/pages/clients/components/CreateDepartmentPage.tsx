import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Building, Plus } from 'lucide-react';
import { DepartmentApiService } from '../../../recruitment/organizations/services/departmentApiService';
import { ClientApiService } from '../../../services/clientApiService';
import type { CreateDepartmentRequest, Department } from '../../../recruitment/organizations/services/departmentApiService';
import type { Client } from '../../../services/clientApiService';
import DepartmentForm from './DepartmentForm';

const CreateDepartmentPage: React.FC = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const departmentApiService = new DepartmentApiService();
  const clientApiService = new ClientApiService();

  useEffect(() => {
    const loadClients = async () => {
      try {
        setLoading(true);
        const clientsData = await clientApiService.getAllClients();
        setClients(clientsData.clients || []);
      } catch (error) {
        console.error('Error loading clients:', error);
      } finally {
        setLoading(false);
      }
    };

    loadClients();
  }, []);

  const handleClientSelect = (client: Client) => {
    setSelectedClient(client);
    setShowForm(true);
  };

  const handleDepartmentCreated = (department: Department) => {
    setShowForm(false);
    setSelectedClient(null);
    // Navigate to the client detail page and show the departments tab
    navigate(`/dashboard/clients/${department.clientId}?tab=departments`);
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading clients...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Breadcrumbs */}
      <div className="flex items-center text-sm text-gray-500 mb-4">
        <Link to="/dashboard" className="hover:text-gray-700">Dashboard</Link>
        <span className="mx-2">/</span>
        <Link to="/dashboard/clients" className="hover:text-gray-700">Clients</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900 font-medium">Create Department</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Link 
            to="/dashboard/clients"
            className="mr-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create Department</h1>
            <p className="text-gray-600 mt-1">Select a client to create a new department</p>
          </div>
        </div>
      </div>

      {/* Client Selection */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Client</h2>
        
        {clients.length === 0 ? (
          <div className="text-center py-8">
            <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No clients found</h3>
            <p className="text-gray-500 mb-4">You need to create a client first before creating departments.</p>
            <Link 
              to="/dashboard/clients"
              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Client
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {clients.map((client) => (
              <button
                key={client.id}
                onClick={() => handleClientSelect(client)}
                className="bg-white border-2 border-gray-200 rounded-lg p-4 hover:border-purple-300 hover:shadow-md transition-all text-left"
              >
                <div className="flex items-center mb-3">
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-xl mr-3"
                    style={{ 
                      backgroundColor: client.name ? `hsl(${client.name.charCodeAt(0) * 10}, 70%, 50%)` : '#6B7280'
                    }}
                  >
                    {client.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{client.name}</h3>
                    <p className="text-sm text-gray-500">{client.industry}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-2">{client.location}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">{client.employees.toLocaleString()} employees</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    client.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {client.status}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Department Form Modal */}
      {showForm && selectedClient && (
        <DepartmentForm
          isOpen={showForm}
          onClose={() => {
            setShowForm(false);
            setSelectedClient(null);
          }}
          onSave={handleDepartmentCreated}
          clientId={selectedClient.id}
          clientName={selectedClient.name}
        />
      )}
    </div>
  );
};

export default CreateDepartmentPage;
