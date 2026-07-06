import React from 'react'

import type { Page } from '@/payload-types'

import { HighImpactHero } from '@/modules/pages/blocks/hero/components/high-impact-hero/high-impact-hero.component'
import { MediumImpactHero } from '@/modules/pages/blocks/hero/components/medium-impact-hero/medium-impact-hero.component'

const heroes = {
  highImpact: HighImpactHero,
  mediumImpact: MediumImpactHero,
}

export const RenderHero: React.FC<Page['hero']> = (props) => {
  const { type } = props || {}

  if (!type || type === 'none') return null

  const HeroToRender = heroes[type]

  if (!HeroToRender) return null

  return <HeroToRender {...props} />
}
