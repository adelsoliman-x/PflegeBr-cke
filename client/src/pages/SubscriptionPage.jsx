
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { CheckCircle, XCircle, Calendar, CreditCard, Loader2 } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';

// Replace with your actual Stripe Publishable Key and Price ID
const STRIPE_PUBLISHABLE_KEY = 'pk_test_YOUR_PUBLISHABLE_KEY';
const STRIPE_PRICE_ID = 'price_1Rejma2aTkS63to0e63IfW9N';


const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

const SubscriptionPage = () => {
  const { user, isSubscriptionActive } = useAuth();
  const { t, language } = useLanguage();
  const [loading, setLoading] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString(language === 'en' ? 'en-US' : 'de-DE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleSubscribe = async () => {
  setLoading(true);

  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/cash-request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });

    const data = await res.json();

    if (!res.ok) {
      if (data.message === 'You already have a pending request') {
        toast({
          title: t('requestPendingTitle'),
          description: t('requestPendingMessage'),
          variant: 'default',
        });
      } else {
        throw new Error(data.message || 'Request failed');
      }
    } else {
      toast({
        title: t('requestSent'),
        description: t('requestSentDescription'),
      });
    }
  } catch (error) {
    console.error('Request error:', error);
    toast({
      title: t('error'),
      description: t('actionFailed'),
      variant: 'destructive',
    });
  } finally {
    setLoading(false);
  }
};




  const active = isSubscriptionActive();

  return (
    <>
      <Helmet>
        <title>{t('jobBoard')} - {t('mySubscription')}</title>
        <meta name="description" content="Manage your subscription status." />
      </Helmet>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto"
      >
        <Card className="glass-effect">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-2xl">
              <CreditCard className="h-6 w-6" />
              <span>{t('mySubscription')}</span>
            </CardTitle>
            <CardDescription>
              View and manage your subscription details.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 rounded-lg bg-muted/50 border border-border">
              <div className="mb-4 sm:mb-0">
                <p className="text-sm text-muted-foreground">{t('subscriptionStatus')}</p>
                <Badge variant={active ? 'default' : 'destructive'} className={`text-lg ${active ? 'bg-green-500' : 'bg-blou-500'}`}>
                  {active ? (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  ) : (
                    <XCircle className="h-4 w-4 mr-2" />
                  )}
                  {active ? t('statusActive') : t('subscribeNowSubtitle')}
                </Badge>
              </div>
              {user && user.role === 'viewer' && (
                <div className="text-left sm:text-right">
                  <p className="text-sm text-muted-foreground">{t('expiresOn')}</p>
                  <p className="font-semibold flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(user.subscription_end)}</span>
                  </p>
                </div>
              )}
            </div>

            {!active && (
              <div className="text-center p-6 border-dashed border-2 border-primary rounded-lg">
                <h3 className="text-lg font-semibold mb-2">{t('subscriptionExpired')}</h3>
                <p className="text-muted-foreground mb-4">{t('subscriptionExpiredNotice')}</p>
                <Button 
                  onClick={handleSubscribe}
                  disabled={loading}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {t('subscribeNow')}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </>
  );
};

export default SubscriptionPage;
