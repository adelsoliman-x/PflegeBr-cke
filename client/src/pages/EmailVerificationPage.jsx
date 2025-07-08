import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

const EmailVerificationPage = () => {
  const [code, setCode] = useState('');
  const navigate = useNavigate();

  const handleVerify = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });

      const data = await res.json();

      if (res.ok) {
        toast({ title: 'Success', description: 'Email verified successfully!' });
        navigate('/login');
      } else {
        toast({ title: 'Error', description: data.message, variant: 'destructive' });
      }
    } catch (err) {
      toast({ title: 'Error', description: 'Something went wrong', variant: 'destructive' });
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 space-y-4">
      <h2 className="text-2xl font-bold">Verify Your Email</h2>
      <Input
        placeholder="Enter the code sent to your email"
        value={code}
        onChange={(e) => setCode(e.target.value)}
      />
      <Button onClick={handleVerify}>Verify Email</Button>
    </div>
  );
};

export default EmailVerificationPage;
