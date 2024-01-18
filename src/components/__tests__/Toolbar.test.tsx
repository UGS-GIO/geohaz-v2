import { test } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import Toolbar from '../Toolbar'

let container: HTMLElement

beforeEach(() => {
    const result = render(<Toolbar />)
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

// test that the first button is not active by default
test('Info button is not active by default', () => {
    const infoButton = container.querySelector('calcite-action[text="Info"]')
    expect(infoButton).not.toHaveAttribute('active', 'true')
})

// test that clicking first button triggers the correct action
test('clicking the Info button triggers the correct action', () => {
    const infoButton = container.querySelector('calcite-action[text="Info"]')
    const layersButton = container.querySelector('calcite-action[text="Layers"]')
    fireEvent.click(infoButton as Element)

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

// test if shellPanelCollapsed is true, the panel is collapsed on page load
test('if shellPanelCollapsed is true, the panel is collapsed', () => {
    const panel = container.querySelector('calcite-shell-panel')
    expect(panel).toHaveAttribute('collapsed', 'true')
})

// test if clicking the Info button toggles the panel
test('clicking the Info button toggles the panel', () => {
    const infoButton = container.querySelector('calcite-action[text="Info"]')
    fireEvent.click(infoButton as Element)
    const panel = container.querySelector('calcite-shell-panel')
    expect(panel).not.toHaveAttribute('collapsed', 'true')
})