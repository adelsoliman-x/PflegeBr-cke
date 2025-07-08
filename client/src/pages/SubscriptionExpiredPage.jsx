import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { Clock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const SubscriptionExpiredPage = () => {
  const { t } = useLanguage();
  const { token } = useAuth();

  const handleSendCashRequest = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/cash-request`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      toast({
        title: t('requestSent'),
        description: t('waitingForApproval'),
      });
    } catch (err) {
      console.error('ُError', err);
      toast({
        title: t('error'),
        description: t(err.message) || err.message,
        variant: 'destructive',
      });
    }

   const res = await fetch(`${import.meta.env.VITE_API_URL}/cash-request`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
   Authorization: `Bearer ${localStorage.getItem('token')}`,

  },
});

const contentType = res.headers.get('content-type');

if (!res.ok) {
  // لو رجع HTML بدل JSON، اطبعه في الكونسول
  const text = await res.text();
  console.error('Server returned HTML:', text);
  throw new Error('Failed to send request');
}

const data = await res.json();

  };

  return (
    <>
      <Helmet>
        <title>{t('jobBoard')} - {t('subscriptionExpiredTitle')}</title>
        <meta name="description" content={t('subscriptionExpiredNotice')} />
      </Helmet>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-20"
      >
        <div className="max-w-md mx-auto glass-effect p-8 rounded-lg">
          <Clock className="h-16 w-16 mx-auto mb-4 text-red-400" />
          <h1 className="text-2xl font-bold mb-4">{t('subscriptionExpired')}</h1>
          <p className="text-muted-foreground mb-6">
            {t('contactAdminToRenew')}
          </p>

          <Button onClick={handleSendCashRequest}>
            {t('requestSubscription')}
          </Button>
        </div>
      </motion.div>
    </>
  );
};

export default SubscriptionExpiredPage;
