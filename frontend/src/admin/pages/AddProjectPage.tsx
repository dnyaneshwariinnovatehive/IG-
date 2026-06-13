import React, { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useDropzone } from 'react-dropzone'
import { toast } from 'sonner'
import { Upload, X, Plus, ArrowLeft, ImageIcon, FileArchive, Tag, Loader2 } from 'lucide-react'
import { Button } from '@ui/button'
import { Input } from '@ui/input'
import { Textarea } from '@ui/textarea'
import AdminHeader from '@admin/components/AdminHeader'
import projectService from '@services/projectService'
import { cn } from '@utils/index'
import type { DifficultyLevel, ProjectType } from '@ig-types/index'

const schema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  domain: z.string().min(1, 'Please select a domain'),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced'] as const, { required_error: 'Please select a difficulty level' }),
  type: z.enum(['admin', 'student'] as const, { required_error: 'Please select a project type' }),
  price: z.coerce.number({ invalid_type_error: 'Price must be a number' }).min(0, 'Price cannot be negative'),
  shortDescription: z.string().min(20, 'Short description must be at least 20 characters').max(200, 'Short description must not exceed 200 characters'),
  longDescription: z.string().min(50, 'Long description must be at least 50 characters'),
  githubUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  videoUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
})

type FormValues = z.infer<typeof schema>

const DOMAINS = ['AI & ML','Web Development','Mobile Development','IoT / Embedded Systems','Cybersecurity','Data Science','Blockchain / Web3','Cloud / DevOps','Desktop Application','Game Development','Other']
const DIFFICULTIES: { value: DifficultyLevel; label: string }[] = [{ value: 'beginner', label: 'Beginner' },{ value: 'intermediate', label: 'Intermediate' },{ value: 'advanced', label: 'Advanced' }]
const PROJECT_TYPES: { value: ProjectType; label: string }[] = [{ value: 'admin', label: 'Admin (Platform Project)' },{ value: 'student', label: 'Student Submission' }]

const FieldLabel: React.FC<{ children: React.ReactNode; required?: boolean; className?: string }> = ({ children, required, className }) => (
  <label className={cn('block text-sm font-medium text-slate-700 mb-1.5', className)}>
    {children}{required && <span className="text-red-500 ml-0.5">*</span>}
  </label>
)

const FieldError: React.FC<{ message?: string }> = ({ message }) =>
  message ? <p className="mt-1 text-xs text-red-500">{message}</p> : null

interface TagInputProps { label: string; placeholder: string; tags: string[]; onChange: (tags: string[]) => void; icon?: React.ReactNode }
const TagInput: React.FC<TagInputProps> = ({ label, placeholder, tags, onChange, icon }) => {
  const [input, setInput] = useState('')
  const add = () => { const val = input.trim(); if (val && !tags.includes(val)) onChange([...tags, val]); setInput('') }
  const remove = (tag: string) => onChange(tags.filter((t) => t !== tag))
  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add() } }
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <div className="flex gap-2 mb-2">
        <div className="relative flex-1">
          {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">{icon}</span>}
          <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKey} placeholder={placeholder} className={cn('w-full h-10 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all', icon ? 'pl-9 pr-4' : 'px-4')} />
        </div>
        <button type="button" onClick={add} className="h-10 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors border border-blue-200"><Plus size={16} /></button>
      </div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium">
              {tag}<button type="button" onClick={() => remove(tag)} className="text-slate-400 hover:text-red-500 transition-colors"><X size={12} /></button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

interface FileDropProps { label: string; accept: Record<string, string[]>; multiple?: boolean; icon: React.ReactNode; description: string; files: File[]; onFiles: (files: File[]) => void; onRemove: (index: number) => void }
const FileDrop: React.FC<FileDropProps> = ({ label, accept, multiple, icon, description, files, onFiles, onRemove }) => {
  const onDrop = useCallback((accepted: File[]) => { onFiles(multiple ? [...files, ...accepted] : accepted) }, [files, multiple, onFiles])
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept, multiple })
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <div {...getRootProps()} className={cn('border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200', isDragActive ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-slate-50 hover:border-blue-400 hover:bg-blue-50/50')}>
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-2 text-slate-500">
          {icon}
          <p className="text-sm font-medium text-slate-700">{isDragActive ? 'Drop files here...' : 'Drag & drop or click to upload'}</p>
          <p className="text-xs text-slate-400">{description}</p>
        </div>
      </div>
      {files.length > 0 && (
        <ul className="mt-2.5 space-y-1.5">
          {files.map((f, i) => (
            <li key={`${f.name}-${i}`} className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-100 text-sm">
              <span className="truncate text-slate-700 flex-1">{f.name}</span>
              <span className="text-xs text-slate-400 mx-3 shrink-0">{(f.size / 1024).toFixed(0)} KB</span>
              <button type="button" onClick={() => onRemove(i)} className="text-slate-400 hover:text-red-500 transition-colors shrink-0"><X size={14} /></button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

const FormSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
    <h3 className="font-sora font-semibold text-base text-slate-900 pb-3 border-b border-slate-100">{title}</h3>
    {children}
  </div>
)

const AddProjectPage: React.FC = () => {
  const navigate = useNavigate()
  const [technologies, setTechnologies] = useState<string[]>([])
  const [tags, setTags] = useState<string[]>([])
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [zipFiles, setZipFiles] = useState<File[]>([])

  const { register, handleSubmit, control, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { type: 'admin', difficulty: 'beginner', price: 0 },
  })

  const onSubmit = async (data: FormValues) => {
    try {
      await projectService.createProject({ title: data.title, domain: data.domain, difficulty: data.difficulty, type: data.type, price: data.price, description: data.longDescription, technologies, tags, githubUrl: data.githubUrl || undefined, videoUrl: data.videoUrl || undefined, status: 'pending' } as Parameters<typeof projectService.createProject>[0])
      toast.success('Project created successfully!')
      navigate('/admin/admin-projects')
    } catch {
      toast.error('Failed to create project. Please try again.')
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <AdminHeader title="Add New Project" subtitle="Fill in the details below to add a project" />
      <div className="flex items-center">
        <Button variant="outline" size="sm" onClick={() => navigate('/admin/admin-projects')} className="gap-1.5"><ArrowLeft size={15} />Back</Button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
        <FormSection title="Basic Information">
          <div><FieldLabel required>Project Title</FieldLabel><Input {...register('title')} placeholder="e.g. AI Face Recognition Attendance System" error={errors.title?.message} /></div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <FieldLabel required>Domain</FieldLabel>
              <select {...register('domain')} className={cn('w-full h-12 rounded-xl border bg-white px-4 text-sm text-slate-900 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all', errors.domain ? 'border-red-400' : 'border-slate-200')}>
                <option value="">Select domain</option>
                {DOMAINS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
              <FieldError message={errors.domain?.message} />
            </div>
            <div>
              <FieldLabel required>Difficulty</FieldLabel>
              <Controller name="difficulty" control={control} render={({ field }) => (
                <select {...field} className={cn('w-full h-12 rounded-xl border bg-white px-4 text-sm text-slate-900 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all', errors.difficulty ? 'border-red-400' : 'border-slate-200')}>
                  {DIFFICULTIES.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
                </select>
              )} />
              <FieldError message={errors.difficulty?.message} />
            </div>
            <div>
              <FieldLabel required>Project Type</FieldLabel>
              <Controller name="type" control={control} render={({ field }) => (
                <select {...field} className={cn('w-full h-12 rounded-xl border bg-white px-4 text-sm text-slate-900 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all', errors.type ? 'border-red-400' : 'border-slate-200')}>
                  {PROJECT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              )} />
              <FieldError message={errors.type?.message} />
            </div>
          </div>
          <div className="max-w-xs"><FieldLabel required>Price (₹)</FieldLabel><Input {...register('price')} type="number" min={0} placeholder="e.g. 1499" error={errors.price?.message} /></div>
        </FormSection>

        <FormSection title="Descriptions">
          <div><FieldLabel required>Short Description</FieldLabel><Textarea {...register('shortDescription')} placeholder="A brief one-to-two sentence summary shown in project cards (20–200 characters)" className="min-h-[80px]" error={errors.shortDescription?.message} /><p className="mt-1 text-xs text-slate-400">Used in listing cards and search results.</p></div>
          <div><FieldLabel required>Long Description</FieldLabel><Textarea {...register('longDescription')} placeholder="Detailed description of the project — features, architecture, use cases, technical highlights..." className="min-h-[160px]" error={errors.longDescription?.message} /></div>
        </FormSection>

        <FormSection title="Technologies & Tags">
          <TagInput label="Technologies" placeholder="Add a technology and press Enter" tags={technologies} onChange={setTechnologies} icon={<Tag size={14} />} />
          <TagInput label="Tags" placeholder="Add a tag and press Enter (e.g. AI, Python)" tags={tags} onChange={setTags} />
        </FormSection>

        <FormSection title="External Links">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><FieldLabel>GitHub Repository URL</FieldLabel><Input {...register('githubUrl')} placeholder="https://github.com/..." error={errors.githubUrl?.message} /></div>
            <div><FieldLabel>Demo Video URL</FieldLabel><Input {...register('videoUrl')} placeholder="https://youtube.com/..." error={errors.videoUrl?.message} /></div>
          </div>
        </FormSection>

        <FormSection title="Files & Media">
          <FileDrop label="Project Screenshots / Thumbnails" accept={{ 'image/*': ['.png','.jpg','.jpeg','.webp','.gif'] }} multiple icon={<ImageIcon size={28} className="text-slate-400" />} description="PNG, JPG, WebP — you can upload multiple images" files={imageFiles} onFiles={setImageFiles} onRemove={(i) => setImageFiles((prev) => prev.filter((_, idx) => idx !== i))} />
          <FileDrop label="Project ZIP File" accept={{ 'application/zip': ['.zip'], 'application/x-zip-compressed': ['.zip'] }} multiple={false} icon={<FileArchive size={28} className="text-slate-400" />} description="ZIP archive containing the full project source code" files={zipFiles} onFiles={(f) => setZipFiles(f)} onRemove={(i) => setZipFiles((prev) => prev.filter((_, idx) => idx !== i))} />
        </FormSection>

        <div className="flex items-center justify-end gap-3 pt-2 pb-8">
          <Button type="button" variant="outline" size="md" onClick={() => navigate('/admin/admin-projects')}>Cancel</Button>
          <Button type="submit" variant="primary" size="md" loading={isSubmitting} className="min-w-[140px]">
            {isSubmitting && <Loader2 size={16} className="animate-spin" />}Create Project
          </Button>
        </div>
      </form>
    </div>
  )
}

export default AddProjectPage
