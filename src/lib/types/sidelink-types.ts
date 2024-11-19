export interface NavLink {
    title: string
    label?: string
    href?: string
    icon: JSX.Element
    component?: () => JSX.Element
    componentPath?: string
}

export interface SideLink extends NavLink {
    sub?: NavLink[]
}