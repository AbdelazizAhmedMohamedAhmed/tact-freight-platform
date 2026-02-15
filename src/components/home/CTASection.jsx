import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { Button } from "@/components/ui/button";
import { ArrowRight, Phone } from 'lucide-react';

export default function CTASection() {
  return (
    <section className="py-24 bg-[#D50000] relative overflow-hidden">
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1920&q=80"
          alt=""
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#D50000] via-[#D50000]/95 to-[#D50000]" />
      </div>
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-5xl font-black text-white leading-tight">
          Ready to Ship?<br />Let's Move Your Cargo.
        </h2>
        <p className="mt-6 text-white/80 text-lg max-w-xl mx-auto">
          Get a competitive quote in minutes. Our team is ready to handle your next shipment.
        </p>
        <div className="flex flex-wrap justify-center gap-4 mt-10">
          <Link to={createPageUrl('RequestQuote')}>
            <Button size="lg" className="bg-white text-[#D50000] hover:bg-gray-100 h-14 px-10 text-base font-bold rounded-xl">
              Get a Free Quote
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
          <a href="tel:+20204042643">
            <Button size="lg" variant="outline" className="border-white/40 text-white hover:bg-white/10 h-14 px-10 text-base rounded-xl">
              <Phone className="w-5 h-5 mr-2" />
              Call Us Now
            </Button>
          </a>
        </div>
      </div>
    </section>
  );
}