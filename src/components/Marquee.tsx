import { useLanguage } from '../context/LanguageContext';

const ITEMS = 12;

export default function Marquee() {
  const { t, isRTL } = useLanguage();

  return (
    <div className="relative overflow-hidden bg-neon-blue py-2">
      <div
        className="flex whitespace-nowrap marquee-track"
        style={{ animationDirection: isRTL ? 'reverse' : 'normal' }}
      >
        {Array.from({ length: ITEMS }).map((_, i) => (
          <span
            key={i}
            className="flex-shrink-0 mx-8 text-black font-bold uppercase tracking-widest text-sm md:text-base font-mono"
          >
            {t('marquee.delivery')}
          </span>
        ))}
      </div>
    </div>
  );
}
