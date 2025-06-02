import { cache } from 'react'
import { twMerge } from 'tailwind-merge'
import { clsx, type ClassValue } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function absoluteUrl(path: string) {
  return `${process.env.NEXT_PUBLIC_APP_URL}${path}`
}

export const getNftData = cache(async (metadataUri: string) => {
  const response = await fetch(metadataUri)
  const data = await response.json()

  return data
})
