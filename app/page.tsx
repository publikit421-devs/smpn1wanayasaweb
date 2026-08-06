import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import SmartIntroLoader from '@/components/SmartIntroLoader'
import HeroSlider from '@/components/landing/HeroSlider'
import StatsSection from '@/components/landing/StatsSection'
import StudentStatsSection from '@/components/landing/StudentStatsSection'
import KegiatanTabs from '@/components/landing/KegiatanTabs'
import SpmbSection from '@/components/landing/SpmbSection'
import AnnouncementSection from '@/components/home/AnnouncementSection'
import GallerySection from '@/components/landing/GallerySection'
import GuruStaffDirectory from '@/components/landing/GuruStaffDirectory'
import LayananPortalSection from '@/components/landing/LayananPortalSection'
import ServiceHoursSection from '@/components/home/ServiceHoursSection'
import ContactSection from '@/components/home/ContactSection'

export default function HomePage() {
  return (
    <>
      <SmartIntroLoader />
      <Header />
      <main>
        <HeroSlider />
        <StatsSection />
        <StudentStatsSection />
        <KegiatanTabs />
        <SpmbSection />
        <AnnouncementSection />
        <GallerySection />
        <GuruStaffDirectory />
        <LayananPortalSection />
        <ServiceHoursSection />
        <ContactSection />
      </main>
      <Footer />
    </>
  )
}
