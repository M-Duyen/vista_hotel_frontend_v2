export interface NavItem {
    label: string;
    path: string;
}

export interface MenuSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    navItems: NavItem[];
}

export interface SearchSidebarProps {
    isOpen: boolean;
    onClose: () => void;
}
