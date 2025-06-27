"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "~/trpc/react";

export default function ManageAssociation({ params }: { params: { id: string } }) {
  const [nameInput, setNameInput] = useState("");
  const [locationInput, setLocationInput] = useState("");
  const [maxPopulationInput, setMaxPopulationInput] = useState("");
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  
  // This would be a query to check if the user is a platform admin
  const isPlatformAdminQuery = api.user.isPlatformAdmin.useQuery();
  
  // This would be a query to fetch association details
  const associationQuery = api.admin.getAssociationDetail.useQuery({ id: params.id });
  
  // This would be a query to fetch association history
  const historyQuery = api.admin.getAssociationHistory.useQuery({ id: params.id });
  
  // This would be a query to fetch moderation logs for the association
  const moderationQuery = api.admin.getAssociationModeration.useQuery({ id: params.id });
  
  // This would be a mutation to update association details
  const updateAssociationMutation = api.admin.updateAssociation.useMutation({
    onSuccess: () => {
      void associationQuery.refetch();
    },
  });
  
  // This would be a mutation to assign an admin
  const assignAdminMutation = api.admin.assignAssociationAdmin.useMutation({
    onSuccess: () => {
      void associationQuery.refetch();
      setShowAdminModal(false);
      setNewAdminEmail("");
    },
  });
  
  // This would be a mutation to remove an admin
  const removeAdminMutation = api.admin.removeAssociationAdmin.useMutation({
    onSuccess: () => {
      void associationQuery.refetch();
    },
  });

  useEffect(() => {
    if (associationQuery.data) {
      setNameInput(associationQuery.data.name || "");
      setLocationInput(associationQuery.data.location);
      setMaxPopulationInput(String(associationQuery.data.maxPopulation));
    }
  }, [associationQuery.data]);

  const handleUpdateAssociation = (e: React.FormEvent) => {
    e.preventDefault();
    
    updateAssociationMutation.mutate({
      id: params.id,
      name: nameInput,
      location: locationInput,
      maxPopulation: parseInt(maxPopulationInput),
    });
  };

  const handleAssignAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newAdminEmail) {
      assignAdminMutation.mutate({
        associationId: params.id,
        adminEmail: newAdminEmail,
      });
    }
  };

  const handleRemoveAdmin = (adminId: string) => {
    if (window.confirm("Are you sure you want to remove this admin?")) {
      removeAdminMutation.mutate({
        associationId: params.id,
        adminId,
      });
    }
  };

  if (isPlatformAdminQuery.isLoading || associationQuery.isLoading) {
    return <div className="container mx-auto py-8 text-center">Loading...</div>;
  }

  if (!isPlatformAdminQuery.data) {
    return (
      <div className="container mx-auto py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Unauthorized</h1>
        <p>You do not have permission to access the platform admin dashboard.</p>
        <Link href="/" className="text-blue-600 hover:underline">
          Return to Home
        </Link>
      </div>
    );
  }

  if (associationQuery.error) {
    return (
      <div className="container mx-auto py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Error</h1>
        <p>Failed to load association details: {associationQuery.error.message}</p>
        <Link href="/admin/associations" className="text-blue-600 hover:underline">
          Return to Associations List
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Link href="/admin/associations" className="text-blue-600 hover:underline">
          ← Back to Associations List
        </Link>
      </div>
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          {associationQuery.data?.name || `Association ${associationQuery.data?.id.substring(0, 8)}`}
        </h1>
        <div className={`px-3 py-1 rounded-full text-sm ${
          associationQuery.data?.active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
        }`}>
          {associationQuery.data?.active ? "Active" : "Inactive"}
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded shadow-sm mb-6">
            <h2 className="text-xl font-semibold mb-4">Association Details</h2>
            
            <form onSubmit={handleUpdateAssociation}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="name" className="block mb-2">Association Name</label>
                  <input
                    type="text"
                    id="name"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    className="w-full p-2 border rounded"
                    placeholder="Enter a name for this association"
                  />
                </div>
                
                <div>
                  <label htmlFor="location" className="block mb-2">Location</label>
                  <input
                    type="text"
                    id="location"
                    value={locationInput}
                    onChange={(e) => setLocationInput(e.target.value)}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <label htmlFor="maxPopulation" className="block mb-2">Maximum Population</label>
                <input
                  type="number"
                  id="maxPopulation"
                  value={maxPopulationInput}
                  onChange={(e) => setMaxPopulationInput(e.target.value)}
                  className="w-full p-2 border rounded"
                  min={1}
                  required
                />
              </div>
              
              <div className="flex gap-4 mb-4">
                <div className="flex-1">
                  <label className="block mb-2">Current Population</label>
                  <div className="p-2 border rounded bg-gray-50">
                    {associationQuery.data?.population} members
                  </div>
                </div>
                
                <div className="flex-1">
                  <label className="block mb-2">Created On</label>
                  <div className="p-2 border rounded bg-gray-50">
                    {associationQuery.data?.createdAt 
                      ? new Date(associationQuery.data.createdAt).toLocaleDateString() 
                      : "Unknown"}
                  </div>
                </div>
              </div>
              
              <button
                type="submit"
                disabled={updateAssociationMutation.isLoading}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
              >
                {updateAssociationMutation.isLoading ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </div>
          
          <div className="bg-white p-6 rounded shadow-sm mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Association Admins</h2>
              <button
                onClick={() => setShowAdminModal(true)}
                className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
              >
                Add Admin
              </button>
            </div>
            
            {associationQuery.data?.admins.length === 0 ? (
              <p>No admins assigned to this association</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="py-2 px-4 text-left">Name</th>
                      <th className="py-2 px-4 text-left">Email</th>
                      <th className="py-2 px-4 text-left">Role</th>
                      <th className="py-2 px-4 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {associationQuery.data?.owner && (
                      <tr className="border-b">
                        <td className="py-2 px-4">{associationQuery.data.owner.name}</td>
                        <td className="py-2 px-4">{associationQuery.data.owner.email}</td>
                        <td className="py-2 px-4">
                          <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">
                            Owner
                          </span>
                        </td>
                        <td className="py-2 px-4">
                          <span className="text-gray-400 text-sm">Owner cannot be removed</span>
                        </td>
                      </tr>
                    )}
                    
                    {associationQuery.data?.admins.map((admin) => (
                      <tr key={admin.id} className="border-b">
                        <td className="py-2 px-4">{admin.name}</td>
                        <td className="py-2 px-4">{admin.email}</td>
                        <td className="py-2 px-4">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                            Admin
                          </span>
                        </td>
                        <td className="py-2 px-4">
                          <button
                            onClick={() => handleRemoveAdmin(admin.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          
          <div className="bg-white p-6 rounded shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Member Churn History</h2>
            
            {historyQuery.isLoading ? (
              <div className="text-center py-4">Loading history...</div>
            ) : historyQuery.error ? (
              <div className="text-center text-red-500 py-4">
                Error loading history: {historyQuery.error.message}
              </div>
            ) : historyQuery.data?.length === 0 ? (
              <p>No member history available</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="py-2 px-4 text-left">Date</th>
                      <th className="py-2 px-4 text-left">Event</th>
                      <th className="py-2 px-4 text-left">User</th>
                      <th className="py-2 px-4 text-left">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historyQuery.data?.map((entry) => (
                      <tr key={entry.id} className="border-b">
                        <td className="py-2 px-4">
                          {new Date(entry.date).toLocaleDateString()}
                        </td>
                        <td className="py-2 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            entry.event === "JOIN" ? "bg-green-100 text-green-800" :
                            entry.event === "LEAVE" ? "bg-red-100 text-red-800" :
                            entry.event === "TRANSFER_IN" ? "bg-blue-100 text-blue-800" :
                            entry.event === "TRANSFER_OUT" ? "bg-yellow-100 text-yellow-800" :
                            "bg-gray-100 text-gray-800"
                          }`}>
                            {entry.event.replace("_", " ")}
                          </span>
                        </td>
                        <td className="py-2 px-4">{entry.user.name}</td>
                        <td className="py-2 px-4">{entry.notes || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
        
        <div>
          <div className="bg-white p-6 rounded shadow-sm mb-6">
            <h2 className="text-xl font-semibold mb-4">Quick Stats</h2>
            
            <div className="space-y-4">
              <div>
                <p className="text-gray-600 mb-1">Current Population</p>
                <p className="text-2xl font-bold">
                  {associationQuery.data?.population} / {associationQuery.data?.maxPopulation}
                </p>
              </div>
              
              <div>
                <p className="text-gray-600 mb-1">Pending Applications</p>
                <p className="text-2xl font-bold">
                  {associationQuery.data?.pendingApplications || 0}
                </p>
              </div>
              
              <div>
                <p className="text-gray-600 mb-1">Upcoming Events</p>
                <p className="text-2xl font-bold">
                  {associationQuery.data?.upcomingEvents || 0}
                </p>
              </div>
              
              <div>
                <p className="text-gray-600 mb-1">Member Retention</p>
                <p className="text-2xl font-bold">
                  {associationQuery.data?.retentionRate || 0}%
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded shadow-sm mb-6">
            <h2 className="text-xl font-semibold mb-4">Flagged Issues</h2>
            
            {moderationQuery.isLoading ? (
              <div className="text-center py-4">Loading moderation data...</div>
            ) : moderationQuery.error ? (
              <div className="text-center text-red-500 py-4">
                Error loading moderation data: {moderationQuery.error.message}
              </div>
            ) : moderationQuery.data?.length === 0 ? (
              <p>No flagged issues</p>
            ) : (
              <div className="space-y-4 max-h-80 overflow-y-auto">
                {moderationQuery.data?.map((issue) => (
                  <div key={issue.id} className="border-b pb-4">
                    <div className="flex justify-between items-start mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        issue.status === "NEW" ? "bg-red-100 text-red-800" :
                        issue.status === "IN_PROGRESS" ? "bg-yellow-100 text-yellow-800" :
                        issue.status === "RESOLVED" ? "bg-green-100 text-green-800" :
                        "bg-gray-100 text-gray-800"
                      }`}>
                        {issue.status.replace("_", " ")}
                      </span>
                      <span className="text-sm text-gray-600">
                        {new Date(issue.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="font-semibold mb-1">{issue.title}</p>
                    <p className="text-sm text-gray-700 mb-2">{issue.description}</p>
                    <div className="flex justify-between text-sm">
                      <span>Reported by: {issue.reporter.name}</span>
                      <Link 
                        href={`/admin/moderation/${issue.id}`}
                        className="text-blue-600 hover:underline"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="space-y-3">
            <Link 
              href={`/admin/association/${params.id}`}
              className="block w-full bg-blue-500 text-white py-2 rounded text-center hover:bg-blue-600"
            >
              View Admin Dashboard
            </Link>
            
            <Link 
              href={`/admin/association/${params.id}/insights`}
              className="block w-full bg-blue-500 text-white py-2 rounded text-center hover:bg-blue-600"
            >
              View Association Insights
            </Link>
          </div>
        </div>
      </div>
      
      {/* Add Admin Modal */}
      {showAdminModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-semibold mb-4">Add Association Admin</h2>
            
            <form onSubmit={handleAssignAdmin}>
              <div className="mb-4">
                <label htmlFor="adminEmail" className="block mb-2">Admin Email</label>
                <input
                  type="email"
                  id="adminEmail"
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="Enter email of the new admin"
                  required
                />
              </div>
              
              <div className="text-sm text-gray-600 mb-4">
                <p>The user must already have an account in the system.</p>
                <p>They will be granted admin privileges for this association.</p>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAdminModal(false)}
                  className="px-4 py-2 border rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={assignAdminMutation.isLoading || !newAdminEmail}
                  className="px-4 py-2 bg-green-600 text-white rounded disabled:bg-gray-400"
                >
                  {assignAdminMutation.isLoading ? "Adding..." : "Add Admin"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}