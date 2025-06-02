
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserRole } from '../../contexts/AuthContext';

interface LoginFormProps {
  onLogin: (email: string, password: string, role: UserRole) => Promise<boolean>;
}

const LoginForm = ({ onLogin }: LoginFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('vendor');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);

  const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Basic client-side validation
    if (!email || !password) {
      setError('Email and password are required');
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      setLoading(false);
      return;
    }

    try {
      const success = await onLogin(email, password, role);
      if (!success) {
        setAttempts(prev => prev + 1);
        if (attempts >= 4) {
          setError('Too many failed attempts. Please wait before trying again.');
        } else {
          setError('Invalid credentials. Please check your email and password.');
        }
      }
    } catch (err: any) {
      setAttempts(prev => prev + 1);
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="role">Role</Label>
        <Select value={role} onValueChange={(value: UserRole) => setRole(value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select your role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="vendor">Vendor</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="Enter your email"
          maxLength={254}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="Enter your password"
          minLength={8}
          maxLength={128}
        />
      </div>
      
      {error && (
        <div className="text-red-600 text-sm bg-red-50 p-2 rounded border">
          {error}
        </div>
      )}
      
      <Button type="submit" className="w-full" disabled={loading || attempts >= 5}>
        {loading ? 'Signing in...' : 'Sign In'}
      </Button>
      
      {role === 'admin' && isDemoMode && (
        <div className="text-xs text-gray-500 mt-2 p-2 bg-yellow-50 rounded border">
          Demo credentials: admin@pvc.com / AdminDemo123!
        </div>
      )}
    </form>
  );
};

export default LoginForm;
