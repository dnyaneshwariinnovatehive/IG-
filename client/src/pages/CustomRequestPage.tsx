import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import {
  CheckCircle,
  MessageCircle,
  Clock,
  Shield,
  Users,
  Send,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import requestService from '@/services/requestService'

// ─── Validation Schema ────────────────────────────────────────────────────────

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional(),
  projectType: z.string().min(1, 'Please select a project type'),
  budget: z.string().min(1, 'Please select a budget range'),
  timeline: z.string().min(1, 'Please select a timeline'),
  technologies: z.string().optional(),
  requirements: z.string().min(30, 'Please describe your project in at least 30 characters'),
  additionalInfo: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

// ─── Constants ────────────────────────────────────────────────────────────────

const PROJECT_TYPES = [
  'Web Development',
  'Mobile Application',
  'AI / Machine Learning',
  'IoT / Embedded Systems',
  'Data Science / Analytics',
  'Blockchain / Web3',
  'Cybersecurity',
  'Cloud / DevOps',
  'Desktop Application',
  'Other',
]

const BUDGET_RANGES = [
  '₹1,000 – ₹5,000',
  '₹5,000 – ₹15,000',
  '₹15,000 – ₹30,000',
  '₹30,000 – ₹50,000',
  '₹50,000+',
  'To be discussed',
]

const TIMELINES = [
  '1 week',
  '2 weeks',
  '1 month',
  '2 months',
  '3 months',
  'Flexible',
]

const BENEFITS = [
  'Free Project Consultation',
  'Student & Industry Experts',
  'Delivery & Industry Guidance',
  'Multiple Revision Support',
]

const HOW_IT_WORKS = [
  {
    step: 1,
    title: 'Submit Your Request',
    desc: 'Fill out the form with your project idea, budget, and timeline requirements.',
  },
  {
    step: 2,
    title: 'Expert Review',
    desc: 'Our team reviews your request and contacts you within 24 hours to discuss details.',
  },
  {
    step: 3,
    title: 'Get Your Project',
    desc: 'We build, test, and deliver your custom project with full documentation.',
  },
]

// ─── Animation variants ────────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

// ─── Field label helper ───────────────────────────────────────────────────────

const FieldLabel: React.FC<{ children: React.ReactNode; required?: boolean }> = ({
  children,
  required,
}) => (
  <label className="block text-sm font-medium text-slate-700 mb-1.5">
    {children}
    {required && <span className="text-red-500 ml-0.5">*</span>}
  </label>
)

// ─── Native select wrapper ────────────────────────────────────────────────────

const NativeSelect = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement> & { error?: string }
>(({ className = '', error, children, ...props }, ref) => (
  <div className="w-full">
    <select
      ref={ref}
      className={[
        'w-full h-12 rounded-xl border bg-white px-4 text-sm text-slate-900',
        'transition-all duration-200 appearance-none cursor-pointer',
        'focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        error
          ? 'border-red-400 focus:border-red-400 focus:ring-red-400/20'
          : 'border-slate-200',
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </select>
    {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
  </div>
))
NativeSelect.displayName = 'NativeSelect'

// ─── Main Component ───────────────────────────────────────────────────────────

const CustomRequestPage: React.FC = () => {
  const [submitted, setSubmitted] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  })

  const onSubmit = async (data: FormValues) => {
    try {
      await requestService.createCustomRequest({
        title: data.projectType,
        description: data.requirements,
        budget: undefined,
        deadline: data.timeline,
        category: data.projectType,
        // extend with full fields — the API accepts extra keys via [key: string]: unknown
        ...(data as Record<string, unknown>),
      })
      setSubmitted(true)
      reset()
      toast.success('Request submitted successfully!')
    } catch {
      toast.error('Something went wrong. Please try again.')
    }
  }

  const whatsappNumber = '919876543210'
  const whatsappHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    'Hi! I would like to discuss a custom project requirement.'
  )}`

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Hero banner ── */}
      <div className="bg-gradient-to-r from-[#0F172A] to-[#1E3A5F] text-white py-14 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30 mb-4"
          >
            Premium Custom Projects
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="font-sora font-bold text-3xl sm:text-4xl lg:text-5xl leading-tight mb-4"
          >
            Get Your{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
              Dream Project
            </span>{' '}
            Built
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.2 }}
            className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto"
          >
            Describe your idea and our expert team will craft a fully functional project
            tailored to your exact requirements — on time and within budget.
          </motion.p>
        </div>
      </div>

      {/* ── Two-column content ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">

          {/* ══ LEFT — Form ══ */}
          <motion.div
            className="lg:col-span-3 bg-white rounded-2xl shadow-lg border border-slate-200 p-6 sm:p-8"
            variants={stagger}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={fadeUp} className="mb-6">
              <h2 className="font-sora font-bold text-2xl text-slate-900">
                Request Custom Project
              </h2>
              <p className="text-slate-500 text-sm mt-1">
                Fields marked with <span className="text-red-500">*</span> are required.
              </p>
            </motion.div>

            {/* Success state */}
            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-12 text-center gap-4"
              >
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="text-green-600" size={32} />
                </div>
                <h3 className="font-sora font-bold text-xl text-slate-900">
                  Request Submitted!
                </h3>
                <p className="text-slate-500 max-w-xs">
                  We'll contact you within 24 hours to discuss your project requirements.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSubmitted(false)}
                  className="mt-2"
                >
                  Submit Another Request
                </Button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>

                {/* Row 1: Name + Email */}
                <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <FieldLabel required>Your Name</FieldLabel>
                    <Input
                      {...register('name')}
                      placeholder="e.g. Rahul Sharma"
                      error={errors.name?.message}
                    />
                  </div>
                  <div>
                    <FieldLabel required>Email Address</FieldLabel>
                    <Input
                      {...register('email')}
                      type="email"
                      placeholder="you@example.com"
                      error={errors.email?.message}
                    />
                  </div>
                </motion.div>

                {/* Row 2: Phone + Project Type */}
                <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <FieldLabel>Phone Number</FieldLabel>
                    <Input
                      {...register('phone')}
                      type="tel"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                  <div>
                    <FieldLabel required>Project Type</FieldLabel>
                    <NativeSelect
                      {...register('projectType')}
                      error={errors.projectType?.message}
                    >
                      <option value="">Select project type</option>
                      {PROJECT_TYPES.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </NativeSelect>
                  </div>
                </motion.div>

                {/* Row 3: Budget + Timeline */}
                <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <FieldLabel required>Budget Range</FieldLabel>
                    <NativeSelect
                      {...register('budget')}
                      error={errors.budget?.message}
                    >
                      <option value="">Select budget range</option>
                      {BUDGET_RANGES.map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </NativeSelect>
                  </div>
                  <div>
                    <FieldLabel required>Timeline</FieldLabel>
                    <NativeSelect
                      {...register('timeline')}
                      error={errors.timeline?.message}
                    >
                      <option value="">Select timeline</option>
                      {TIMELINES.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </NativeSelect>
                  </div>
                </motion.div>

                {/* Technologies */}
                <motion.div variants={fadeUp}>
                  <FieldLabel>Preferred Technologies</FieldLabel>
                  <Input
                    {...register('technologies')}
                    placeholder="e.g. React, Node.js, Python, MongoDB (comma-separated)"
                  />
                  <p className="mt-1 text-xs text-slate-400">
                    Enter technologies separated by commas. Leave blank if unsure.
                  </p>
                </motion.div>

                {/* Requirements */}
                <motion.div variants={fadeUp}>
                  <FieldLabel required>Project Requirements</FieldLabel>
                  <Textarea
                    {...register('requirements')}
                    placeholder="Describe your project in detail — features, functionality, goals, target users, and any specific technical requirements..."
                    className="min-h-[130px]"
                    error={errors.requirements?.message}
                  />
                </motion.div>

                {/* Additional Info */}
                <motion.div variants={fadeUp}>
                  <FieldLabel>Additional Information</FieldLabel>
                  <Textarea
                    {...register('additionalInfo')}
                    placeholder="Any other details — deadline constraints, reference links, design preferences, etc."
                    className="min-h-[90px]"
                  />
                </motion.div>

                {/* Submit */}
                <motion.div variants={fadeUp}>
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-full gap-2"
                    loading={isSubmitting}
                  >
                    <Send size={17} />
                    Request Custom Project
                  </Button>
                </motion.div>
              </form>
            )}
          </motion.div>

          {/* ══ RIGHT — Trust Panel ══ */}
          <motion.div
            className="lg:col-span-2 space-y-5"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            {/* Custom Project Support card */}
            <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-[#0F172A] via-[#1E3A5F] to-[#163559] text-white p-6 shadow-xl">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <Shield size={20} className="text-blue-300" />
                </div>
                <h3 className="font-sora font-bold text-lg">Custom Project Support</h3>
              </div>

              {/* Benefits */}
              <ul className="space-y-3 mb-6">
                {BENEFITS.map((benefit) => (
                  <li key={benefit} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle size={13} className="text-green-400" />
                    </div>
                    <span className="text-sm text-slate-200">{benefit}</span>
                  </li>
                ))}
              </ul>

              {/* Stats strip */}
              <div className="grid grid-cols-3 gap-3 mb-6 pt-5 border-t border-white/10">
                <div className="text-center">
                  <p className="font-sora font-bold text-xl text-white">500+</p>
                  <p className="text-xs text-slate-400 mt-0.5">Projects Done</p>
                </div>
                <div className="text-center border-x border-white/10">
                  <p className="font-sora font-bold text-xl text-white">24h</p>
                  <p className="text-xs text-slate-400 mt-0.5">Response Time</p>
                </div>
                <div className="text-center">
                  <p className="font-sora font-bold text-xl text-white">4.9</p>
                  <p className="text-xs text-slate-400 mt-0.5">Avg Rating</p>
                </div>
              </div>

              {/* WhatsApp CTA */}
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2.5 w-full py-3 rounded-xl bg-green-500 hover:bg-green-600 transition-colors text-white font-semibold text-sm shadow-md"
              >
                <MessageCircle size={17} />
                Contact via WhatsApp
              </a>
            </div>

            {/* How It Works card */}
            <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-md">
              <div className="flex items-center gap-2 mb-5">
                <Clock size={18} className="text-blue-600" />
                <h3 className="font-sora font-bold text-base text-slate-900">How It Works</h3>
              </div>

              <ol className="space-y-5">
                {HOW_IT_WORKS.map(({ step, title, desc }) => (
                  <li key={step} className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold shrink-0">
                      {step}
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-slate-800">{title}</p>
                      <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{desc}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            {/* Expert team badge */}
            <div className="rounded-2xl bg-amber-50 border border-amber-200 p-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                <Users size={20} className="text-amber-600" />
              </div>
              <div>
                <p className="font-semibold text-sm text-amber-900">Expert Team</p>
                <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
                  Every custom project is handled by verified developers with industry experience
                  in your chosen technology stack.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default CustomRequestPage
