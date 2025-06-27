"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "~/trpc/react";

export default function WeaverApplicationDetail({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [adminNotes, setAdminNotes] = useState("");
  
  // This would be a query to check if the user is a platform admin
  const isPlatformAdminQuery = api.user.isPlatformAdmin.useQuery();
  
  // This would be a query to fetch Weaver application details
  const applicationQuery = api.admin.getWeaverApplicationDetail.useQuery({ id: params.id });
  
  // This would be a mutation to approve a Weaver application
  const approveApplicationMutation = api.admin.approveWeaverApplication.useMutation({
    onSuccess: () => {
      router.push("/admin");
    },
  });
  
  // This would be a mutation to reject a Weaver application
  const rejectApplicationMutation = api.admin.rejectWeaverApplication.useMutation({
    onSuccess: () => {
      router.push("/admin");
    },
  });
  
  // This would be a mutation to blacklist a user
  const blacklistUserMutation = api.admin.blacklistUser.useMutation({
    onSuccess: () => {
      router.push("/admin");
    },
  });
  
  // This would be a mutation to add admin notes to an application
  const addNotesMutation = api.admin.addApplicationNotes.useMutation({
    onSuccess: () => {
      void applicationQuery.refetch();
      setAdminNotes("");
    },
  });

  const handleApprove = () => {
    if (window.confirm("Are you sure you want to approve this application?")) {
      approveApplicationMutation.mutate({ id: params.id });
    }
  };

  const handleReject = () => {
    if (window.confirm("Are you sure you want to reject this application?")) {
      rejectApplicationMutation.mutate({ id: params.id });
    }
  };

  const handleBlacklist = () => {
    if (window.confirm("Are you sure you want to blacklist this user? This action cannot be undone.")) {
      blacklistUserMutation.mutate({ userId: applicationQuery.data?.user.id ?? "" });
    }
  };

  const handleAddNotes = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminNotes.trim()) {
      addNotesMutation.mutate({
        id: params.id,
        notes: adminNotes,
      });
    }
  };

  if (isPlatformAdminQuery.isLoading || applicationQuery.isLoading) {
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

  if (applicationQuery.error) {
    return (
      <div className="container mx-auto py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Error</h1>
        <p>Failed to load application details: {applicationQuery.error.message}</p>
        <Link href="/admin" className="text-blue-600 hover:underline">
          Return to Admin Dashboard
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
        <h1 className="text-2xl font-bold">Weaver Application Details</h1>
        <div className={`px-3 py-1 rounded-full text-sm ${
          applicationQuery.data?.status === "NEW" ? "bg-blue-100 text-blue-800" :
          applicationQuery.data?.status === "UNDER_REVIEW" ? "bg-yellow-100 text-yellow-800" :
          applicationQuery.data?.status === "APPROVED" ? "bg-green-100 text-green-800" :
          applicationQuery.data?.status === "REJECTED" ? "bg-red-100 text-red-800" :
          "bg-gray-100 text-gray-800"
        }`}>
          {applicationQuery.data?.status.replace("_", " ")}
        </div>
      </div>
      
      {applicationQuery.data && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white p-6 rounded shadow-sm mb-6">
              <h2 className="text-xl font-semibold mb-4">User Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600 mb-1">Name</p>
                  <p className="font-semibold">{applicationQuery.data.user.name}</p>
                </div>
                <div>
                  <p className="text-gray-600 mb-1">Email</p>
                  <p className="font-semibold">{applicationQuery.data.user.email}</p>
                </div>
                <div>
                  <p className="text-gray-600 mb-1">Applied On</p>
                  <p className="font-semibold">
                    {new Date(applicationQuery.data.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 mb-1">Location</p>
                  <p className="font-semibold">{applicationQuery.data.location}</p>
                </div>
                <div>
                  <p className="text-gray-600 mb-1">Twitter Handle</p>
                  <p className="font-semibold">{applicationQuery.data.twitterHandle || "Not provided"}</p>
                </div>
                <div>
                  <p className="text-gray-600 mb-1">Discord Username</p>
                  <p className="font-semibold">{applicationQuery.data.discordUsername || "Not provided"}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded shadow-sm mb-6">
              <h2 className="text-xl font-semibold mb-4">Application Responses</h2>
              
              {applicationQuery.data.answers.length === 0 ? (
                <p>No responses provided</p>
              ) : (
                <div className="space-y-6">
                  {applicationQuery.data.answers.map((answer) => (
                    <div key={answer.questionId}>
                      <p className="text-gray-600 mb-1">{answer.question}</p>
                      <p className="bg-gray-50 p-3 rounded">{answer.answer}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="bg-white p-6 rounded shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Admin Notes</h2>
              
              <div className="mb-6">
                {applicationQuery.data.adminNotes.length === 0 ? (
                  <p className="text-gray-600">No admin notes yet</p>
                ) : (
                  <div className="space-y-4">
                    {applicationQuery.data.adminNotes.map((note) => (
                      <div key={note.id} className="bg-gray-50 p-3 rounded">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-semibold">{note.admin.name}</span>
                          <span className="text-sm text-gray-600">{new Date(note.createdAt).toLocaleString()}</span>
                        </div>
                        <p>{note.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <form onSubmit={handleAddNotes}>
                <div className="mb-4">
                  <label htmlFor="adminNotes" className="block mb-2">Add Notes</label>
                  <textarea
                    id="adminNotes"
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    className="w-full p-2 border rounded"
                    rows={3}
                    required
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={addNotesMutation.isLoading || !adminNotes.trim()}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
                >
                  {addNotesMutation.isLoading ? "Adding..." : "Add Note"}
                </button>
              </form>
            </div>
          </div>
          
          <div>
            <div className="bg-white p-6 rounded shadow-sm mb-6">
              <h2 className="text-xl font-semibold mb-4">Application Score</h2>
              
              <div className="flex justify-center mb-6">
                <div className={`w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold ${
                  applicationQuery.data.score >= 8 ? "bg-green-500 text-white" :
                  applicationQuery.data.score >= 5 ? "bg-yellow-500 text-white" :
                  "bg-red-500 text-white"
                }`}>
                  {applicationQuery.data.score}/10
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Location Proximity</span>
                  <span className="font-semibold">{applicationQuery.data.scoreFactors.locationScore}/10</span>
                </div>
                <div className="flex justify-between">
                  <span>Application Quality</span>
                  <span className="font-semibold">{applicationQuery.data.scoreFactors.answerScore}/10</span>
                </div>
                <div className="flex justify-between">
                  <span>Social Verification</span>
                  <span className="font-semibold">{applicationQuery.data.scoreFactors.socialScore}/10</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded shadow-sm mb-6">
              <h2 className="text-xl font-semibold mb-4">Suggested Association</h2>
              
              {applicationQuery.data.suggestedAssociation ? (
                <div>
                  <p className="mb-2">Based on location and availability:</p>
                  <div className="bg-gray-50 p-3 rounded mb-4">
                    <p className="font-semibold">{applicationQuery.data.suggestedAssociation.name || "Unnamed Association"}</p>
                    <p className="text-sm text-gray-600 mb-1">
                      Location: {applicationQuery.data.suggestedAssociation.location}
                    </p>
                    <p className="text-sm text-gray-600">
                      Members: {applicationQuery.data.suggestedAssociation.population} / 
                      {applicationQuery.data.suggestedAssociation.maxPopulation}
                    </p>
                  </div>
                  
                  <Link 
                    href={`/admin/associations/${applicationQuery.data.suggestedAssociation.id}`}
                    className="text-blue-600 hover:underline text-sm"
                  >
                    View Association Details
                  </Link>
                </div>
              ) : (
                <p>No association suggestions available</p>
              )}
            </div>
            
            <div className="space-y-3">
              <button
                onClick={handleApprove}
                disabled={
                  applicationQuery.data.status === "APPROVED" || 
                  approveApplicationMutation.isLoading
                }
                className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600 disabled:bg-gray-400"
              >
                {approveApplicationMutation.isLoading ? "Approving..." : "Approve Application"}
              </button>
              
              <button
                onClick={handleReject}
                disabled={
                  applicationQuery.data.status === "REJECTED" || 
                  rejectApplicationMutation.isLoading
                }
                className="w-full bg-red-500 text-white py-2 rounded hover:bg-red-600 disabled:bg-gray-400"
              >
                {rejectApplicationMutation.isLoading ? "Rejecting..." : "Reject Application"}
              </button>
              
              <button
                onClick={handleBlacklist}
                disabled={blacklistUserMutation.isLoading}
                className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 disabled:bg-gray-400"
              >
                {blacklistUserMutation.isLoading ? "Processing..." : "Blacklist User"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}