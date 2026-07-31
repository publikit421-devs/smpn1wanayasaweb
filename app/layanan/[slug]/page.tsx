import { notFound } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import ServiceForm from '@/components/layanan/ServiceForm'
import { services } from '@/lib/services'
import type { ServiceType } from '@/lib/supabase'
import { ArrowLeft, Clock, CheckCircle, Info } from 'lucide-react'

// Extra fields for each service type
const serviceExtraFields: Record<string, Array<{
  id: string
  name: string
  label: string
  type: 'text' | 'textarea' | 'select' | 'email' | 'tel' | 'date'
  placeholder?: string
  required?: boolean
  options?: string[]
  rows?: number
}>> = {
  'informasi-publik': [
    {
      id: 'informasi_diminta',
      name: 'informasi_diminta',
      label: 'Informasi yang Diminta',
      type: 'textarea',
      placeholder: 'Jelaskan informasi apa yang Anda butuhkan secara spesifik...',
      required: true,
      rows: 4,
    },
    {
      id: 'tujuan_penggunaan',
      name: 'tujuan_penggunaan',
      label: 'Tujuan Penggunaan Informasi',
      type: 'select',
      required: true,
      options: ['Keperluan Pribadi', 'Penelitian / Akademik', 'Kebutuhan Hukum', 'Keperluan Instansi', 'Lainnya'],
    },
    {
      id: 'cara_perolehan',
      name: 'cara_perolehan',
      label: 'Cara Memperoleh Informasi',
      type: 'select',
      required: true,
      options: ['Email', 'Datang Langsung ke Sekolah', 'Surat Fisik'],
    },
  ],
  'pengaduan': [
    {
      id: 'jenis_pengaduan',
      name: 'jenis_pengaduan',
      label: 'Jenis Pengaduan',
      type: 'select',
      required: true,
      options: ['Pelayanan Administrasi', 'Fasilitas Sekolah', 'Tenaga Pendidik', 'Keamanan & Ketertiban', 'Pungutan Liar', 'Lainnya'],
    },
    {
      id: 'isi_pengaduan',
      name: 'isi_pengaduan',
      label: 'Uraian Pengaduan',
      type: 'textarea',
      placeholder: 'Jelaskan pengaduan Anda secara detail, termasuk waktu kejadian, lokasi, dan pihak yang terlibat...',
      required: true,
      rows: 5,
    },
    {
      id: 'harapan_pemohon',
      name: 'harapan_pemohon',
      label: 'Harapan / Tindak Lanjut yang Diinginkan',
      type: 'textarea',
      placeholder: 'Apa yang Anda harapkan dari pengaduan ini?',
      rows: 3,
    },
  ],
  'legalisasi-ijazah': [
    {
      id: 'nama_siswa',
      name: 'nama_siswa',
      label: 'Nama Siswa (sesuai ijazah)',
      type: 'text',
      placeholder: 'Nama lengkap sesuai ijazah',
      required: true,
    },
    {
      id: 'tahun_lulus',
      name: 'tahun_lulus',
      label: 'Tahun Lulus',
      type: 'select',
      required: true,
      options: Array.from({ length: 30 }, (_, i) => String(new Date().getFullYear() - i)),
    },
    {
      id: 'jumlah_lembar',
      name: 'jumlah_lembar',
      label: 'Jumlah Lembar Legalisasi',
      type: 'select',
      required: true,
      options: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
    },
    {
      id: 'keperluan',
      name: 'keperluan',
      label: 'Keperluan Legalisasi',
      type: 'text',
      placeholder: 'Contoh: Melamar kerja, melanjutkan pendidikan, dll.',
      required: true,
    },
  ],
  'izin-siswa': [
    {
      id: 'nama_siswa_izin',
      name: 'nama_siswa_izin',
      label: 'Nama Siswa',
      type: 'text',
      placeholder: 'Nama lengkap siswa',
      required: true,
    },
    {
      id: 'kelas',
      name: 'kelas',
      label: 'Kelas',
      type: 'select',
      required: true,
      options: ['VII-A', 'VII-B', 'VII-C', 'VII-D', 'VII-E', 'VIII-A', 'VIII-B', 'VIII-C', 'VIII-D', 'VIII-E', 'IX-A', 'IX-B', 'IX-C', 'IX-D', 'IX-E'],
    },
    {
      id: 'tanggal_izin',
      name: 'tanggal_izin',
      label: 'Tanggal Izin',
      type: 'date',
      required: true,
    },
    {
      id: 'alasan_izin',
      name: 'alasan_izin',
      label: 'Alasan / Keperluan',
      type: 'select',
      required: true,
      options: ['Sakit', 'Keperluan Keluarga', 'Kegiatan Lomba / Kompetisi', 'Urusan Kesehatan', 'Lainnya'],
    },
    {
      id: 'keterangan_tambahan',
      name: 'keterangan_tambahan',
      label: 'Keterangan Tambahan',
      type: 'textarea',
      placeholder: 'Informasi tambahan jika diperlukan...',
      rows: 2,
    },
  ],
  'penelitian': [
    {
      id: 'institusi_asal',
      name: 'institusi_asal',
      label: 'Institusi / Universitas / Lembaga',
      type: 'text',
      placeholder: 'Nama institusi asal peneliti',
      required: true,
    },
    {
      id: 'judul_penelitian',
      name: 'judul_penelitian',
      label: 'Judul Penelitian / Kegiatan',
      type: 'text',
      placeholder: 'Judul penelitian atau observasi',
      required: true,
    },
    {
      id: 'tujuan_penelitian',
      name: 'tujuan_penelitian',
      label: 'Tujuan & Deskripsi Kegiatan',
      type: 'textarea',
      placeholder: 'Jelaskan tujuan, metodologi, dan rencana kegiatan...',
      required: true,
      rows: 4,
    },
    {
      id: 'tanggal_rencana',
      name: 'tanggal_rencana',
      label: 'Tanggal Rencana Kegiatan',
      type: 'date',
      required: true,
    },
    {
      id: 'jumlah_peserta',
      name: 'jumlah_peserta',
      label: 'Jumlah Peserta / Peneliti',
      type: 'text',
      placeholder: 'Contoh: 3 orang',
      required: true,
    },
  ],
  'mutasi-siswa': [
    {
      id: 'jenis_mutasi',
      name: 'jenis_mutasi',
      label: 'Jenis Mutasi',
      type: 'select',
      required: true,
      options: ['Mutasi Masuk (dari sekolah lain ke SMPN 1 Wanayasa)', 'Mutasi Keluar (dari SMPN 1 Wanayasa ke sekolah lain)'],
    },
    {
      id: 'nama_siswa_mutasi',
      name: 'nama_siswa_mutasi',
      label: 'Nama Siswa',
      type: 'text',
      placeholder: 'Nama lengkap siswa',
      required: true,
    },
    {
      id: 'asal_sekolah',
      name: 'asal_sekolah',
      label: 'Sekolah Asal / Tujuan',
      type: 'text',
      placeholder: 'Nama sekolah asal (mutasi masuk) atau tujuan (mutasi keluar)',
      required: true,
    },
    {
      id: 'kelas_mutasi',
      name: 'kelas_mutasi',
      label: 'Kelas yang Dituju / Ditinggalkan',
      type: 'select',
      required: true,
      options: ['VII', 'VIII', 'IX'],
    },
    {
      id: 'alasan_mutasi',
      name: 'alasan_mutasi',
      label: 'Alasan Mutasi',
      type: 'textarea',
      placeholder: 'Jelaskan alasan mutasi...',
      required: true,
      rows: 3,
    },
  ],
}

const syaratMap: Record<string, string[]> = {
  'informasi-publik': ['Mengisi formulir permohonan dengan lengkap', 'Menyertakan identitas pemohon (KTP/Kartu Pelajar)', 'Menyebutkan informasi yang diminta secara spesifik'],
  'pengaduan': ['Mengisi formulir pengaduan dengan lengkap dan jujur', 'Menyertakan identitas pelapor', 'Bukti pendukung (jika ada)'],
  'legalisasi-ijazah': ['Membawa ijazah asli', 'Mengisi formulir permohonan', 'Datang langsung ke sekolah pada jam pelayanan'],
  'izin-siswa': ['Mengisi formulir izin', 'Diajukan oleh orang tua / wali siswa', 'Melampirkan surat keterangan dokter (jika sakit)'],
  'penelitian': ['Surat pengantar dari institusi', 'Proposal penelitian', 'Identitas peneliti (KTP/KTM)', 'Mengisi formulir permohonan'],
  'mutasi-siswa': ['Surat permohonan dari orang tua', 'Surat keterangan dari sekolah asal', 'Fotokopi rapor terakhir', 'Kartu Keluarga', 'Akta Kelahiran'],
}

export function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }))
}

export async function generateMetadata(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params
  const service = services.find((s) => s.slug === slug)
  if (!service) return {}
  return {
    title: `Layanan ${service.title}`,
    description: service.description,
  }
}

export default async function LayananDetailPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params
  const service = services.find((s) => s.slug === slug)
  if (!service) notFound()

  const ServiceIcon = service.icon
  const extraFields = serviceExtraFields[slug] || []
  const syarat = syaratMap[slug] || []

  return (
    <>
      <Header />
      <main className="pt-20 min-h-screen bg-slate-50">
        {/* Page Banner */}
        <div className={`bg-gradient-to-r ${service.color} py-12`}>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link
              href="/layanan"
              className="inline-flex items-center gap-2 text-white/80 hover:text-white text-sm mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali ke Daftar Layanan
            </Link>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                <ServiceIcon className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-800 text-white">
                  Layanan {service.title}
                </h1>
                <p className="text-white/80 text-sm mt-1">{service.description}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Sidebar Info */}
            <div className="space-y-4">
              {/* Estimasi */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-4 h-4 text-brand-600" />
                  <h2 className="text-sm font-700 text-slate-700">Estimasi Waktu</h2>
                </div>
                <p className={`text-lg font-800 ${service.lightText}`}>
                  {service.estimasi}
                </p>
                <p className="text-xs text-slate-400 mt-1">Terhitung sejak berkas dinyatakan lengkap</p>
              </div>

              {/* Syarat */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <Info className="w-4 h-4 text-brand-600" />
                  <h2 className="text-sm font-700 text-slate-700">Persyaratan</h2>
                </div>
                <ul className="space-y-2">
                  {syarat.map((s, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-xs text-slate-600">{s}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Biaya */}
              <div className="bg-green-50 border border-green-200 rounded-2xl p-5">
                <p className="text-sm font-700 text-green-800 mb-1">Biaya Layanan</p>
                <p className="text-2xl font-800 text-green-700">GRATIS</p>
                <p className="text-xs text-green-600 mt-1">Tidak ada biaya yang dipungut</p>
              </div>
            </div>

            {/* Form */}
            <div className="md:col-span-2">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <h2 className="text-lg font-700 text-slate-800 mb-6">Formulir Permohonan</h2>
                <ServiceForm
                  serviceType={slug as ServiceType}
                  serviceTitle={service.title}
                  extraFields={extraFields}
                  estimasi={`Estimasi: ${service.estimasi}`}
                />
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
