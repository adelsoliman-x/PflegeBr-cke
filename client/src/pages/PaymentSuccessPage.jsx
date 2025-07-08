import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from '@/components/ui/use-toast';
import { CheckCircle, Loader2 } from 'lucide-react';

const PaymentSuccessPage = () => {
  const navigate = useNavigate();
  const { token, fetchCurrentUser } = useAuth();
  const { t } = useLanguage();

  useEffect(() => {
    const fetchUpdatedUser = async () => {
      if (!token) {
        console.warn('❗ No token found, skipping fetch.');
        return;
      }

      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error('Failed to fetch user');
        }

        const data = await res.json();
        updateAuth(data.user, token);

        toast({
          title: t('paymentSuccessful'),
          description: t('subscriptionUpdated'),
        });

        setTimeout(() => {
          navigate('/jobs');
        }, 3000);
      } catch (err) {
        console.error('🔴 Error fetching updated user:', err);
        toast({
          title: t('error'),
          description: t('failedToUpdateSubscription'),
          variant: 'destructive',
        });
      }
    };

    fetchUpdatedUser();
  }, [navigate, token, fetchCurrentUser, t]);

  return (
    <>
      <Helmet>
        <title>{t('jobBoard')} - {t('paymentSuccessful')}</title>
        <meta name="description" content="Payment was successful." />
      </Helmet>
      <div className="h-full flex flex-col items-center justify-center bg-background text-foreground p-4">
        <div className="text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">{t('paymentSuccessful')}</h1>
          <p className="text-muted-foreground mb-6">{t('subscriptionUpdated')}</p>
          <div className="flex items-center justify-center text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            <p>{t('redirectingToJobs')}</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default PaymentSuccessPage;
