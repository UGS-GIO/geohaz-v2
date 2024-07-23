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

