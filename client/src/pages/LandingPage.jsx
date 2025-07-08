
import  react  from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';

const LandingPage = () => {
  const { t } = useLanguage();
  return (
    <>
      <section className=" lg:grid lg:h-screen lg:place-content-center ">
  <div
    className="mx-auto w-screen max-w-screen-xl px-4 py-16 sm:px-6 sm:py-24 md:grid md:grid-cols-2 md:items-center md:gap-4 lg:px-8 lg:py-32"
  >
    <div className="max-w-prose text-left">
      <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl dark:text-white">
      {t('welcomeTo')}
        <strong className="text-indigo-600"> PflegeBrücke </strong>
      </h1>

      <p className="mt-4 text-base text-pretty text-gray-700 sm:text-lg/relaxed dark:text-gray-200">
        {t('landingDescription')}
      </p>

      <div className="mt-4 flex gap-4 sm:mt-6">
        <a
          className="inline-block rounded border border-indigo-600 bg-indigo-600 px-5 py-3 font-medium text-white shadow-sm transition-colors hover:bg-indigo-700"
          href="/dashboard"
        >
          {t('getStarted')}
        </a>

        <a
          className="inline-block rounded border border-gray-200 px-5 py-3 font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 hover:text-gray-900 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800 dark:hover:text-white"
          href="#"
        >
          {t('learnMore')}
        </a>
      </div>
    </div>
 <img
  src="/images/hero-image.png"
  className="w-full max-h-[500px] sm:max-h-[400px] md:max-h-[600px] object-cover rounded-lg"
  alt="hero"
  loading="lazy"

/>

  </div>
</section>
{/* end of banner section */}

{/* start of learn More section */}

<section id="about" className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
            {t('aboutTitle')}
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
            {t('aboutDescription')}
          </p>
        </div>
        <div className="mt-12 grid gap-8 md:grid-cols-3 text-center">
          <div>
            <h3 className="text-xl font-semibold text-indigo-600">{t('featureOneTitle')}</h3>
            <p className="mt-2 text-gray-600 dark:text-gray-400">{t('featureOneDesc')}</p>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-indigo-600">{t('featureTwoTitle')}</h3>
            <p className="mt-2 text-gray-600 dark:text-gray-400">{t('featureTwoDesc')}</p>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-indigo-600">{t('featureThreeTitle')}</h3>
            <p className="mt-2 text-gray-600 dark:text-gray-400">{t('featureThreeDesc')}</p>
          </div>
        </div>
      </section>

{/* start of learn More section */}
</>
  );
};

export default LandingPage;
