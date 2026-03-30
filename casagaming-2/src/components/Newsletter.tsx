import { ArrowRight } from 'lucide-react';

export default function Newsletter() {
  return (
    <section className="py-24 bg-neon-blue text-black relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="max-w-2xl">
            <h2 className="text-5xl md:text-7xl font-bold font-display uppercase tracking-tighter leading-[0.9] mb-6">
              Join the <br /> Cult
            </h2>
            <p className="text-lg md:text-xl font-medium max-w-md border-l-2 border-black pl-6">
              Get exclusive access to limited drops, secret sales, and the latest Casa Gaming intel.
            </p>
          </div>

          <div className="w-full max-w-md">
            <form className="flex flex-col gap-4">
              <div className="relative">
                <input 
                  type="email" 
                  placeholder="ENTER YOUR EMAIL" 
                  className="w-full bg-transparent border-b-2 border-black py-4 px-0 text-xl font-bold placeholder:text-black/50 focus:outline-none focus:border-white transition-colors uppercase font-mono"
                />
              </div>
              <button className="group flex items-center justify-between bg-black text-white px-8 py-5 uppercase font-bold tracking-widest hover:bg-white hover:text-black transition-all duration-300">
                <span>Subscribe</span>
                <ArrowRight className="group-hover:translate-x-2 transition-transform" />
              </button>
              <p className="text-xs font-mono uppercase tracking-wide opacity-60 mt-2">
                By subscribing you agree to our terms & conditions.
              </p>
            </form>
          </div>
        </div>
      </div>

      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-[500px] h-[500px] border-[20px] border-black/10 rounded-full blur-sm"></div>
      <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/4 w-[600px] h-[600px] bg-black/5 rounded-full blur-3xl"></div>
    </section>
  );
}
