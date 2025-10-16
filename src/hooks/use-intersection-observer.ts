import { useEffect, useState } from 'react'

interface UseIntersectionObserverProps {
    elements: HTMLElement[]
    ids: string[]
    threshold?: number
    rootMargin?: string
}

export function useIntersectionObserver({
    elements,
    ids,
    threshold = 0.3,
    rootMargin = '-100px 0px -50% 0px'
}: UseIntersectionObserverProps) {
    const [activeId, setActiveId] = useState<string>(ids[0] || '')

    useEffect(() => {
        if (elements.length === 0 || ids.length === 0) return

        const observers = elements.map((element, index) => {
            if (!element) return null

            const observer = new IntersectionObserver(
                ([entry]) => {
                    if (entry.isIntersecting) {
                        setActiveId(ids[index])
                    }
                },
                { threshold, rootMargin }
            )

            observer.observe(element)
            return observer
        })

        return () => {
            observers.forEach(observer => observer?.disconnect())
        }
    }, [elements, ids, threshold, rootMargin])

    return { activeId }
}