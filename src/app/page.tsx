import { HeroSection } from '@/components/home/HeroSection'
import { StatsSection } from '@/components/home/StatsSection'
import { FeaturedCompetitionsSection } from '@/components/home/FeaturedCompetitionsSection'
import { AboutTaakraSection } from '@/components/home/AboutTaakraSection'
import { HomeFooter } from '@/components/home/HomeFooter'
import { theme } from '../../theme'

export default async function Home() {
  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: theme.colors.darkIce }}>
      <HeroSection />
      <StatsSection />
      <FeaturedCompetitionsSection />
      <AboutTaakraSection />
      <HomeFooter />
    </div>
  )
}
