import { AnimatedCounter } from './AnimatedCounter'
import { FadeInSection } from './FadeInSection'

export function StatsSection() {
  const stats = [
    { value: 10, suffix: ' Years', label: 'Sweetening Port Harcourt' },
    { value: 50, suffix: '+', label: 'Students Trained' },
  ]

  return (
    <section className="bg-stone-900 px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-2xl grid-cols-1 gap-10 text-center sm:grid-cols-2">
        {stats.map((stat, i) => (
          <FadeInSection key={stat.label} delay={i * 0.15}>
            <p className="text-4xl font-bold text-white sm:text-5xl">
              <AnimatedCounter value={stat.value} suffix={stat.suffix} />
            </p>
            <p className="mt-2 text-sm font-medium text-stone-300">{stat.label}</p>
          </FadeInSection>
        ))}
      </div>
    </section>
  )
}
