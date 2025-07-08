
import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Facebook, Instagram, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-muted text-muted-foreground p-6 sm:p-8 border-t border-border/50">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">{t('contactInfo')}</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center space-x-3">
                <Phone className="h-4 w-4" />
                <span>+49 123 4567890</span>
              </li>
              <li className="flex items-center space-x-3">
                <MapPin className="h-4 w-4" />
                <span>Berlin, Germany</span>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">{t('socialMedia')}</h3>
            <div className="flex space-x-4">
              <a href="https://www.facebook.com/share/1FvUmM3KX6/?mibextid=wwXIfr" aria-label="Facebook" className="hover:text-primary transition-colors">
                <Facebook className="h-6 w-6" />
              </a>
              <a href="#" aria-label="Instagram" className="hover:text-primary transition-colors">
                <Instagram className="h-6 w-6" />
              </a>
            </div>
          </div>

           <div className="space-y-4 md:text-left">
            <h3 className="text-lg font-semibold text-foreground">PflegeBrücke</h3>
            <p className="text-sm">{t('operatedBy')}</p>
          </div>

        </div>
{/* 
        <div className="mt-8 pt-6 border-t border-border/50 text-center text-sm space-y-2">
            <p>{t('createdBy')}</p>
            <p>{t('copyright')}</p>
        </div> */}

        <div className="mt-8 pt-6 border-t border-border/50 text-center text-sm space-y-2">
  <p>
    <a
      href="https://deepsightx.com" 
      target="_blank"
      rel="noopener noreferrer"
      className="text-foreground hover:underline"
    >
      {t('createdBy')}
    </a>
  </p>
  <p>{t('copyright')}</p>
</div>
      </div>
    </footer>
  );
};

export default Footer;
