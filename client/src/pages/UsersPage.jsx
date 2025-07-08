import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarDays, Mail, User } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from '@/components/ui/use-toast';

const UsersPage = () => {
  const { t } = useLanguage();
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState('all');

  const fetchUsers = async () => {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/users`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`HTTP error: ${res.status} - ${errorText}`);
    }

    const data = await res.json();
    setUsers(data);
  } catch (err) {
    console.error('❌ Error fetching users:', err);
    toast({
      title: t('error'),
      description: t('fetchError'),
      variant: 'destructive',
    });
  }
};


  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user => {
    if (filter === 'subscribed') return user.subscription?.status === 'active';
    if (filter === 'unsubscribed') return !user.subscription || user.subscription.status !== 'active';
    return true; // 'all'
  });

  return (
    <>
      <Helmet>
        <title>{t('users')} - Admin</title>
      </Helmet>

      <h1 className="text-3xl font-bold mb-6">{t('users')}</h1>

      {/* 🔼 Cards for filtering */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
  <Card
    onClick={() => setFilter('all')}
    className={`glass-effect cursor-pointer transition ${filter === 'all' ? 'ring-2 ring-primary' : ''}`}
  >
    <CardHeader>
      <CardTitle>{t('totalUsers')}</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-2xl font-bold">{users.length}</p>
    </CardContent>
  </Card>

  <Card
    onClick={() => setFilter('subscribed')}
    className={`glass-effect cursor-pointer transition ${filter === 'subscribed' ? 'ring-2 ring-green-500' : ''}`}
  >
    <CardHeader>
      <CardTitle>{t('activeSubscribers')}</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-2xl font-bold text-green-500">
        {users.filter(u => u.subscription?.status === 'active').length}
      </p>
    </CardContent>
  </Card>

  <Card
    onClick={() => setFilter('unsubscribed')}
    className={`glass-effect cursor-pointer transition ${filter === 'unsubscribed' ? 'ring-2 ring-red-500' : ''}`}
  >
    <CardHeader>
      <CardTitle>{t('noSubscription')}</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-2xl font-bold text-red-500">
        {users.filter(u => !u.subscription || u.subscription.status !== 'active').length}
      </p>
    </CardContent>
  </Card>
</div>


      {/* 🔽 Filtered user cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredUsers.length === 0 ? (
          <p className="text-muted-foreground">{t('noUsers')}</p>
        ) : (
          filteredUsers.map((user) => (
            <Card key={user.id} className="glass-effect">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-muted-foreground" />
                  {user.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="w-4 h-4" /> {user.email}
                </p>
                <p className="flex items-center gap-2 text-muted-foreground">
                  <CalendarDays className="w-4 h-4" />
                  {t('joinedOn')}: {new Date(user.createdAt).toLocaleDateString()}
                </p>
                <p className="flex items-center gap-2 text-muted-foreground">
                  <CalendarDays className="w-4 h-4" />
                  {t('subscriptionEnd')}:{" "}
                  {user.subscription?.expiryDate
                    ? new Date(user.subscription.expiryDate).toLocaleDateString()
                    : t('noSubscription')}
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </>
  );
};

export default UsersPage;
