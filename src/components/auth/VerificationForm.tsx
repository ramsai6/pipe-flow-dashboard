
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';

interface VerificationFormProps {
  email: string;
  type: 'email' | 'phone';
  onVerificationComplete: () => void;
  onResendCode: () => void;
}

const VerificationForm = ({ email, type, onVerificationComplete, onResendCode }: VerificationFormProps) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate verification API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (code === '123456') { // Mock verification code
        toast({
          title: "Verification successful!",
          description: `Your ${type} has been verified.`,
        });
        onVerificationComplete();
      } else {
        toast({
          title: "Invalid code",
          description: "Please check your verification code and try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Verification failed",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    try {
      await onResendCode();
      toast({
        title: "Code resent",
        description: `A new verification code has been sent to your ${type}.`,
      });
    } catch (error) {
      toast({
        title: "Failed to resend code",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Verify Your {type === 'email' ? 'Email' : 'Phone Number'}</CardTitle>
        <p className="text-sm text-gray-600">
          We've sent a 6-digit code to {email}. Please enter it below.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="code">Verification Code</Label>
            <Input
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="Enter 6-digit code"
              maxLength={6}
              required
            />
          </div>
          
          <Button type="submit" className="w-full" disabled={loading || code.length !== 6}>
            {loading ? 'Verifying...' : 'Verify'}
          </Button>
          
          <div className="text-center">
            <Button 
              type="button" 
              variant="link" 
              onClick={handleResend}
              disabled={resendLoading}
            >
              {resendLoading ? 'Sending...' : 'Resend code'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default VerificationForm;
