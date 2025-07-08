import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/components/ui/use-toast';
import { MapPin, User, Briefcase, CheckCircle, FileText } from 'lucide-react';
import AttachedFilesDialog from '@/components/AttachedFilesDialog';

const JobsPage = () => {
  const { user, isSubscriptionActive } = useAuth();
  const { t } = useLanguage();
  console.log(" User info:", user);
  const [jobs, setJobs] = useState([]);
  const [isFilesDialogOpen, setIsFilesDialogOpen] = useState(false);
  const [selectedJobForFiles, setSelectedJobForFiles] = useState(null);


  useEffect(() => {
    const storedJobs = localStorage.getItem('jobPosts');
    if (storedJobs) {
      const parsedJobs = JSON.parse(storedJobs).map(job => {
        if (job.file_url && !job.files) job.files = [job.file_url];
        if (job.pdf_url && !job.files) job.files = [job.pdf_url];
        delete job.file_url;
        delete job.pdf_url;
        return job;
      });
      setJobs(parsedJobs.filter(job => job.status !== 'hired'));
      localStorage.setItem('jobPosts', JSON.stringify(parsedJobs));
    }
  }, []);

 const handleMarkAsHired = (jobId) => {
  const updatedJobs = jobs.map(job =>
    job.id === jobId
      ? {
          ...job,
          status: 'hired',
          hired_by: user.name,
          hired_date: new Date().toISOString(),
        }
      : job
  );

  // حدث البيانات في localStorage
  const allJobs = JSON.parse(localStorage.getItem('jobPosts') || '[]').map(job =>
    job.id === jobId
      ? {
          ...job,
          status: 'hired',
          hired_by: user.name,
          hired_date: new Date().toISOString(),
        }
      : job
  );
  localStorage.setItem('jobPosts', JSON.stringify(allJobs));

  // شيل البوست من الواجهة
  setJobs(updatedJobs.filter(job => job.id !== jobId));

  toast({ title: t('jobStatusUpdated') });
};


  const handleSetInterviewing = (jobId) => {
    const updatedJobs = jobs.map(job =>
      job.id === jobId
        ? {
            ...job,
            status: job.status === 'interviewing' ? 'available' : 'interviewing',
            hired_date: null,
          }
        : job
    );

    setJobs(updatedJobs);
    localStorage.setItem('jobPosts', JSON.stringify(updatedJobs));
    toast({ title: t('jobStatusUpdated') });
  };

  const handleViewFile = (job, fileName) => {
   };

  const openFilesDialog = (job) => {
    setSelectedJobForFiles(job);
    setIsFilesDialogOpen(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return 'bg-green-500';
      case 'interviewing': return 'bg-yellow-500';
      case 'hired': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getProgressValue = (status) => {
    switch (status) {
      case 'available': return 33;
      case 'interviewing': return 66;
      case 'hired': return 100;
      default: return 0;
    }
  };

  return (
    <>
      <Helmet>
        <title>{t('jobBoard')} - {t('jobPosts')}</title>
        <meta name="description" content="Browse available job posts and candidates" />
      </Helmet>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold gradient-text">{t('jobPosts')}</h1>
          <Badge variant="secondary" className="text-sm">{jobs.length} {jobs.length === 1 ? 'Post' : 'Posts'}</Badge>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job, index) => (
            <motion.div key={job.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
              <Card className="glass-effect card-hover flex flex-col h-full">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{job.candidate_name}</CardTitle>
                    <Badge variant="secondary" className={`${getStatusColor(job.status)} text-white`}>
                      {t(job.status)}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4 flex-grow flex flex-col">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground"><Briefcase className="h-4 w-4" /><span>{job.specialization}</span></div>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground"><MapPin className="h-4 w-4" /><span>{job.city}</span></div>
                    {job.hired_by && <div className="flex items-center space-x-2 text-sm text-muted-foreground"><User className="h-4 w-4" /><span>{t('hiredBy')}: {job.hired_by}</span></div>}
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-1">{t('skills')}:</p>
                    <p className="text-sm text-muted-foreground">{job.skills}</p>
                  </div>

                  <div className="flex-grow"></div>

                  <div className="space-y-4 pt-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">{t('status')}</span>
                        <span>{getProgressValue(job.status)}%</span>
                      </div>
                      <Progress value={getProgressValue(job.status)} className="h-2" />
                    </div>

                          <div className="grid grid-cols-3 gap-2">
        <Button variant="outline" onClick={() => openFilesDialog(job)} className="w-full">
          <FileText className="h-4 w-4 mr-2" />
          {t('attachedFiles')} {job.files?.length ? `(${job.files.length})` : ''}
        </Button>
        
        <Button onClick={() => handleSetInterviewing(job.id)} className="w-full" variant="secondary">
          <User className="h-4 w-4 mr-2" />
          {job.status === 'interviewing' ? t('cancelInterview') : t('inInterview')}
        </Button>
        
     {job.status !== 'hired' && (
  <Button
    onClick={() => handleMarkAsHired(job.id)}
    className="w-full"
    variant="default"
  >
    <CheckCircle className="h-4 w-4 mr-2" />
    {t('markAsHired')}
  </Button>
)}

      </div>

                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

        {jobs.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <Briefcase className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">{t('noJobs')}</h2>
            <p className="text-muted-foreground">{t('checkLater')}</p>
          </motion.div>
        )}
      </motion.div>

      {selectedJobForFiles && (
        <AttachedFilesDialog
          isOpen={isFilesDialogOpen}
          onOpenChange={setIsFilesDialogOpen}
          job={selectedJobForFiles}
          t={t}
          onViewFile={(fileName) => handleViewFile(selectedJobForFiles, fileName)}
        />
      )}
    </>
  );
};

export default JobsPage;
