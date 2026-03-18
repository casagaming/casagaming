import { useState, useEffect } from 'react';
import { ArrowRight, CreditCard, Lock, MapPin, Truck, Search, ChevronDown } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { Link, useNavigate } from 'react-router-dom';
import { turso } from '../lib/turso';

export default function CheckoutPage() {
  const { items, cartTotal, clearCart } = useCart();
  const { language, t, isRTL } = useLanguage();
  const navigate = useNavigate();
  const [shippingMethod, setShippingMethod] = useState<'home' | 'desk'>('home');
  const [wilayas, setWilayas] = useState<any[]>([]);
  const [selectedWilaya, setSelectedWilaya] = useState<number>(16);
  const [shippingCost, setShippingCost] = useState(0);
  const [loadingWilayas, setLoadingWilayas] = useState(true);
  const [isWilayaDropdownOpen, setIsWilayaDropdownOpen] = useState(false);
  const [wilayaSearch, setWilayaSearch] = useState('');

  useEffect(() => {
    const fetchWilayas = async () => {
      try {
        const result = await turso.execute(
          'SELECT * FROM shipping_rates ORDER BY wilaya_name_en ASC'
        );
        const cols = result.columns;
        const rows = result.rows.map((row: any) => {
          const obj: any = {};
          cols.forEach((col, i) => { obj[col] = row[i]; });
          return obj;
        });
        setWilayas(rows);
      } catch (error) {
        console.error('Error fetching wilayas:', error);
      } finally {
        setLoadingWilayas(false);
      }
    };

    fetchWilayas();
  }, []);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [municipality, setMunicipality] = useState('');
  const [address, setAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const wilaya = wilayas.find(w => w.wilaya_id === selectedWilaya);
    if (wilaya) {
      setShippingCost(shippingMethod === 'home' ? wilaya.home_delivery_price : wilaya.desk_delivery_price);
    }
  }, [selectedWilaya, shippingMethod, wilayas]);

  const handleConfirmOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (firstName.length > 20 || lastName.length > 20) {
      setError(language === 'ar' ? 'الاسم واللقب يجب أن لا يتجاوزا 20 حرفاً.' : 'Le prénom et le nom doivent comporter 20 caractères ou moins.');
      return;
    }

    const phoneRegex = /^(05|06|07)\d{8}$/;
    if (!phoneRegex.test(phone)) {
      setError(language === 'ar' ? 'رقم الهاتف يجب أن يتكون من 10 أرقام ويبدأ بـ 05 أو 06 أو 07.' : 'Le numéro de téléphone doit comporter 10 chiffres et commencer par 05, 06 ou 07.');
      return;
    }

    if (!firstName || !lastName || !phone || !municipality || (shippingMethod === 'home' && !address)) {
      setError(language === 'ar' ? 'يرجى ملء جميع الحقول المطلوبة.' : 'Veuillez remplir tous les champs obligatoires.');
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedWilayaData = wilayas.find(w => w.wilaya_id === selectedWilaya);

      const orderResult = await turso.execute({
        sql: `INSERT INTO orders (customer_name, phone, wilaya, commune, address, shipping_price, total_price, status)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?) RETURNING id`,
        args: [
          `${firstName} ${lastName}`,
          phone,
          selectedWilayaData?.wilaya_name_en || 'Unknown',
          municipality,
          shippingMethod === 'home' ? address : 'STOP DESK',
          shippingCost,
          (cartTotal * 200) + shippingCost,
          'pending',
        ],
      });

      const orderId = orderResult.rows[0]?.[0] as string;
      if (!orderId) throw new Error('Failed to create order');

      for (const item of items) {
        await turso.execute({
          sql: `INSERT INTO order_items (order_id, product_id, quantity, price, variant_id) VALUES (?, ?, ?, ?, ?)`,
          args: [orderId, item.id, item.quantity, item.price, (item as any).selectedVariant?.id || null],
        });
      }

      clearCart();
      
      // Trigger Pusher notification for the Admin Control Panel
      try {
        await fetch('https://casagaming-control.onrender.com/api/orders', { // Note: Replace with actual control panel URL if different
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: orderId,
            customer_name: `${firstName} ${lastName}`,
            phone,
            total_price: (cartTotal * 200) + shippingCost
          })
        });
      } catch (err) {
        console.error('Notification trigger failed:', err);
      }

      navigate(`/order-received?order_id=${orderId}`);
    } catch (error: any) {
      console.error('Error submitting order:', error);
      setError(language === 'ar' ? 'فشل إرسال الطلب. يرجى المحاولة مرة أخرى.' : 'Échec de la soumission de la commande. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="pt-32 pb-20 text-center min-h-[60vh] flex flex-col justify-center items-center">
        <h2 className="text-4xl font-bold text-text-primary font-display uppercase tracking-tighter mb-6">{t('cart.empty')}</h2>
        <Link to="/products" className="text-neon-blue hover:text-text-primary font-mono uppercase tracking-widest border-b border-neon-blue hover:border-text-primary transition-all pb-1">
          {language === 'ar' ? 'ابدأ التسوق' : 'Commencer les achats'}
        </Link>
      </div>
    );
  }

  return (
    <div className={`pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto transition-colors duration-300 ${isRTL ? 'text-right' : 'text-left'}`}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <form onSubmit={handleConfirmOrder}>
          <h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-12 font-display uppercase tracking-tighter">{t('checkout.title')}</h1>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500 text-red-500 font-mono text-sm uppercase">
              {error}
            </div>
          )}

          <div className="mb-12">
            <h2 className={`text-xl font-bold text-text-primary mb-6 font-display uppercase tracking-wider border-b border-border-color pb-2 ${isRTL ? 'text-right' : ''}`}>{t('checkout.contact_info')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input
                type="text"
                placeholder={t('checkout.first_name')}
                value={firstName}
                onChange={(e) => setFirstName(e.target.value.slice(0, 20))}
                className="w-full p-4 bg-bg-secondary border border-border-color text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-neon-blue font-mono text-base uppercase"
                required
              />
              <input
                type="text"
                placeholder={t('checkout.last_name')}
                value={lastName}
                onChange={(e) => setLastName(e.target.value.slice(0, 20))}
                className="w-full p-4 bg-bg-secondary border border-border-color text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-neon-blue font-mono text-base uppercase"
                required
              />
              <input
                type="tel"
                placeholder={`${t('checkout.phone')} (e.g. 05XXXXXXXX)`}
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                className="w-full p-4 bg-bg-secondary border border-border-color text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-neon-blue md:col-span-2 font-mono text-base uppercase"
                required
              />
            </div>
          </div>

          <div className="mb-12">
            <h2 className="text-xl font-bold text-text-primary mb-6 font-display uppercase tracking-wider border-b border-border-color pb-2">{t('checkout.shipping_details')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="md:col-span-2 relative text-left" dir="ltr">
                <label className="block text-xs font-bold text-text-secondary mb-2 uppercase tracking-wider font-mono">{t('checkout.wilaya')} (State)</label>
                <div
                  className="w-full p-4 bg-white border border-border-color text-black flex items-center justify-between cursor-pointer font-mono text-base uppercase"
                  onClick={() => setIsWilayaDropdownOpen(!isWilayaDropdownOpen)}
                >
                  <span>
                    {selectedWilaya} - {wilayas.find(w => w.wilaya_id === selectedWilaya)?.wilaya_name_en || (language === 'ar' ? 'اختر الولاية' : 'Sélectionner la Wilaya')}
                  </span>
                  <ChevronDown size={16} className={`transition-transform ${isWilayaDropdownOpen ? 'rotate-180' : ''}`} />
                </div>

                {isWilayaDropdownOpen && (
                  <div className="absolute z-[100] left-0 right-0 mt-1 bg-white border border-border-color shadow-2xl max-h-72 overflow-y-auto custom-scrollbar">
                    <div className="sticky top-0 bg-white p-2 border-b border-gray-100">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                        <input
                          type="text"
                          placeholder="Search state..."
                          value={wilayaSearch}
                          onChange={(e) => setWilayaSearch(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 text-black text-base font-mono uppercase focus:outline-none focus:border-neon-blue"
                          autoFocus
                        />
                      </div>
                    </div>

                    {wilayas
                      .filter(w =>
                        w.wilaya_name_en.toLowerCase().includes(wilayaSearch.toLowerCase()) ||
                        w.wilaya_id.toString().includes(wilayaSearch)
                      )
                      .map(w => (
                        <div
                          key={w.wilaya_id}
                          className={`p-3 cursor-pointer hover:bg-neon-blue hover:text-white transition-colors text-black text-base font-mono border-b border-gray-50 ${selectedWilaya === w.wilaya_id ? 'bg-gray-100 font-bold' : ''}`}
                          onClick={() => {
                            setSelectedWilaya(w.wilaya_id);
                            setIsWilayaDropdownOpen(false);
                            setWilayaSearch('');
                          }}
                        >
                          {w.wilaya_id} - {w.wilaya_name_en}
                        </div>
                      ))}
                  </div>
                )}
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-text-secondary mb-2 uppercase tracking-wider font-mono">{t('checkout.commune')} (Municipality)</label>
                <input
                  type="text"
                  placeholder={language === 'ar' ? 'أدخل بلديتك' : 'ENTRER VOTRE COMMUNE'}
                  value={municipality}
                  onChange={(e) => setMunicipality(e.target.value)}
                  className="w-full p-4 bg-bg-secondary border border-border-color text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-neon-blue font-mono text-base uppercase"
                  required
                />
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <label className="block text-xs font-bold text-text-secondary mb-2 uppercase tracking-wider font-mono">{t('checkout.delivery_method')}</label>

              <div
                className={`border p-6 flex items-center justify-between cursor-pointer transition-all group ${shippingMethod === 'home' ? 'border-neon-blue bg-neon-blue/5' : 'border-border-color hover:border-text-primary/30 bg-bg-secondary'}`}
                onClick={() => setShippingMethod('home')}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-5 h-5 border flex items-center justify-center ${shippingMethod === 'home' ? 'border-neon-blue' : 'border-text-secondary'}`}>
                    {shippingMethod === 'home' && <div className="w-3 h-3 bg-neon-blue"></div>}
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin size={20} className={shippingMethod === 'home' ? 'text-neon-blue' : 'text-text-secondary'} />
                    <span className={`font-bold uppercase tracking-wider ${shippingMethod === 'home' ? 'text-text-primary' : 'text-text-secondary'}`}>{t('checkout.home_delivery')}</span>
                  </div>
                </div>
                <span className="font-bold text-text-primary font-mono">{wilayas.find(w => w.wilaya_id === selectedWilaya)?.home_delivery_price} {t('product.currency')}</span>
              </div>

              <div
                className={`border p-6 flex items-center justify-between cursor-pointer transition-all group ${shippingMethod === 'desk' ? 'border-neon-blue bg-neon-blue/5' : 'border-border-color hover:border-text-primary/30 bg-bg-secondary'}`}
                onClick={() => setShippingMethod('desk')}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-5 h-5 border flex items-center justify-center ${shippingMethod === 'desk' ? 'border-neon-blue' : 'border-text-secondary'}`}>
                    {shippingMethod === 'desk' && <div className="w-3 h-3 bg-neon-blue"></div>}
                  </div>
                  <div className="flex items-center gap-3">
                    <Truck size={20} className={shippingMethod === 'desk' ? 'text-neon-blue' : 'text-text-secondary'} />
                    <span className={`font-bold uppercase tracking-wider ${shippingMethod === 'desk' ? 'text-text-primary' : 'text-text-secondary'}`}>{t('checkout.stop_desk')}</span>
                  </div>
                </div>
                <span className="font-bold text-text-primary font-mono">{wilayas.find(w => w.wilaya_id === selectedWilaya)?.desk_delivery_price} {t('product.currency')}</span>
              </div>
            </div>

            {shippingMethod === 'home' && (
              <div className="mt-6 animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="block text-xs font-bold text-text-secondary mb-2 uppercase tracking-wider font-mono">{t('checkout.address')}</label>
                <textarea
                  placeholder={language === 'ar' ? 'أدخل عنوانك الكامل بالتفصيل' : 'ENTRER VOTRE ADRESSE COMPLÈTE'}
                  rows={3}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full p-4 bg-bg-secondary border border-border-color text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-neon-blue font-mono text-base uppercase resize-none"
                  required={shippingMethod === 'home'}
                ></textarea>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-text-primary text-bg-primary py-5 font-bold uppercase tracking-widest hover:bg-neon-blue hover:text-black transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] text-lg mt-4 group flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? t('checkout.processing') : t('checkout.confirm')} <ArrowRight className={`transition-transform ${isRTL ? 'rotate-180 group-hover:-translate-x-1' : 'group-hover:translate-x-1'}`} />
          </button>
        </form>

        <div>
          <div className="bg-bg-secondary p-8 border border-border-color sticky top-32">
            <h2 className="text-xl font-bold text-text-primary mb-8 font-display uppercase tracking-wider border-b border-border-color pb-4">{t('checkout.summary')}</h2>

            <div className="space-y-6 mb-8 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {items.map((item) => (
                <div key={(item as any).cartItemId} className="flex gap-4 items-center group">
                  <div className="w-16 h-16 bg-bg-primary border border-border-color relative flex-shrink-0">
                    <span className="absolute -top-2 -right-2 w-5 h-5 bg-neon-blue text-black text-xs font-bold flex items-center justify-center font-mono">{item.quantity}</span>
                    <img src={(item as any).selectedVariant?.image_url || (item as any).image} alt={(item as any).name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-text-primary text-sm truncate font-display uppercase tracking-wide">
                      {language === 'ar' ? ((item as any).name_ar || (item as any).name) : ((item as any).name_en || (item as any).name)} 
                      {(item as any).selectedVariant ? ` - ${language === 'ar' ? ((item as any).selectedVariant.name_ar || (item as any).selectedVariant.name_en) : (item as any).selectedVariant.name_en}` : ''}
                    </h4>
                    <p className="text-xs text-text-secondary font-mono uppercase">
                      {language === 'ar' ? ((item as any).category_ar || (item as any).category) : ((item as any).category_en || (item as any).category)}
                    </p>
                  </div>
                  <span className="font-bold text-text-primary whitespace-nowrap font-mono">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-border-color pt-6 space-y-4">
              <div className="flex justify-between text-text-secondary font-mono text-sm">
                <span>{t('cart.subtotal')}</span>
                <span className="font-bold text-text-primary">{cartTotal * 200} {t('product.currency')}</span>
              </div>
              <div className="flex justify-between text-text-secondary font-mono text-sm">
                <span>{t('checkout.shipping_cost')} ({shippingMethod === 'home' ? t('checkout.home_delivery') : t('checkout.stop_desk')})</span>
                <span className="font-bold text-text-primary">{shippingCost} {t('product.currency')}</span>
              </div>
              <div className="border-t border-border-color pt-6 flex justify-between text-xl font-bold text-text-primary font-display uppercase tracking-wider">
                <span>{t('checkout.total')}</span>
                <div className="text-right">
                  <span className="block text-xs text-text-secondary font-normal font-mono mb-1">{language === 'ar' ? 'تقريباً' : 'APPROX.'}</span>
                  <span>{(cartTotal * 200) + shippingCost} {t('product.currency')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
