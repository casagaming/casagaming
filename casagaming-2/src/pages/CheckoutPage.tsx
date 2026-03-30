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
          cartTotal + shippingCost,
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
            total_price: cartTotal + shippingCost
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

  if (items.length === 0 && !isSubmitting) {
    return (
      <div className="pt-20 pb-20 text-center min-h-[60vh] flex flex-col justify-center items-center">
        <h2 className="text-4xl font-bold text-text-primary font-display uppercase tracking-tighter mb-6">{t('cart.empty')}</h2>
        <Link to="/products" className="text-neon-blue hover:text-text-primary font-mono uppercase tracking-widest border-b border-neon-blue hover:border-text-primary transition-all pb-1">
          {language === 'ar' ? 'ابدأ التسوق' : 'Commencer les achats'}
        </Link>
      </div>
    );
  }

  return (
    <div className={`pt-20 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto transition-colors duration-300 ${isRTL ? 'text-right' : 'text-left'}`}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <form onSubmit={handleConfirmOrder}>
          <h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-10 font-display uppercase tracking-tighter">{t('checkout.title')}</h1>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500 text-red-500 font-mono text-sm uppercase">
              {error}
            </div>
          )}

          {/* STEP 1 — Wilaya */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-8 h-8 rounded-full bg-neon-blue text-black flex items-center justify-center font-mono font-black text-sm flex-shrink-0">1</div>
              <div>
                <h2 className="text-lg font-black text-text-primary font-display uppercase tracking-wider leading-none">
                  Wilaya <span className="text-text-secondary font-normal normal-case text-base">(الولاية)</span>
                </h2>
                <p className="text-xs text-text-secondary font-mono mt-0.5">Choisissez votre wilaya · اختر ولايتك</p>
              </div>
            </div>
            <div className="pl-12">
              <div className="relative text-left" dir="ltr">
                <div
                  className="w-full p-4 bg-bg-secondary border-2 border-border-color text-text-primary flex items-center justify-between cursor-pointer font-mono text-base uppercase hover:border-neon-blue transition-colors"
                  onClick={() => setIsWilayaDropdownOpen(!isWilayaDropdownOpen)}
                >
                  <span className="font-bold">
                    {selectedWilaya} — {wilayas.find(w => w.wilaya_id === selectedWilaya)?.wilaya_name_en || 'Sélectionner la Wilaya'}
                  </span>
                  <ChevronDown size={18} className={`transition-transform text-neon-blue ${isWilayaDropdownOpen ? 'rotate-180' : ''}`} />
                </div>

                {isWilayaDropdownOpen && (
                  <div className="absolute z-[100] left-0 right-0 mt-1 bg-bg-secondary border-2 border-neon-blue shadow-2xl max-h-72 overflow-y-auto">
                    <div className="sticky top-0 bg-bg-secondary p-2 border-b border-border-color">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={14} />
                        <input
                          type="text"
                          placeholder="Rechercher / ابحث عن ولايتك..."
                          value={wilayaSearch}
                          onChange={(e) => setWilayaSearch(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          className="w-full pl-9 pr-4 py-2 bg-bg-primary border border-border-color text-text-primary text-sm font-mono focus:outline-none focus:border-neon-blue placeholder:text-text-secondary"
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
                          className={`px-4 py-3 cursor-pointer hover:bg-neon-blue hover:text-black transition-colors text-text-primary text-sm font-mono border-b border-border-color last:border-0 ${selectedWilaya === w.wilaya_id ? 'bg-neon-blue/10 text-neon-blue font-bold' : ''}`}
                          onClick={() => {
                            setSelectedWilaya(w.wilaya_id);
                            setIsWilayaDropdownOpen(false);
                            setWilayaSearch('');
                          }}
                        >
                          <span className="text-text-secondary mr-2">{w.wilaya_id} —</span>{w.wilaya_name_en}
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* STEP 2 — Delivery Method */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-8 h-8 rounded-full bg-neon-blue text-black flex items-center justify-center font-mono font-black text-sm flex-shrink-0">2</div>
              <div>
                <h2 className="text-lg font-black text-text-primary font-display uppercase tracking-wider leading-none">
                  Mode de Livraison <span className="text-text-secondary font-normal normal-case text-base">(طريقة التوصيل)</span>
                </h2>
                <p className="text-xs text-text-secondary font-mono mt-0.5">Choisissez comment recevoir votre commande · اختر طريقة الاستلام</p>
              </div>
            </div>
            <div className="pl-12 space-y-3">
              <div
                className={`border-2 p-5 flex items-center justify-between cursor-pointer transition-all ${shippingMethod === 'home' ? 'border-neon-blue bg-neon-blue/5' : 'border-border-color hover:border-neon-blue/40 bg-bg-secondary'}`}
                onClick={() => setShippingMethod('home')}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${shippingMethod === 'home' ? 'border-neon-blue' : 'border-text-secondary'}`}>
                    {shippingMethod === 'home' && <div className="w-2.5 h-2.5 rounded-full bg-neon-blue"></div>}
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin size={20} className={shippingMethod === 'home' ? 'text-neon-blue' : 'text-text-secondary'} />
                    <div>
                      <span className={`font-bold uppercase tracking-wider text-sm block ${shippingMethod === 'home' ? 'text-text-primary' : 'text-text-secondary'}`}>
                        {t('checkout.home_delivery')}
                      </span>
                      <span className="text-xs text-text-secondary font-mono">توصيل للمنزل</span>
                    </div>
                  </div>
                </div>
                <span className={`font-black font-mono text-lg ${shippingMethod === 'home' ? 'text-neon-blue' : 'text-text-primary'}`}>
                  {wilayas.find(w => w.wilaya_id === selectedWilaya)?.home_delivery_price ?? '—'} <span className="text-xs">{t('product.currency')}</span>
                </span>
              </div>

              <div
                className={`border-2 p-5 flex items-center justify-between cursor-pointer transition-all ${shippingMethod === 'desk' ? 'border-neon-blue bg-neon-blue/5' : 'border-border-color hover:border-neon-blue/40 bg-bg-secondary'}`}
                onClick={() => setShippingMethod('desk')}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${shippingMethod === 'desk' ? 'border-neon-blue' : 'border-text-secondary'}`}>
                    {shippingMethod === 'desk' && <div className="w-2.5 h-2.5 rounded-full bg-neon-blue"></div>}
                  </div>
                  <div className="flex items-center gap-3">
                    <Truck size={20} className={shippingMethod === 'desk' ? 'text-neon-blue' : 'text-text-secondary'} />
                    <div>
                      <span className={`font-bold uppercase tracking-wider text-sm block ${shippingMethod === 'desk' ? 'text-text-primary' : 'text-text-secondary'}`}>
                        {t('checkout.stop_desk')}
                      </span>
                      <span className="text-xs text-text-secondary font-mono">توصيل للمكتب (Stop Desk)</span>
                    </div>
                  </div>
                </div>
                <span className={`font-black font-mono text-lg ${shippingMethod === 'desk' ? 'text-neon-blue' : 'text-text-primary'}`}>
                  {wilayas.find(w => w.wilaya_id === selectedWilaya)?.desk_delivery_price ?? '—'} <span className="text-xs">{t('product.currency')}</span>
                </span>
              </div>
            </div>
          </div>

          {/* STEP 3 — Personal Info */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-8 h-8 rounded-full bg-neon-blue text-black flex items-center justify-center font-mono font-black text-sm flex-shrink-0">3</div>
              <div>
                <h2 className="text-lg font-black text-text-primary font-display uppercase tracking-wider leading-none">
                  Vos Informations <span className="text-text-secondary font-normal normal-case text-base">(معلوماتك)</span>
                </h2>
                <p className="text-xs text-text-secondary font-mono mt-0.5">Nom, prénom et numéro · الاسم، اللقب، الهاتف</p>
              </div>
            </div>
            <div className="pl-12 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-text-secondary mb-2 uppercase tracking-wider font-mono">
                  Prénom <span className="text-text-secondary/60 normal-case">(الاسم)</span>
                </label>
                <input
                  type="text"
                  placeholder={language === 'ar' ? 'الاسم' : 'Prénom'}
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value.slice(0, 20))}
                  className="w-full p-4 bg-bg-secondary border-2 border-border-color text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-neon-blue font-mono text-base uppercase transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-text-secondary mb-2 uppercase tracking-wider font-mono">
                  Nom <span className="text-text-secondary/60 normal-case">(اللقب)</span>
                </label>
                <input
                  type="text"
                  placeholder={language === 'ar' ? 'اللقب' : 'Nom'}
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value.slice(0, 20))}
                  className="w-full p-4 bg-bg-secondary border-2 border-border-color text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-neon-blue font-mono text-base uppercase transition-colors"
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-text-secondary mb-2 uppercase tracking-wider font-mono">
                  Numéro de Téléphone <span className="text-text-secondary/60 normal-case">(رقم الهاتف)</span>
                </label>
                <input
                  type="tel"
                  placeholder="05XXXXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  className="w-full p-4 bg-bg-secondary border-2 border-border-color text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-neon-blue font-mono text-base uppercase transition-colors"
                  required
                />
              </div>
            </div>
          </div>

          {/* STEP 4 — Address */}
          <div className="mb-10">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-8 h-8 rounded-full bg-neon-blue text-black flex items-center justify-center font-mono font-black text-sm flex-shrink-0">4</div>
              <div>
                <h2 className="text-lg font-black text-text-primary font-display uppercase tracking-wider leading-none">
                  Adresse <span className="text-text-secondary font-normal normal-case text-base">(العنوان)</span>
                </h2>
                <p className="text-xs text-text-secondary font-mono mt-0.5">Commune et adresse complète · البلدية والعنوان</p>
              </div>
            </div>
            <div className="pl-12 space-y-4">
              <div>
                <label className="block text-xs font-bold text-text-secondary mb-2 uppercase tracking-wider font-mono">
                  Commune <span className="text-text-secondary/60 normal-case">(البلدية)</span>
                </label>
                <input
                  type="text"
                  placeholder={language === 'ar' ? 'أدخل اسم البلدية' : 'Entrez votre commune'}
                  value={municipality}
                  onChange={(e) => setMunicipality(e.target.value)}
                  className="w-full p-4 bg-bg-secondary border-2 border-border-color text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-neon-blue font-mono text-base uppercase transition-colors"
                  required
                />
              </div>

              {shippingMethod === 'home' && (
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-2 uppercase tracking-wider font-mono">
                    Adresse Complète <span className="text-text-secondary/60 normal-case">(العنوان الكامل)</span>
                  </label>
                  <textarea
                    placeholder={language === 'ar' ? 'أدخل عنوانك الكامل (الشارع، رقم المنزل، الطابق...)' : 'Entrez votre adresse complète (rue, N°, étage...)'}
                    rows={3}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full p-4 bg-bg-secondary border-2 border-border-color text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-neon-blue font-mono text-base uppercase resize-none transition-colors"
                    required={shippingMethod === 'home'}
                  />
                </div>
              )}
            </div>
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
                    <img src={(item as any).selectedVariant?.image_url || (item as any).image} alt={(item as any).name} loading="lazy" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
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
                  <span className="font-bold text-text-primary whitespace-nowrap font-mono">{Math.round(item.price * item.quantity)} {t('product.currency')}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-border-color pt-6 space-y-4">
              <div className="flex justify-between text-text-secondary font-mono text-sm">
                <span>{t('cart.subtotal')}</span>
                <span className="font-bold text-text-primary">{Math.round(cartTotal)} {t('product.currency')}</span>
              </div>
              <div className="flex justify-between text-text-secondary font-mono text-sm">
                <span>{t('checkout.shipping_cost')} ({shippingMethod === 'home' ? t('checkout.home_delivery') : t('checkout.stop_desk')})</span>
                <span className="font-bold text-text-primary">{shippingCost} {t('product.currency')}</span>
              </div>
              <div className="border-t border-border-color pt-6 flex justify-between text-xl font-bold text-text-primary font-display uppercase tracking-wider">
                <span>{t('checkout.total')}</span>
                <div className="text-right">
                  <span className="block text-xs text-text-secondary font-normal font-mono mb-1">{language === 'ar' ? 'تقريباً' : 'APPROX.'}</span>
                  <span>{Math.round(cartTotal + shippingCost)} {t('product.currency')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
