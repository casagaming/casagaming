import React from 'react';
import { motion } from 'motion/react';
import { Phone, Mail, MapPin, MessageSquare, Instagram, Facebook, Twitter } from 'lucide-react';
import { useConfig } from '../context/ConfigContext';
import { useLanguage } from '../context/LanguageContext';

export default function AboutUsPage() {
  const { config } = useConfig();
  const { language, t, isRTL } = useLanguage();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  return (
    <div className="pt-24 pb-20 bg-bg-primary min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[40vh] md:h-[50vh] overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-[url('https://res.cloudinary.com/dwgp11ukd/image/upload/v1772992306/alexander-swoboda-pc9_ke2pxf.jpg')] bg-cover bg-center opacity-20 scale-110" />
        <div className="absolute inset-0 bg-gradient-to-b from-bg-primary via-transparent to-bg-primary" />
        
        <motion.div 
          className="relative z-10 text-center px-4"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl md:text-7xl font-display font-black tracking-tighter uppercase mb-4">
            {language === 'ar' ? 'من نحن' : 'À Propos'}
            <span className="text-neon-blue block md:inline md:ml-4">CASA GAMING</span>
          </h1>
          <div className="h-1 w-24 bg-gradient-to-r from-neon-blue to-neon-purple mx-auto rounded-full" />
        </motion.div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-32"
        >
          {/* Logo & Info */}
          <motion.div variants={itemVariants} className="flex flex-col items-center lg:items-start text-center lg:text-left">
            <div className="relative mb-8 group">
              <div className="absolute -inset-4 bg-gradient-to-r from-neon-blue/20 to-neon-purple/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-500" />
              {config?.logo_url ? (
                <img src={config.logo_url} alt="Logo" className="relative w-48 h-48 object-contain" />
              ) : (
                <div className="relative w-48 h-48 flex items-center justify-center bg-bg-secondary border border-border-color rounded-2xl">
                   <span className="font-display font-black text-4xl text-neon-blue">CASA</span>
                </div>
              )}
            </div>
            
            <h2 className={`text-3xl font-display font-bold text-text-primary mb-6 uppercase tracking-wider ${isRTL ? 'lg:text-right' : 'lg:text-left'}`}>
              {language === 'ar' ? 'التميز في عالم الألعاب' : 'L\'Excellence du Gaming'}
            </h2>
            <p className={`text-lg text-text-secondary leading-relaxed max-w-xl ${isRTL ? 'lg:text-right font-sans' : 'lg:text-left'}`}>
              {language === 'ar' 
                ? 'كازا جيمينج هو وجهتك الأولى للحصول على أفضل معدات الألعاب في الجزائر. نحن متخصصون في توفير أرقى الملحقات التي تجمع بين الأداء العالي والتصميم العصري، من لوحات المفاتيح الميكانيكية إلى الفئات الاحترافية من الفئران وسماعات الرأس.'
                : 'Casa Gaming est votre destination ultime pour le meilleur équipement de jeu en Algérie. Nous nous spécialisons dans la fourniture de périphériques haut de gamme alliant haute performance et design moderne, des claviers mécaniques aux souris et casques professionnels.'}
            </p>
          </motion.div>

          {/* Contact Cards */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-8 bg-bg-secondary border border-border-color rounded-2xl hover:border-neon-blue transition-colors group">
              <Phone className="text-neon-blue mb-4 group-hover:scale-110 transition-transform" size={32} />
              <h4 className="font-display font-bold text-text-primary mb-2 uppercase">{language === 'ar' ? 'الهاتف' : 'Téléphone'}</h4>
              <p className="text-text-secondary font-mono">{config?.contact_phone || '+213 555 123 456'}</p>
            </div>
            <div className="p-8 bg-bg-secondary border border-border-color rounded-2xl hover:border-neon-purple transition-colors group">
              <Mail className="text-neon-purple mb-4 group-hover:scale-110 transition-transform" size={32} />
              <h4 className="font-display font-bold text-text-primary mb-2 uppercase">Email</h4>
              <p className="text-text-secondary font-mono">{config?.contact_email || 'support@casagaming.dz'}</p>
            </div>
            <div className="p-8 bg-bg-secondary border border-border-color rounded-2xl hover:border-neon-blue transition-colors group md:col-span-2">
              <MapPin className="text-neon-blue mb-4 group-hover:scale-110 transition-transform" size={32} />
              <h4 className="font-display font-bold text-text-primary mb-2 uppercase">{language === 'ar' ? 'الموقع' : 'Localisation'}</h4>
              <p className="text-text-secondary">{config?.contact_address || 'Algiers, Algeria'}</p>
            </div>
          </motion.div>
        </motion.div>

        {/* Call to Action */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative p-12 md:p-20 bg-bg-secondary border border-border-color rounded-[40px] overflow-hidden text-center"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-neon-blue/5 to-neon-purple/5" />
          <div className="relative z-10 max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-display font-black text-text-primary mb-8 uppercase tracking-tighter">
              {language === 'ar' ? 'هل لديك أي استفسار؟' : 'Une Question ?'}
            </h2>
            <p className="text-xl text-text-secondary mb-12">
              {language === 'ar' 
                ? 'فريقنا متاح دائماً للإجابة على جميع تساؤلاتكم عبر الواتساب.'
                : 'Notre équipe est toujours disponible pour répondre à toutes vos questions via WhatsApp.'}
            </p>
            <a 
              href={`https://wa.me/${config?.whatsapp_number}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-10 py-5 bg-green-500 hover:bg-green-600 text-white font-bold rounded-full scale-100 hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(34,197,94,0.3)]"
            >
              <MessageSquare size={24} />
              <span className="text-lg uppercase tracking-wider">{language === 'ar' ? 'تواصل معنا عبر واتساب' : 'WhatsAppez-nous'}</span>
            </a>
          </div>
        </motion.div>
      </div>

      {/* Social Links Section */}
      <section className="mt-32 border-t border-border-color pt-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h3 className="text-sm font-mono text-text-secondary uppercase tracking-[0.3em] mb-12">{language === 'ar' ? 'تابعنا على المنصات الاجتماعية' : 'Suivez-nous sur les réseaux'}</h3>
          <div className="flex justify-center gap-12">
            {config?.instagram_url && (
              <a href={config.instagram_url} target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-neon-purple transition-all hover:scale-125">
                <Instagram size={32} />
              </a>
            )}
            {config?.facebook_url && (
              <a href={config.facebook_url} target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-neon-blue transition-all hover:scale-125">
                <Facebook size={32} />
              </a>
            )}
            {config?.twitter_url && (
              <a href={config.twitter_url} target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-neon-blue transition-all hover:scale-125">
                <Twitter size={32} />
              </a>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
