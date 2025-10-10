import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface Section {
    id: string
    label: string
    icon?: React.ReactNode
}

interface SectionTabsProps {
    sections: Section[]
    activeSection: string
    onSectionChange: (sectionId: string) => void
}

export function SectionTabs({
    sections,
    activeSection,
    onSectionChange,
}: SectionTabsProps) {
    return (
        <div className="flex gap-2 px-4 py-3 overflow-x-auto">
            {sections.map((section) => (
                <Button
                    key={section.id}
                    variant={activeSection === section.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => onSectionChange(section.id)}
                    className={cn(
                        'flex items-center gap-2 whitespace-nowrap transition-all',
                        activeSection === section.id && 'shadow-md'
                    )}
                >
                    {section.icon}
                    {section.label}
                </Button>
            ))}
        </div>
    )
}