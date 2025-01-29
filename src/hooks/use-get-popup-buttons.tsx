import { useState, useEffect } from "react"
import { useGetCurrentPage } from "@/hooks/use-get-current-page"

const useGetPopupButtons = () => {
    const currentPage = useGetCurrentPage()
    const [popupButtons, setPopupButtons] = useState<JSX.Element[] | null>(null)

    useEffect(() => {
        let isMounted = true

        const loadButtons = async () => {
            try {
                // Try to import the popup-buttons file dynamically
                const { popupButtons } = await import(
                    `@/pages/${currentPage}/data/popup-buttons.tsx`
                )

                if (isMounted && popupButtons) {
                    const renderedButtons = popupButtons.map((button: any) => {
                        const ButtonComponent = button.component
                        return <ButtonComponent key={button.id} />
                    })
                    setPopupButtons(renderedButtons)
                }
            } catch (error) {
                // Handle cases where the file doesn't exist
                if (isMounted) {
                    console.warn("Popup buttons file not found or no buttons available.")
                    setPopupButtons(null)
                }
            }
        }

        loadButtons()

        return () => {
            isMounted = false
        }
    }, [currentPage])

    return popupButtons
}

export { useGetPopupButtons }
