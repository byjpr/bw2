"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";

export default function WeaverStatus() {
  const router = useRouter();
  
  // This would be a query to fetch the weaver's application status
  const statusQuery = api.weaver.getApplicationStatus.useQuery();

  useEffect(() => {
    // If application is approved, redirect to associations discovery
    if (statusQuery.data?.status === "APPROVED") {
      router.push("/associations/discover");
    }
  }, [statusQuery.data, router]);

  const getStatusStepCompleted = (step: string) => {
    if (!statusQuery.data) return false;
    
    const statusOrder = ["NEW", "UNDER_REVIEW", "APPROVED"];
    const currentIndex = statusOrder.indexOf(statusQuery.data.status);
    const stepIndex = statusOrder.indexOf(step);
    
    return currentIndex >= stepIndex;
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Application Status</h1>
      
      {statusQuery.isLoading ? (
        <div className="text-center">Loading your application status...</div>
      ) : statusQuery.error ? (
        <div className="text-center text-red-500">
          Error loading status: {statusQuery.error.message}
        </div>
      ) : (
        <div className="max-w-md mx-auto">
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                getStatusStepCompleted("NEW") ? "bg-green-500 text-white" : "bg-gray-200"
              }`}>
                1
              </div>
              <div>
                <h3 className="font-semibold">Application Submitted</h3>
                <p className="text-sm text-gray-600">
                  {getStatusStepCompleted("NEW") 
                    ? `Submitted on ${statusQuery.data.createdAt?.toLocaleDateString()}`
                    : "Not yet submitted"}
                </p>
              </div>
            </div>
            
            <div className="flex items-center mb-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                getStatusStepCompleted("UNDER_REVIEW") ? "bg-green-500 text-white" : "bg-gray-200"
              }`}>
                2
              </div>
              <div>
                <h3 className="font-semibold">Under Review</h3>
                <p className="text-sm text-gray-600">
                  {getStatusStepCompleted("UNDER_REVIEW") 
                    ? "Your application is being reviewed by our team"
                    : "Waiting for review"}
                </p>
              </div>
            </div>
            
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                getStatusStepCompleted("APPROVED") ? "bg-green-500 text-white" : "bg-gray-200"
              }`}>
                3
              </div>
              <div>
                <h3 className="font-semibold">Approved</h3>
                <p className="text-sm text-gray-600">
                  {getStatusStepCompleted("APPROVED") 
                    ? "Congratulations! Your application has been approved."
                    : "Waiting for approval"}
                </p>
              </div>
            </div>
          </div>
          
          {statusQuery.data && (
            <div className="bg-gray-100 p-4 rounded">
              <h3 className="font-semibold mb-2">Current Status</h3>
              <p>{
                statusQuery.data.status === "NEW" ? "Your application has been received and is in queue for review." :
                statusQuery.data.status === "UNDER_REVIEW" ? "Your application is currently being reviewed by our team. This process typically takes 1-3 business days." :
                statusQuery.data.status === "APPROVED" ? "Your application has been approved! You can now discover and join associations." :
                "Status unknown"
              }</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}