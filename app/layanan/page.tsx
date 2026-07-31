import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'
import { services } from '@/lib/services'
import { ArrowRight, Clock, CheckCircle } from 'lucide-react'

export const metadata = {
  title: 'Portal Layanan Publik',
  description: 'Akses 6 layanan publik SMPN 1 Wanayasa secara online: informasi publik, pengaduan, legalisasi ijazah, izin siswa, penelitian, dan mutasi siswa.',
}

export default function LayananPage() {
  return (
    <>
      <Header />
      <main className="pt-20 min-h-screen bg-slate-50">
        {/* Page Header */}
        <div className="gradient-hero py-16 md:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-3xl md:text-4xl font-800 text-white mb-4">
              Portal Layanan Publik
            </h1>
            <p className="text-blue-100 text-lg max-w-2xl mx-auto">
              Pilih jenis layanan yang Anda butuhkan. Semua layanan gratis dan dapat diajukan secara online.
            </p>
          </div>
        </div>

        {/* Services */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          {/* Info Banner */}
          <div className="flex items-start gap-3 p-4 mb-10 bg-blue-50 border border-blue-200 rounded-xl">
            <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-600 text-blue-800">Semua layanan gratis dan transparan</p>
              <p className="text-xs text-blue-600 mt-0.5">
                Setelah mengajukan permohonan, Anda akan mendapatkan nomor registrasi untuk memantau status.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => {
              const ServiceIcon = service.icon
              return (
                <Link
                  key={service.slug}
                  href={`/layanan/${service.slug}`}
                  id={`layanan-card-${service.slug}`}
                  className={`
                    block p-6 rounded-2xl border-2 bg-white card-hover shadow-sm
                    hover:border-transparent hover:shadow-lg group ${service.borderColor}
                  `}
                >
                  <div className={`
                    w-12 h-12 rounded-xl bg-gradient-to-br ${service.color}
                    flex items-center justify-center mb-4 shadow-sm
                    group-hover:scale-110 transition-transform duration-200
                  `}>
                    <ServiceIcon className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-base font-700 text-slate-800 mb-2">{service.title}</h2>
                  <p className="text-sm text-slate-500 leading-relaxed mb-4">{service.description}</p>
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-600 ${service.lightText} ${service.lightBg} px-2.5 py-1 rounded-full`}>
                      <Clock className="w-3 h-3" />
                      Est. {service.estimasi}
                    </span>
                    <span className="flex items-center gap-1 text-xs font-600 text-slate-500 group-hover:text-brand-600 transition-colors">
                      Ajukan Sekarang
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
