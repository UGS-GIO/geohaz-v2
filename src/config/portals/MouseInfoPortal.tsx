import { createPortal } from "react-dom";

type MouseInfoPortalProps = {
    mount: HTMLElement;
    children: React.ReactNode;
};

const MouseInfoPortal: React.FC<MouseInfoPortalProps> = ({ mount, children }) => {
    return createPortal(children, mount);
}

export default MouseInfoPortal;