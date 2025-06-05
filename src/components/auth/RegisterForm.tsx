
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { User } from '../../contexts/AuthContext';
import VerificationForm from './VerificationForm';

interface RegisterFormProps {
  onRegister: (userData: Omit<User, 'id'> & { password: string; phone?: string }) => Promise<boolean>;
}

const RegisterForm = ({ onRegister }: RegisterFormProps) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showVerification, setShowVerification] = useState(false);
  const [verificationType, setVerificationType] = useState<'email' | 'phone'>('email');
  const [requirePhoneVerification, setRequirePhoneVerification] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Basic validation
      if (formData.password.length < 8) {
        setError('Password must be at least 8 characters long');
        return;
      }

      if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
        setError('Password must contain at least one uppercase letter, one lowercase letter, and one number');
        return;
      }

      if (formData.phone && !/^\+?[\d\s-()]{10,15}$/.test(formData.phone)) {
        setError('Please enter a valid phone number');
        return;
      }

      // Show email verification first
      setShowVerification(true);
      setVerificationType('email');
      
      toast({
        title: "Verification required",
        description: "Please check your email for a verification code.",
      });
    } catch (err) {
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailVerificationComplete = () => {
    if (formData.phone && requirePhoneVerification) {
      setVerificationType('phone');
      toast({
        title: "Email verified!",
        description: "Now please verify your phone number.",
      });
    } else {
      completeRegistration();
    }
  };

  const handlePhoneVerificationComplete = () => {
    completeRegistration();
  };

  const completeRegistration = async () => {
    try {
      const success = await onRegister({
        ...formData,
        role: 'vendor',
        phone: formData.phone || undefined
      });
      
      if (success) {
        toast({
          title: "Registration successful!",
          description: "Welcome! You can now place orders.",
        });
      } else {
        setError('Registration failed. Please try again.');
        setShowVerification(false);
      }
    } catch (err) {
      setError('Registration failed. Please try again.');
      setShowVerification(false);
    }
  };

  const handleResendCode = async () => {
    // Simulate resend API call
    await new Promise(resolve => setTimeout(resolve, 500));
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (showVerification) {
    return (
      <VerificationForm
        email={formData.email}
        type={verificationType}
        onVerificationComplete={
          verificationType === 'email' 
            ? handleEmailVerificationComplete 
            : handlePhoneVerificationComplete
        }
        onResendCode={handleResendCode}
      />
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Create Vendor Account</CardTitle>
      </CardHeader>
      <CardContent>
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
            <Label htmlFor="email">Email *</Label>
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
            <Label htmlFor="phone">Phone Number (Optional)</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="+1 (555) 123-4567"
            />
            {formData.phone && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="requirePhoneVerification"
                  checked={requirePhoneVerification}
                  onCheckedChange={(checked) => setRequirePhoneVerification(checked as boolean)}
                />
                <Label htmlFor="requirePhoneVerification" className="text-sm">
                  Verify phone number
                </Label>
              </div>
            )}
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
            <p className="text-xs text-gray-500">
              Must be at least 8 characters with uppercase, lowercase, and number
            </p>
          </div>
          
          {error && (
            <div className="text-red-600 text-sm">{error}</div>
          )}
          
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default RegisterForm;
