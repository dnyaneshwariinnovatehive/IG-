import React, { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useDropzone } from 'react-dropzone'
import { toast } from 'sonner'
import { Upload, X, Plus, ImageIcon, FileArchive, Tag, Loader2 } from 'lucide-react'
import { Button } from '@ui/button'
import { Input } from '@ui/input'
import { Textarea } from '@ui/textarea'
import projectService from '@services/projectService'
import { cn } from '@utils/index'
import type { DifficultyLevel } from '@ig-types/index'

// ─── Constants ───────────────────────────────────────────────────────────────

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
  'Desktop Application',
  'Other',
]

const YEAR_OPTIONS = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Other']

const DIFFICULTIES: { value: DifficultyLevel; label: string }[] = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
]

// ─── Schema ──────────────────────────────────────────────────────────────────

const schema = z.object({
  // Student Details
  studentName: z.string().min(2, 'Full name is required'),
  email: z.string().email('Enter a valid email address'),
  mobile: z.string().regex(/^\+?[0-9]{10,13}$/, 'Enter a valid mobile number'),
  college: z.string().min(2, 'College name is required'),
  course: z.string().min(2, 'Course name is required'),
  year: z.string().min(1, 'Please select your year'),

  // Project Details
  title: z.string().min(3, 'Project title must be at least 3 characters'),
  developer: z.string().min(2, 'Developer name is required'),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced'] as const, {
    required_error: 'Please select a difficulty level',
  }),
  price: z.coerce
    .number({ invalid_type_error: 'Price must be a number' })
    .min(0, 'Price cannot be negative'),
  domain: z.string().min(1, 'Please select a domain'),
  description: z.string().min(50, 'Description must be at least 50 characters'),
  videoUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  githubUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  requirements: z.string().min(10, 'Requirements must be at least 10 characters'),
  setupInstructions: z.string().min(10, 'Setup instructions must be at least 10 characters'),
})

type FormValues = z.infer<typeof schema>

// ─── Sub-components ──────────────────────────────────────────────────────────

const FieldLabel: React.FC<{
  children: React.ReactNode
  required?: boolean
  htmlFor?: string
}> = ({ children, required, htmlFor }) => (
  <label
    htmlFor={htmlFor}
    className="block text-sm font-semibold text-slate-700 mb-1.5"
  >
    {children}
    {required && <span className="text-red-500 ml-0.5">*</span>}
  </label>
)

const FieldError: React.FC<{ message?: string }> = ({ message }) =>
  message ? <p className="mt-1 text-xs text-red-500">{message}</p> : null

const StyledSelect: React.FC<
  React.SelectHTMLAttributes<HTMLSelectElement> & { error?: boolean }
> = ({ error, className, children, ...props }) => (
  <select
    {...props}
    className={cn(
      'w-full h-12 rounded-xl border bg-white px-4 text-sm text-slate-900',
      'appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all',
      error ? 'border-red-400' : 'border-slate-200',
      className
    )}
  >
    {children}
  </select>
)

interface TagInputProps {
  label: string
  placeholder: string
  tags: string[]
  onChange: (tags: string[]) => void
  required?: boolean
}

const TagInput: React.FC<TagInputProps> = ({
  label,
  placeholder,
  tags,
  onChange,
  required,
}) => {
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
      <FieldLabel required={required}>{label}</FieldLabel>
      <div className="flex gap-2 mb-2">
        <div className="relative flex-1">
          <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder={placeholder}
            className="w-full h-12 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all pl-9 pr-4"
          />
        </div>
        <button
          type="button"
          onClick={add}
          className="h-12 px-4 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors border border-blue-200"
        >
          <Plus size={16} />
        </button>
      </div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100"
            >
              {tag}
              <button
                type="button"
                onClick={() => remove(tag)}
                className="text-blue-400 hover:text-red-500 transition-colors ml-0.5"
              >
                <X size={11} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

interface FileDropProps {
  label: string
  accept: Record<string, string[]>
  multiple?: boolean
  icon: React.ReactNode
  description: string
  files: File[]
  onFiles: (files: File[]) => void
  onRemove: (index: number) => void
  required?: boolean
}

const FileDrop: React.FC<FileDropProps> = ({
  label,
  accept,
  multiple,
  icon,
  description,
  files,
  onFiles,
  onRemove,
  required,
}) => {
  const onDrop = useCallback(
    (accepted: File[]) => {
      onFiles(multiple ? [...files, ...accepted] : accepted)
    },
    [files, multiple, onFiles]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    multiple,
  })

  return (
    <div>
      <FieldLabel required={required}>{label}</FieldLabel>
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200',
          isDragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-slate-200 bg-slate-50 hover:border-blue-400 hover:bg-blue-50/40'
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-2 text-slate-500">
          {icon}
          <p className="text-sm font-medium text-slate-700">
            {isDragActive ? 'Drop files here…' : 'Drag & drop or click to upload'}
          </p>
          <p className="text-xs text-slate-400">{description}</p>
        </div>
      </div>
      {files.length > 0 && (
        <ul className="mt-2.5 space-y-1.5">
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

const FormSection: React.FC<{
  number: number
  title: string
  children: React.ReactNode
}> = ({ number, title, children }) => (
  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
    <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 bg-slate-50/60">
      <span className="w-7 h-7 rounded-full bg-accent text-white text-xs font-bold flex items-center justify-center shrink-0">
        {number}
      </span>
      <h2 className="font-sora font-bold text-base text-slate-900">{title}</h2>
    </div>
    <div className="p-6 space-y-5">{children}</div>
  </div>
)

// ─── Main Page ───────────────────────────────────────────────────────────────

const UploadProjectPage: React.FC = () => {
  const navigate = useNavigate()
  const [technologies, setTechnologies] = useState<string[]>([])
  const [screenshotFiles, setScreenshotFiles] = useState<File[]>([])
  const [zipFiles, setZipFiles] = useState<File[]>([])

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { difficulty: 'beginner', price: 0 },
  })

  const onSubmit = async (data: FormValues) => {
    try {
      await projectService.createProject({
        title: data.title,
        domain: data.domain,
        difficulty: data.difficulty,
        price: data.price,
        description: data.description,
        technologies,
        tags: technologies,
        githubUrl: data.githubUrl || undefined,
        videoUrl: data.videoUrl || undefined,
        status: 'pending',
        developer: data.developer,
        studentName: data.studentName,
        studentEmail: data.email,
        studentMobile: data.mobile,
        college: data.college,
        course: data.course,
        year: data.year,
        requirements: data.requirements,
        setupInstructions: data.setupInstructions,
      } as Parameters<typeof projectService.createProject>[0])

      toast.success('Project submitted successfully! We will review it shortly.')
      navigate('/')
    } catch {
      toast.error('Submission failed. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="font-sora font-bold text-2xl sm:text-3xl text-slate-900">
            Submit Your Project
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Fill in your details and project information. Our team will review and
            publish it within 24–48 hours.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
          {/* ── Section 1: Student Details ── */}
          <FormSection number={1} title="Student Details">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <FieldLabel required htmlFor="studentName">
                  Student Name
                </FieldLabel>
                <Input
                  id="studentName"
                  {...register('studentName')}
                  placeholder="Your full name"
                  error={errors.studentName?.message}
                />
              </div>
              <div>
                <FieldLabel required htmlFor="email">
                  Email Address
                </FieldLabel>
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  placeholder="you@example.com"
                  error={errors.email?.message}
                />
              </div>
              <div>
                <FieldLabel required htmlFor="mobile">
                  Mobile Number
                </FieldLabel>
                <Input
                  id="mobile"
                  type="tel"
                  {...register('mobile')}
                  placeholder="+91 9876543210"
                  error={errors.mobile?.message}
                />
              </div>
              <div>
                <FieldLabel required htmlFor="college">
                  College Name
                </FieldLabel>
                <Input
                  id="college"
                  {...register('college')}
                  placeholder="Your college or university"
                  error={errors.college?.message}
                />
              </div>
              <div>
                <FieldLabel required htmlFor="course">
                  Course
                </FieldLabel>
                <Input
                  id="course"
                  {...register('course')}
                  placeholder="e.g. B.Tech CSE, BCA, MCA"
                  error={errors.course?.message}
                />
              </div>
              <div>
                <FieldLabel required htmlFor="year">
                  Year
                </FieldLabel>
                <StyledSelect
                  id="year"
                  {...register('year')}
                  error={!!errors.year}
                >
                  <option value="">Select year</option>
                  {YEAR_OPTIONS.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </StyledSelect>
                <FieldError message={errors.year?.message} />
              </div>
            </div>
          </FormSection>

          {/* ── Section 2: Project Details ── */}
          <FormSection number={2} title="Project Details">
            {/* Row: Title + Developer */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <FieldLabel required htmlFor="title">
                  Project Title
                </FieldLabel>
                <Input
                  id="title"
                  {...register('title')}
                  placeholder="e.g. AI Attendance System"
                  error={errors.title?.message}
                />
              </div>
              <div>
                <FieldLabel required htmlFor="developer">
                  Developer
                </FieldLabel>
                <Input
                  id="developer"
                  {...register('developer')}
                  placeholder="Developer or team name"
                  error={errors.developer?.message}
                />
              </div>
            </div>

            {/* Row: Difficulty + Price + Domain */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div>
                <FieldLabel required htmlFor="difficulty">
                  Difficulty Level
                </FieldLabel>
                <StyledSelect
                  id="difficulty"
                  {...register('difficulty')}
                  error={!!errors.difficulty}
                >
                  {DIFFICULTIES.map((d) => (
                    <option key={d.value} value={d.value}>
                      {d.label}
                    </option>
                  ))}
                </StyledSelect>
                <FieldError message={errors.difficulty?.message} />
              </div>
              <div>
                <FieldLabel required htmlFor="price">
                  Price (₹)
                </FieldLabel>
                <Input
                  id="price"
                  type="number"
                  min={0}
                  {...register('price')}
                  placeholder="e.g. 1499"
                  error={errors.price?.message}
                />
              </div>
              <div>
                <FieldLabel required htmlFor="domain">
                  Domain
                </FieldLabel>
                <StyledSelect
                  id="domain"
                  {...register('domain')}
                  error={!!errors.domain}
                >
                  <option value="">Select domain</option>
                  {DOMAIN_OPTIONS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </StyledSelect>
                <FieldError message={errors.domain?.message} />
              </div>
            </div>

            {/* Description */}
            <div>
              <FieldLabel required htmlFor="description">
                Description
              </FieldLabel>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Describe your project — features, purpose, technical highlights, and what makes it unique..."
                className="min-h-[120px]"
                error={errors.description?.message}
              />
            </div>

            {/* Technologies / Tags */}
            <TagInput
              label="Technologies / Tags"
              placeholder="Type a technology and press Enter (e.g. React, Python)"
              tags={technologies}
              onChange={setTechnologies}
              required
            />

            {/* Video Tutorial URL */}
            <div>
              <FieldLabel htmlFor="videoUrl">Video Tutorial URL</FieldLabel>
              <Input
                id="videoUrl"
                {...register('videoUrl')}
                placeholder="https://youtube.com/watch?v=..."
                error={errors.videoUrl?.message}
              />
            </div>

            {/* Screenshots */}
            <FileDrop
              label="Project Screenshots"
              accept={{ 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] }}
              multiple
              icon={<ImageIcon size={28} className="text-slate-400" />}
              description="PNG, JPG, WebP — upload multiple screenshots"
              files={screenshotFiles}
              onFiles={setScreenshotFiles}
              onRemove={(i) =>
                setScreenshotFiles((prev) => prev.filter((_, idx) => idx !== i))
              }
            />

            {/* ZIP File */}
            <FileDrop
              label="Project ZIP File"
              accept={{
                'application/zip': ['.zip'],
                'application/x-zip-compressed': ['.zip'],
              }}
              multiple={false}
              icon={<FileArchive size={28} className="text-slate-400" />}
              description="Single ZIP archive containing the full project source code"
              files={zipFiles}
              onFiles={(f) => setZipFiles(f)}
              onRemove={(i) =>
                setZipFiles((prev) => prev.filter((_, idx) => idx !== i))
              }
            />

            {/* GitHub URL */}
            <div>
              <FieldLabel required htmlFor="githubUrl">
                GitHub Repository URL
              </FieldLabel>
              <Input
                id="githubUrl"
                {...register('githubUrl')}
                placeholder="https://github.com/username/repo"
                error={errors.githubUrl?.message}
              />
            </div>

            {/* Requirements */}
            <div>
              <FieldLabel required htmlFor="requirements">
                Requirements &amp; Dependencies
              </FieldLabel>
              <Textarea
                id="requirements"
                {...register('requirements')}
                placeholder="List all required software, libraries, or frameworks (e.g. Node.js v18+, Python 3.10, MongoDB)..."
                className="min-h-[100px]"
                error={errors.requirements?.message}
              />
            </div>

            {/* Setup Instructions */}
            <div>
              <FieldLabel required htmlFor="setupInstructions">
                Setup Instructions
              </FieldLabel>
              <Textarea
                id="setupInstructions"
                {...register('setupInstructions')}
                placeholder="Step-by-step instructions to run the project locally..."
                className="min-h-[120px]"
                error={errors.setupInstructions?.message}
              />
            </div>
          </FormSection>

          {/* ── Action Buttons ── */}
          <div className="flex items-center justify-end gap-3 pt-2 pb-10">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => navigate('/')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={isSubmitting}
              className="min-w-[160px] gap-2"
            >
              {isSubmitting ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Upload size={15} />
              )}
              Submit Project
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default UploadProjectPage
