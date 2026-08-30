'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { ScrollFadeIn } from '@/components/ScrollFadeIn';
import { LiquidGlassCard } from '@/components/ui/LiquidGlassCard';
import { useTeamMembers } from '@/features/team/hooks/useTeamMembers';
import { useLocale } from '@/i18n/LocaleProvider';

const SPRING_TRANSITION = { type: 'spring' as const, stiffness: 120, damping: 20, mass: 0.8 };

const fallbackTeam = [
  { name: 'Ahmed Al-Rashid', role: 'Founder & Creative Director', department: 'Leadership', skills: ['3D Visualization', 'Creative Direction', 'Architecture'] },
  { name: 'Sara Mitchell', role: 'Head of 3D Production', department: 'Production', skills: ['Unreal Engine', '3ds Max', 'Lighting Design'] },
  { name: 'Li Wei', role: 'AI & Technology Lead', department: 'Technology', skills: ['Machine Learning', 'Python', 'Neural Rendering'] },
  { name: 'Elena Popova', role: 'Art Director', department: 'Design', skills: ['Concept Art', 'Material Design', 'Color Theory'] },
];

export const TeamSection = () => {
  const { t } = useLocale();
  const { data } = useTeamMembers();

  const team = (data?.teamMembers && data.teamMembers.length > 0 ? data.teamMembers : fallbackTeam).map((m) => ({
    name: m.name,
    role: m.role,
    department: m.department || '',
    avatar: 'avatar' in m ? (m as { avatar?: string }).avatar : undefined,
    skills: m.skills || [],
  }));

  return (
    <section className="px-8 md:px-16 py-32">
      <ScrollFadeIn className="mb-20 text-center">
        <span className="text-xs uppercase tracking-[0.5em] text-sl-mist/60 mb-6 block">
          {t('footer.connect')}
        </span>
        <h2 className="text-5xl md:text-7xl font-serif font-light tracking-tight text-sl-alabaster leading-tight">
          The <span className="italic text-sl-gold-hover">Team</span>
        </h2>
      </ScrollFadeIn>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
        {team.map((member, idx) => (
          <ScrollFadeIn key={member.name} delay={idx * 0.1}>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ ...SPRING_TRANSITION, delay: idx * 0.1 }}
            >
              <LiquidGlassCard glow className="p-6 group">
                <div className="w-full aspect-square rounded-xl bg-sl-void mb-6 overflow-hidden">
                  {member.avatar ? (
                    <Image src={member.avatar} alt={member.name} width={300} height={300} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl font-serif text-neutral-700">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </div>
                  )}
                </div>
                <h3 className="text-lg font-medium text-sl-alabaster mb-1 group-hover:text-sl-gold-hover transition-colors duration-500">{member.name}</h3>
                <p className="text-sm text-sl-gold-hover mb-1">{member.role}</p>
                {member.department && (
                  <p className="text-xs text-sl-mist/60 mb-3">{member.department}</p>
                )}
                <div className="flex flex-wrap gap-1.5">
                  {member.skills.slice(0, 3).map((skill) => (
                    <span key={skill} className="text-[10px] uppercase tracking-wider text-sl-mist/60 border border-sl-obsidian rounded-full px-2 py-0.5 group-hover:border-sl-gold-subtle/30 transition-colors duration-500">
                      {skill}
                    </span>
                  ))}
                </div>
              </LiquidGlassCard>
            </motion.div>
          </ScrollFadeIn>
        ))}
      </div>
    </section>
  );
};
