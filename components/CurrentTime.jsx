// components/CurrentTime.jsx
"use client";

import { useEffect, useState } from "react";

const CurrentTime = () => {
  const [time, setTime] = useState("");

  useEffect(() => {
    const now = new Date();
    const formatted = now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    setTime(formatted);
  }, []);

  return <span>{time}</span>;
};

export default CurrentTime;
