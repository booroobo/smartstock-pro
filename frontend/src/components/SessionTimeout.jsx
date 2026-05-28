import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Modal from "./Modal";

const IDLE_TIMEOUT_MS = 30 * 60 * 1000;
const WARNING_TIMEOUT_MS = 60 * 1000;
const ACTIVITY_EVENTS = ["mousemove", "keydown", "click", "scroll"];

export default function SessionTimeout() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [warningOpen, setWarningOpen] = useState(false);
  const warningOpenRef = useRef(false);
  const idleTimer = useRef(null);
  const logoutTimer = useRef(null);

  const clearTimers = () => {
    window.clearTimeout(idleTimer.current);
    window.clearTimeout(logoutTimer.current);
  };

  const forceLogout = async () => {
    clearTimers();
    setWarningOpen(false);
    await logout();
    navigate("/login", { replace: true });
  };

  const startIdleTimer = () => {
    clearTimers();
    if (!isAuthenticated) return;
    idleTimer.current = window.setTimeout(() => {
      warningOpenRef.current = true;
      setWarningOpen(true);
      logoutTimer.current = window.setTimeout(forceLogout, WARNING_TIMEOUT_MS);
    }, IDLE_TIMEOUT_MS);
  };

  const stayLoggedIn = () => {
    setWarningOpen(false);
    warningOpenRef.current = false;
    startIdleTimer();
  };

  useEffect(() => {
    warningOpenRef.current = warningOpen;
  }, [warningOpen]);

  useEffect(() => {
    if (!isAuthenticated) {
      clearTimers();
      setWarningOpen(false);
      return undefined;
    }

    const handleActivity = () => {
      if (!warningOpenRef.current) startIdleTimer();
    };

    ACTIVITY_EVENTS.forEach((event) => window.addEventListener(event, handleActivity));
    startIdleTimer();

    return () => {
      ACTIVITY_EVENTS.forEach((event) => window.removeEventListener(event, handleActivity));
      clearTimers();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  if (!warningOpen) return null;

  return (
    <Modal title="Peringatan Sesi" onClose={stayLoggedIn}>
      <div className="ss-session-warning">
        <p>Sesi Anda akan berakhir karena tidak ada aktivitas.</p>
        <div className="ss-form-actions">
          <button className="ss-secondary" type="button" onClick={forceLogout}>Keluar</button>
          <button className="ss-primary" type="button" onClick={stayLoggedIn}>Tetap Masuk</button>
        </div>
      </div>
    </Modal>
  );
}
