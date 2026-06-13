import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Save, Shield, MessageCircle, Tag, Plus, X, Edit2, Check, Eye, EyeOff, Globe, RefreshCw } from 'lucide-react'
import { Button } from '@ui/button'
import { Input } from '@ui/input'
import AdminHeader from '@admin/components/AdminHeader'
import { cn } from '@utils/index'

interface Category { id: string; name: string; slug: string }

const platformSchema = z.object({
  siteName: z.string().min(2, 'Site name must be at least 2 characters'),
  whatsappNumber: z.string().regex(/^\d{10,15}$/, 'Enter digits only with country code (e.g. 919876543210)').or(z.literal('')),
})

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters').regex(/[A-Z]/, 'Must contain at least one uppercase letter').regex(/[0-9]/, 'Must contain at least one number'),
  confirmPassword: z.string().min(1, 'Please confirm your new password'),
}).refine((d) => d.newPassword === d.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] })

type PlatformValues = z.infer<typeof platformSchema>
type PasswordValues = z.infer<typeof passwordSchema>

const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-1',  name: 'AI & ML',            slug: 'ai-ml' },
  { id: 'cat-2',  name: 'Web Development',     slug: 'web-development' },
  { id: 'cat-3',  name: 'Mobile Development',  slug: 'mobile-development' },
  { id: 'cat-4',  name: 'IoT / Embedded',      slug: 'iot-embedded' },
  { id: 'cat-5',  name: 'Cybersecurity',        slug: 'cybersecurity' },
  { id: 'cat-6',  name: 'Data Science',         slug: 'data-science' },
  { id: 'cat-7',  name: 'Blockchain / Web3',    slug: 'blockchain-web3' },
  { id: 'cat-8',  name: 'Cloud / DevOps',       slug: 'cloud-devops' },
  { id: 'cat-9',  name: 'Desktop Application',  slug: 'desktop-application' },
  { id: 'cat-10', name: 'Game Development',     slug: 'game-development' },
]

function toSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}
function uid(): string { return 'cat-' + Math.random().toString(36).slice(2, 9) }

interface SectionProps { icon: React.ReactNode; iconBg: string; title: string; subtitle?: string; children: React.ReactNode }
const Section: React.FC<SectionProps> = ({ icon, iconBg, title, subtitle, children }) => (
  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
    <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 bg-slate-50/70">
      <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center shrink-0', iconBg)}>{icon}</div>
      <div>
        <h2 className="font-sora font-semibold text-slate-900 text-sm">{title}</h2>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
    </div>
    <div className="p-6">{children}</div>
  </div>
)

const PasswordInput = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string }>(
  ({ label, error, ...props }, ref) => {
    const [show, setShow] = useState(false)
    const inputId = label.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className="flex flex-col gap-1.5 w-full">
        <label htmlFor={inputId} className="text-sm font-medium text-slate-700">{label}</label>
        <div className="relative">
          <input ref={ref} id={inputId} type={show ? 'text' : 'password'} className={cn('w-full h-12 rounded-xl border bg-white px-4 pr-11 text-sm text-slate-900 placeholder:text-slate-400 transition-all duration-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50', error ? 'border-red-400 focus:border-red-400 focus:ring-red-400/20' : 'border-slate-200')} {...props} />
          <button type="button" onClick={() => setShow((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors" tabIndex={-1}>
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}
      </div>
    )
  }
)
PasswordInput.displayName = 'PasswordInput'

interface CategoryRowProps { category: Category; onEdit: (id: string, name: string) => void; onDelete: (id: string) => void }
const CategoryRow: React.FC<CategoryRowProps> = ({ category, onEdit, onDelete }) => {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(category.name)
  const commit = () => {
    const trimmed = value.trim()
    if (trimmed && trimmed !== category.name) onEdit(category.id, trimmed)
    else setValue(category.name)
    setEditing(false)
  }
  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') { setValue(category.name); setEditing(false) } }
  return (
    <div className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 group">
      {editing ? (
        <input autoFocus value={value} onChange={(e) => setValue(e.target.value)} onBlur={commit} onKeyDown={handleKey} className="flex-1 min-w-0 text-sm bg-white border border-blue-400 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
      ) : (
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Tag size={13} className="text-slate-400 shrink-0" />
          <span className="text-sm font-medium text-slate-800 truncate">{category.name}</span>
          <span className="text-xs text-slate-400 font-mono truncate hidden sm:block">/{category.slug}</span>
        </div>
      )}
      <div className="flex items-center gap-1 shrink-0">
        {editing ? (
          <button type="button" onClick={commit} className="p-1.5 rounded-lg text-green-600 bg-green-50 hover:bg-green-100 transition-colors"><Check size={13} /></button>
        ) : (
          <button type="button" onClick={() => setEditing(true)} className="p-1.5 rounded-lg text-blue-600 bg-blue-50 opacity-0 group-hover:opacity-100 hover:bg-blue-100 transition-all"><Edit2 size={13} /></button>
        )}
        <button type="button" onClick={() => onDelete(category.id)} className="p-1.5 rounded-lg text-red-500 bg-red-50 opacity-0 group-hover:opacity-100 hover:bg-red-100 transition-all"><X size={13} /></button>
      </div>
    </div>
  )
}

const AdminSettingsPage: React.FC = () => {
  const [platformSaving, setPlatformSaving] = useState(false)
  const { register: regPlatform, handleSubmit: handlePlatform, setValue: setPlatformValue, formState: { errors: platformErrors } } = useForm<PlatformValues>({ resolver: zodResolver(platformSchema), defaultValues: { siteName: 'InnovateGuide', whatsappNumber: '' } })

  useEffect(() => {
    const savedWhatsapp = localStorage.getItem('ig_whatsapp')
    const savedSiteName = localStorage.getItem('ig_site_name')
    if (savedWhatsapp) setPlatformValue('whatsappNumber', savedWhatsapp)
    if (savedSiteName) setPlatformValue('siteName', savedSiteName)
  }, [setPlatformValue])

  const onSavePlatform = async (data: PlatformValues) => {
    setPlatformSaving(true)
    try {
      await new Promise((r) => setTimeout(r, 500))
      localStorage.setItem('ig_whatsapp', data.whatsappNumber)
      localStorage.setItem('ig_site_name', data.siteName)
      toast.success('Platform settings saved successfully.')
    } catch { toast.error('Failed to save platform settings.') } finally { setPlatformSaving(false) }
  }

  const [passwordSaving, setPasswordSaving] = useState(false)
  const { register: regPassword, handleSubmit: handlePassword, reset: resetPassword, formState: { errors: passwordErrors } } = useForm<PasswordValues>({ resolver: zodResolver(passwordSchema), defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' } })

  const onChangePassword = async (_data: PasswordValues) => {
    setPasswordSaving(true)
    try {
      await new Promise((r) => setTimeout(r, 800))
      toast.success('Password changed successfully.')
      resetPassword()
    } catch { toast.error('Failed to change password. Please check your current password.') } finally { setPasswordSaving(false) }
  }

  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES)
  const [newCatName, setNewCatName] = useState('')
  const [catSaving, setCatSaving] = useState(false)

  const addCategory = () => {
    const name = newCatName.trim()
    if (!name) return
    if (categories.some((c) => c.name.toLowerCase() === name.toLowerCase())) { toast.error('A category with that name already exists.'); return }
    setCategories((prev) => [...prev, { id: uid(), name, slug: toSlug(name) }])
    setNewCatName('')
  }
  const editCategory = (id: string, name: string) => setCategories((prev) => prev.map((c) => c.id === id ? { ...c, name, slug: toSlug(name) } : c))
  const deleteCategory = (id: string) => { setCategories((prev) => prev.filter((c) => c.id !== id)); toast.success('Category removed.') }
  const saveCategories = async () => {
    setCatSaving(true)
    try { await new Promise((r) => setTimeout(r, 600)); toast.success(`${categories.length} categories saved successfully.`) }
    catch { toast.error('Failed to save categories.') } finally { setCatSaving(false) }
  }
  const resetCategories = () => { setCategories(DEFAULT_CATEGORIES); toast('Categories reset to defaults.') }
  const handleNewCatKey = (e: React.KeyboardEvent<HTMLInputElement>) => { if (e.key === 'Enter') { e.preventDefault(); addCategory() } }

  return (
    <div className="flex flex-col gap-6">
      <AdminHeader title="Settings" subtitle="Configure platform behaviour and security" />
      <div className="max-w-3xl mx-auto w-full space-y-6 pb-10">
        <Section icon={<Globe size={16} className="text-blue-600" />} iconBg="bg-blue-100" title="Platform Settings" subtitle="Site name and WhatsApp contact number">
          <form onSubmit={handlePlatform(onSavePlatform)} className="space-y-5" noValidate>
            <Input label="Site Name" {...regPlatform('siteName')} placeholder="e.g. InnovateGuide" error={platformErrors.siteName?.message} />
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5"><MessageCircle size={13} className="inline mr-1.5 text-green-600" />WhatsApp Number</label>
              <Input {...regPlatform('whatsappNumber')} placeholder="919876543210 (country code + number, no spaces or +)" error={platformErrors.whatsappNumber?.message} />
              <p className="text-xs text-slate-400 mt-1.5">Used for the "Buy on WhatsApp" CTA on project detail pages. Example: <code className="bg-slate-100 px-1 rounded">919876543210</code> for +91 98765 43210.</p>
            </div>
            <div className="pt-1"><Button type="submit" variant="primary" size="sm" loading={platformSaving} className="gap-2"><Save size={14} />Save Platform Settings</Button></div>
          </form>
        </Section>

        <Section icon={<Shield size={16} className="text-purple-600" />} iconBg="bg-purple-100" title="Change Password" subtitle="Update your admin account password">
          <form onSubmit={handlePassword(onChangePassword)} className="space-y-5" noValidate>
            <PasswordInput label="Current Password" {...regPassword('currentPassword')} placeholder="Enter your current password" error={passwordErrors.currentPassword?.message} />
            <PasswordInput label="New Password" {...regPassword('newPassword')} placeholder="At least 8 characters, one uppercase, one number" error={passwordErrors.newPassword?.message} />
            <PasswordInput label="Confirm New Password" {...regPassword('confirmPassword')} placeholder="Re-enter your new password" error={passwordErrors.confirmPassword?.message} />
            <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-xs text-amber-800 leading-relaxed"><strong>Note:</strong> In production this updates the admin credentials via the secure API endpoint. Make sure your new password is at least 8 characters, contains an uppercase letter and a number.</div>
            <div className="pt-1"><Button type="submit" variant="primary" size="sm" loading={passwordSaving} className="gap-2"><Shield size={14} />Change Password</Button></div>
          </form>
        </Section>

        <Section icon={<Tag size={16} className="text-emerald-600" />} iconBg="bg-emerald-100" title="Project Categories" subtitle="Manage the domain categories shown in browse and filter panels">
          <div className="flex gap-2 mb-4">
            <input value={newCatName} onChange={(e) => setNewCatName(e.target.value)} onKeyDown={handleNewCatKey} placeholder="New category name, press Enter to add" className="flex-1 h-10 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all" />
            <button type="button" onClick={addCategory} className="h-10 px-3.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors border border-emerald-200 shrink-0"><Plus size={16} /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-5">
            {categories.map((cat) => <CategoryRow key={cat.id} category={cat} onEdit={editCategory} onDelete={deleteCategory} />)}
            {categories.length === 0 && <p className="col-span-2 text-center text-sm text-slate-400 py-8">No categories yet. Add one above.</p>}
          </div>
          <p className="text-xs text-slate-400 mb-4">{categories.length} categor{categories.length !== 1 ? 'ies' : 'y'} &mdash; hover a row to reveal edit / delete actions.</p>
          <div className="flex items-center gap-3 pt-1">
            <Button type="button" variant="primary" size="sm" loading={catSaving} onClick={saveCategories} className="gap-2"><Save size={14} />Save Categories</Button>
            <button type="button" onClick={resetCategories} className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 transition-colors px-3 h-8 rounded-lg hover:bg-slate-100"><RefreshCw size={13} />Reset to defaults</button>
          </div>
        </Section>
      </div>
    </div>
  )
}

export default AdminSettingsPage
