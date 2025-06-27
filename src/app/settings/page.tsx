"use client";

import { useState } from "react";
import { z } from "zod";
import { api } from "~/trpc/react";

// Form validation schema
const settingsSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  notifyApplications: z.boolean(),
  notifyEvents: z.boolean(),
  notifyMessages: z.boolean(),
});

type SettingsForm = z.infer<typeof settingsSchema>;

export default function Settings() {
  // Mock user data - this would normally come from an API call
  const userData = {
    id: "user1",
    name: "John Smith",
    email: "john@example.com",
    notifyApplications: true,
    notifyEvents: true,
    notifyMessages: true,
  };

  const [formData, setFormData] = useState<SettingsForm>({
    name: userData.name,
    email: userData.email,
    notifyApplications: userData.notifyApplications,
    notifyEvents: userData.notifyEvents,
    notifyMessages: userData.notifyMessages,
  });
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showTransferConfirm, setShowTransferConfirm] = useState(false);
  const [transferReason, setTransferReason] = useState("");
  
  // This would be a mutation to update the user's profile
  const updateProfileMutation = {
    mutate: (data: SettingsForm) => {
      console.log("Updating profile:", data);
    },
    isLoading: false,
    isSuccess: false,
    isError: false,
    error: null,
  };
  
  // This would be a mutation to delete the user's account
  const deleteAccountMutation = {
    mutate: () => {
      console.log("Deleting account");
      setShowDeleteConfirm(false);
    },
    isLoading: false,
  };
  
  // This would be a mutation to request a transfer
  const requestTransferMutation = {
    mutate: (reason: string) => {
      console.log("Requesting transfer:", reason);
      setShowTransferConfirm(false);
      setTransferReason("");
    },
    isLoading: false,
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(formData);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleDeleteAccount = () => {
    deleteAccountMutation.mutate();
  };

  const handleRequestTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (transferReason.trim()) {
      requestTransferMutation.mutate(transferReason);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Account Settings</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="bg-white p-6 rounded shadow-sm mb-6">
            <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="name" className="block mb-2">Display Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="email" className="block mb-2">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              
              <button
                type="submit"
                disabled={updateProfileMutation.isLoading}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
              >
                {updateProfileMutation.isLoading ? "Saving..." : "Save Changes"}
              </button>
              
              {updateProfileMutation.isSuccess && (
                <p className="text-green-600 mt-2">Settings saved successfully!</p>
              )}
              
              {updateProfileMutation.isError && (
                <p className="text-red-600 mt-2">
                  Error saving settings: {updateProfileMutation.error?.toString()}
                </p>
              )}
            </form>
          </div>
          
          <div className="bg-white p-6 rounded shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Notification Settings</h2>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="notifyApplications"
                  name="notifyApplications"
                  checked={formData.notifyApplications}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <label htmlFor="notifyApplications">
                  Application status updates
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="notifyEvents"
                  name="notifyEvents"
                  checked={formData.notifyEvents}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <label htmlFor="notifyEvents">
                  Event invitations and reminders
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="notifyMessages"
                  name="notifyMessages"
                  checked={formData.notifyMessages}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <label htmlFor="notifyMessages">
                  New messages from admins
                </label>
              </div>
            </div>
          </div>
        </div>
        
        <div>
          <div className="bg-white p-6 rounded shadow-sm mb-6">
            <h2 className="text-xl font-semibold mb-4 text-red-600">Danger Zone</h2>
            
            <div className="space-y-4">
              <div>
                <button
                  onClick={() => setShowTransferConfirm(true)}
                  className="w-full border border-yellow-500 text-yellow-700 px-4 py-2 rounded hover:bg-yellow-50"
                >
                  Request Association Transfer
                </button>
                <p className="text-sm text-gray-600 mt-1">
                  Request to leave your current association and join another.
                </p>
              </div>
              
              <div>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full border border-red-500 text-red-700 px-4 py-2 rounded hover:bg-red-50"
                >
                  Delete Account
                </button>
                <p className="text-sm text-gray-600 mt-1">
                  Permanently delete your account and all associated data.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Delete Account Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-semibold mb-4 text-red-600">Delete Account</h2>
            <p className="mb-4">
              Are you sure you want to delete your account? This action cannot be undone,
              and all your data will be permanently removed.
            </p>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteAccountMutation.isLoading}
                className="px-4 py-2 bg-red-600 text-white rounded disabled:bg-gray-400"
              >
                {deleteAccountMutation.isLoading ? "Deleting..." : "Delete Account"}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Transfer Request Modal */}
      {showTransferConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-semibold mb-4">Request Association Transfer</h2>
            <p className="mb-4">
              Please provide a reason for your transfer request. This will be reviewed by the admins.
            </p>
            
            <form onSubmit={handleRequestTransfer}>
              <textarea
                value={transferReason}
                onChange={(e) => setTransferReason(e.target.value)}
                className="w-full p-2 border rounded mb-4"
                rows={4}
                placeholder="Reason for transfer request..."
                required
              />
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowTransferConfirm(false)}
                  className="px-4 py-2 border rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={requestTransferMutation.isLoading || !transferReason.trim()}
                  className="px-4 py-2 bg-yellow-600 text-white rounded disabled:bg-gray-400"
                >
                  {requestTransferMutation.isLoading ? "Submitting..." : "Submit Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}