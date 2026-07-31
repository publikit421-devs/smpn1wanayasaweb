'use client'

import { motion } from 'framer-motion'
import { Clock, AlertCircle } from 'lucide-react'

const schedule = [
  {
    days: 'Senin – Kamis',
    hours: '07.00 – 14.00 WIB',
    isOpen: true,
  },
  {
    days: 'Jumat',
    hours: '06.30 – 11.00 WIB',
    isOpen: true,
  },
  {
    days: 'Sabtu – Minggu',
    hours: 'Tutup',
    isOpen: false,
  },
]

export default function ServiceHoursSection() {
  return (
    <section className="py-20 bg-white" id="jam-layanan" aria-label="Jam Pelayanan">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-full bg-brand-50 border border-brand-100">
              <Clock className="w-4 h-4 text-brand-600" />
              <span className="text-sm font-600 text-brand-700">Jam Operasional</span>
            </div>
            <h2 className="section-title mb-4">
              Kapan Kami<br />
              <span className="text-brand-600">Melayani Anda?</span>
            </h2>
            <p className="section-subtitle mb-6">
              Layanan tatap muka tersedia sesuai jam operasional berikut. Untuk layanan online, Anda dapat mengajukan permohonan kapan saja melalui portal ini.
            </p>
            <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-100">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800">
                <strong>Catatan:</strong> Portal online ini tersedia 24/7. Permohonan yang masuk di luar jam kerja akan diproses pada hari kerja berikutnya.
              </p>
            </div>
          </motion.div>

          {/* Schedule Cards */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            {schedule.map((item, i) => (
              <motion.div
                key={item.days}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`
                  flex items-center justify-between p-5 rounded-2xl border-2 transition-all
                  ${item.isOpen
                    ? 'bg-gradient-to-r from-brand-50 to-white border-brand-200 shadow-sm'
                    : 'bg-slate-50 border-slate-200'
                  }
                `}
              >
                <div className="flex items-center gap-4">
                  <div className={`
                    w-10 h-10 rounded-xl flex items-center justify-center
                    ${item.isOpen ? 'bg-brand-600' : 'bg-slate-400'}
                  `}>
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className={`font-700 ${item.isOpen ? 'text-slate-800' : 'text-slate-500'}`}>
                      {item.days}
                    </p>
                    <p className={`text-sm ${item.isOpen ? 'text-brand-600 font-600' : 'text-slate-400'}`}>
                      {item.hours}
                    </p>
                  </div>
                </div>
                <span className={`
                  badge text-xs font-700
                  ${item.isOpen ? 'badge-green' : 'badge-red'}
                `}>
                  {item.isOpen ? 'Buka' : 'Tutup'}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
