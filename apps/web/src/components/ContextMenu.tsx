import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';

export interface ContextMenuItem {
    label: string;
    icon?: ReactNode;
    onClick: () => void;
    danger?: boolean;
    disabled?: boolean;
    separator?: false;
}

export interface ContextMenuSeparator {
    separator: true;
}

export type ContextMenuEntry = ContextMenuItem | ContextMenuSeparator;

interface ContextMenuState {
    x: number;
    y: number;
    items: ContextMenuEntry[];
}

interface ContextMenuContextValue {
    show: (items: ContextMenuEntry[], x: number, y: number) => void;
    hide: () => void;
}

const ContextMenuContext = createContext<ContextMenuContextValue | null>(null);

export function ContextMenuProvider({ children }: { children: ReactNode }) {
    const [menu, setMenu] = useState<ContextMenuState | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    const show = useCallback((items: ContextMenuEntry[], x: number, y: number) => {
        setMenu({ x, y, items });
    }, []);

    const hide = useCallback(() => setMenu(null), []);

    useEffect(() => {
        if (!menu) return;
        function onDown(e: MouseEvent) {
            if (!menuRef.current?.contains(e.target as Node)) hide();
        }
        function onKey(e: KeyboardEvent) {
            if (e.key === 'Escape') hide();
        }
        document.addEventListener('mousedown', onDown);
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('mousedown', onDown);
            document.removeEventListener('keydown', onKey);
        };
    }, [menu, hide]);

    // Prevent native context menu everywhere
    useEffect(() => {
        function prevent(e: MouseEvent) {
            e.preventDefault();
        }
        document.addEventListener('contextmenu', prevent);
        return () => document.removeEventListener('contextmenu', prevent);
    }, []);

    // Clamp menu to viewport
    const MENU_W = 200;
    const MENU_ITEM_H = 32;
    const estimatedH = menu ? menu.items.reduce((h, item) => h + ('separator' in item && item.separator ? 9 : MENU_ITEM_H), 8) : 0;
    const x = menu ? Math.min(menu.x, window.innerWidth - MENU_W - 8) : 0;
    const y = menu ? Math.min(menu.y, window.innerHeight - estimatedH - 8) : 0;

    return (
        <ContextMenuContext.Provider value={{ show, hide }}>
            {children}
            {menu && (
                <div
                    ref={menuRef}
                    className="border-line-2 bg-lift fixed z-[9999] min-w-[200px] overflow-hidden rounded-[10px] border p-1 shadow-2xl"
                    style={{ top: y, left: x }}
                >
                    {menu.items.map((item, i) => {
                        if ('separator' in item && item.separator) {
                            return <div key={i} className="bg-line-2 my-1 h-px" />;
                        }
                        const it = item as ContextMenuItem;
                        return (
                            <button
                                key={i}
                                type="button"
                                disabled={it.disabled}
                                onClick={() => {
                                    it.onClick();
                                    hide();
                                }}
                                className={`flex w-full items-center gap-2.5 rounded-[7px] px-3 py-[7px] text-left text-[13px] transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                                    it.danger ? 'text-[#e35d3a] hover:bg-[#2a1515]' : 'text-fg-body hover:bg-active hover:text-fg-primary'
                                }`}
                            >
                                {it.icon && <span className="flex-none">{it.icon}</span>}
                                {it.label}
                            </button>
                        );
                    })}
                </div>
            )}
        </ContextMenuContext.Provider>
    );
}

export function useContextMenu() {
    const ctx = useContext(ContextMenuContext);
    if (!ctx) throw new Error('useContextMenu must be used inside ContextMenuProvider');
    return ctx;
}
