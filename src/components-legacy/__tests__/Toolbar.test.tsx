import { test } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import Toolbar from '@/components/ui/layout/Toolbar'
import { NavigationProvider } from '@/contexts/NavigationContext'

let container: HTMLElement

beforeEach(() => {
    const result = render(<NavigationProvider><Toolbar /></NavigationProvider>)
    container = result.container
})

// test that the component renders
test('renders Toolbar component', () => {
    expect(container.querySelector('calcite-action-bar')).toBeInTheDocument()
})

// test that the component renders the info button
test('renders Info button', () => {
    const infoButton = container.querySelector('calcite-action[text="Info"]')
    expect(infoButton).toBeInTheDocument()
})

// test that the Info panel is active by default
test('Info button is active by default', () => {
    const infoButton = container.querySelector('calcite-action[text="Info"]')
    expect(infoButton).toHaveAttribute('active', 'true')
})

// test that clicking first button triggers the correct action
test('clicking the Info button triggers the correct action', () => {
    const infoButton = container.querySelector('calcite-action[text="Info"]')
    const layersButton = container.querySelector('calcite-action[text="Layers"]')
    fireEvent.click(infoButton as Element) // click to deactivate the button since it is active by default
    fireEvent.click(infoButton as Element) // click to activate the button

    // test that it was clicked and is active
    expect(infoButton).toHaveAttribute('active', 'true')

    // test that the other button was not clicked or active
    expect(layersButton).not.toHaveAttribute('active', 'true')
})

// test that the component renders the layers button
test('renders Layers button', () => {
    const layersButton = container.querySelector('calcite-action[text="Layers"]')
    expect(layersButton).toBeInTheDocument()
})

// test that clicking a different button triggers the correct action
test('clicking the Layers button triggers the correct action', () => {
    const infoButton = container.querySelector('calcite-action[text="Info"]')
    const layersButton = container.querySelector('calcite-action[text="Layers"]')
    fireEvent.click(layersButton as Element)

    // test that it was clicked and is active
    expect(layersButton).toHaveAttribute('active', 'true')

    // test that the other button was not clicked or active
    expect(infoButton).not.toHaveAttribute('active', 'true')
})

// on page load, we should see shellPanelCollapsed as false since the default value is 'Info'
test('if shellPanelCollapsed is true, the panel is collapsed', () => {
    const panel = container.querySelector('calcite-shell-panel')
    expect(panel).toHaveAttribute('collapsed', 'false')
})

test('the info button is active by default', () => {
    const infoButton = container.querySelector('calcite-action[text="Info"]')
    expect(infoButton).toHaveAttribute('active', 'true')
})

// test if clicking the Info button toggles the panel
test('clicking the Info button toggles the panel', () => {
    const infoButton = container.querySelector('calcite-action[text="Info"]')
    fireEvent.click(infoButton as Element)
    const panel = container.querySelector('calcite-shell-panel')
    expect(panel).not.toHaveAttribute('collapsed', 'false')
})

