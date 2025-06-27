"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "~/trpc/react";

type TimeRange = "week" | "month" | "quarter" | "year";

export default function AssociationInsights({ params }: { params: { id: string } }) {
  const [timeRange, setTimeRange] = useState<TimeRange>("month");
  
  // This would be a query to fetch association details
  const associationQuery = api.association.getById.useQuery({ id: params.id });
  
  // This would be a query to fetch insights data for the association
  const insightsQuery = api.association.getInsights.useQuery({ 
    associationId: params.id,
    timeRange,
  });
  
  // This would be a query to fetch feedback and issues for the association
  const feedbackQuery = api.association.getFeedback.useQuery({ 
    associationId: params.id,
    limit: 10,
  });

  // Check if the current user is an admin of this association
  const isAdminQuery = api.association.isUserAssociationAdmin.useQuery({ associationId: params.id });
  const isPlatformAdminQuery = api.user.isPlatformAdmin.useQuery();
  
  const hasAdminAccess = isAdminQuery.data || isPlatformAdminQuery.data;

  if (isAdminQuery.isLoading || isPlatformAdminQuery.isLoading || associationQuery.isLoading) {
    return <div className="container mx-auto py-8 text-center">Loading...</div>;
  }

  if (!hasAdminAccess) {
    return (
      <div className="container mx-auto py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Unauthorized</h1>
        <p>You do not have permission to view insights for this association.</p>
        <Link href="/association" className="text-blue-600 hover:underline">
          Return to Association Home
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Link href={`/admin/association/${params.id}`} className="text-blue-600 hover:underline">
          ← Back to Association Admin
        </Link>
      </div>
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Association Insights</h1>
        <div className="flex border rounded overflow-hidden">
          <button
            onClick={() => setTimeRange("week")}
            className={`px-3 py-1 ${timeRange === "week" ? "bg-blue-500 text-white" : "bg-white"}`}
          >
            Week
          </button>
          <button
            onClick={() => setTimeRange("month")}
            className={`px-3 py-1 ${timeRange === "month" ? "bg-blue-500 text-white" : "bg-white"}`}
          >
            Month
          </button>
          <button
            onClick={() => setTimeRange("quarter")}
            className={`px-3 py-1 ${timeRange === "quarter" ? "bg-blue-500 text-white" : "bg-white"}`}
          >
            Quarter
          </button>
          <button
            onClick={() => setTimeRange("year")}
            className={`px-3 py-1 ${timeRange === "year" ? "bg-blue-500 text-white" : "bg-white"}`}
          >
            Year
          </button>
        </div>
      </div>
      
      {associationQuery.isLoading ? (
        <div className="text-center">Loading association details...</div>
      ) : associationQuery.error ? (
        <div className="text-center text-red-500">
          Error loading association: {associationQuery.error.message}
        </div>
      ) : associationQuery.data ? (
        <div className="bg-white p-6 rounded shadow-sm mb-6">
          <h2 className="text-xl font-semibold mb-4">Association Overview</h2>
          <p className="mb-2">Location: {associationQuery.data.location}</p>
          <p>Members: {associationQuery.data.population} / {associationQuery.data.maxPopulation}</p>
        </div>
      ) : null}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded shadow-sm">
          <h3 className="text-lg font-semibold mb-2">Applications</h3>
          <div className="text-3xl font-bold mb-1">
            {insightsQuery.data?.applications.total || 0}
          </div>
          <p className="text-sm text-gray-600">
            <span className={
              (insightsQuery.data?.applications.trend || 0) > 0 ? "text-green-500" : 
              (insightsQuery.data?.applications.trend || 0) < 0 ? "text-red-500" : ""
            }>
              {(insightsQuery.data?.applications.trend || 0) > 0 ? "↑" : 
               (insightsQuery.data?.applications.trend || 0) < 0 ? "↓" : "–"}
              {' '}
              {Math.abs(insightsQuery.data?.applications.trend || 0)}%
            </span>
            {' '}vs previous {timeRange}
          </p>
        </div>
        
        <div className="bg-white p-6 rounded shadow-sm">
          <h3 className="text-lg font-semibold mb-2">New Members</h3>
          <div className="text-3xl font-bold mb-1">
            {insightsQuery.data?.newMembers.total || 0}
          </div>
          <p className="text-sm text-gray-600">
            <span className={
              (insightsQuery.data?.newMembers.trend || 0) > 0 ? "text-green-500" : 
              (insightsQuery.data?.newMembers.trend || 0) < 0 ? "text-red-500" : ""
            }>
              {(insightsQuery.data?.newMembers.trend || 0) > 0 ? "↑" : 
               (insightsQuery.data?.newMembers.trend || 0) < 0 ? "↓" : "–"}
              {' '}
              {Math.abs(insightsQuery.data?.newMembers.trend || 0)}%
            </span>
            {' '}vs previous {timeRange}
          </p>
        </div>
        
        <div className="bg-white p-6 rounded shadow-sm">
          <h3 className="text-lg font-semibold mb-2">Events Held</h3>
          <div className="text-3xl font-bold mb-1">
            {insightsQuery.data?.events.total || 0}
          </div>
          <p className="text-sm text-gray-600">
            <span className={
              (insightsQuery.data?.events.trend || 0) > 0 ? "text-green-500" : 
              (insightsQuery.data?.events.trend || 0) < 0 ? "text-red-500" : ""
            }>
              {(insightsQuery.data?.events.trend || 0) > 0 ? "↑" : 
               (insightsQuery.data?.events.trend || 0) < 0 ? "↓" : "–"}
              {' '}
              {Math.abs(insightsQuery.data?.events.trend || 0)}%
            </span>
            {' '}vs previous {timeRange}
          </p>
        </div>
        
        <div className="bg-white p-6 rounded shadow-sm">
          <h3 className="text-lg font-semibold mb-2">Avg. Attendance</h3>
          <div className="text-3xl font-bold mb-1">
            {insightsQuery.data?.attendance.average || 0}%
          </div>
          <p className="text-sm text-gray-600">
            <span className={
              (insightsQuery.data?.attendance.trend || 0) > 0 ? "text-green-500" : 
              (insightsQuery.data?.attendance.trend || 0) < 0 ? "text-red-500" : ""
            }>
              {(insightsQuery.data?.attendance.trend || 0) > 0 ? "↑" : 
               (insightsQuery.data?.attendance.trend || 0) < 0 ? "↓" : "–"}
              {' '}
              {Math.abs(insightsQuery.data?.attendance.trend || 0)}%
            </span>
            {' '}vs previous {timeRange}
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-6 rounded shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Membership Retention</h2>
          
          {insightsQuery.isLoading ? (
            <div className="text-center py-4">Loading retention data...</div>
          ) : insightsQuery.error ? (
            <div className="text-center text-red-500 py-4">
              Error loading insights: {insightsQuery.error.message}
            </div>
          ) : (
            <div>
              <div className="flex items-end mb-6">
                <div className="w-1/3 text-center">
                  <div className="text-sm text-gray-600 mb-1">Joined</div>
                  <div className="bg-blue-500 mx-auto" style={{ height: "100px", width: "50px" }}></div>
                  <div className="mt-1 font-semibold">{insightsQuery.data?.retention.joined || 0}</div>
                </div>
                <div className="w-1/3 text-center">
                  <div className="text-sm text-gray-600 mb-1">Active</div>
                  <div className="bg-green-500 mx-auto" style={{ 
                    height: `${((insightsQuery.data?.retention.active || 0) / (insightsQuery.data?.retention.joined || 1)) * 100}px`, 
                    width: "50px" 
                  }}></div>
                  <div className="mt-1 font-semibold">{insightsQuery.data?.retention.active || 0}</div>
                </div>
                <div className="w-1/3 text-center">
                  <div className="text-sm text-gray-600 mb-1">Left</div>
                  <div className="bg-red-500 mx-auto" style={{ 
                    height: `${((insightsQuery.data?.retention.left || 0) / (insightsQuery.data?.retention.joined || 1)) * 100}px`, 
                    width: "50px" 
                  }}></div>
                  <div className="mt-1 font-semibold">{insightsQuery.data?.retention.left || 0}</div>
                </div>
              </div>
              
              <div className="text-center text-sm text-gray-600">
                Retention Rate: <span className="font-semibold">
                  {insightsQuery.data?.retention.rate || 0}%
                </span>
              </div>
            </div>
          )}
        </div>
        
        <div className="bg-white p-6 rounded shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Event Participation</h2>
          
          {insightsQuery.isLoading ? (
            <div className="text-center py-4">Loading participation data...</div>
          ) : insightsQuery.error ? (
            <div className="text-center text-red-500 py-4">
              Error loading insights: {insightsQuery.error.message}
            </div>
          ) : (
            <div>
              <div className="grid grid-cols-7 gap-1 mb-2">
                {Array.from({ length: 35 }).map((_, i) => {
                  // Mock data - in a real implementation, this would come from the API
                  const intensity = Math.floor(Math.random() * 5); // 0-4
                  
                  return (
                    <div 
                      key={i}
                      className={`aspect-square rounded ${
                        intensity === 0 ? "bg-gray-100" :
                        intensity === 1 ? "bg-green-100" :
                        intensity === 2 ? "bg-green-200" :
                        intensity === 3 ? "bg-green-300" :
                        "bg-green-400"
                      }`}
                      title={`${intensity} attendees`}
                    ></div>
                  );
                })}
              </div>
              
              <div className="flex justify-between text-xs text-gray-600 mb-6">
                <div>Less</div>
                <div className="flex gap-1">
                  <div className="w-3 h-3 bg-gray-100"></div>
                  <div className="w-3 h-3 bg-green-100"></div>
                  <div className="w-3 h-3 bg-green-200"></div>
                  <div className="w-3 h-3 bg-green-300"></div>
                  <div className="w-3 h-3 bg-green-400"></div>
                </div>
                <div>More</div>
              </div>
              
              <div>
                <div className="mb-2 flex justify-between">
                  <span>Average RSVPs per event:</span>
                  <span className="font-semibold">{insightsQuery.data?.events.avgRsvps || 0}</span>
                </div>
                <div className="mb-2 flex justify-between">
                  <span>Average attendance rate:</span>
                  <span className="font-semibold">{insightsQuery.data?.events.avgAttendance || 0}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Most popular event day:</span>
                  <span className="font-semibold">{insightsQuery.data?.events.popularDay || "N/A"}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-white p-6 rounded shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Feedback & Issues</h2>
        
        {feedbackQuery.isLoading ? (
          <div className="text-center py-4">Loading feedback...</div>
        ) : feedbackQuery.error ? (
          <div className="text-center text-red-500 py-4">
            Error loading feedback: {feedbackQuery.error.message}
          </div>
        ) : feedbackQuery.data?.length === 0 ? (
          <div className="text-center py-4">No feedback or issues reported</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-2 px-4 text-left">Date</th>
                  <th className="py-2 px-4 text-left">Member</th>
                  <th className="py-2 px-4 text-left">Type</th>
                  <th className="py-2 px-4 text-left">Content</th>
                  <th className="py-2 px-4 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {feedbackQuery.data?.map((item) => (
                  <tr key={item.id} className="border-b">
                    <td className="py-2 px-4">{new Date(item.createdAt).toLocaleDateString()}</td>
                    <td className="py-2 px-4">{item.user.name}</td>
                    <td className="py-2 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        item.type === "ISSUE" ? "bg-red-100 text-red-800" :
                        item.type === "FEEDBACK" ? "bg-blue-100 text-blue-800" :
                        item.type === "SUGGESTION" ? "bg-green-100 text-green-800" :
                        "bg-gray-100 text-gray-800"
                      }`}>
                        {item.type}
                      </span>
                    </td>
                    <td className="py-2 px-4">{item.content}</td>
                    <td className="py-2 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        item.status === "NEW" ? "bg-yellow-100 text-yellow-800" :
                        item.status === "IN_PROGRESS" ? "bg-blue-100 text-blue-800" :
                        item.status === "RESOLVED" ? "bg-green-100 text-green-800" :
                        "bg-gray-100 text-gray-800"
                      }`}>
                        {item.status.replace("_", " ")}
                      </span>
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