'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface NavigationBlockerContextType {
  isBlocked: boolean;
  setBlocked: (blocked: boolean) => void;
}

const NavigationBlockerContext = createContext<NavigationBlockerContextType>({
  isBlocked: false,
  setBlocked: () => {},
});

export function useNavigationBlocker() {
  return useContext(NavigationBlockerContext);
}

export function NavigationBlockerProvider({ children }: { children: ReactNode }) {
  const [isBlocked, setIsBlocked] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const router = useRouter();

  // beforeunload for browser refresh/close
  useEffect(() => {
    if (!isBlocked) return;

    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };

    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isBlocked]);

  const setBlocked = useCallback((blocked: boolean) => {
    setIsBlocked(blocked);
  }, []);

  const handleConfirmLeave = () => {
    setIsBlocked(false);
    setShowDialog(false);
    if (pendingHref) {
      router.push(pendingHref);
      setPendingHref(null);
    }
  };

  const handleCancelLeave = () => {
    setShowDialog(false);
    setPendingHref(null);
  };

  const requestNavigation = useCallback((href: string) => {
    if (isBlocked) {
      setPendingHref(href);
      setShowDialog(true);
      return false;
    }
    return true;
  }, [isBlocked]);

  return (
    <NavigationBlockerContext.Provider value={{ isBlocked, setBlocked }}>
      {children}
      <Dialog open={showDialog} onOpenChange={(open) => { if (!open) handleCancelLeave(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>작성 중인 내용이 있습니다</DialogTitle>
            <DialogDescription>
              저장하지 않은 변경사항이 있습니다. 정말 나가시겠습니까?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={handleCancelLeave}>
              계속 작성
            </Button>
            <Button variant="destructive" onClick={handleConfirmLeave}>
              나가기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </NavigationBlockerContext.Provider>
  );
}

interface SafeLinkProps extends Omit<React.ComponentProps<typeof Link>, 'onNavigate'> {
  children: React.ReactNode;
}

export function SafeLink({ href, children, ...props }: SafeLinkProps) {
  const { isBlocked } = useNavigationBlocker();
  const [showDialog, setShowDialog] = useState(false);
  const router = useRouter();

  const handleConfirmLeave = () => {
    setShowDialog(false);
    router.push(typeof href === 'string' ? href : href.toString());
  };

  return (
    <>
      <Link
        href={href}
        onClick={(e) => {
          if (isBlocked) {
            e.preventDefault();
            setShowDialog(true);
          }
        }}
        {...props}
      >
        {children}
      </Link>
      <Dialog open={showDialog} onOpenChange={(open) => { if (!open) setShowDialog(false); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>작성 중인 내용이 있습니다</DialogTitle>
            <DialogDescription>
              저장하지 않은 변경사항이 있습니다. 정말 나가시겠습니까?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              계속 작성
            </Button>
            <Button variant="destructive" onClick={handleConfirmLeave}>
              나가기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
