
import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { XCircle } from 'lucide-react';

const PaymentCancelledPage = () => {
  const { t } = useLanguage();

  return (
    <>
      <Helmet>
        <title>{t('jobBoard')} - {t('paymentCancelled')}</title>
        <meta name="description" content="Payment was cancelled." />
      </Helmet>
      <div className="h-full flex flex-col items-center justify-center bg-background text-foreground p-4">
        <div className="text-center">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">{t('paymentCancelled')}</h1>
          <p className="text-muted-foreground mb-6">{t('paymentCancelledMessage')}</p>
          <Button asChild>
            <Link to="/subscription">{t('backToSubscription')}</Link>
          </Button>
        </div>
      </div>
    </>
  );
};

export default PaymentCancelledPage;
