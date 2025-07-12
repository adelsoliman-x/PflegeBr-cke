
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { Plus, Edit, Trash2, Briefcase, Users, TrendingUp, FileText, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const DashboardPage = () => {
  const [filterStatus, setFilterStatus] = useState('all');
  const { t } = useLanguage();
  const [jobs, setJobs] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const { token } = useAuth(); // ✅ دي اللي هنستخدمها في fetch
  const [formData, setFormData] = useState({
    candidate_name: '',
    specialization: '',
    skills: '',
    city: '',
    country: '',
    status: 'available',
    files: []
  });

  const getFileNameFromUrl = (url) => {
  if (!url) return 'Unknown';
  try {
    return decodeURIComponent(url.split('/').pop());
  } catch (e) {
    return 'Unknown';
  }
};

  useEffect(() => {
    const storedJobs = localStorage.getItem('jobPosts');
    if (storedJobs) {
      setJobs(JSON.parse(storedJobs));
    }
  }, []);

  const saveJobs = (updatedJobs) => {
    setJobs(updatedJobs);
    localStorage.setItem('jobPosts', JSON.stringify(updatedJobs));
  };

  const handleInputChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  const newJob = {
    candidateName: formData.candidate_name,
    specialization: formData.specialization,
    skills: formData.skills,
    country: formData.country,
    city: formData.city,
    status: formData.status,
    files: formData.files, // ✅ array of { name, url }
  };

  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/jobs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`, // لازم تكون جايب التوكن من context أو غيره
      },
      body: JSON.stringify(newJob),
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.message);

    toast({ title: '✅ Success', description: 'Job created successfully' });
    fetchJobs(); // ⬅️ جدد البيانات
    resetForm(); // ⬅️ فضي الفورم
  } catch (err) {
    console.error('❌ Job creation error:', err);
    toast({ title: 'Error', description: err.message || 'Something went wrong' });
  }
};

  const handleFileChange = async (e) => {
  const files = Array.from(e.target.files);

  const uploadedFiles = await Promise.all(
    files.map(async (file) => {
      const formData = new FormData();
      formData.append('file', file);

      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/upload`, {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();

        return {
          name: file.name,  // 👈 نضمن ظهور الاسم هنا فورًا من الملف الأصلي
          url: data.url,
        };
      } catch (err) {
        console.error('Upload failed', err);
        return null;
      }
    })
  );

  const validFiles = uploadedFiles.filter(Boolean);

  setSelectedFiles((prev) => [...prev, ...validFiles]);
   setFormData((prev) => ({
    ...prev,
    files: [...prev.files, ...validFiles],
  }));
};

  const handleEdit = (job) => {
    setEditingJob(job);
    const [country, city] = job.city.split(' / ');
    setFormData({
      candidate_name: job.candidate_name,
      specialization: job.specialization,
      skills: job.skills,
      city: city || '',
      country: country || '',
      status: job.status,

   files: Array.isArray(job.files)
  ? job.files.map((f) =>
      typeof f === 'string'
        ? { name: getFileNameFromUrl(f), url: f }
        : {
            name: f.name || getFileNameFromUrl(f.url),
            url: f.url,
          }
    )
  : job.file_url
  ? [{ name: getFileNameFromUrl(job.file_url), url: job.file_url }]
  : [],



    });
    setIsDialogOpen(true);
  };

  const handleDelete = (jobId) => {
    const updatedJobs = jobs.filter(job => job.id !== jobId);
    saveJobs(updatedJobs);
    toast({ title: 'Success', description: t('jobDeleted') });
  };

 const handleRemoveFile = (targetFile) => {
  setFormData((prev) => ({
    ...prev,
    files: prev.files.filter((f) => f.url !== targetFile.url),
  }));
};


  const resetForm = () => {
    setFormData({
      candidate_name: '',
      specialization: '',
      skills: '',
      city: '',
      country: '',
      status: 'available',
      files: []
    });
    setEditingJob(null);
    setSelectedFiles([]);
    setIsDialogOpen(false);
  };

  const stats = {
    total: jobs.length,
    available: jobs.filter(job => job.status === 'available').length,
    hired: jobs.filter(job => job.status === 'hired').length,
  };

  return (
    <>
      <Helmet>
        <title>{t('jobBoard')} - {t('adminDashboard')}</title>
        <meta name="description" content="Admin dashboard for managing job posts and candidates"/>
      </Helmet>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold gradient-text">{t('adminDashboard')}</h1>
          <Dialog open={isDialogOpen} onOpenChange={(open) => { if (!open) resetForm(); else setIsDialogOpen(true); }}>
            <DialogTrigger asChild>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                {t('create')} {t('jobPosts')}
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-effect border-border max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingJob ? t('editJobPost') : t('createJobPost')}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="candidate_name">{t('candidateName')}</Label>
                  <Input id="candidate_name" name="candidate_name" value={formData.candidate_name} onChange={handleInputChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="specialization">{t('specialization')}</Label>
                  <Input id="specialization" name="specialization" value={formData.specialization} onChange={handleInputChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="skills">{t('skills')}</Label>
                  <Input id="skills" name="skills" value={formData.skills} onChange={handleInputChange} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="country">{t('country')}</Label>
                    <Input id="country" name="country" value={formData.country} onChange={handleInputChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">{t('city')}</Label>
                    <Input id="city" name="city" value={formData.city} onChange={handleInputChange} required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">{t('status')}</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">{t('available')}</SelectItem>
                      <SelectItem value="hired">{t('hired')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="file-upload">{t('uploadFiles')}</Label>
                  <Input id="file-upload" type="file" accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png" onChange={handleFileChange} multiple />
                  {selectedFiles.length > 0 && <p className="text-sm text-muted-foreground">{t('filesSelected', { count: selectedFiles.length })}</p>}
                  
                  {formData.files && formData.files.length > 0 && (
  <div className="space-y-2 pt-2">
    <p className="text-sm font-medium">{t('filesUploaded')}:</p>
    <ul className="space-y-1">
      {formData.files.map((file, index) => (
  <li key={index}
    className="flex items-center justify-between p-2 rounded-md bg-muted text-sm"
  > 
    <a
      href={file.url}
      target="_blank"
      rel="noopener noreferrer"
      className="truncate text-blue-500 hover:underline"
    >
      {file.name}
    </a>
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="h-6 w-6"
      onClick={() => handleRemoveFile(file)}
    >
      <X className="h-4 w-4" />
    </Button>
  </li>
))}

    </ul>
  </div>
)}

                </div>

                <div className="flex space-x-2 pt-4">
                  <Button type="submit" className="flex-1">{t('save')}</Button>
                  <Button type="button" variant="outline" onClick={resetForm} className="flex-1">{t('cancel')}</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: 0.1 }}
    onClick={() => setFilterStatus('all')}
  >
    <Card className={`glass-effect cursor-pointer ${filterStatus === 'all' ? 'ring-2 ring-primary' : ''}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
        <Briefcase className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent><div className="text-2xl font-bold">{stats.total}</div></CardContent>
    </Card>
  </motion.div>

  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: 0.2 }}
    onClick={() => setFilterStatus('available')}
  >
    <Card className={`glass-effect cursor-pointer ${filterStatus === 'available' ? 'ring-2 ring-green-400' : ''}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{t('available')}</CardTitle>
        <Users className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent><div className="text-2xl font-bold text-green-400">{stats.available}</div></CardContent>
    </Card>
  </motion.div>

  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: 0.3 }}
    onClick={() => setFilterStatus('hired')}
  >
    <Card className={`glass-effect cursor-pointer ${filterStatus === 'hired' ? 'ring-2 ring-blue-400' : ''}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{t('hired')}</CardTitle>
        <TrendingUp className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent><div className="text-2xl font-bold text-blue-400">{stats.hired}</div></CardContent>
    </Card>
  </motion.div>
</div>

        <Card className="glass-effect">
          <CardHeader><CardTitle>{t('jobPosts')}</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
            {jobs
              .filter(job => filterStatus === 'all' || job.status === filterStatus)
              .map((job, index) => (
                <motion.div key={job.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="font-medium">{job.candidate_name}</h3>
                      <Badge variant={job.status === 'available' ? 'default' : 'secondary'}>{t(job.status)}</Badge>
                      {(job.files && job.files.length > 0) && <FileText className="h-4 w-4 text-primary" />}
                    </div>
                    <p className="text-sm text-muted-foreground">{job.specialization} • {job.city}</p>
                    <p className="text-xs text-muted-foreground/80">{job.skills}</p>
                    {job.hired_by && (
                      <>
                        <p className="text-xs text-blue-400">{t('hiredBy')}: {job.hired_by}</p>
                        {job.hired_date && (
                          <p className="text-xs text-muted-foreground">
                            {t('hiredDate')}: {new Date(job.hired_date).toLocaleDateString()}
                          </p>
                        )}
                      </>
                    )}
                    {job.fileUrls?.length > 0 && (
  <div className="mt-2 space-y-1">
    <p className="text-xs font-semibold">{t('uploadedFiles')}:</p>
    {job.fileUrls.map((url, i) => (
      <a
        key={i}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-blue-500 underline block"
      >
        File {i + 1}
      </a>
    ))}
  </div>
)}

                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(job)}><Edit className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(job.id)} className="text-red-400 hover:text-red-300"><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </motion.div>
              ))}
              {jobs.length === 0 && (
                <div className="text-center py-8"><Briefcase className="h-12 w-12 mx-auto mb-4 text-muted-foreground" /><p className="text-muted-foreground">No job posts yet. Create your first one!</p></div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </>
  );
};

export default DashboardPage;
