import * as React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, Download, ShoppingCart } from 'lucide-react'
import { cn } from '@utils/index'
import { formatPrice, getWhatsAppLink, generateCreatorId } from '@utils/index'
import { Badge } from '@ui/badge'
import { Button } from '@ui/button'
import type { Project } from '@ig-types/index'

const DIFFICULTY_CONFIG: Record<
  string,
  { label: string; className: string }
> = {
  beginner: {
    label: 'Beginner',
    className: 'bg-green-100 text-green-700',
  },
  intermediate: {
    label: 'Intermediate',
    className: 'bg-amber-100 text-amber-700',
  },
  advanced: {
    label: 'Advanced',
    className: 'bg-red-100 text-red-700',
  },
}

export interface ProjectCardProps {
  project: Project
  variant?: 'default' | 'compact'
  index?: number
  className?: string
}

const CompactProjectCard = React.memo(function CompactProjectCard({
  project,
  index = 0,
  className,
}: Omit<ProjectCardProps, 'variant'>) {
  const whatsAppLink = getWhatsAppLink(project.title, project.price)

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05, ease: 'easeOut' }}
      className={cn(
        'group flex items-center gap-3 bg-white border border-slate-100 rounded-2xl p-3 shadow-card',
        'hover:-translate-y-1 hover:shadow-card-hover transition-all duration-300',
        className
      )}
    >
      <div className="relative w-20 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-slate-100 to-slate-200">
        {project.screenshots?.[0] ? (
          <img
            src={project.screenshots?.[0]}
            alt={project.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-sora font-bold text-sm text-primary line-clamp-1 leading-snug">
          {project.title}
        </p>
        <p className="text-accent font-bold text-sm mt-0.5">
          {formatPrice(project.price)}
        </p>
      </div>

      <Button
        variant="success"
        size="sm"
        className="flex-shrink-0 text-xs px-3"
        onClick={(e) => {
          e.preventDefault()
          window.open(whatsAppLink, '_blank', 'noopener,noreferrer')
        }}
      >
        Buy
      </Button>
    </motion.div>
  )
})

const DefaultProjectCard = React.memo(function DefaultProjectCard({
  project,
  index = 0,
  className,
}: Omit<ProjectCardProps, 'variant'>) {
  const whatsAppLink = getWhatsAppLink(project.title, project.price)
  const difficultyConf =
    DIFFICULTY_CONFIG[project.difficulty?.toLowerCase() ?? ''] ??
    DIFFICULTY_CONFIG['beginner']

  const techs: string[] = project.technologies ?? []
  const visibleTechs = techs.slice(0, 3)
  const extraTechCount = techs.length - 3

  const _creatorDisplayId = generateCreatorId(project.id)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.07, ease: 'easeOut' }}
      className={cn(
        'group relative flex flex-col bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-card',
        'hover:-translate-y-1 hover:shadow-card-hover transition-all duration-300',
        className
      )}
    >
      <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 flex-shrink-0">
        {project.screenshots?.[0] ? (
          <img
            src={project.screenshots?.[0]}
            alt={project.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200" />
        )}

        <div className="absolute top-2 right-2 flex flex-col items-end gap-1.5 pointer-events-none">
          {project.isNew && (
            <Badge variant="new" className="text-[10px] px-2 py-0.5 shadow">
              NEW
            </Badge>
          )}
          {project.isTrending && (
            <Badge
              variant="trending"
              className="text-[10px] px-2 py-0.5 shadow"
            >
              TRENDING
            </Badge>
          )}
          {project.isTopSelling && (
            <Badge
              variant="top-seller"
              className="text-[10px] px-2 py-0.5 shadow"
            >
              TOP SELLER
            </Badge>
          )}
        </div>
      </div>

      <div className="flex flex-col flex-1 gap-3 p-4">
        <h3 className="font-sora font-bold text-sm leading-snug text-primary line-clamp-2">
          {project.title}
        </h3>

        {techs.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {visibleTechs.map((tech) => (
              <span
                key={tech}
                className="inline-flex items-center rounded-full bg-accent-50 text-accent px-2 py-0.5 text-[11px] font-medium border border-accent-100"
              >
                {tech}
              </span>
            ))}
            {extraTechCount > 0 && (
              <span className="inline-flex items-center rounded-full bg-slate-100 text-slate-500 px-2 py-0.5 text-[11px] font-medium">
                +{extraTechCount} more
              </span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="font-bold text-accent text-lg leading-none">
            {formatPrice(project.price)}
          </span>
          <span
            className={cn(
              'inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold',
              difficultyConf.className
            )}
          >
            {difficultyConf.label}
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs text-muted">
          {typeof project.views === 'number' && (
            <span className="flex items-center gap-1">
              <Eye size={12} className="shrink-0" />
              {project.views.toLocaleString()}
            </span>
          )}
          {typeof project.downloads === 'number' && (
            <span className="flex items-center gap-1">
              <Download size={12} className="shrink-0" />
              {project.downloads.toLocaleString()}
            </span>
          )}
        </div>

        <div className="flex-1" />

        <div className="flex flex-col gap-2 pt-1 border-t border-slate-100">
          <Button
            variant="outline"
            size="sm"
            className="w-full text-xs"
            asChild
          >
            <Link to={`/projects/${project.id}`}>View Details</Link>
          </Button>

          <Button
            variant="success"
            size="sm"
            className="w-full text-xs gap-1.5"
            onClick={() =>
              window.open(whatsAppLink, '_blank', 'noopener,noreferrer')
            }
          >
            <ShoppingCart size={13} />
            Buy via WhatsApp
          </Button>
        </div>
      </div>
    </motion.div>
  )
})

export function ProjectCard({
  project,
  variant = 'default',
  index = 0,
  className,
}: ProjectCardProps) {
  if (variant === 'compact') {
    return (
      <CompactProjectCard
        project={project}
        index={index}
        className={className}
      />
    )
  }
  return (
    <DefaultProjectCard
      project={project}
      index={index}
      className={className}
    />
  )
}

export default ProjectCard
