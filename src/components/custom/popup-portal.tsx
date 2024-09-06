import { useEffect } from "react";
import { createPortal } from "react-dom";

interface Props {
    mount: Element;
    children: React.ReactNode;
}

const PopupPortal = ({ mount, children }: Props) => {
    const el = document.createElement("div");

    useEffect(() => {
        mount.appendChild(el);
        return () => {
            mount.removeChild(el);
        };
    }, [el, mount]);

    return createPortal(children, el);
};

export default PopupPortal;