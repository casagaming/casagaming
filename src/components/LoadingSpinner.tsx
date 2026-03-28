import { useLanguage } from '../context/LanguageContext';

export default function LoadingSpinner() {
  const { t } = useLanguage();
  return (
    <div className="fixed inset-0 bg-bg-primary z-[60] flex items-center justify-center transition-colors duration-300">
      <div className="flex flex-col items-center gap-4">
        <div
          className="w-12 h-12 rounded-full border-4 border-border-color border-t-neon-blue"
          style={{ animation: 'spin-loader 0.75s linear infinite' }}
        />
        <span
          className="text-text-secondary font-medium tracking-widest uppercase text-sm font-mono"
          style={{ animation: 'pulse-loader 1.5s ease-in-out infinite' }}
        >
          {t('common.loading')}
        </span>
      </div>
    </div>
  );
}
