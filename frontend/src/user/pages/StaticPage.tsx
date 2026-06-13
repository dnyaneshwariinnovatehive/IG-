import React from 'react'
import { useLocation, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

const PAGES: Record<string, { title: string; content: React.ReactNode }> = {
  'how-it-works': {
    title: 'How It Works',
    content: (
      <div className="flex flex-col gap-6">
        <p className="text-slate-600 leading-relaxed">InnovateGuide connects student creators with buyers looking for quality software projects. Here's how it works:</p>
        <div className="grid gap-4">
          {[
            { step: '1', title: 'Browse Projects', desc: 'Explore 1,500+ student-built projects across categories like AI, Web Development, Cybersecurity, and more.' },
            { step: '2', title: 'Purchase & Download', desc: 'Buy a project with secure payments and get instant access to the full source code and documentation.' },
            { step: '3', title: 'Use & Customize', desc: 'Use the project as-is or customize it to fit your needs. All projects come with complete documentation.' },
            { step: '4', title: 'Sell Your Own', desc: 'Student creators can upload their projects and earn money by selling to a global audience.' },
          ].map((item) => (
            <div key={item.step} className="flex gap-4 p-4 bg-slate-50 rounded-xl">
              <span className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 text-white font-bold shrink-0">{item.step}</span>
              <div>
                <h3 className="font-semibold text-slate-800">{item.title}</h3>
                <p className="text-sm text-slate-500 mt-1">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  'case-study': {
    title: 'Case Study',
    content: (
      <div className="flex flex-col gap-6">
        <p className="text-slate-600 leading-relaxed">Discover how students and businesses have benefited from InnovateGuide.</p>
        <div className="grid md:grid-cols-2 gap-6">
          {[
            { title: 'AI Attendance System', author: 'Rahul S.', result: '100+ downloads in first month', desc: 'Built as a college project, this AI-powered attendance system using facial recognition became one of our top-selling projects.' },
            { title: 'E-Commerce Platform', author: 'Priya M.', result: '₹50,000+ in sales', desc: 'A full-stack e-commerce solution built with Next.js and MongoDB that helped 20+ small businesses go online.' },
          ].map((item) => (
            <div key={item.title} className="bg-white rounded-2xl border border-slate-200 p-6">
              <h3 className="font-bold text-slate-800">{item.title}</h3>
              <p className="text-sm text-blue-600 font-medium">by {item.author}</p>
              <p className="text-sm text-emerald-600 font-semibold mt-2">{item.result}</p>
              <p className="text-sm text-slate-500 mt-2 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  faq: {
    title: 'Frequently Asked Questions',
    content: (
      <div className="flex flex-col gap-4">
        {[
          { q: 'How do I purchase a project?', a: 'Simply browse our catalog, select a project, and click "Buy Now". Complete the secure payment, and you\'ll get instant access to the source code.' },
          { q: 'Can I get a refund?', a: 'Yes, we offer a 7-day refund policy if the project doesn\'t meet the described specifications.' },
          { q: 'How do I sell my project?', a: 'Sign up as a creator, upload your project with detailed documentation, and set your price. We handle payments and delivery.' },
          { q: 'Are the projects original?', a: 'All projects are built by verified student creators. Each project is reviewed for quality and originality before listing.' },
          { q: 'Do I get support after purchase?', a: 'Yes, each project comes with documentation and you can contact the creator for support via our platform.' },
        ].map((item) => (
          <div key={item.q} className="bg-white rounded-2xl border border-slate-200 p-5">
            <h3 className="font-semibold text-slate-800">{item.q}</h3>
            <p className="text-sm text-slate-500 mt-2 leading-relaxed">{item.a}</p>
          </div>
        ))}
      </div>
    ),
  },
  about: {
    title: 'About InnovateGuide',
    content: (
      <div className="flex flex-col gap-6">
        <p className="text-slate-600 leading-relaxed">InnovateGuide is the premium marketplace for student-built software innovations. We bridge the gap between student creators and buyers looking for high-quality, affordable software projects.</p>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { value: '1,500+', label: 'Projects' },
            { value: '500+', label: 'Creators' },
            { value: '3,000+', label: 'Buyers' },
          ].map((stat) => (
            <div key={stat.label} className="text-center bg-slate-50 rounded-2xl p-6">
              <p className="text-3xl font-extrabold text-blue-600">{stat.value}</p>
              <p className="text-sm text-slate-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
        <p className="text-slate-600 leading-relaxed">Founded in 2024, InnovateGuide has grown into a thriving community where students showcase their skills and earn from their projects while buyers get affordable, quality software solutions.</p>
      </div>
    ),
  },
  contact: {
    title: 'Contact Us',
    content: (
      <div className="flex flex-col gap-6">
        <p className="text-slate-600 leading-relaxed">Have questions or feedback? We'd love to hear from you. Reach out to us through any of the channels below.</p>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-slate-50 rounded-2xl p-6">
            <h3 className="font-semibold text-slate-800">Email</h3>
            <p className="text-sm text-slate-500 mt-1">support@innovateguide.com</p>
          </div>
          <div className="bg-slate-50 rounded-2xl p-6">
            <h3 className="font-semibold text-slate-800">Phone</h3>
            <p className="text-sm text-slate-500 mt-1">+91 98765 43210</p>
          </div>
          <div className="bg-slate-50 rounded-2xl p-6">
            <h3 className="font-semibold text-slate-800">Address</h3>
            <p className="text-sm text-slate-500 mt-1">InnovateGuide HQ, Bangalore, India</p>
          </div>
          <div className="bg-slate-50 rounded-2xl p-6">
            <h3 className="font-semibold text-slate-800">Social</h3>
            <p className="text-sm text-slate-500 mt-1">Follow us on Twitter, LinkedIn, and Instagram</p>
          </div>
        </div>
      </div>
    ),
  },
  'privacy-policy': {
    title: 'Privacy Policy',
    content: (
      <div className="flex flex-col gap-4 text-sm text-slate-600 leading-relaxed">
        <p>At InnovateGuide, we take your privacy seriously. This policy describes how we collect, use, and protect your personal information.</p>
        <h3 className="font-semibold text-slate-800 text-base">Information We Collect</h3>
        <p>We collect information you provide when creating an account, making a purchase, or contacting us. This includes your name, email address, and payment information.</p>
        <h3 className="font-semibold text-slate-800 text-base">How We Use Your Information</h3>
        <p>We use your information to process transactions, provide customer support, and improve our services. We never sell your personal data to third parties.</p>
        <h3 className="font-semibold text-slate-800 text-base">Data Security</h3>
        <p>We implement industry-standard security measures to protect your data. All transactions are encrypted using SSL technology.</p>
        <h3 className="font-semibold text-slate-800 text-base">Contact</h3>
        <p>For privacy-related inquiries, contact us at privacy@innovateguide.com.</p>
      </div>
    ),
  },
  'terms-of-service': {
    title: 'Terms of Service',
    content: (
      <div className="flex flex-col gap-4 text-sm text-slate-600 leading-relaxed">
        <p>By using InnovateGuide, you agree to the following terms and conditions.</p>
        <h3 className="font-semibold text-slate-800 text-base">Account Registration</h3>
        <p>You must provide accurate information when creating an account. You are responsible for maintaining the confidentiality of your account credentials.</p>
        <h3 className="font-semibold text-slate-800 text-base">Purchases & Refunds</h3>
        <p>All purchases are subject to our 7-day refund policy. Projects must not be redistributed without proper attribution.</p>
        <h3 className="font-semibold text-slate-800 text-base">Creator Responsibilities</h3>
        <p>Creators warrant that their projects are original and do not infringe on any third-party rights. All listed projects must include complete source code and documentation.</p>
        <h3 className="font-semibold text-slate-800 text-base">Limitation of Liability</h3>
        <p>InnovateGuide acts as a marketplace platform and is not liable for disputes between buyers and creators. We reserve the right to remove listings that violate our policies.</p>
      </div>
    ),
  },
}

export default function StaticPage() {
  const { pathname } = useLocation()
  const slug = pathname.replace('/', '')
  const page = slug ? PAGES[slug] : null

  if (!page) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h1 className="text-3xl font-bold text-slate-800">Page Not Found</h1>
        <p className="text-slate-500 mt-2">The page you're looking for doesn't exist.</p>
        <Link to="/" className="inline-flex items-center gap-2 text-blue-600 font-medium mt-4 hover:underline">
          <ArrowLeft size={16} /> Back to Home
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 mb-8 transition-colors">
        <ArrowLeft size={16} /> Back to Home
      </Link>
      <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-8">{page.title}</h1>
      {page.content}
    </div>
  )
}
