import { test } from 'vitest'
import { render, screen } from '@testing-library/react'
import { fireEvent } from '@testing-library/react'
import MapConfigurations from '@/components/ui/layout/sidebar/MapConfigurations'

let container: HTMLElement

beforeAll(() => {
    delete (window as any).location
    window.location = { href: '' } as any
})

beforeEach(() => {
    const result = render(<MapConfigurations />)
    container = result.container
})

test('renders Map Configurations heading', () => {
    const heading = screen.getByText('Map Configurations')
    expect(heading).toBeInTheDocument()
})

test('renders Location Coordinate Format heading', () => {
    const heading = screen.getByText('Location Coordinate Format')
    expect(heading).toBeInTheDocument()
})

test('renders Toggle Vertical Exaggeration checkbox', () => {
    const checkbox = screen.getByText('Toggle Vertical Exaggeration')
    expect(checkbox).toBeInTheDocument()
})

test('renders Toggle Basemap Labels checkbox', () => {
    const checkbox = screen.getByText('Toggle Basemap Labels')
    expect(checkbox).toBeInTheDocument()
})

test('renders Reload map in 2D mode block', () => {
    const block = screen.getByText('Reload map in 2D mode')
    expect(block).toBeInTheDocument()
})

// this will fail and need updating once the correct link is added in the component
test('renders Reload map in 2D mode button', () => {
    const button = screen.getByRole('button', { name: /Reload map in 2D mode/i })
    expect(button).toBeInTheDocument()
})

test('clicking the button reloads the map', () => {
    const button = screen.getByRole('button', { name: /Reload map in 2D mode/i })
    fireEvent.click(button)
    // Since window.location.href will change, you might need to mock it.
    expect(window.location.href).toBe('https://google.com/')
})