export function getAdminApiErrorMessage(error, fallbackMessage) {
  const status = error?.response?.status;
  const apiMessage = error?.response?.data?.message;

  if (status === 503) {
    return (
      apiMessage ||
      "MongoDB is currently unavailable. Cached public content may still appear, but dashboard actions will recover after Atlas access is restored."
    );
  }

  return apiMessage || fallbackMessage;
}
