import { useEffect } from 'react'

const SUFFIX = ' · Holidaze'

export function useDocumentTitle(title: string): void {
  useEffect(() => {
    const previous = document.title
    document.title = `${title}${SUFFIX}`
    return () => {
      document.title = previous
    }
  }, [title])
}
