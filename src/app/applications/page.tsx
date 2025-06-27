"use client";

import { api } from "~/trpc/react";

export default function Applications() {
  // This would be a query to fetch the user's applications
  const applicationsQuery = api.application.getUserApplications.useQuery();
  
  // This would be a mutation to withdraw an application
  const withdrawMutation = api.application.withdrawApplication.useMutation({
    onSuccess: () => {
      // Refetch applications after withdrawal
      void applicationsQuery.refetch();
    },
  });

  const handleWithdraw = (applicationId: string) => {
    if (window.confirm("Are you sure you want to withdraw this application?")) {
      withdrawMutation.mutate({ id: applicationId });
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "NEW": return "bg-blue-100 text-blue-800";
      case "UNDER_REVIEW": return "bg-yellow-100 text-yellow-800";
      case "INVITED": return "bg-purple-100 text-purple-800";
      case "APPROVED": return "bg-green-100 text-green-800";
      case "KICKED": return "bg-red-100 text-red-800";
      case "SELFIMMOLATE": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">My Applications</h1>
      
      {applicationsQuery.isLoading ? (
        <div className="text-center">Loading your applications...</div>
      ) : applicationsQuery.error ? (
        <div className="text-center text-red-500">
          Error loading applications: {applicationsQuery.error.message}
        </div>
      ) : applicationsQuery.data?.length === 0 ? (
        <div className="text-center">
          You haven't submitted any applications yet. Discover associations to apply.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-2 px-4 border-b text-left">Association</th>
                <th className="py-2 px-4 border-b text-left">Applied On</th>
                <th className="py-2 px-4 border-b text-left">Status</th>
                <th className="py-2 px-4 border-b text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {applicationsQuery.data?.map((application) => (
                <tr key={application.id}>
                  <td className="py-2 px-4 border-b">
                    Association {/* Association name would come from relation */}
                  </td>
                  <td className="py-2 px-4 border-b">
                    {application.createdAt.toLocaleDateString()}
                  </td>
                  <td className="py-2 px-4 border-b">
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeColor(application.status)}`}>
                      {application.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="py-2 px-4 border-b">
                    {(application.status === "NEW" || application.status === "UNDER_REVIEW") && (
                      <button
                        onClick={() => handleWithdraw(application.id)}
                        disabled={withdrawMutation.isLoading}
                        className="text-red-600 hover:text-red-800 disabled:text-gray-400"
                      >
                        Withdraw
                      </button>
                    )}
                    {application.status === "APPROVED" && (
                      <span className="text-green-600">Approved ✓</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}