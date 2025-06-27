"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "~/trpc/react";

export default function AssociationAdminDashboard({ params }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState<"members" | "applications" | "notes">("members");
  const [showPromoteModal, setShowPromoteModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  
  // This would be a query to fetch association details
  const associationQuery = api.association.getById.useQuery({ id: params.id });
  
  // This would be a query to fetch members of the association
  const membersQuery = api.association.getMembers.useQuery(
    { associationId: params.id },
    { enabled: activeTab === "members" }
  );
  
  // This would be a query to fetch applications to the association
  const applicationsQuery = api.association.getApplications.useQuery(
    { associationId: params.id },
    { enabled: activeTab === "applications" }
  );
  
  // This would be a query to fetch admin notes
  const notesQuery = api.association.getAdminNotes.useQuery(
    { associationId: params.id },
    { enabled: activeTab === "notes" }
  );
  
  // This would be a mutation to approve an application
  const approveApplicationMutation = api.association.approveApplication.useMutation({
    onSuccess: () => {
      void applicationsQuery.refetch();
      void membersQuery.refetch();
    },
  });
  
  // This would be a mutation to reject an application
  const rejectApplicationMutation = api.association.rejectApplication.useMutation({
    onSuccess: () => {
      void applicationsQuery.refetch();
    },
  });
  
  // This would be a mutation to promote a member to admin
  const promoteToAdminMutation = api.association.promoteToAdmin.useMutation({
    onSuccess: () => {
      void membersQuery.refetch();
      setShowPromoteModal(false);
      setSelectedUserId(null);
    },
  });
  
  // This would be a mutation to demote an admin to regular member
  const demoteFromAdminMutation = api.association.demoteFromAdmin.useMutation({
    onSuccess: () => {
      void membersQuery.refetch();
    },
  });
  
  // This would be a mutation to remove a member from the association
  const removeMemberMutation = api.association.removeMember.useMutation({
    onSuccess: () => {
      void membersQuery.refetch();
    },
  });
  
  // This would be a mutation to add an admin note
  const addNoteMutation = api.association.addAdminNote.useMutation({
    onSuccess: () => {
      void notesQuery.refetch();
    },
  });

  const handleApproveApplication = (applicationId: string) => {
    if (window.confirm("Are you sure you want to approve this application?")) {
      approveApplicationMutation.mutate({ id: applicationId });
    }
  };

  const handleRejectApplication = (applicationId: string) => {
    if (window.confirm("Are you sure you want to reject this application?")) {
      rejectApplicationMutation.mutate({ id: applicationId });
    }
  };

  const handlePromoteToAdmin = () => {
    if (selectedUserId) {
      promoteToAdminMutation.mutate({ 
        associationId: params.id, 
        userId: selectedUserId 
      });
    }
  };

  const handleDemoteFromAdmin = (userId: string) => {
    if (window.confirm("Are you sure you want to remove admin privileges from this user?")) {
      demoteFromAdminMutation.mutate({ 
        associationId: params.id, 
        userId 
      });
    }
  };

  const handleRemoveMember = (userId: string) => {
    if (window.confirm("Are you sure you want to remove this member from the association?")) {
      removeMemberMutation.mutate({ 
        associationId: params.id, 
        userId 
      });
    }
  };

  const handleAddNote = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const content = formData.get("content") as string;
    
    if (content) {
      addNoteMutation.mutate({
        associationId: params.id,
        content
      });
      form.reset();
    }
  };

  // Check if the current user is an admin of this association
  const isAdminQuery = api.association.isUserAssociationAdmin.useQuery({ associationId: params.id });
  const isPlatformAdminQuery = api.user.isPlatformAdmin.useQuery();
  
  const hasAdminAccess = isAdminQuery.data || isPlatformAdminQuery.data;

  if (isAdminQuery.isLoading || isPlatformAdminQuery.isLoading) {
    return <div className="container mx-auto py-8 text-center">Verifying admin access...</div>;
  }

  if (!hasAdminAccess) {
    return (
      <div className="container mx-auto py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Unauthorized</h1>
        <p>You do not have permission to manage this association.</p>
        <Link href="/association" className="text-blue-600 hover:underline">
          Return to Association Home
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Link href="/association" className="text-blue-600 hover:underline">
          ← Back to Association Home
        </Link>
      </div>
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Association Admin Dashboard</h1>
        
        <div className="flex space-x-4">
          <Link 
            href={`/admin/association/${params.id}/events`}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Manage Events
          </Link>
          <Link 
            href={`/admin/association/${params.id}/insights`}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            View Insights
          </Link>
        </div>
      </div>
      
      {associationQuery.isLoading ? (
        <div className="text-center">Loading association details...</div>
      ) : associationQuery.error ? (
        <div className="text-center text-red-500">
          Error loading association: {associationQuery.error.message}
        </div>
      ) : associationQuery.data ? (
        <>
          <div className="bg-white p-6 rounded shadow-sm mb-6">
            <h2 className="text-xl font-semibold mb-4">Association Overview</h2>
            <p className="mb-2">Location: {associationQuery.data.location}</p>
            <p>Members: {associationQuery.data.population} / {associationQuery.data.maxPopulation}</p>
          </div>
          
          <div className="mb-6">
            <div className="flex border-b">
              <button
                onClick={() => setActiveTab("members")}
                className={`px-4 py-2 ${activeTab === "members" ? "border-b-2 border-blue-500 font-semibold" : ""}`}
              >
                Members
              </button>
              <button
                onClick={() => setActiveTab("applications")}
                className={`px-4 py-2 ${activeTab === "applications" ? "border-b-2 border-blue-500 font-semibold" : ""}`}
              >
                Applications
              </button>
              <button
                onClick={() => setActiveTab("notes")}
                className={`px-4 py-2 ${activeTab === "notes" ? "border-b-2 border-blue-500 font-semibold" : ""}`}
              >
                Internal Notes
              </button>
            </div>
          </div>
          
          {activeTab === "members" && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Members</h2>
                <button
                  onClick={() => setShowPromoteModal(true)}
                  className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                >
                  Promote Member to Admin
                </button>
              </div>
              
              {membersQuery.isLoading ? (
                <div className="text-center py-4">Loading members...</div>
              ) : membersQuery.error ? (
                <div className="text-center text-red-500 py-4">
                  Error loading members: {membersQuery.error.message}
                </div>
              ) : membersQuery.data?.length === 0 ? (
                <div className="text-center py-4">No members in this association</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="py-2 px-4 border-b text-left">Name</th>
                        <th className="py-2 px-4 border-b text-left">Email</th>
                        <th className="py-2 px-4 border-b text-left">Joined</th>
                        <th className="py-2 px-4 border-b text-left">Role</th>
                        <th className="py-2 px-4 border-b text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {membersQuery.data?.map((member) => (
                        <tr key={member.id}>
                          <td className="py-2 px-4 border-b">{member.name}</td>
                          <td className="py-2 px-4 border-b">{member.email}</td>
                          <td className="py-2 px-4 border-b">{member.joinedAt?.toLocaleDateString()}</td>
                          <td className="py-2 px-4 border-b">
                            {member.isAdmin ? (
                              <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">
                                Admin
                              </span>
                            ) : (
                              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                                Member
                              </span>
                            )}
                          </td>
                          <td className="py-2 px-4 border-b">
                            {member.isAdmin ? (
                              <button
                                onClick={() => handleDemoteFromAdmin(member.id)}
                                className="text-yellow-600 hover:text-yellow-800 mr-2"
                              >
                                Demote
                              </button>
                            ) : null}
                            <button
                              onClick={() => handleRemoveMember(member.id)}
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
          )}
          
          {activeTab === "applications" && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Applications</h2>
              
              {applicationsQuery.isLoading ? (
                <div className="text-center py-4">Loading applications...</div>
              ) : applicationsQuery.error ? (
                <div className="text-center text-red-500 py-4">
                  Error loading applications: {applicationsQuery.error.message}
                </div>
              ) : applicationsQuery.data?.length === 0 ? (
                <div className="text-center py-4">No pending applications</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="py-2 px-4 border-b text-left">Name</th>
                        <th className="py-2 px-4 border-b text-left">Email</th>
                        <th className="py-2 px-4 border-b text-left">Applied On</th>
                        <th className="py-2 px-4 border-b text-left">Status</th>
                        <th className="py-2 px-4 border-b text-left">Motivation</th>
                        <th className="py-2 px-4 border-b text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {applicationsQuery.data?.map((application) => (
                        <tr key={application.id}>
                          <td className="py-2 px-4 border-b">{application.user.name}</td>
                          <td className="py-2 px-4 border-b">{application.user.email}</td>
                          <td className="py-2 px-4 border-b">{application.createdAt.toLocaleDateString()}</td>
                          <td className="py-2 px-4 border-b">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              application.status === "NEW" ? "bg-blue-100 text-blue-800" :
                              application.status === "UNDER_REVIEW" ? "bg-yellow-100 text-yellow-800" :
                              "bg-gray-100 text-gray-800"
                            }`}>
                              {application.status.replace("_", " ")}
                            </span>
                          </td>
                          <td className="py-2 px-4 border-b">
                            {application.motivation || "No motivation provided"}
                          </td>
                          <td className="py-2 px-4 border-b">
                            {(application.status === "NEW" || application.status === "UNDER_REVIEW") && (
                              <>
                                <button
                                  onClick={() => handleApproveApplication(application.id)}
                                  className="text-green-600 hover:text-green-800 mr-2"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleRejectApplication(application.id)}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  Reject
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
          
          {activeTab === "notes" && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Internal Notes</h2>
              
              <form onSubmit={handleAddNote} className="mb-6">
                <div className="mb-4">
                  <label htmlFor="content" className="block mb-2">Add a new note</label>
                  <textarea
                    id="content"
                    name="content"
                    rows={3}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={addNoteMutation.isLoading}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
                >
                  {addNoteMutation.isLoading ? "Adding..." : "Add Note"}
                </button>
              </form>
              
              {notesQuery.isLoading ? (
                <div className="text-center py-4">Loading notes...</div>
              ) : notesQuery.error ? (
                <div className="text-center text-red-500 py-4">
                  Error loading notes: {notesQuery.error.message}
                </div>
              ) : notesQuery.data?.length === 0 ? (
                <div className="text-center py-4">No notes yet</div>
              ) : (
                <div className="space-y-4">
                  {notesQuery.data?.map((note) => (
                    <div key={note.id} className="bg-white p-4 rounded shadow-sm">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-semibold">{note.user?.name}</span>
                        <span className="text-sm text-gray-600">{note.createdAt.toLocaleString()}</span>
                      </div>
                      <p className="whitespace-pre-wrap">{note.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      ) : null}
      
      {/* Promote to Admin Modal */}
      {showPromoteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-semibold mb-4">Promote Member to Admin</h2>
            
            <div className="mb-4">
              <label htmlFor="userId" className="block mb-2">Select Member</label>
              <select
                id="userId"
                value={selectedUserId ?? ""}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="">Select a member</option>
                {membersQuery.data
                  ?.filter(member => !member.isAdmin)
                  .map(member => (
                    <option key={member.id} value={member.id}>
                      {member.name} ({member.email})
                    </option>
                  ))}
              </select>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowPromoteModal(false);
                  setSelectedUserId(null);
                }}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePromoteToAdmin}
                disabled={!selectedUserId || promoteToAdminMutation.isLoading}
                className="px-4 py-2 bg-green-600 text-white rounded disabled:bg-gray-400"
              >
                {promoteToAdminMutation.isLoading ? "Promoting..." : "Promote to Admin"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}