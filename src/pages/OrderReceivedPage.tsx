import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, Package, Truck, ArrowRight, ShoppingBag } from 'lucide-react';
import { turso } from '../lib/turso';
import LoadingSpinner from '../components/LoadingSpinner';

export default function OrderReceivedPage() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order_id');
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        setLoading(false);
        return;
      }

      try {
        const orderResult = await turso.execute({
          sql: 'SELECT * FROM orders WHERE id = ?',
          args: [orderId],
        });

        if (orderResult.rows.length === 0) {
          setLoading(false);
          return;
        }

        const orderCols = orderResult.columns;
        const orderRow = orderResult.rows[0] as any[];
        const orderObj: any = {};
        orderCols.forEach((col, i) => { orderObj[col] = orderRow[i]; });

        const itemsResult = await turso.execute({
          sql: `SELECT oi.id, oi.quantity, oi.price, oi.variant_id,
                       p.name_en AS product_name, p.image_url AS product_image,
                       pv.name_en AS variant_name, pv.image_url AS variant_image
                FROM order_items oi
                LEFT JOIN products p ON oi.product_id = p.id
                LEFT JOIN product_variants pv ON oi.variant_id = pv.id
                WHERE oi.order_id = ?`,
          args: [orderId],
        });

        const orderItems = itemsResult.rows.map((row: any) => ({
          id: row[0],
          quantity: row[1],
          price: row[2],
          variant_id: row[3],
          products: { name_en: row[4], image_url: row[5] },
          product_variants: row[3] ? { name_en: row[6], image_url: row[7] } : null,
        }));

        setOrder({ ...orderObj, order_items: orderItems });
      } catch (err) {
        console.error('Error fetching order details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return <div className="pt-32 pb-20 min-h-screen bg-bg-primary"><LoadingSpinner /></div>;
  }

  if (!order) {
    return (
      <div className="pt-32 pb-20 px-4 text-center min-h-screen bg-bg-primary flex flex-col justify-center items-center">
        <h2 className="text-3xl font-bold text-text-primary font-display uppercase tracking-tighter mb-4">Order Not Found</h2>
        <p className="text-text-secondary mb-8">We couldn't retrieve your order details. Please contact support if you believe this is an error.</p>
        <Link to="/" className="bg-text-primary text-bg-primary px-8 py-3 font-bold uppercase tracking-widest hover:bg-neon-blue hover:text-black transition-all">
          Return to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto transition-colors duration-300 min-h-screen bg-bg-primary">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-neon-blue/10 rounded-full mb-6 border-2 border-neon-blue/20">
          <CheckCircle size={40} className="text-neon-blue" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-text-primary font-display uppercase tracking-tighter mb-4">Order Received!</h1>
        <p className="text-text-secondary text-lg">Thank you for your purchase. Your order is being processed.</p>
        <p className="text-neon-blue font-mono mt-2 font-bold uppercase tracking-wider">Order ID: #{order.id?.toString().slice(0, 8) || 'N/A'}</p>
      </div>

      <div className="bg-bg-secondary p-8 border border-border-color mb-8">
        <h2 className="text-xl font-bold text-text-primary mb-6 font-display uppercase tracking-wider border-b border-border-color pb-2 flex items-center gap-2">
          <ShoppingBag size={20} className="text-neon-purple" /> Order Summary
        </h2>

        <div className="space-y-4 mb-8">
          {order.order_items?.map((item: any) => {
            const images = Array.isArray(item.products?.image_url) ? item.products.image_url : [item.products?.image_url];
            const displayImage = item.product_variants?.image_url || images[0];
            return (
              <div key={item.id} className="flex items-center gap-4 text-sm font-mono uppercase pb-2 border-b border-border-color last:border-0">
                {displayImage && (
                  <img
                    src={displayImage}
                    alt=""
                    className="w-12 h-12 object-cover border border-border-color bg-bg-primary"
                    style={{ imageRendering: '-webkit-optimize-contrast' }}
                  />
                )}
                <div className="flex-1">
                  <span className="text-text-secondary">
                    {item.products?.name_en || 'Product'} {item.product_variants ? `- ${item.product_variants.name_en}` : ''} x{item.quantity}
                  </span>
                </div>
                <span className="text-text-primary font-bold">{(item.price * item.quantity)} DA</span>
              </div>
            );
          })}
        </div>

        <div className="border-t border-border-color pt-6 space-y-3">
          <div className="flex justify-between text-text-secondary font-mono text-xs uppercase">
            <span>Subtotal</span>
            <span className="text-text-primary">
              {(order.order_items?.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0) || 0)} DA
            </span>
          </div>
          <div className="flex justify-between text-text-secondary font-mono text-xs uppercase">
            <span>Shipping</span>
            <span className="text-text-primary">{order.shipping_price} DZD</span>
          </div>
          <div className="border-t border-border-color pt-3 flex justify-between text-xl font-bold text-text-primary font-display uppercase tracking-wider">
            <span>Total</span>
            <div className="text-right">
              <span className="block text-xs text-text-secondary font-normal font-mono">APPROX.</span>
              <span>{(order.total_price || 0)} DA</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <div className="bg-bg-secondary p-6 border border-border-color">
          <h3 className="font-bold text-text-primary mb-4 uppercase tracking-wider text-sm flex items-center gap-2 font-display">
            <Truck size={18} className="text-neon-blue" /> Shipping Method
          </h3>
          <p className="text-text-secondary text-sm font-mono uppercase">{order.shipping_method === 'home' ? 'Home Delivery' : 'Stop Desk'}</p>
        </div>
        <div className="bg-bg-secondary p-6 border border-border-color">
          <h3 className="font-bold text-text-primary mb-4 uppercase tracking-wider text-sm flex items-center gap-2 font-display">
            <Package size={18} className="text-neon-purple" /> Shipping Address
          </h3>
          <p className="text-text-secondary text-sm font-mono uppercase">{order.address}, {order.commune}</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <Link to="/products" className="flex-1 bg-bg-secondary border border-border-color text-text-primary px-8 py-4 font-bold uppercase tracking-widest hover:bg-text-primary/10 transition-all text-center">
          Continue Shopping
        </Link>
        <Link to="/" className="flex-1 bg-text-primary text-bg-primary px-8 py-4 font-bold uppercase tracking-widest hover:bg-neon-blue hover:text-black transition-all text-center flex items-center justify-center gap-2 group">
          Back to Home <ArrowRight className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
