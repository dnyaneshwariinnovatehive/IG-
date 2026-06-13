import React, { useState, useCallback, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useDropzone } from 'react-dropzone'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import {
  X,
  Plus,
  ArrowLeft,
  ImageIcon,
  FileArchive,
  Tag,
  Loader2,
  AlertCircle,
  Save,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import AdminHeader from '@/components/admin/AdminHeader'
import { useProject } from '@/hooks/useProjects'
import projectService from '@/services/projectService'
import { cn } from '@/lib/utils'
import type { DifficultyLevel, ProjectType, ProjectStatus } from '@/types'

// ─── Validation Schema ────────────────────────────────────────────────────────

const schema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  domain: z.string().min(1, 'Please select a domain'),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced'] as const),
  type: z.enum(['admin', 'student'] as const),
  price: z.coerce.number().min(0, 'Price cannot be negative'),
  shortDescription: z
    .string()
    .min(20, 'Short description must be at least 20 characters')
    .max(200, 'Must not exceed 200 characters'),
  longDescription: z.string().min(50, 'Long description must be at least 50 characters'),
  githubUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  videoUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  status: z.enum([
    'pending',
    'approved',
    'rejected',
    'published',
    'draft',
    'archived',
  ] as const),
})

type FormValues = z.infer<typeof schema>

// ─── Constants ────────────────────────────────────────────────────────────────

const DOMAINS = [
  'AI & ML',
  'Web Development',
  'Mobile Development',
  'IoT / Embedded Systems',
  'Cybersecurity',
  'Data Science',
  'Blockchain / Web3',
  'Cloud / DevOps',
  'Desktop Application',
  'Game Development',
  'Other',
]

const DIFFICULTIES: { value: DifficultyLevel; label: string }[] = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
]

const PROJECT_TYPES: { value: ProjectType; label: string }[] = [
  { value: 'admin', label: 'Admin (Platform Project)' },
  { value: 'student', label: 'Student Submission' },
]

const STATUS_OPTIONS: {
  value: ProjectStatus
  label: string
  color: string
}[] = [
  { value: 'pending', label: 'Pending', color: 'text-amber-600 bg-amber-50 border-amber-200' },
  { value: 'approved', label: 'Approved', color: 'text-green-600 bg-green-50 border-green-200' },
  { value: 'rejected', label: 'Rejected', color: 'text-red-600 bg-red-50 border-red-200' },
  { value: 'published', label: 'Published', color: 'text-blue-600 bg-blue-50 border-blue-200' },
  { value: 'draft', label: 'Draft', color: 'text-slate-600 bg-slate-50 border-slate-200' },
  { value: 'archived', label: 'Archived', color: 'text-purple-600 bg-purple-50 border-purple-200' },
]

// ─── Sub-components ───────────────────────────────────────────────────────────

const FieldLabel: React.FC<{
  children: React.ReactNode
  required?: boolean
  className?: string
}> = ({ children, required, className }) => (
  <label className={cn('block text-sm font-medium text-slate-700 mb-1.5', className)}>
    {children}
    {required && <span className="text-red-500 ml-0.5">*</span>}
  </label>
)

const FieldError: React.FC<{ message?: string }> = ({ message }) =>
  message ? <p className="mt-1 text-xs text-red-500">{message}</p> : null

// ── Tag Input ──

interface TagInputProps {
  label: string
  placeholder: string
  tags: string[]
  onChange: (tags: string[]) => void
  icon?: React.ReactNode
}

const TagInput: React.FC<TagInputProps> = ({ label, placeholder, tags, onChange, icon }) => {
  const [input, setInput] = useState('')

  const add = () => {
    const val = input.trim()
    if (val && !tags.includes(val)) onChange([...tags, val])
    setInput('')
  }

  const remove = (tag: string) => onChange(tags.filter((t) => t !== tag))

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      add()
    }
  }

  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <div className="flex gap-2 mb-2">
        <div className="relative flex-1">
          {icon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              {icon}
            </span>
          )}
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder={placeholder}
            className={cn(
              'w-full h-10 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400',
              'focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all',
              icon ? 'pl-9 pr-4' : 'px-4'
            )}
          />
        </div>
        <button
          type="button"
          onClick={add}
          className="h-10 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors border border-blue-200"
        >
          <Plus size={16} />
        </button>
      </div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium"
            >
              {tag}
              <button
                type="button"
                onClick={() => remove(tag)}
                className="text-slate-400 hover:text-red-500 transition-colors"
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

// ── File Drop ──

interface FileDropProps {
  label: string
  accept: Record<string, string[]>
  multiple?: boolean
  icon: React.ReactNode
  description: string
  files: File[]
  existingUrls?: string[]
  onFiles: (files: File[]) => void
  onRemove: (index: number) => void
}

const FileDrop: React.FC<FileDropProps> = ({
  label,
  accept,
  multiple,
  icon,
  description,
  files,
  existingUrls = [],
  onFiles,
  onRemove,
}) => {
  const onDrop = useCallback(
    (accepted: File[]) => {
      onFiles(multiple ? [...files, ...accepted] : accepted)
    },
    [files, multiple, onFiles]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept, multiple })

  return (
    <div>
      <FieldLabel>{label}</FieldLabel>

      {existingUrls.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {existingUrls.map((url, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-medium border border-blue-200"
            >
              Existing file {i + 1}
            </span>
          ))}
        </div>
      )}

      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all duration-200',
          isDragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-slate-200 bg-slate-50 hover:border-blue-400 hover:bg-blue-50/50'
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-2 text-slate-500">
          {icon}
          <p className="text-sm font-medium text-slate-700">
            {isDragActive ? 'Drop here...' : 'Replace — drag & drop or click to upload'}
          </p>
          <p className="text-xs text-slate-400">{description}</p>
        </div>
      </div>

      {files.length > 0 && (
        <ul className="mt-2 space-y-1.5">
          {files.map((f, i) => (
            <li
              key={`${f.name}-${i}`}
              className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-100 text-sm"
            >
              <span className="truncate text-slate-700 flex-1">{f.name}</span>
              <span className="text-xs text-slate-400 mx-3 shrink-0">
                {(f.size / 1024).toFixed(0)} KB
              </span>
              <button
                type="button"
                onClick={() => onRemove(i)}
                className="text-slate-400 hover:text-red-500 transition-colors shrink-0"
              >
                <X size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

const FormSection: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
    <h3 className="font-sora font-semibold text-base text-slate-900 pb-3 border-b border-slate-100">
      {title}
    </h3>
    {children}
  </div>
)

// ─── Main Component ───────────────────────────────────────────────────────────

const EditProjectPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: project, isLoading, isError } = useProject(id)

  const [technologies, setTechnologies] = useState<string[]>([])
  const [tags, setTags] = useState<string[]>([])
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [zipFiles, setZipFiles] = useState<File[]>([])

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  const currentStatus = watch('status')

  // Populate form once project data loads
  useEffect(() => {
    if (!project) return

    const p = project as unknown as Record<string, unknown>

    reset({
      title: project.title,
      domain: (p.domain as string) ?? '',
      difficulty: ((p.difficulty as DifficultyLevel) ?? 'beginner'),
      type: ((p.type as ProjectType) ?? 'admin'),
      price: project.price ?? 0,
      shortDescription: (project.description ?? '').slice(0, 200),
      longDescription: project.description ?? '',
      githubUrl: (p.githubUrl as string) ?? '',
      videoUrl: (p.videoUrl as string) ?? '',
      status: ((p.status as ProjectStatus) ?? 'pending'),
    })

    setTechnologies(project.technologies ?? [])
    setTags(project.tags ?? [])
  }, [project, reset])

  const onSubmit = async (data: FormValues) => {
    if (!id) return
    try {
      await projectService.updateProject(id, {
        title: data.title,
        domain: data.domain,
        difficulty: data.difficulty,
        type: data.type,
        price: data.price,
        description: data.longDescription,
        technologies,
        tags,
        githubUrl: data.githubUrl || undefined,
        videoUrl: data.videoUrl || undefined,
        status: data.status,
      } as Parameters<typeof projectService.updateProject>[1])

      queryClient.invalidateQueries({ queryKey: ['project', id] })
      queryClient.invalidateQueries({ queryKey: ['projects'] })

      toast.success('Project updated successfully!')
      navigate('/admin/admin-projects')
    } catch {
      toast.error('Failed to update project. Please try again.')
    }
  }

  // ── Loading ──
  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <AdminHeader title="Edit Project" />
        <div className="flex items-center justify-center h-64">
          <Loader2 size={32} className="animate-spin text-blue-600" />
        </div>
      </div>
    )
  }

  // ── Error ──
  if (isError || !project) {
    return (
      <div className="flex flex-col gap-6">
        <AdminHeader title="Edit Project" />
        <div className="flex flex-col items-center justify-center gap-4 h-64 text-center">
          <AlertCircle size={36} className="text-red-500" />
          <p className="font-semibold text-slate-800">Project not found</p>
          <p className="text-sm text-slate-500">
            The project with ID{' '}
            <code className="bg-slate-100 px-1 rounded">{id}</code> could not be loaded.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/admin/admin-projects')}
            className="gap-1.5"
          >
            <ArrowLeft size={14} />
            Back to Projects
          </Button>
        </div>
      </div>
    )
  }

  const statusConfig = STATUS_OPTIONS.find((s) => s.value === currentStatus)

  return (
    <div className="flex flex-col gap-6">
      <AdminHeader title="Edit Project" subtitle={`Editing: ${project.title}`} />

      {/* Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-sora font-bold text-xl text-slate-900">Edit Project</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            ID:{' '}
            <code className="bg-slate-100 px-1 rounded text-xs">{id}</code>
            {statusConfig && (
              <span
                className={cn(
                  'ml-2 inline-block px-2 py-0.5 rounded-md text-xs font-semibold border',
                  statusConfig.color
                )}
              >
                {statusConfig.label}
              </span>
            )}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/admin/admin-projects')}
          className="gap-1.5"
        >
          <ArrowLeft size={15} />
          Back
        </Button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>

        {/* ── Status Change ── */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 text-amber-800 shrink-0">
            <AlertCircle size={18} />
            <span className="font-semibold text-sm">Project Status</span>
          </div>
          <div className="flex-1 min-w-[200px]">
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <select
                  {...field}
                  className="w-full h-10 rounded-xl border border-amber-300 bg-white px-4 text-sm text-slate-900 appearance-none focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 transition-all"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              )}
            />
          </div>
          <p className="text-xs text-amber-700 w-full sm:w-auto">
            Setting to <strong>Published</strong> makes the project visible to all users.
          </p>
        </div>

        {/* ── Basic Information ── */}
        <FormSection title="Basic Information">
          <div>
            <FieldLabel required>Project Title</FieldLabel>
            <Input
              {...register('title')}
              placeholder="e.g. AI Face Recognition Attendance System"
              error={errors.title?.message}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Domain */}
            <div>
              <FieldLabel required>Domain</FieldLabel>
              <select
                {...register('domain')}
                className={cn(
                  'w-full h-12 rounded-xl border bg-white px-4 text-sm text-slate-900 appearance-none',
                  'focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all',
                  errors.domain ? 'border-red-400' : 'border-slate-200'
                )}
              >
                <option value="">Select domain</option>
                {DOMAINS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              <FieldError message={errors.domain?.message} />
            </div>

            {/* Difficulty */}
            <div>
              <FieldLabel required>Difficulty</FieldLabel>
              <Controller
                name="difficulty"
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    className={cn(
                      'w-full h-12 rounded-xl border bg-white px-4 text-sm text-slate-900 appearance-none',
                      'focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all',
                      errors.difficulty ? 'border-red-400' : 'border-slate-200'
                    )}
                  >
                    {DIFFICULTIES.map((d) => (
                      <option key={d.value} value={d.value}>{d.label}</option>
                    ))}
                  </select>
                )}
              />
              <FieldError message={errors.difficulty?.message} />
            </div>

            {/* Project Type */}
            <div>
              <FieldLabel required>Project Type</FieldLabel>
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    className={cn(
                      'w-full h-12 rounded-xl border bg-white px-4 text-sm text-slate-900 appearance-none',
                      'focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all',
                      errors.type ? 'border-red-400' : 'border-slate-200'
                    )}
                  >
                    {PROJECT_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                )}
              />
              <FieldError message={errors.type?.message} />
            </div>
          </div>

          <div className="max-w-xs">
            <FieldLabel required>Price (₹)</FieldLabel>
            <Input
              {...register('price')}
              type="number"
              min={0}
              placeholder="e.g. 1499"
              error={errors.price?.message}
            />
          </div>
        </FormSection>

        {/* ── Descriptions ── */}
        <FormSection title="Descriptions">
          <div>
            <FieldLabel required>Short Description</FieldLabel>
            <Textarea
              {...register('shortDescription')}
              placeholder="Brief summary shown in project cards (20–200 characters)"
              className="min-h-[80px]"
              error={errors.shortDescription?.message}
            />
          </div>
          <div>
            <FieldLabel required>Long Description</FieldLabel>
            <Textarea
              {...register('longDescription')}
              placeholder="Detailed project description..."
              className="min-h-[160px]"
              error={errors.longDescription?.message}
            />
          </div>
        </FormSection>

        {/* ── Technologies & Tags ── */}
        <FormSection title="Technologies & Tags">
          <TagInput
            label="Technologies"
            placeholder="Add technology, press Enter"
            tags={technologies}
            onChange={setTechnologies}
            icon={<Tag size={14} />}
          />
          <TagInput
            label="Tags"
            placeholder="Add tag, press Enter (e.g. AI, Python)"
            tags={tags}
            onChange={setTags}
          />
        </FormSection>

        {/* ── Links ── */}
        <FormSection title="External Links">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <FieldLabel>GitHub Repository URL</FieldLabel>
              <Input
                {...register('githubUrl')}
                placeholder="https://github.com/..."
                error={errors.githubUrl?.message}
              />
            </div>
            <div>
              <FieldLabel>Demo Video URL</FieldLabel>
              <Input
                {...register('videoUrl')}
                placeholder="https://youtube.com/..."
                error={errors.videoUrl?.message}
              />
            </div>
          </div>
        </FormSection>

        {/* ── File Uploads ── */}
        <FormSection title="Files & Media">
          <FileDrop
            label="Project Screenshots / Thumbnails"
            accept={{ 'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.gif'] }}
            multiple
            icon={<ImageIcon size={28} className="text-slate-400" />}
            description="Upload new images to replace existing ones"
            existingUrls={project.screenshots ?? []}
            files={imageFiles}
            onFiles={setImageFiles}
            onRemove={(i) => setImageFiles((prev) => prev.filter((_, idx) => idx !== i))}
          />

          <FileDrop
            label="Project ZIP File"
            accept={{
              'application/zip': ['.zip'],
              'application/x-zip-compressed': ['.zip'],
            }}
            multiple={false}
            icon={<FileArchive size={28} className="text-slate-400" />}
            description="Upload a new ZIP to replace the current source archive"
            files={zipFiles}
            onFiles={(f) => setZipFiles(f)}
            onRemove={(i) => setZipFiles((prev) => prev.filter((_, idx) => idx !== i))}
          />
        </FormSection>

        {/* ── Form Actions ── */}
        <div className="flex items-center justify-between gap-3 pt-2 pb-8 flex-wrap">
          <Button
            type="button"
            variant="ghost"
            size="md"
            onClick={() => navigate('/admin/admin-projects')}
          >
            Cancel
          </Button>
          <div className="flex items-center gap-3">
            {isDirty && (
              <span className="text-xs text-amber-600 font-medium">Unsaved changes</span>
            )}
            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={isSubmitting}
              className="min-w-[150px] gap-2"
            >
              <Save size={15} />
              Save Changes
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default EditProjectPage
