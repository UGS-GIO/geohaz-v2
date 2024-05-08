import { createPortal } from "react-dom";

type PortalProps = {
    mount: HTMLElement;
    children: React.ReactNode;
};

/**
 * The Portal component is a simple wrapper around a DOM node 
 * It takes a mount prop which is the DOM node that the children will be rendered into
 * It then renders the children into this DOM node 
 * @param mount - HTMLElement
 * @param children - React.ReactNode
 */
const Portal: React.FC<PortalProps> = ({ mount, children }) => {
    return createPortal(children, mount);
}

export default Portal;