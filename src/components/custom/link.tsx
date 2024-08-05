import { Link as RouterLink } from "react-router-dom";

type LinkProps = {
    to: string;
    children: React.ReactNode;
};

const Link = ({ children, ...props }: LinkProps) => {

    return (
        <RouterLink className='p-0 text-primary hover:underline' target="_blank" rel="noopener noreferrer" {...props}>
            {children}
        </RouterLink>
    );
};

export { Link };