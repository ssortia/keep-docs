import { useCallback } from 'react';

interface ApiErrorResponse {
  data?: {
    message?: string;
  };
}

interface ApiError {
  response?: ApiErrorResponse;
  message?: string;
}

function isApiError(err: unknown): err is ApiError {
  return typeof err === 'object' && err !== null && ('response' in err || 'message' in err);
}

function hasResponse(err: ApiError): err is ApiError & { response: ApiErrorResponse } {
  return 'response' in err && err.response !== undefined;
}

function hasMessage(err: ApiError): err is ApiError & { message: string } {
  return 'message' in err && typeof err.message === 'string';
}

export function useApiError() {
  const handleError = useCallback((err: unknown, onError?: (error: string) => void): string => {
    let errorMessage = 'Произошла ошибка';

    if (isApiError(err)) {
      if (hasResponse(err) && err.response.data?.message) {
        errorMessage = err.response.data.message;
      } else if (hasMessage(err)) {
        errorMessage = err.message;
      }
    }

    onError?.(errorMessage);
    return errorMessage;
  }, []);

  const handleAsyncError = useCallback(
    async (operation: () => Promise<any>, onError?: (error: string) => void): Promise<any> => {
      try {
        return await operation();
      } catch (err) {
        handleError(err, onError);
        throw err;
      }
    },
    [handleError],
  );

  return {
    handleError,
    handleAsyncError,
  };
}
