import { Button } from "@/components/custom/button";

type LinkProps = {
    to: string;
    children: React.ReactNode;
};

const Link = ({ children, ...props }: LinkProps) => {
    const { to } = props;

    const handleOnClick = () => window.open(`${to}`, '_blank')

    return (
        <Button className='p-0 text-primary' variant={'link'} onClick={handleOnClick} {...props}>
            {children}
        </Button>
    );
};

export { Link };