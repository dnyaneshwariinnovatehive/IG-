export type ProjectStatus = 'pending' | 'approved' | 'rejected' | 'published' | 'draft' | 'archived'
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced'
export type ProjectType = 'admin' | 'student'

export interface Project {
  id: string
  title: string
  description: string
  price: number
  domain: string
  difficulty: DifficultyLevel
  type: ProjectType
  technologies: string[]
  screenshots: string[]
  videoUrl?: string
  githubUrl?: string
  status: ProjectStatus
  createdAt: string
  updatedAt?: string
  views: number
  downloads: number
  rating: number
  reviewCount: number
  isTrending: boolean
  isNew: boolean
  isFeatured: boolean
  isTopSelling: boolean
  tags: string[]
  rejectionReason?: string
}

export interface Category {
  id: string
  name: string
  slug: string
  icon: string
  count: number
  color: string
  description: string
}

export interface AdminUser {
  id: string
  email: string
  role: 'admin'
  name: string
}

export interface CustomRequest {
  id: string
  name: string
  email: string
  phone: string
  projectType: string
  budget: string
  timeline: string
  technologies: string[]
  description: string
  additionalInfo?: string
  status: 'pending' | 'in-progress' | 'completed' | 'rejected'
  createdAt: string
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface FilterOptions {
  search?: string
  category?: string
  domain?: string
  difficulty?: DifficultyLevel | ''
  minPrice?: number
  maxPrice?: number
  sort?: 'newest' | 'trending' | 'price-asc' | 'price-desc' | 'most-viewed' | 'top-rated' | 'top-selling'
  page?: number
  limit?: number
}

export interface AdminStats {
  totalProjects: number
  studentProjects: number
  adminProjects: number
  pendingApprovals: number
  buyEnquiries: number
  customEnquiries: number
}
