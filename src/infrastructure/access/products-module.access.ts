import { features } from '@/infrastructure/features'
import { type Access } from 'payload'

export const productsModule: Access = () => features.products
