import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Info from '@/components/ui/layout/sidebar/Info';
import { NavigationProvider } from '@/contexts/NavigationContext';

describe('Info Component', () => {
    let container: HTMLElement;

    beforeEach(() => {
        const result = render(
            <NavigationProvider>
                <Info />
            </NavigationProvider>
        );
        container = result.container;
    });

    test('renders and handles Open Data Disclaimer button click', () => {

        // Simulate clicking the Open Data Disclaimer button
        const openDataDisclaimerButton = screen.getByRole('button', { name: /open data disclaimer/i });
        fireEvent.click(openDataDisclaimerButton);

        // Use getAllByRole to get all buttons named "Close"
        const closeButtons = screen.getAllByRole('button', { name: 'Close' });

        // Find the visible "Close" button by checking its parent element's visibility
        const visibleCloseButton = closeButtons.find(button => {
            return window.getComputedStyle(button.parentElement as Element).display !== 'none';
        });

        // Simulate clicking the visible Close button
        if (visibleCloseButton) {
            fireEvent.click(visibleCloseButton);
        }

        // Assert that the modal is closed (optional, depending on your component's implementation)
        const modal = screen.queryByRole('dialog');
        expect(modal).not.toBeInTheDocument();
    });

    test('renders Contact Webmaster link', () => {
        const link = screen.getByRole('button', { name: /Contact Webmaster/i });
        expect(link).toBeInTheDocument();
    });
});
