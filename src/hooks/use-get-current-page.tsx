import { useLocation } from "@tanstack/react-router";

const useGetCurrentPage = () => {
    const { pathname } = useLocation();
    const currentPage = pathname.split('/')[1];
    return currentPage;
}

export { useGetCurrentPage };