"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "~/trpc/react";

export default function ManageAssociations() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [locationFilter, setLocationFilter] = useState("");
  
  // This would be a query to check if the user is a platform admin
  const isPlatformAdminQuery = api.user.isPlatformAdmin.useQuery();
  
  // This would be a query to fetch all associations
  const associationsQuery = api.admin.getAllAssociations.useQuery({
    location: locationFilter || undefined,
  });
  
  // This would be a mutation to create a new association
  const createAssociationMutation = api.admin.createAssociation.useMutation({
    onSuccess: () => {
      void associationsQuery.refetch();
      setShowCreateModal(false);
    },
  });
  
  // This would be a mutation to deactivate an association
  const deactivateAssociationMutation = api.admin.deactivateAssociation.useMutation({
    onSuccess: () => {
      void associationsQuery.refetch();
    },
  });

  const handleCreateAssociation = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    const location = formData.get("location") as string;
    const maxPopulation = parseInt(formData.get("maxPopulation") as string);
    const ownerId = formData.get("ownerId") as string;
    
    createAssociationMutation.mutate({
      location,
      maxPopulation,
      ownerId: ownerId || undefined,
    });
  };

  const handleDeactivateAssociation = (id: string) => {
    if (window.confirm("Are you sure you want to deactivate this association? Members will no longer be able to access it.")) {
      deactivateAssociationMutation.mutate({ id });
    }
  };

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // The query will automatically refetch when locationFilter changes
  };

  if (isPlatformAdminQuery.isLoading) {
    return <div className="container mx-auto py-8 text-center">Verifying admin access...</div>;
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

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Link href="/admin" className="text-blue-600 hover:underline">
          ← Back to Admin Dashboard
        </Link>
      </div>
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Associations</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Create New Association
        </button>
      </div>
      
      <div className="bg-white p-6 rounded shadow-sm mb-6">
        <form onSubmit={handleFilterSubmit} className="flex gap-4">
          <div className="flex-1">
            <label htmlFor="locationFilter" className="block mb-2">Filter by Location</label>
            <input
              type="text"
              id="locationFilter"
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              placeholder="Enter location..."
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Filter
            </button>
          </div>
        </form>
      </div>
      
      <div className="bg-white p-6 rounded shadow-sm">
        <h2 className="text-xl font-semibold mb-4">All Associations</h2>
        
        {associationsQuery.isLoading ? (
          <div className="text-center py-4">Loading associations...</div>
        ) : associationsQuery.error ? (
          <div className="text-center text-red-500 py-4">
            Error loading associations: {associationsQuery.error.message}
          </div>
        ) : associationsQuery.data?.length === 0 ? (
          <div className="text-center py-4">No associations found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-2 px-4 text-left">Name/ID</th>
                  <th className="py-2 px-4 text-left">Location</th>
                  <th className="py-2 px-4 text-left">Members</th>
                  <th className="py-2 px-4 text-left">Owner</th>
                  <th className="py-2 px-4 text-left">Status</th>
                  <th className="py-2 px-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {associationsQuery.data?.map((association) => (
                  <tr key={association.id} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-4">
                      <Link 
                        href={`/admin/associations/${association.id}`}
                        className="text-blue-600 hover:underline"
                      >
                        {association.name || "Unnamed Association"}
                      </Link>
                      <div className="text-xs text-gray-500">{association.id}</div>
                    </td>
                    <td className="py-2 px-4">{association.location}</td>
                    <td className="py-2 px-4">
                      {association.population} / {association.maxPopulation}
                    </td>
                    <td className="py-2 px-4">
                      {association.owner?.name || "No owner assigned"}
                    </td>
                    <td className="py-2 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        association.active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}>
                        {association.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="py-2 px-4">
                      <div className="flex space-x-2">
                        <Link 
                          href={`/admin/associations/${association.id}`}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          Edit
                        </Link>
                        {association.active && (
                          <button
                            onClick={() => handleDeactivateAssociation(association.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Deactivate
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Create Association Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-semibold mb-4">Create New Association</h2>
            
            <form onSubmit={handleCreateAssociation}>
              <div className="mb-4">
                <label htmlFor="location" className="block mb-2">Location</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  required
                  className="w-full p-2 border rounded"
                  placeholder="City, Postcode, or Coordinates"
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="maxPopulation" className="block mb-2">Maximum Population</label>
                <input
                  type="number"
                  id="maxPopulation"
                  name="maxPopulation"
                  required
                  min={1}
                  defaultValue={30}
                  className="w-full p-2 border rounded"
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="ownerId" className="block mb-2">Owner ID (Optional)</label>
                <input
                  type="text"
                  id="ownerId"
                  name="ownerId"
                  className="w-full p-2 border rounded"
                  placeholder="User ID of the association owner"
                />
                <p className="text-sm text-gray-600 mt-1">
                  Leave blank to assign an owner later
                </p>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createAssociationMutation.isLoading}
                  className="px-4 py-2 bg-green-600 text-white rounded disabled:bg-gray-400"
                >
                  {createAssociationMutation.isLoading ? "Creating..." : "Create Association"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}