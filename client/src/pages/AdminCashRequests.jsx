import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { CalendarClock, CheckCircle, XCircle } from 'lucide-react';

const AdminCashRequests = () => {
  const { t } = useLanguage();
  const [requests, setRequests] = useState([]);

  const fetchRequests = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/cash-requests`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch');

      const data = await response.json();
      setRequests(data.filter(r => r.status === 'pending'));
    } catch (err) {
      console.error('❌ Failed to fetch cash requests:', err);
      toast({
        title: t('error'),
        description: t('fetchError'),
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const rejectRequest = async (id) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/cash-requests/${id}/reject`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) throw new Error('Reject failed');

      setRequests(prev => prev.filter(r => r.id !== id));
      toast({ title: t('rejected'), description: t('requestRejected') });
    } catch (err) {
      console.error('❌ Reject error:', err);
      toast({
        title: t('error'),
        description: t('actionFailed'),
        variant: 'destructive',
      });
    }
  };

  const approveRequest = async (id, duration = 1) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/cash-requests/${id}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ duration }),
      });
      console.log('💡 approving request with id:', id);

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || 'Approval failed');

      console.log('✅ Approve success:', data);
      setRequests(prev => prev.filter(r => r.id !== id));
      toast({ title: t('approved'), description: t('requestApproved') });
    } catch (err) {
      console.error('❌ Approve error:', err);
      toast({
        title: t('error'),
        description: t('actionFailed'),
        variant: 'destructive',
      });
    }
  };

  return (
    <>
      <Helmet>
        <title>{t('cashRequests')} - Admin</title>
      </Helmet>

      <h1 className="text-3xl font-bold mb-6">{t('cashRequests')}</h1>

      <div className="space-y-4">
        {requests.length === 0 ? (
          <p className="text-muted-foreground">{t('noCashRequests')}</p>
        ) : (
          requests.map((req) => (
            <Card key={req.id} className="glass-effect">
              <CardHeader className="flex justify-between items-center">
                <CardTitle>
                  {req.user.name} ({req.user.email})
                </CardTitle>
                <CalendarClock className="text-muted-foreground" />
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                <p>
                  <strong>{t('requestedDuration')}:</strong> {req.duration} {t('months')}
                </p>
                <p>
                  <strong>{t('requestedOn')}:</strong>{' '}
                  {new Date(req.createdAt).toLocaleDateString()}
                </p>
                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={() => approveRequest(req.id, req.duration || 1)}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <CheckCircle className="w-4 h-4 mr-1" /> {t('approve')}
                  </Button>
                  <Button
                    onClick={() => rejectRequest(req.id)}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    <XCircle className="w-4 h-4 mr-1" /> {t('reject')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </>
  );
};

export default AdminCashRequests;
