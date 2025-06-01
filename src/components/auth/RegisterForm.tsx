
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User } from '../../contexts/AuthContext';

interface RegisterFormProps {
  onRegister: (userData: Omit<User, 'id'> & { password: string }) => Promise<boolean>;
}

const RegisterForm = ({ onRegister }: RegisterFormProps) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    company: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await onRegister({
        ...formData,
        role: 'vendor'
      });
    } catch (err) {
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          required
          placeholder="Enter your full name"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => handleChange('email', e.target.value)}
          required
          placeholder="Enter your email"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="company">Company</Label>
        <Input
          id="company"
          value={formData.company}
          onChange={(e) => handleChange('company', e.target.value)}
          placeholder="Company name (optional)"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          value={formData.phone}
          onChange={(e) => handleChange('phone', e.target.value)}
          placeholder="Phone number (optional)"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          value={formData.password}
          onChange={(e) => handleChange('password', e.target.value)}
          required
          placeholder="Enter your password"
        />
      </div>
      
      {error && (
        <div className="text-red-600 text-sm">{error}</div>
      )}
      
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Creating account...' : 'Create Vendor Account'}
      </Button>
    </form>
  );
};

export default RegisterForm;
