import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Info from '../Info';
import { NavigationProvider } from '../../../contexts/NavigationContext';

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

    test('renders and handles Open Data Disclaimer button click', async () => {
        const openDisclaimerButton = screen.getByText('Open Data Disclaimer');
        expect(openDisclaimerButton).toBeInTheDocument();
        fireEvent.click(openDisclaimerButton);
        await waitFor(() => {
            expect(screen.getByText('Data Disclaimer')).toBeInTheDocument();
            expect(screen.getByText(/Although this product represents the work of professional scientists/i)).toBeInTheDocument();
        });
        fireEvent.click(screen.getByText('Close'));
        expect(screen.queryByRole('dialog')).toBeNull();
    });

    test('renders Contact Webmaster link', () => {
        const link = screen.getByRole('link', { name: /Contact Webmaster/i });
        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute('href', 'https://geology.utah.gov/about-us/contact-webmaster/');
    });
});
