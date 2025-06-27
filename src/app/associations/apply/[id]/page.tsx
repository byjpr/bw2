"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";

export default function ApplyToAssociation({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [motivation, setMotivation] = useState("");
  
  // This would be a query to fetch association details
  const associationQuery = api.association.getById.useQuery({ id: params.id });
  
  // This would be a mutation to submit an application to join the association
  const applyMutation = api.association.applyToJoin.useMutation({
    onSuccess: () => {
      router.push("/applications");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyMutation.mutate({
      associationId: params.id,
      motivation,
    });
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Apply to Association</h1>
      
      {associationQuery.isLoading ? (
        <div className="text-center">Loading association details...</div>
      ) : associationQuery.error ? (
        <div className="text-center text-red-500">
          Error loading association: {associationQuery.error.message}
        </div>
      ) : associationQuery.data ? (
        <div className="max-w-md mx-auto">
          <div className="mb-6 bg-gray-100 p-4 rounded">
            <h2 className="text-xl font-semibold mb-2">Association Overview</h2>
            <p className="mb-2">Location: {associationQuery.data.location}</p>
            <p>Members: {associationQuery.data.population} / {associationQuery.data.maxPopulation}</p>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="motivation" className="block mb-2">Why do you want to join this association? (Optional)</label>
              <textarea
                id="motivation"
                value={motivation}
                onChange={(e) => setMotivation(e.target.value)}
                className="w-full p-2 border rounded"
                rows={4}
              />
            </div>
            
            <button
              type="submit"
              disabled={applyMutation.isLoading}
              className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
            >
              {applyMutation.isLoading ? "Submitting..." : "Submit Application"}
            </button>
          </form>
          
          <div className="mt-6 text-center text-sm text-gray-600">
            <p>Your application will be reviewed by the association admins.</p>
            <p>You will be notified when there is an update to your application status.</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}