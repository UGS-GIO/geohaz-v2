import { test } from 'vitest'
import { render, screen } from '@testing-library/react'
import { fireEvent } from '@testing-library/react'
import MapConfigurations from '../MapConfigurations'

let container: HTMLElement

beforeEach(() => {
    const result = render(<MapConfigurations />)
    container = result.container
})

test('renders Map Configurations block', () => {
    const block = container.querySelector('calcite-block[heading="Map Configurations"]')
    expect(block).not.toBeNull()
})

test('renders Location Coordinate Format block', () => {
    const block = container.querySelector('calcite-block[heading="Location Coordinate Format"]')
    expect(block).toBeInTheDocument()
})

test('renders Toggle Basemap Blending checkbox', () => {
    const checkbox = screen.getByText('Toggle Basemap Blending')
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
test('renders link to reload the map in 2D mode', () => {
    const link = screen.getByRole('link', { name: /Reload map in 2D mode/i })
    expect(link).toHaveAttribute('href', 'https://google.com/')
})


test('clicking the link to reload the map in 2D mode opens the link in a new tab', () => {
    const { getAllByRole } = render(<MapConfigurations />)
    const links = getAllByRole('link', { name: /Reload map in 2D mode/i })
    links.forEach(link => {
        fireEvent.click(link)
        expect(link).toHaveAttribute('target', '_blank')
    })
})