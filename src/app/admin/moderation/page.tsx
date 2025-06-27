"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "~/trpc/react";

type FilterStatus = "all" | "new" | "in_progress" | "resolved" | "dismissed";

export default function ModerationQueue() {
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  
  // This would be a query to check if the user is a platform admin
  const isPlatformAdminQuery = api.user.isPlatformAdmin.useQuery();
  
  // This would be a query to fetch moderation items
  const moderationQuery = api.admin.getModerationItems.useQuery({
    status: filterStatus === "all" ? undefined : filterStatus,
  });
  
  // This would be a mutation to update the status of a moderation item
  const updateStatusMutation = api.admin.updateModerationStatus.useMutation({
    onSuccess: () => {
      void moderationQuery.refetch();
    },
  });

  const handleUpdateStatus = (id: string, status: string) => {
    updateStatusMutation.mutate({ id, status });
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
      
      <h1 className="text-2xl font-bold mb-6">Moderation Queue</h1>
      
      <div className="bg-white p-6 rounded shadow-sm mb-6">
        <div className="flex border-b mb-6">
          <button
            onClick={() => setFilterStatus("all")}
            className={`px-4 py-2 ${filterStatus === "all" ? "border-b-2 border-blue-500 font-semibold" : ""}`}
          >
            All
          </button>
          <button
            onClick={() => setFilterStatus("new")}
            className={`px-4 py-2 ${filterStatus === "new" ? "border-b-2 border-blue-500 font-semibold" : ""}`}
          >
            New
          </button>
          <button
            onClick={() => setFilterStatus("in_progress")}
            className={`px-4 py-2 ${filterStatus === "in_progress" ? "border-b-2 border-blue-500 font-semibold" : ""}`}
          >
            In Progress
          </button>
          <button
            onClick={() => setFilterStatus("resolved")}
            className={`px-4 py-2 ${filterStatus === "resolved" ? "border-b-2 border-blue-500 font-semibold" : ""}`}
          >
            Resolved
          </button>
          <button
            onClick={() => setFilterStatus("dismissed")}
            className={`px-4 py-2 ${filterStatus === "dismissed" ? "border-b-2 border-blue-500 font-semibold" : ""}`}
          >
            Dismissed
          </button>
        </div>
        
        {moderationQuery.isLoading ? (
          <div className="text-center py-4">Loading moderation items...</div>
        ) : moderationQuery.error ? (
          <div className="text-center text-red-500 py-4">
            Error loading moderation items: {moderationQuery.error.message}
          </div>
        ) : moderationQuery.data?.length === 0 ? (
          <div className="text-center py-4">No moderation items found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-2 px-4 text-left">Type</th>
                  <th className="py-2 px-4 text-left">Reported</th>
                  <th className="py-2 px-4 text-left">Association</th>
                  <th className="py-2 px-4 text-left">Reporter</th>
                  <th className="py-2 px-4 text-left">Status</th>
                  <th className="py-2 px-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {moderationQuery.data?.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        item.type === "MESSAGE" ? "bg-blue-100 text-blue-800" :
                        item.type === "USER" ? "bg-purple-100 text-purple-800" :
                        item.type === "CONTENT" ? "bg-yellow-100 text-yellow-800" :
                        "bg-gray-100 text-gray-800"
                      }`}>
                        {item.type}
                      </span>
                    </td>
                    <td className="py-2 px-4">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-2 px-4">
                      {item.association ? (
                        <Link 
                          href={`/admin/associations/${item.association.id}`}
                          className="text-blue-600 hover:underline"
                        >
                          {item.association.name || "Unnamed Association"}
                        </Link>
                      ) : (
                        "Platform-wide"
                      )}
                    </td>
                    <td className="py-2 px-4">
                      {item.reporter.name}
                    </td>
                    <td className="py-2 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        item.status === "NEW" ? "bg-red-100 text-red-800" :
                        item.status === "IN_PROGRESS" ? "bg-yellow-100 text-yellow-800" :
                        item.status === "RESOLVED" ? "bg-green-100 text-green-800" :
                        item.status === "DISMISSED" ? "bg-gray-100 text-gray-800" :
                        "bg-gray-100 text-gray-800"
                      }`}>
                        {item.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-2 px-4">
                      <div className="flex space-x-2">
                        <Link 
                          href={`/admin/moderation/${item.id}`}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          View
                        </Link>
                        
                        {item.status === "NEW" && (
                          <button
                            onClick={() => handleUpdateStatus(item.id, "IN_PROGRESS")}
                            className="text-yellow-600 hover:text-yellow-800"
                          >
                            Start Review
                          </button>
                        )}
                        
                        {(item.status === "NEW" || item.status === "IN_PROGRESS") && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(item.id, "RESOLVED")}
                              className="text-green-600 hover:text-green-800"
                            >
                              Resolve
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(item.id, "DISMISSED")}
                              className="text-gray-600 hover:text-gray-800"
                            >
                              Dismiss
                            </button>
                          </>
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
    </div>
  );
}