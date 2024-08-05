import { Button } from "@/components/custom/button";

type LinkProps = {
    to: string;
    children: React.ReactNode;
};

const Link = ({ children, ...props }: LinkProps) => {
    return (
        <Button className='p-0 text-primary' variant={'link'} {...props}>
            {children}
        </Button>
    );
};

export { Link };