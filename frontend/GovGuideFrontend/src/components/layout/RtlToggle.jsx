import { useState } from "react";

const RtlToggle = () => {
  const [isRtl, setIsRtl] = useState(false);

  const toggleDirection = () => {
    const newValue = !isRtl;
    setIsRtl(newValue);

    document.documentElement.dir = newValue ? "rtl" : "ltr";
  };

  return <button onClick={toggleDirection}>{isRtl ? "LTR" : "RTL"}</button>;
};

export default RtlToggle;
