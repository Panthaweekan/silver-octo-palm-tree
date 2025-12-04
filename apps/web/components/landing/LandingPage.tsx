'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Dumbbell, Apple, TrendingUp, Target, CheckCircle2, Star, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BrandIcon } from '@/components/ui/logo'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/components/providers/LanguageProvider'

export function LandingPage() {
  const { t } = useLanguage()

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl border-b border-border/40 supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BrandIcon className="w-8 h-8" />
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
              FitJourney
            </span>
          </div>
          
          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              {t('landing.nav.features')}
            </Link>
            <Link href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              {t('landing.nav.howItWorks')}
            </Link>
          </div>
          
          <div className="hidden md:flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                {t('landing.nav.login')}
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="rounded-full px-6">
                {t('landing.nav.getStarted')}
              </Button>
            </Link>
          </div>

          {/* Mobile Nav Toggle */}
          <div className="md:hidden flex items-center gap-4">
             <Link href="/login">
              <Button variant="ghost" size="sm">
                {t('landing.nav.login')}
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="rounded-full">
                {t('landing.nav.getStarted')}
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background" />
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            {t('landing.hero.newFeatures')}
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70"
          >
            {t('landing.hero.title')} <br />
            <span className="text-primary">{t('landing.hero.subtitle')}</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            {t('landing.hero.description')}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20"
          >
            <Link href="/register">
              <Button size="lg" className="h-12 px-8 rounded-full text-lg gap-2 shadow-lg shadow-primary/25">
                {t('landing.hero.startFree')} <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg" className="h-12 px-8 rounded-full text-lg backdrop-blur-sm">
                {t('landing.hero.viewDemo')}
              </Button>
            </Link>
          </motion.div>

          {/* Floating UI Mockup */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative max-w-5xl mx-auto"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-purple-600 rounded-2xl blur opacity-20" />
            <div className="relative bg-card border border-border/50 rounded-xl shadow-2xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50 bg-muted/50">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                  <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
                </div>
              </div>
              <div className="grid md:grid-cols-3 gap-6 p-6 bg-background/50 backdrop-blur-sm">
                {/* Mock Stats */}
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-card border border-border shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                        <Dumbbell className="w-5 h-5" />
                      </div>
                      <span className="font-medium">Workouts</span>
                    </div>
                    <div className="text-2xl font-bold">12</div>
                    <div className="text-sm text-muted-foreground">+2 from last week</div>
                  </div>
                  <div className="p-4 rounded-xl bg-card border border-border shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-lg bg-green-500/10 text-green-500">
                        <Apple className="w-5 h-5" />
                      </div>
                      <span className="font-medium">Calories</span>
                    </div>
                    <div className="text-2xl font-bold">1,850</div>
                    <div className="text-sm text-muted-foreground">On track today</div>
                  </div>
                </div>
                {/* Mock Chart Area */}
                <div className="md:col-span-2 p-6 rounded-xl bg-card border border-border shadow-sm flex items-center justify-center min-h-[200px]">
                  <div className="w-full space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                      <div className="h-8 w-24 bg-primary/10 rounded-lg" />
                    </div>
                    <div className="flex items-end gap-2 h-32 pt-4">
                      {[40, 70, 45, 90, 65, 85, 55].map((h, i) => (
                        <div key={i} className="flex-1 bg-primary/20 rounded-t-lg relative group overflow-hidden" style={{ height: `${h}%` }}>
                          <div className="absolute inset-0 bg-primary/40 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('landing.features.title')}</h2>
            <p className="text-muted-foreground text-lg">
              {t('landing.features.subtitle')}
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <FeatureCard
              icon={<Dumbbell className="w-6 h-6" />}
              title={t('landing.features.smartTracking.title')}
              description={t('landing.features.smartTracking.desc')}
              className="md:col-span-2"
            />
            <FeatureCard
              icon={<Apple className="w-6 h-6" />}
              title={t('landing.features.nutrition.title')}
              description={t('landing.features.nutrition.desc')}
            />
            <FeatureCard
              icon={<TrendingUp className="w-6 h-6" />}
              title={t('landing.features.analytics.title')}
              description={t('landing.features.analytics.desc')}
            />
            <FeatureCard
              icon={<Target className="w-6 h-6" />}
              title={t('landing.features.goals.title')}
              description={t('landing.features.goals.desc')}
              className="md:col-span-2"
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('landing.howItWorks.title')}</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-12 relative">
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-transparent via-border to-transparent -z-10" />
            
            <StepCard
              number="01"
              title={t('landing.howItWorks.step1.title')}
              description={t('landing.howItWorks.step1.desc')}
            />
            <StepCard
              number="02"
              title={t('landing.howItWorks.step2.title')}
              description={t('landing.howItWorks.step2.desc')}
            />
            <StepCard
              number="03"
              title={t('landing.howItWorks.step3.title')}
              description={t('landing.howItWorks.step3.desc')}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden bg-primary">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/10 to-transparent -z-10" />
        <div className="container mx-auto px-4 text-center text-primary-foreground">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">{t('landing.cta.title')}</h2>
          <p className="text-xl text-primary-foreground/80 mb-10 max-w-2xl mx-auto">
            {t('landing.cta.desc')}
          </p>
          <Link href="/login">
            <Button size="lg" variant="secondary" className="h-14 px-10 rounded-full text-lg font-semibold shadow-xl">
              {t('landing.cta.button')}
            </Button>
          </Link>
          <p className="mt-6 text-sm text-primary-foreground/60">
            {t('landing.cta.note')}
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border bg-background">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <BrandIcon className="w-6 h-6" />
                <span className="text-lg font-bold">FitJourney</span>
              </div>
              <p className="text-muted-foreground max-w-xs">
                {t('landing.footer.tagline')}
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">{t('landing.footer.product')}</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-primary">{t('landing.nav.features')}</Link></li>
                <li><Link href="#" className="hover:text-primary">{t('landing.footer.pricing')}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">{t('landing.footer.company')}</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-primary">{t('landing.footer.about')}</Link></li>
                <li><Link href="#" className="hover:text-primary">{t('landing.footer.blog')}</Link></li>
                <li><Link href="#" className="hover:text-primary">{t('landing.footer.careers')}</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p>© 2025 FitJourney. All rights reserved.</p>
            <div className="flex gap-6">
              <Link href="#" className="hover:text-foreground">{t('landing.footer.privacy')}</Link>
              <Link href="#" className="hover:text-foreground">{t('landing.footer.terms')}</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description, className }: { icon: React.ReactNode, title: string, description: string, className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -5 }}
      className={cn("p-6 rounded-2xl bg-card border border-border shadow-sm hover:shadow-md transition-all", className)}
    >
      <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </motion.div>
  )
}

function StepCard({ number, title, description }: { number: string, title: string, description: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="text-center relative bg-background p-6 rounded-2xl"
    >
      <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground text-xl font-bold flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary/20">
        {number}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </motion.div>
  )
}
