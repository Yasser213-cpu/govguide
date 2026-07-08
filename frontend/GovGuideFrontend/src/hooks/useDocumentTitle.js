import { useEffect } from "react";

const useDocumentTitle = (title) => {
  useEffect(() => {
    document.title = title ? `GovGuide - ${title}` : "GovGuide";
  }, [title]);
};

export default useDocumentTitle;
