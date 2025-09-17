// Algeria Eats Hub - User Debug Component

import { useAuthStore } from '@/store/authStore';

export const UserDebug = () => {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return (
      <div className="p-4 bg-red-100 rounded-lg">
        <h3 className="font-bold text-red-800">User Debug - Not Authenticated</h3>
        <p className="text-sm text-red-600">Please log in to see user information</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-blue-100 rounded-lg">
      <h3 className="font-bold text-blue-800">User Debug Information</h3>
      <div className="text-sm space-y-1 mt-2">
        <p><strong>ID:</strong> {user?.id}</p>
        <p><strong>Name:</strong> {user?.name}</p>
        <p><strong>Phone:</strong> {user?.phone}</p>
        <p><strong>Role:</strong> {user?.role}</p>
        <p><strong>Branch ID:</strong> {user?.branchId || 'Not assigned'}</p>
        <p><strong>Status:</strong> {!user?.isBlocked ? 'Active' : 'Blocked'}</p>
      </div>
    </div>
  );
};
