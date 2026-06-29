export const getTokenPayload = () => {
  const token = sessionStorage.getItem("access");

  if (!token) return null;

  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
};

export const getCompanyId = () => {
  return getTokenPayload()?.company_id ?? null;
};

export const getUserId = () => {
  return getTokenPayload()?.user_id ?? null;
};

export const getRole = () => {
  return getTokenPayload()?.role ?? null;
};
