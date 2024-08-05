import { Link } from "react-router-dom";

type LinkProps = {
    to: string;
    children: React.ReactNode;
};

export const BlueLink = ({ children, ...props }: LinkProps) => {
    return (
        <Link {...props}>
            <button className="text-blue-600 underline">{children}</button>
        </Link>
    );
};