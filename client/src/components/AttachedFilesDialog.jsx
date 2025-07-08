import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { FileText } from 'lucide-react';

const AttachedFilesDialog = ({ isOpen, onOpenChange, job, t }) => {
  if (!job) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="glass-effect border-border">
        <DialogHeader>
          <DialogTitle>
            {t('attachedFiles')} for {job.candidate_name}
          </DialogTitle>
          <DialogDescription>
            {job.specialization} at {job.city}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {job.files && job.files.length > 0 ? (
            <ul className="space-y-3">
              {job.files.map((file, index) => (
                <li
                  key={index}
                  className="flex items-center justify-between p-3 rounded-md bg-muted/50"
                >
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-primary" />
                    <span className="font-medium text-sm">
                      {t('viewFile', { index: index + 1 })}: {file.name}
                    </span>
                  </div>
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 text-sm underline"
                  >
                    {t('view')}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-10 w-10 mx-auto mb-3" />
              <p>{t('noFilesAttached')}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AttachedFilesDialog;
