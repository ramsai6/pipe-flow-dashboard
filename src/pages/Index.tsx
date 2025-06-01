
import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import LoginForm from '../components/auth/LoginForm';
import RegisterForm from '../components/auth/RegisterForm';
import Dashboard from '../components/Dashboard';

const AuthWrapper = () => {
  const [isLogin, setIsLogin] = useState(true);
  const { user, login, register } = useAuth();

  if (user) {
    return <Dashboard />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">PVC Manufacturing</h1>
          <p className="text-gray-600">Professional Pipe Solutions</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
            <button
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                isLogin ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setIsLogin(true)}
            >
              Login
            </button>
            <button
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                !isLogin ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setIsLogin(false)}
            >
              Register
            </button>
          </div>
          
          {isLogin ? (
            <LoginForm onLogin={login} />
          ) : (
            <RegisterForm onRegister={register} />
          )}
          
          <div className="mt-4 pt-4 border-t">
            <button
              className="w-full bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 transition-colors"
              onClick={() => login('guest', '', 'guest')}
            >
              Continue as Guest
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Index = () => {
  return (
    <AuthProvider>
      <AuthWrapper />
    </AuthProvider>
  );
};

export default Index;
