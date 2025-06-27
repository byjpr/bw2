"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "~/trpc/react";

type TimeRange = "week" | "month" | "quarter" | "year" | "all";

export default function PlatformInsights() {
  const [timeRange, setTimeRange] = useState<TimeRange>("month");
  
  // This would be a query to check if the user is a platform admin
  const isPlatformAdminQuery = api.user.isPlatformAdmin.useQuery();
  
  // This would be a query to fetch platform insights
  const insightsQuery = api.admin.getPlatformInsights.useQuery({ 
    timeRange 
  });

  if (isPlatformAdminQuery.isLoading || insightsQuery.isLoading) {
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

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Link href="/admin" className="text-blue-600 hover:underline">
          ← Back to Admin Dashboard
        </Link>
      </div>
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Platform Insights</h1>
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
          <button
            onClick={() => setTimeRange("all")}
            className={`px-3 py-1 ${timeRange === "all" ? "bg-blue-500 text-white" : "bg-white"}`}
          >
            All Time
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded shadow-sm">
          <h3 className="text-lg font-semibold mb-2">Total Users</h3>
          <div className="text-3xl font-bold mb-1">
            {insightsQuery.data?.userStats.total.toLocaleString()}
          </div>
          <p className="text-sm text-gray-600">
            <span className={
              (insightsQuery.data?.userStats.growth || 0) > 0 ? "text-green-500" : 
              (insightsQuery.data?.userStats.growth || 0) < 0 ? "text-red-500" : ""
            }>
              {(insightsQuery.data?.userStats.growth || 0) > 0 ? "↑" : 
               (insightsQuery.data?.userStats.growth || 0) < 0 ? "↓" : "–"}
              {' '}
              {Math.abs(insightsQuery.data?.userStats.growth || 0)}%
            </span>
            {' '}vs previous {timeRange}
          </p>
        </div>
        
        <div className="bg-white p-6 rounded shadow-sm">
          <h3 className="text-lg font-semibold mb-2">Active Associations</h3>
          <div className="text-3xl font-bold mb-1">
            {insightsQuery.data?.associationStats.active.toLocaleString()}
          </div>
          <p className="text-sm text-gray-600">
            Across {insightsQuery.data?.associationStats.locations.toLocaleString()} locations
          </p>
        </div>
        
        <div className="bg-white p-6 rounded shadow-sm">
          <h3 className="text-lg font-semibold mb-2">Events Hosted</h3>
          <div className="text-3xl font-bold mb-1">
            {insightsQuery.data?.eventStats.total.toLocaleString()}
          </div>
          <p className="text-sm text-gray-600">
            <span className={
              (insightsQuery.data?.eventStats.growth || 0) > 0 ? "text-green-500" : 
              (insightsQuery.data?.eventStats.growth || 0) < 0 ? "text-red-500" : ""
            }>
              {(insightsQuery.data?.eventStats.growth || 0) > 0 ? "↑" : 
               (insightsQuery.data?.eventStats.growth || 0) < 0 ? "↓" : "–"}
              {' '}
              {Math.abs(insightsQuery.data?.eventStats.growth || 0)}%
            </span>
            {' '}vs previous {timeRange}
          </p>
        </div>
        
        <div className="bg-white p-6 rounded shadow-sm">
          <h3 className="text-lg font-semibold mb-2">Avg. Event Attendance</h3>
          <div className="text-3xl font-bold mb-1">
            {insightsQuery.data?.eventStats.avgAttendance.toLocaleString()}%
          </div>
          <p className="text-sm text-gray-600">
            <span className={
              (insightsQuery.data?.eventStats.attendanceGrowth || 0) > 0 ? "text-green-500" : 
              (insightsQuery.data?.eventStats.attendanceGrowth || 0) < 0 ? "text-red-500" : ""
            }>
              {(insightsQuery.data?.eventStats.attendanceGrowth || 0) > 0 ? "↑" : 
               (insightsQuery.data?.eventStats.attendanceGrowth || 0) < 0 ? "↓" : "–"}
              {' '}
              {Math.abs(insightsQuery.data?.eventStats.attendanceGrowth || 0)}%
            </span>
            {' '}vs previous {timeRange}
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-6 rounded shadow-sm">
          <h2 className="text-xl font-semibold mb-4">User Growth</h2>
          
          <div className="aspect-[16/9] bg-gray-100 mb-4 flex items-center justify-center">
            {/* Chart would be rendered here in a real implementation */}
            <p className="text-gray-500">User growth chart would appear here</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">New Users (This {timeRange})</p>
              <p className="text-xl font-semibold">
                {insightsQuery.data?.userStats.new.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Application Approval Rate</p>
              <p className="text-xl font-semibold">
                {insightsQuery.data?.userStats.approvalRate.toLocaleString()}%
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Active Users</p>
              <p className="text-xl font-semibold">
                {insightsQuery.data?.userStats.active.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">User Retention</p>
              <p className="text-xl font-semibold">
                {insightsQuery.data?.userStats.retention.toLocaleString()}%
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Geographic Distribution</h2>
          
          <div className="aspect-[16/9] bg-gray-100 mb-4 flex items-center justify-center">
            {/* Map would be rendered here in a real implementation */}
            <p className="text-gray-500">Geographic distribution map would appear here</p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-2">Top Locations</h3>
            
            <div className="space-y-2">
              {insightsQuery.data?.geoStats.topLocations.map((location, index) => (
                <div key={index} className="flex items-center">
                  <div className="w-1/2 flex items-center">
                    <span className="mr-2">{index + 1}.</span>
                    <span>{location.name}</span>
                  </div>
                  <div className="w-1/2 flex items-center">
                    <div className="flex-grow h-2 bg-gray-200 rounded-full mr-2">
                      <div 
                        className="h-2 bg-blue-500 rounded-full" 
                        style={{ width: `${location.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm">{location.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-6 rounded shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Applications by Time</h2>
          
          <div className="aspect-[16/9] bg-gray-100 mb-4 flex items-center justify-center">
            {/* Chart would be rendered here in a real implementation */}
            <p className="text-gray-500">Applications trend chart would appear here</p>
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Applications</p>
              <p className="text-xl font-semibold">
                {insightsQuery.data?.applicationStats.total.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Approved</p>
              <p className="text-xl font-semibold text-green-600">
                {insightsQuery.data?.applicationStats.approved.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Rejected</p>
              <p className="text-xl font-semibold text-red-600">
                {insightsQuery.data?.applicationStats.rejected.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Event Participation Heatmap</h2>
          
          <div className="aspect-[16/9] bg-gray-100 mb-4 flex items-center justify-center">
            {/* Heatmap would be rendered here in a real implementation */}
            <p className="text-gray-500">Event participation heatmap would appear here</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Most Popular Day</p>
              <p className="text-xl font-semibold">
                {insightsQuery.data?.eventStats.popularDay}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Most Popular Time</p>
              <p className="text-xl font-semibold">
                {insightsQuery.data?.eventStats.popularTime}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Average Event Size</p>
              <p className="text-xl font-semibold">
                {insightsQuery.data?.eventStats.avgSize.toLocaleString()} people
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Attendances</p>
              <p className="text-xl font-semibold">
                {insightsQuery.data?.eventStats.totalAttendances.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Associations by Performance</h2>
        
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-2 px-4 text-left">Association</th>
                <th className="py-2 px-4 text-left">Location</th>
                <th className="py-2 px-4 text-right">Members</th>
                <th className="py-2 px-4 text-right">Events</th>
                <th className="py-2 px-4 text-right">Avg. Attendance</th>
                <th className="py-2 px-4 text-right">Retention</th>
                <th className="py-2 px-4 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {insightsQuery.data?.associationStats.topPerforming.map((association, index) => (
                <tr key={index} className="border-b">
                  <td className="py-2 px-4">
                    <Link 
                      href={`/admin/associations/${association.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      {association.name || "Unnamed Association"}
                    </Link>
                  </td>
                  <td className="py-2 px-4">{association.location}</td>
                  <td className="py-2 px-4 text-right">{association.members}</td>
                  <td className="py-2 px-4 text-right">{association.events}</td>
                  <td className="py-2 px-4 text-right">{association.attendance}%</td>
                  <td className="py-2 px-4 text-right">{association.retention}%</td>
                  <td className="py-2 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      association.status === "active" ? "bg-green-100 text-green-800" :
                      association.status === "inactive" ? "bg-red-100 text-red-800" :
                      "bg-gray-100 text-gray-800"
                    }`}>
                      {association.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}