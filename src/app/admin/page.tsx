"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "~/trpc/react";

type FilterStatus = "all" | "new" | "under_review" | "approved" | "rejected";
type SortField = "date" | "location" | "score";
type SortOrder = "asc" | "desc";

export default function PlatformAdminDashboard() {
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [locationFilter, setLocationFilter] = useState("");
  
  // This would be a query to check if the user is a platform admin
  const isPlatformAdminQuery = api.user.isPlatformAdmin.useQuery();
  
  // This would be a query to fetch pending Weaver applications
  const applicationsQuery = api.admin.getWeaverApplications.useQuery({
    status: filterStatus === "all" ? undefined : filterStatus,
    sortField,
    sortOrder,
    location: locationFilter || undefined,
  });
  
  // This would be a query to fetch platform metrics
  const metricsQuery = api.admin.getPlatformMetrics.useQuery();
  
  // This would be a mutation to approve a Weaver application
  const approveApplicationMutation = api.admin.approveWeaverApplication.useMutation({
    onSuccess: () => {
      void applicationsQuery.refetch();
      void metricsQuery.refetch();
    },
  });
  
  // This would be a mutation to reject a Weaver application
  const rejectApplicationMutation = api.admin.rejectWeaverApplication.useMutation({
    onSuccess: () => {
      void applicationsQuery.refetch();
      void metricsQuery.refetch();
    },
  });
  
  // This would be a mutation to flag a Weaver application for further review
  const flagApplicationMutation = api.admin.flagWeaverApplication.useMutation({
    onSuccess: () => {
      void applicationsQuery.refetch();
    },
  });

  const handleApprove = (id: string) => {
    if (window.confirm("Are you sure you want to approve this application?")) {
      approveApplicationMutation.mutate({ id });
    }
  };

  const handleReject = (id: string) => {
    if (window.confirm("Are you sure you want to reject this application?")) {
      rejectApplicationMutation.mutate({ id });
    }
  };

  const handleFlag = (id: string) => {
    flagApplicationMutation.mutate({ id });
  };

  const handleSortChange = (field: SortField) => {
    if (sortField === field) {
      // Toggle sort order if clicking the same field
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      // Set new field and default to descending order
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // The query will automatically refetch when the state variables change
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Platform Admin Dashboard</h1>
        <div className="flex space-x-4">
          <Link 
            href="/admin/associations"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Manage Associations
          </Link>
          <Link 
            href="/admin/moderation"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Moderation Queue
          </Link>
          <Link 
            href="/admin/insights"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Platform Insights
          </Link>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded shadow-sm">
          <h3 className="text-lg font-semibold mb-2">Total Users</h3>
          <div className="text-3xl font-bold mb-1">
            {metricsQuery.data?.totalUsers || 0}
          </div>
          <p className="text-sm text-gray-600">
            <span className={
              (metricsQuery.data?.usersTrend || 0) > 0 ? "text-green-500" : 
              (metricsQuery.data?.usersTrend || 0) < 0 ? "text-red-500" : ""
            }>
              {(metricsQuery.data?.usersTrend || 0) > 0 ? "↑" : 
               (metricsQuery.data?.usersTrend || 0) < 0 ? "↓" : "–"}
              {' '}
              {Math.abs(metricsQuery.data?.usersTrend || 0)}%
            </span>
            {' '}vs previous week
          </p>
        </div>
        
        <div className="bg-white p-6 rounded shadow-sm">
          <h3 className="text-lg font-semibold mb-2">Applications</h3>
          <div className="text-3xl font-bold mb-1">
            {metricsQuery.data?.pendingApplications || 0}
          </div>
          <p className="text-sm text-gray-600">
            Pending review
          </p>
        </div>
        
        <div className="bg-white p-6 rounded shadow-sm">
          <h3 className="text-lg font-semibold mb-2">Associations</h3>
          <div className="text-3xl font-bold mb-1">
            {metricsQuery.data?.totalAssociations || 0}
          </div>
          <p className="text-sm text-gray-600">
            Across {metricsQuery.data?.totalLocations || 0} locations
          </p>
        </div>
        
        <div className="bg-white p-6 rounded shadow-sm">
          <h3 className="text-lg font-semibold mb-2">Events</h3>
          <div className="text-3xl font-bold mb-1">
            {metricsQuery.data?.eventsThisWeek || 0}
          </div>
          <p className="text-sm text-gray-600">
            Scheduled this week
          </p>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded shadow-sm mb-6">
        <h2 className="text-xl font-semibold mb-4">Weaver Applications</h2>
        
        <form onSubmit={handleFilterSubmit} className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="status" className="block mb-2">Status</label>
              <select
                id="status"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
                className="w-full p-2 border rounded"
              >
                <option value="all">All Statuses</option>
                <option value="new">New</option>
                <option value="under_review">Under Review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="location" className="block mb-2">Location</label>
              <input
                type="text"
                id="location"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                placeholder="Filter by location"
                className="w-full p-2 border rounded"
              />
            </div>
            
            <div className="flex items-end">
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </form>
        
        {applicationsQuery.isLoading ? (
          <div className="text-center py-4">Loading applications...</div>
        ) : applicationsQuery.error ? (
          <div className="text-center text-red-500 py-4">
            Error loading applications: {applicationsQuery.error.message}
          </div>
        ) : applicationsQuery.data?.length === 0 ? (
          <div className="text-center py-4">No applications found matching the criteria</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-2 px-4 text-left">User</th>
                  <th 
                    className="py-2 px-4 text-left cursor-pointer"
                    onClick={() => handleSortChange("location")}
                  >
                    Location
                    {sortField === "location" && (
                      <span className="ml-1">
                        {sortOrder === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </th>
                  <th className="py-2 px-4 text-left">Status</th>
                  <th 
                    className="py-2 px-4 text-left cursor-pointer"
                    onClick={() => handleSortChange("score")}
                  >
                    Score
                    {sortField === "score" && (
                      <span className="ml-1">
                        {sortOrder === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </th>
                  <th 
                    className="py-2 px-4 text-left cursor-pointer"
                    onClick={() => handleSortChange("date")}
                  >
                    Applied
                    {sortField === "date" && (
                      <span className="ml-1">
                        {sortOrder === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </th>
                  <th className="py-2 px-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {applicationsQuery.data?.map((application) => (
                  <tr key={application.id} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-4">
                      <Link 
                        href={`/admin/weavers/${application.id}`}
                        className="text-blue-600 hover:underline font-medium"
                      >
                        {application.user.name}
                      </Link>
                      <div className="text-sm text-gray-600">{application.user.email}</div>
                    </td>
                    <td className="py-2 px-4">{application.location}</td>
                    <td className="py-2 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        application.status === "NEW" ? "bg-blue-100 text-blue-800" :
                        application.status === "UNDER_REVIEW" ? "bg-yellow-100 text-yellow-800" :
                        application.status === "APPROVED" ? "bg-green-100 text-green-800" :
                        application.status === "REJECTED" ? "bg-red-100 text-red-800" :
                        "bg-gray-100 text-gray-800"
                      }`}>
                        {application.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-2 px-4">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center 
                        ${application.score >= 8 ? "bg-green-500 text-white" :
                          application.score >= 5 ? "bg-yellow-500 text-white" :
                          "bg-red-500 text-white"}">
                        {application.score}
                      </div>
                    </td>
                    <td className="py-2 px-4">
                      {new Date(application.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-2 px-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleApprove(application.id)}
                          disabled={application.status === "APPROVED"}
                          className="text-green-600 hover:text-green-800 disabled:text-gray-400"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(application.id)}
                          disabled={application.status === "REJECTED"}
                          className="text-red-600 hover:text-red-800 disabled:text-gray-400"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => handleFlag(application.id)}
                          className="text-yellow-600 hover:text-yellow-800"
                        >
                          Flag
                        </button>
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