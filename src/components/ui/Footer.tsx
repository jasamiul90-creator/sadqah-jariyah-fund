import React from 'react';
import { HeartHandshake, ShieldCheck, Moon, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-emerald-950 text-white mt-auto border-t border-emerald-900/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center text-center md:text-left">
          {/* Column 1: Fund Info */}
          <div>
            <div className="flex items-center justify-center md:justify-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-800 flex items-center justify-center text-emerald-300">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-lg text-emerald-100">সদকায়ে জারিয়া মাসিক ফান্ড</h3>
            </div>
            <p className="text-emerald-300/80 text-sm leading-relaxed max-w-sm">
              প্রতিটি অবদান হোক কল্যাণের পথে। ২৫ জন সদস্যের আন্তরিক ঐক্য ও মাসিক দানের মাধ্যমে কল্যাণমূলক মানবিক কার্যক্রম।
            </p>
          </div>

          {/* Column 2: Islamic Ayah / Hadith */}
          <div className="bg-emerald-900/50 p-5 rounded-2xl border border-emerald-800/60 text-center">
            <div className="flex items-center justify-center gap-1.5 text-amber-300 text-xs font-semibold mb-2">
              <Moon className="w-4 h-4 fill-amber-300/20" />
              <span>পবিত্র কুরআন ও হাদিসের বাণী</span>
            </div>
            <p className="text-xs sm:text-sm text-emerald-100 italic leading-relaxed">
              &quot;মানুষ যখন মৃত্যুবরণ করে তখন তার সমস্ত আমল বন্ধ হয়ে যায়, তিনটি আমল ব্যতীত: সদকায়ে জারিয়া, উপকারী জ্ঞান অথবা এমন সৎ সন্তান যে তার জন্য দোয়া করে।&quot;
            </p>
            <p className="text-[11px] text-emerald-400 mt-2 font-medium">
              — সহীহ মুসলিম: ১৬৩১
            </p>
          </div>

          {/* Column 3: Trust & Administration */}
          <div className="md:text-right text-xs text-emerald-300/80 space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-900 border border-emerald-800 text-emerald-200 text-xs font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>নিরাপদ ও স্বচ্ছ আর্থিক হিসাব ব্যবস্থা</span>
            </div>
            <p>প্রধান পরিচালক ও তত্ত্বাবধায়ক: <strong className="text-white">Md Samiul Islam</strong></p>
            <p className="text-[11px] text-emerald-400">Next.js & Supabase আরএলএস (Row Level Security) সুরক্ষিত</p>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-emerald-900/80 flex flex-col sm:flex-row items-center justify-between text-xs text-emerald-400 gap-3">
          <p>© {new Date().getFullYear()} সদকায়ে জারিয়া মাসিক ফান্ড (Sadqah Jariyah Monthly Fund). সর্বস্বত্ব সংরক্ষিত।</p>
          <div className="flex items-center gap-1 text-emerald-300">
            <span>সততা ও স্বচ্ছতার সাথে পরিচালিত</span>
            <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
          </div>
        </div>
      </div>
    </footer>
  );
}
