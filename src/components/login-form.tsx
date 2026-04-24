import { useState } from 'react';
import { User } from '../types';
import { LogIn, UserCircle, Shield } from 'lucide-react';
import { AuthService } from '../apiService';

interface LoginFormProps {
  onLogin: (token: string) => void;
  onSwitchToSignup: () => void;
}

export function LoginForm({ onLogin, onSwitchToSignup }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [selectedRole, setSelectedRole] = useState<'manager' | 'member'>('manager');
  // New state variables for real API handling
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !name) {
      alert('Please enter your name and email');
      return;
    }


    setIsLoading(true);

    try {
      // 1. Call your Axios API service
      // Assuming AuthenticationRequest takes { email, password }
      const response = await AuthService.authenticate({ email, password });

      if (response) {
        // 2. Pass the authenticated user data to the parent component
        // Assuming your AuthenticationResponse includes a 'user' object
        onLogin(response.token); 
      }
    } catch (err: any) {
      // 3. Handle errors (e.g., 401 Unauthorized, 500 Server Error)
      const errorMessage = err.response?.data?.message || 'Invalid email or password. Please try again.';
      setError(errorMessage);
    } finally {
      // 4. Stop the loading spinner whether it succeeded or failed
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-4">
            <UserCircle className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-gray-900 mb-2">Project Management System</h1>
          <p className="text-gray-600">Sign in to manage your projects</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-lg shadow-xl p-8 border border-gray-200">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label className="block text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-gray-700 mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Password (for demo purposes) */}
            <div>
              <label className="block text-gray-700 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-gray-700 mb-3">Select Your Role</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedRole('manager')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedRole === 'manager'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-blue-300'
                  }`}
                >
                  <Shield className={`w-8 h-8 mx-auto mb-2 ${
                    selectedRole === 'manager' ? 'text-blue-600' : 'text-gray-400'
                  }`} />
                  <div className={`text-sm ${
                    selectedRole === 'manager' ? 'text-blue-600' : 'text-gray-700'
                  }`}>
                    Project Manager
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Create & manage projects
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedRole('member')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedRole === 'member'
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-gray-200 bg-white hover:border-purple-300'
                  }`}
                >
                  <UserCircle className={`w-8 h-8 mx-auto mb-2 ${
                    selectedRole === 'member' ? 'text-purple-600' : 'text-gray-400'
                  }`} />
                  <div className={`text-sm ${
                    selectedRole === 'member' ? 'text-purple-600' : 'text-gray-700'
                  }`}>
                    Team Member
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Work on assigned tasks
                  </div>
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              <LogIn className="w-5 h-5" />
              Sign In
            </button>
          </form>

          {/* Demo Info */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-600 mb-2">
              <strong>Demo Instructions:</strong>
            </p>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• <strong>Project Manager:</strong> Create and manage projects</li>
              <li>• <strong>Team Member:</strong> Enroll in projects and complete tasks</li>
              <li>• Use any email and password for demo purposes</li>
            </ul>
          </div>
        </div>

        {/* Switch to Signup */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account? <button
              onClick={onSwitchToSignup}
              className="text-blue-600 hover:underline"
            >
              Sign Up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}