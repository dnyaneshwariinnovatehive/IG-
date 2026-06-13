import React, { useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronRight,
  ChevronLeft,
  Upload,
  X,
  Check,
  Image,
  FileArchive,
  Link,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import projectService from '@/services/projectService'
import { cn } from '@/lib/utils'

// ─── Constants ────────────────────────────────────────────────────────────────

const TOTAL_STEPS = 7

const STEP_LABELS = [
  'Basic Info',
  'Details',
  'Technologies',
  'Media',
  'Documentation',
  'Files',
  'Preview',
]

const DOMAIN_OPTIONS = [
  'AI & ML',
  'Web Development',
  'Mobile Apps',
  'Data Science',
  'Cybersecurity',
  'Cloud Computing',
  'IoT',
  'Blockchain',
  'Game Development',
  'DevOps',
  'Other',
]

const DIFFICULTY_OPTIONS = ['Beginner', 'Intermediate', 'Advanced', 'Expert']

// ─── Schemas ──────────────────────────────────────────────────────────────────

const step1Schema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  shortDescription: z
    .string()
    .min(20, 'Short description must be at least 20 characters')
    .max(200, 'Short description must be at most 200 characters'),
  projectType: z.enum(['admin', 'student'], {
    required_error: 'Please select a project type',
  }),
})

const step2Schema = z.object({
  domain: z.string().min(1, 'Please select a domain'),
  difficulty: z.string().min(1, 'Please select a difficulty level'),
  price: z.number({ invalid_type_error: 'Price must be a number' }).min(0, 'Price cannot be negative'),
  longDescription: z.string().min(50, 'Long description must be at least 50 characters'),
})

const step3Schema = z.object({
  technologies: z.array(z.string()).min(1, 'Add at least one technology'),
  tags: z.array(z.string()),
  category: z.string().min(1, 'Please enter a category'),
  githubUrl: z.string().url('Enter a valid URL').optional().or(z.literal('')),
  videoUrl: z.string().url('Enter a valid URL').optional().or(z.literal('')),
})

type Step1Data = z.infer<typeof step1Schema>
type Step2Data = z.infer<typeof step2Schema>
type Step3Data = z.infer<typeof step3Schema>

// ─── Aggregated wizard state ──────────────────────────────────────────────────

interface WizardData {
  // Step 1
  title: string
  shortDescription: string
  projectType: 'admin' | 'student'
  // Step 2
  domain: string
  difficulty: string
  price: number
  longDescription: string
  // Step 3
  technologies: string[]
  tags: string[]
  category: string
  githubUrl: string
  videoUrl: string
  // Step 4
  screenshots: File[]
  // Step 5
  documentation: string
  // Step 6
  projectFile: File | null
}

const defaultWizardData: WizardData = {
  title: '',
  shortDescription: '',
  projectType: 'student',
  domain: '',
  difficulty: '',
  price: 0,
  longDescription: '',
  technologies: [],
  tags: [],
  category: '',
  githubUrl: '',
  videoUrl: '',
  screenshots: [],
  documentation: '',
  projectFile: null,
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

// ─── Step Indicator ───────────────────────────────────────────────────────────

interface StepIndicatorProps {
  currentStep: number
}

function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <div className="w-full mb-10">
      <div className="flex items-center justify-between relative">
        {/* Connecting lines */}
        <div className="absolute top-4 left-0 right-0 h-[2px] bg-slate-200 z-0">
          <div
            className="h-full bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] transition-all duration-500"
            style={{ width: `${((currentStep - 1) / (TOTAL_STEPS - 1)) * 100}%` }}
          />
        </div>

        {STEP_LABELS.map((label, idx) => {
          const stepNum = idx + 1
          const isCompleted = stepNum < currentStep
          const isActive = stepNum === currentStep

          return (
            <div key={stepNum} className="flex flex-col items-center z-10" style={{ minWidth: 0 }}>
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-all duration-300',
                  isCompleted
                    ? 'bg-[#2563EB] border-[#2563EB] text-white'
                    : isActive
                    ? 'bg-[#2563EB] border-[#2563EB] text-white shadow-lg shadow-blue-400/40 scale-110'
                    : 'bg-white border-slate-300 text-slate-400'
                )}
              >
                {isCompleted ? <Check size={14} /> : stepNum}
              </div>
              <span
                className={cn(
                  'mt-2 text-[10px] font-medium text-center whitespace-nowrap leading-tight',
                  isActive ? 'text-[#2563EB]' : isCompleted ? 'text-slate-600' : 'text-slate-400'
                )}
              >
                {label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Tag / Pill Input ─────────────────────────────────────────────────────────

interface PillInputProps {
  label: string
  placeholder: string
  values: string[]
  onChange: (values: string[]) => void
  error?: string
  hint?: string
}

function PillInput({ label, placeholder, values, onChange, error, hint }: PillInputProps) {
  const [inputValue, setInputValue] = useState('')

  const addValue = (raw: string) => {
    const trimmed = raw.trim()
    if (trimmed && !values.includes(trimmed)) {
      onChange([...values, trimmed])
    }
    setInputValue('')
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addValue(inputValue)
    } else if (e.key === 'Backspace' && inputValue === '' && values.length > 0) {
      onChange(values.slice(0, -1))
    }
  }

  const removeValue = (val: string) => {
    onChange(values.filter((v) => v !== val))
  }

  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-[#0F172A]">{label}</label>
      <div
        className={cn(
          'min-h-[44px] w-full rounded-xl border bg-white px-3 py-2 flex flex-wrap gap-2 items-center transition-colors',
          error ? 'border-red-400 focus-within:ring-red-300' : 'border-slate-200 focus-within:border-[#2563EB] focus-within:ring-2 focus-within:ring-blue-100'
        )}
      >
        {values.map((val) => (
          <span
            key={val}
            className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg px-2.5 py-0.5 text-sm font-medium"
          >
            {val}
            <button
              type="button"
              onClick={() => removeValue(val)}
              className="hover:text-red-500 transition-colors ml-0.5"
            >
              <X size={12} />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => inputValue.trim() && addValue(inputValue)}
          placeholder={values.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[120px] outline-none text-sm text-[#0F172A] placeholder:text-slate-400 bg-transparent"
        />
      </div>
      {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}

// ─── Field wrapper ────────────────────────────────────────────────────────────

interface FieldProps {
  label: string
  required?: boolean
  error?: string
  hint?: string
  children: React.ReactNode
}

function Field({ label, required, error, hint, children }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-[#0F172A]">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}

// ─── Step 1: Basic Information ────────────────────────────────────────────────

interface Step1Props {
  data: WizardData
  onNext: (values: Step1Data) => void
}

function Step1Basic({ data, onNext }: Step1Props) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      title: data.title,
      shortDescription: data.shortDescription,
      projectType: data.projectType,
    },
  })

  const projectType = watch('projectType')
  const shortDesc = watch('shortDescription') ?? ''

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[#0F172A] font-['Sora']">Basic Information</h2>
        <p className="text-sm text-slate-500 mt-1">Start with the essential details of your project.</p>
      </div>

      <Field label="Project Title" required error={errors.title?.message}>
        <Input
          {...register('title')}
          placeholder="e.g. E-commerce Website with React & Node.js"
          className={cn(errors.title && 'border-red-400')}
        />
      </Field>

      <Field
        label="Short Description"
        required
        error={errors.shortDescription?.message}
        hint={`${shortDesc.length}/200 characters`}
      >
        <Textarea
          {...register('shortDescription')}
          placeholder="A brief overview of what this project does (shown in cards and search results)"
          rows={3}
          className={cn(errors.shortDescription && 'border-red-400')}
        />
      </Field>

      <Field label="Project Type" required error={errors.projectType?.message}>
        <div className="flex gap-4">
          {(['admin', 'student'] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setValue('projectType', type)}
              className={cn(
                'flex-1 py-3 px-4 rounded-xl border-2 text-sm font-medium transition-all duration-200 capitalize',
                projectType === type
                  ? 'border-[#2563EB] bg-blue-50 text-[#2563EB]'
                  : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
              )}
            >
              {type === 'admin' ? 'Admin Project' : 'Student Project'}
              <p className="text-xs font-normal mt-0.5 text-slate-400">
                {type === 'admin' ? 'Official / verified listing' : 'Community contribution'}
              </p>
            </button>
          ))}
        </div>
      </Field>

      <div className="flex justify-end pt-2">
        <Button type="submit" variant="primary" size="lg">
          Next <ChevronRight size={18} />
        </Button>
      </div>
    </form>
  )
}

// ─── Step 2: Project Details ──────────────────────────────────────────────────

interface Step2Props {
  data: WizardData
  onNext: (values: Step2Data) => void
  onBack: () => void
}

function Step2Details({ data, onNext, onBack }: Step2Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      domain: data.domain,
      difficulty: data.difficulty,
      price: data.price,
      longDescription: data.longDescription,
    },
  })

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[#0F172A] font-['Sora']">Project Details</h2>
        <p className="text-sm text-slate-500 mt-1">Provide more context about complexity and domain.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Field label="Domain" required error={errors.domain?.message}>
          <select
            {...register('domain')}
            className={cn(
              'w-full h-10 rounded-xl border px-3 text-sm bg-white text-[#0F172A] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 transition-colors',
              errors.domain ? 'border-red-400' : 'border-slate-200'
            )}
          >
            <option value="">Select domain</option>
            {DOMAIN_OPTIONS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </Field>

        <Field label="Difficulty Level" required error={errors.difficulty?.message}>
          <select
            {...register('difficulty')}
            className={cn(
              'w-full h-10 rounded-xl border px-3 text-sm bg-white text-[#0F172A] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 transition-colors',
              errors.difficulty ? 'border-red-400' : 'border-slate-200'
            )}
          >
            <option value="">Select difficulty</option>
            {DIFFICULTY_OPTIONS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Price (₹)" required error={errors.price?.message} hint="Set 0 for a free project">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-medium">₹</span>
          <Input
            {...register('price', { valueAsNumber: true })}
            type="number"
            min={0}
            step={1}
            placeholder="0"
            className={cn('pl-8', errors.price && 'border-red-400')}
          />
        </div>
      </Field>

      <Field label="Long Description" required error={errors.longDescription?.message} hint="Min 50 characters. Describe features, use cases, and what makes this project special.">
        <Textarea
          {...register('longDescription')}
          placeholder="Provide a detailed description of the project including features, architecture, use cases, and any notable aspects..."
          rows={6}
          className={cn(errors.longDescription && 'border-red-400')}
        />
      </Field>

      <div className="flex justify-between pt-2">
        <Button type="button" variant="outline" size="lg" onClick={onBack}>
          <ChevronLeft size={18} /> Back
        </Button>
        <Button type="submit" variant="primary" size="lg">
          Next <ChevronRight size={18} />
        </Button>
      </div>
    </form>
  )
}

// ─── Step 3: Technologies ─────────────────────────────────────────────────────

interface Step3Props {
  data: WizardData
  onNext: (values: Step3Data) => void
  onBack: () => void
}

function Step3Technologies({ data, onNext, onBack }: Step3Props) {
  const [technologies, setTechnologies] = useState<string[]>(data.technologies)
  const [tags, setTags] = useState<string[]>(data.tags)
  const [techError, setTechError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Omit<Step3Data, 'technologies' | 'tags'>>({
    resolver: zodResolver(
      step3Schema.omit({ technologies: true, tags: true })
    ),
    defaultValues: {
      category: data.category,
      githubUrl: data.githubUrl,
      videoUrl: data.videoUrl,
    },
  })

  const onSubmit = handleSubmit((formValues) => {
    if (technologies.length === 0) {
      setTechError('Add at least one technology')
      return
    }
    setTechError('')
    onNext({ ...formValues, technologies, tags })
  })

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[#0F172A] font-['Sora']">Technologies & Tags</h2>
        <p className="text-sm text-slate-500 mt-1">Help users discover your project with the right keywords.</p>
      </div>

      <PillInput
        label="Technologies *"
        placeholder="Type a technology and press Enter or comma..."
        values={technologies}
        onChange={(vals) => { setTechnologies(vals); if (vals.length > 0) setTechError('') }}
        error={techError}
        hint="e.g. React, Node.js, MongoDB, TailwindCSS"
      />

      <PillInput
        label="Tags"
        placeholder="Type a tag and press Enter or comma..."
        values={tags}
        onChange={setTags}
        hint="e.g. ecommerce, dashboard, real-time"
      />

      <Field label="Category" required error={errors.category?.message}>
        <Input
          {...register('category')}
          placeholder="e.g. Full Stack, Frontend, Backend, API..."
          className={cn(errors.category && 'border-red-400')}
        />
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Field label="GitHub Repository URL" error={errors.githubUrl?.message}>
          <div className="relative">
            <Link size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              {...register('githubUrl')}
              placeholder="https://github.com/..."
              className={cn('pl-8', errors.githubUrl && 'border-red-400')}
            />
          </div>
        </Field>

        <Field label="Video Tutorial URL" error={errors.videoUrl?.message}>
          <div className="relative">
            <Link size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              {...register('videoUrl')}
              placeholder="https://youtube.com/..."
              className={cn('pl-8', errors.videoUrl && 'border-red-400')}
            />
          </div>
        </Field>
      </div>

      <div className="flex justify-between pt-2">
        <Button type="button" variant="outline" size="lg" onClick={onBack}>
          <ChevronLeft size={18} /> Back
        </Button>
        <Button type="submit" variant="primary" size="lg">
          Next <ChevronRight size={18} />
        </Button>
      </div>
    </form>
  )
}

// ─── Step 4: Media Upload ─────────────────────────────────────────────────────

interface Step4Props {
  screenshots: File[]
  onNext: (files: File[]) => void
  onBack: () => void
}

function Step4Media({ screenshots: initialScreenshots, onNext, onBack }: Step4Props) {
  const [files, setFiles] = useState<File[]>(initialScreenshots)
  const [previews, setPreviews] = useState<string[]>(() =>
    initialScreenshots.map((f) => URL.createObjectURL(f))
  )

  const onDrop = useCallback(
    (accepted: File[]) => {
      const remaining = 10 - files.length
      const toAdd = accepted.slice(0, remaining)
      setFiles((prev) => [...prev, ...toAdd])
      setPreviews((prev) => [...prev, ...toAdd.map((f) => URL.createObjectURL(f))])
    },
    [files.length]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/jpeg': [], 'image/png': [], 'image/gif': [] },
    maxSize: 5 * 1024 * 1024,
    maxFiles: 10 - files.length,
    disabled: files.length >= 10,
    onDropRejected: (fileRejections) => {
      fileRejections.forEach((rejection) => {
        const err = rejection.errors[0]
        if (err.code === 'file-too-large') toast.error(`${rejection.file.name} exceeds 5 MB`)
        else if (err.code === 'file-invalid-type') toast.error('Only JPG, PNG, and GIF images are accepted')
        else toast.error(err.message)
      })
    },
  })

  const removeFile = (idx: number) => {
    URL.revokeObjectURL(previews[idx])
    setFiles((prev) => prev.filter((_, i) => i !== idx))
    setPreviews((prev) => prev.filter((_, i) => i !== idx))
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[#0F172A] font-['Sora']">Screenshots & Media</h2>
        <p className="text-sm text-slate-500 mt-1">Upload up to 10 screenshots (JPG/PNG/GIF, max 5 MB each).</p>
      </div>

      {/* Drop zone */}
      <div
        {...getRootProps()}
        className={cn(
          'rounded-2xl border-2 border-dashed p-8 flex flex-col items-center justify-center cursor-pointer transition-all duration-200',
          isDragActive
            ? 'border-[#2563EB] bg-blue-50'
            : files.length >= 10
            ? 'border-slate-200 bg-slate-50 cursor-not-allowed opacity-60'
            : 'border-slate-300 bg-white hover:border-[#2563EB] hover:bg-blue-50/30'
        )}
      >
        <input {...getInputProps()} />
        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-3">
          <Image size={22} className="text-[#2563EB]" />
        </div>
        <p className="text-sm font-medium text-[#0F172A]">
          {isDragActive ? 'Drop images here' : files.length >= 10 ? 'Maximum 10 images reached' : 'Drag & drop images here'}
        </p>
        <p className="text-xs text-slate-400 mt-1">or click to browse — JPG, PNG, GIF up to 5 MB each</p>
        {files.length > 0 && (
          <span className="mt-2 text-xs text-slate-500">{files.length}/10 uploaded</span>
        )}
      </div>

      {/* Preview grid */}
      {previews.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {previews.map((src, idx) => (
            <div key={idx} className="relative group aspect-video rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
              <img src={src} alt={`Screenshot ${idx + 1}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeFile(idx)}
                className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow"
              >
                <X size={12} />
              </button>
              <div className="absolute bottom-0 left-0 right-0 bg-black/40 text-white text-[10px] px-1.5 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity truncate">
                {files[idx]?.name}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-between pt-2">
        <Button type="button" variant="outline" size="lg" onClick={onBack}>
          <ChevronLeft size={18} /> Back
        </Button>
        <Button type="button" variant="primary" size="lg" onClick={() => onNext(files)}>
          Next <ChevronRight size={18} />
        </Button>
      </div>
    </div>
  )
}

// ─── Step 5: Documentation ────────────────────────────────────────────────────

interface Step5Props {
  documentation: string
  onNext: (doc: string) => void
  onBack: () => void
}

function Step5Documentation({ documentation, onNext, onBack }: Step5Props) {
  const [doc, setDoc] = useState(documentation)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[#0F172A] font-['Sora']">Documentation</h2>
        <p className="text-sm text-slate-500 mt-1">Provide setup instructions and usage notes for buyers.</p>
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-[#0F172A]">
          Project Documentation / README
          <span className="ml-2 text-xs text-slate-400 font-normal">(optional)</span>
        </label>
        <Textarea
          value={doc}
          onChange={(e) => setDoc(e.target.value)}
          placeholder={`## Setup Instructions\n\n1. Clone the repository\n2. Run \`npm install\`\n3. Configure environment variables\n4. Run \`npm start\`\n\n## Features\n\n- Feature 1\n- Feature 2\n\n## Usage\n\n...`}
          rows={14}
          className="font-mono text-sm"
        />
        <p className="text-xs text-slate-500">
          Describe setup instructions, features, and usage. Markdown is supported.
        </p>
      </div>

      <div className="flex justify-between pt-2">
        <Button type="button" variant="outline" size="lg" onClick={onBack}>
          <ChevronLeft size={18} /> Back
        </Button>
        <Button type="button" variant="primary" size="lg" onClick={() => onNext(doc)}>
          Next <ChevronRight size={18} />
        </Button>
      </div>
    </div>
  )
}

// ─── Step 6: Project Files ────────────────────────────────────────────────────

interface Step6Props {
  projectFile: File | null
  onNext: (file: File | null) => void
  onBack: () => void
}

function Step6Files({ projectFile: initialFile, onNext, onBack }: Step6Props) {
  const [file, setFile] = useState<File | null>(initialFile)

  const onDrop = useCallback((accepted: File[]) => {
    if (accepted.length > 0) setFile(accepted[0])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/zip': ['.zip'],
      'application/x-rar-compressed': ['.rar'],
      'application/x-7z-compressed': ['.7z'],
      'application/octet-stream': ['.zip', '.rar', '.7z'],
    },
    maxSize: 100 * 1024 * 1024,
    maxFiles: 1,
    onDropRejected: (rejections) => {
      const err = rejections[0]?.errors[0]
      if (err?.code === 'file-too-large') toast.error('File exceeds 100 MB limit')
      else toast.error('Only .zip, .rar, and .7z files are accepted')
    },
  })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[#0F172A] font-['Sora']">Project Files</h2>
        <p className="text-sm text-slate-500 mt-1">Upload the project archive (.zip / .rar / .7z, max 100 MB).</p>
      </div>

      {file ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
            <FileArchive size={22} className="text-emerald-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[#0F172A] truncate">{file.name}</p>
            <p className="text-xs text-slate-500 mt-0.5">{formatBytes(file.size)}</p>
          </div>
          <button
            type="button"
            onClick={() => setFile(null)}
            className="text-slate-400 hover:text-red-500 transition-colors p-1"
          >
            <X size={18} />
          </button>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={cn(
            'rounded-2xl border-2 border-dashed p-12 flex flex-col items-center justify-center cursor-pointer transition-all duration-200',
            isDragActive
              ? 'border-[#2563EB] bg-blue-50'
              : 'border-slate-300 bg-white hover:border-[#2563EB] hover:bg-blue-50/30'
          )}
        >
          <input {...getInputProps()} />
          <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mb-4">
            <FileArchive size={26} className="text-slate-500" />
          </div>
          <p className="text-sm font-medium text-[#0F172A]">
            {isDragActive ? 'Drop your archive here' : 'Drag & drop your project archive'}
          </p>
          <p className="text-xs text-slate-400 mt-1">or click to browse — .zip, .rar, .7z up to 100 MB</p>
        </div>
      )}

      <div className="flex justify-between pt-2">
        <Button type="button" variant="outline" size="lg" onClick={onBack}>
          <ChevronLeft size={18} /> Back
        </Button>
        <Button type="button" variant="primary" size="lg" onClick={() => onNext(file)}>
          Next <ChevronRight size={18} />
        </Button>
      </div>
    </div>
  )
}

// ─── Step 7: Preview & Submit ─────────────────────────────────────────────────

interface Step7Props {
  data: WizardData
  onBack: () => void
  onSubmit: () => void
  isSubmitting: boolean
}

function Step7Preview({ data, onBack, onSubmit, isSubmitting }: Step7Props) {
  const difficultyColor: Record<string, string> = {
    Beginner: 'bg-green-100 text-green-700 border-green-200',
    Intermediate: 'bg-amber-100 text-amber-700 border-amber-200',
    Advanced: 'bg-red-100 text-red-700 border-red-200',
    Expert: 'bg-purple-100 text-purple-700 border-purple-200',
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[#0F172A] font-['Sora']">Preview & Submit</h2>
        <p className="text-sm text-slate-500 mt-1">Review your project before submitting for review.</p>
      </div>

      {/* Summary card */}
      <div className="rounded-2xl border border-slate-200 bg-white divide-y divide-slate-100 overflow-hidden">
        {/* Header */}
        <div className="p-5">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h3 className="text-lg font-bold text-[#0F172A]">{data.title || <span className="text-slate-400 italic">Untitled</span>}</h3>
              <p className="text-sm text-slate-500 mt-1 max-w-prose">{data.shortDescription}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-2xl font-bold text-[#2563EB]">
                {data.price === 0 ? 'Free' : `₹${data.price.toLocaleString('en-IN')}`}
              </p>
            </div>
          </div>
        </div>

        {/* Meta row */}
        <div className="px-5 py-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <SummaryMeta label="Type" value={data.projectType === 'admin' ? 'Admin Project' : 'Student Project'} />
          <SummaryMeta label="Domain" value={data.domain || '—'} />
          <SummaryMeta
            label="Difficulty"
            value={
              data.difficulty ? (
                <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full border', difficultyColor[data.difficulty] ?? 'bg-slate-100 text-slate-600 border-slate-200')}>
                  {data.difficulty}
                </span>
              ) : '—'
            }
          />
          <SummaryMeta label="Category" value={data.category || '—'} />
        </div>

        {/* Description */}
        {data.longDescription && (
          <div className="px-5 py-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Description Preview</p>
            <p className="text-sm text-slate-700 line-clamp-4">{data.longDescription}</p>
          </div>
        )}

        {/* Technologies */}
        {data.technologies.length > 0 && (
          <div className="px-5 py-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Tech Stack</p>
            <div className="flex flex-wrap gap-2">
              {data.technologies.map((tech) => (
                <span key={tech} className="inline-flex items-center bg-blue-50 text-blue-700 border border-blue-200 rounded-lg px-2.5 py-0.5 text-xs font-medium">
                  {tech}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Tags */}
        {data.tags.length > 0 && (
          <div className="px-5 py-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Tags</p>
            <div className="flex flex-wrap gap-2">
              {data.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">#{tag}</Badge>
              ))}
            </div>
          </div>
        )}

        {/* URLs */}
        {(data.githubUrl || data.videoUrl) && (
          <div className="px-5 py-4 flex flex-wrap gap-4">
            {data.githubUrl && (
              <a href={data.githubUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-[#2563EB] hover:underline flex items-center gap-1">
                <Link size={12} /> GitHub Repository
              </a>
            )}
            {data.videoUrl && (
              <a href={data.videoUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-[#2563EB] hover:underline flex items-center gap-1">
                <Link size={12} /> Video Tutorial
              </a>
            )}
          </div>
        )}

        {/* Assets */}
        <div className="px-5 py-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
          <SummaryMeta
            label="Screenshots"
            value={data.screenshots.length > 0 ? `${data.screenshots.length} image${data.screenshots.length > 1 ? 's' : ''}` : 'None uploaded'}
          />
          <SummaryMeta
            label="Documentation"
            value={data.documentation.trim().length > 0 ? `${data.documentation.trim().length} chars` : 'Not provided'}
          />
          <SummaryMeta
            label="Project File"
            value={data.projectFile ? data.projectFile.name : 'None uploaded'}
          />
        </div>
      </div>

      {/* Notice */}
      <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
        <strong>Note:</strong> Your project will be reviewed before it goes live. You will be notified once it is approved.
      </div>

      <div className="flex justify-between pt-2">
        <Button type="button" variant="outline" size="lg" onClick={onBack}>
          <ChevronLeft size={18} /> Back
        </Button>
        <Button
          type="button"
          variant="primary"
          size="lg"
          loading={isSubmitting}
          onClick={onSubmit}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Project'}
          {!isSubmitting && <Upload size={18} />}
        </Button>
      </div>
    </div>
  )
}

interface SummaryMetaProps {
  label: string
  value: React.ReactNode
}

function SummaryMeta({ label, value }: SummaryMetaProps) {
  return (
    <div>
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5">{label}</p>
      <p className="text-sm text-[#0F172A] font-medium">{value}</p>
    </div>
  )
}

// ─── Page animation variants ──────────────────────────────────────────────────

const stepVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 60 : -60,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 60 : -60,
    opacity: 0,
  }),
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function UploadProjectPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [direction, setDirection] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [wizardData, setWizardData] = useState<WizardData>(defaultWizardData)

  const goNext = () => {
    setDirection(1)
    setCurrentStep((s) => Math.min(s + 1, TOTAL_STEPS))
  }

  const goBack = () => {
    setDirection(-1)
    setCurrentStep((s) => Math.max(s - 1, 1))
  }

  // Step handlers
  const handleStep1 = (values: Step1Data) => {
    setWizardData((prev) => ({ ...prev, ...values }))
    goNext()
  }

  const handleStep2 = (values: Step2Data) => {
    setWizardData((prev) => ({ ...prev, ...values }))
    goNext()
  }

  const handleStep3 = (values: Step3Data) => {
    setWizardData((prev) => ({ ...prev, ...values }))
    goNext()
  }

  const handleStep4 = (files: File[]) => {
    setWizardData((prev) => ({ ...prev, screenshots: files }))
    goNext()
  }

  const handleStep5 = (doc: string) => {
    setWizardData((prev) => ({ ...prev, documentation: doc }))
    goNext()
  }

  const handleStep6 = (file: File | null) => {
    setWizardData((prev) => ({ ...prev, projectFile: file }))
    goNext()
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      const payload = {
        title: wizardData.title,
        description: wizardData.shortDescription,
        longDescription: wizardData.longDescription,
        category: wizardData.category,
        domain: wizardData.domain,
        difficulty: wizardData.difficulty as import('@/types').DifficultyLevel,
        price: wizardData.price,
        projectType: wizardData.projectType,
        technologies: wizardData.technologies,
        tags: wizardData.tags,
        githubUrl: wizardData.githubUrl || undefined,
        videoUrl: wizardData.videoUrl || undefined,
        documentation: wizardData.documentation || undefined,
        screenshotCount: wizardData.screenshots.length,
        hasProjectFile: !!wizardData.projectFile,
      }

      await projectService.createProject(payload)
      toast.success('Project submitted successfully! It will be reviewed shortly.')

      // Reset wizard
      setWizardData(defaultWizardData)
      setCurrentStep(1)
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: unknown }).message)
          : 'Failed to submit project. Please try again.'
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-10 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Page header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-[#0F172A] font-['Sora']">Upload a Project</h1>
          <p className="text-slate-500 mt-2 text-sm">
            Share your work with the InnovateGuide community in a few easy steps.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 sm:p-8">
          <StepIndicator currentStep={currentStep} />

          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentStep}
              custom={direction}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: 'tween', duration: 0.22, ease: 'easeInOut' }}
            >
              {currentStep === 1 && (
                <Step1Basic data={wizardData} onNext={handleStep1} />
              )}
              {currentStep === 2 && (
                <Step2Details data={wizardData} onNext={handleStep2} onBack={goBack} />
              )}
              {currentStep === 3 && (
                <Step3Technologies data={wizardData} onNext={handleStep3} onBack={goBack} />
              )}
              {currentStep === 4 && (
                <Step4Media
                  screenshots={wizardData.screenshots}
                  onNext={handleStep4}
                  onBack={goBack}
                />
              )}
              {currentStep === 5 && (
                <Step5Documentation
                  documentation={wizardData.documentation}
                  onNext={handleStep5}
                  onBack={goBack}
                />
              )}
              {currentStep === 6 && (
                <Step6Files
                  projectFile={wizardData.projectFile}
                  onNext={handleStep6}
                  onBack={goBack}
                />
              )}
              {currentStep === 7 && (
                <Step7Preview
                  data={wizardData}
                  onBack={goBack}
                  onSubmit={handleSubmit}
                  isSubmitting={isSubmitting}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Step counter */}
        <p className="text-center text-xs text-slate-400 mt-4">
          Step {currentStep} of {TOTAL_STEPS}
        </p>
      </div>
    </div>
  )
}
