import { useEffect, useState, useCallback } from "react";
import { getUnreadNotificationsCount } from "./notificationsApi";

const POLL_INTERVAL = 20000; // 20 ثانية

export default function useUnreadNotificationsCount() {
  const [count, setCount] = useState(0);

  const refresh = useCallback(async () => {
    try {
      const unread = await getUnreadNotificationsCount();
      setCount(unread);
    } catch (err) {
      console.log(err);
    }
  }, []);

  useEffect(() => {
    refresh();

    const interval = setInterval(refresh, POLL_INTERVAL);

    return () => clearInterval(interval);
  }, [refresh]);

  return { count, refresh };
}
