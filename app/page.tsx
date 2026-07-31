import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import HeroSlider from '@/components/landing/HeroSlider'
import StatsSection from '@/components/landing/StatsSection'
import KegiatanTabs from '@/components/landing/KegiatanTabs'
import SpmbSection from '@/components/landing/SpmbSection'
import AnnouncementSection from '@/components/home/AnnouncementSection'
import GuruStaffDirectory from '@/components/landing/GuruStaffDirectory'
import LayananPortalSection from '@/components/landing/LayananPortalSection'
import ServiceHoursSection from '@/components/home/ServiceHoursSection'
import ContactSection from '@/components/home/ContactSection'

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <HeroSlider />
        <StatsSection />
        <KegiatanTabs />
        <SpmbSection />
        <AnnouncementSection />
        <GuruStaffDirectory />
        <LayananPortalSection />
        <ServiceHoursSection />
        <ContactSection />
      </main>
      <Footer />
    </>
  )
}
