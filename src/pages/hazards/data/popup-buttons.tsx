// src/pages/hazards/data/popup-buttons.tsx

import { Button } from "@/components/custom/button"
import ReportGenerator from "@/components/sidebar/report-generator"
import { FileTextIcon } from "lucide-react"
import { useSidebar } from "@/hooks/use-sidebar"

// Define ReportGeneratorButton as a React component
const ReportGeneratorButton: React.FC = () => {
    const { setCurrentContent } = useSidebar()

    const handleReportGenerator = () => {
        setCurrentContent({
            title: 'Report Generator',
            label: '',
            icon: <FileTextIcon />,
            componentPath: '/src/components/sidebar/report-generator',
            component: ReportGenerator,
        })
    }

    return (
        <Button onClick={handleReportGenerator} variant="secondary">
            Report Generator
        </Button>
    )
}

// Export popupButtons with the proper component
export const popupButtons = [
    {
        id: "reportGenerator",
        component: ReportGeneratorButton, // Use the React component directly
    },
]