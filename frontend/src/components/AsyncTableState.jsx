import { memo } from "react";

const AsyncTableState = memo(
  ({
    isLoading = false,
    error = null,
    isEmpty = false,
    colSpan = 1,
    loadingMessage = "Cargando...",
    emptyMessage = "No hay registros.",
  }) => {
    if (isLoading) {
      return (
        <tr>
          <td colSpan={colSpan} className="text-center py-3">
            {loadingMessage}
          </td>
        </tr>
      );
    }

    if (error) {
      return (
        <tr>
          <td colSpan={colSpan} className="text-danger py-3">
            {error}
          </td>
        </tr>
      );
    }

    if (isEmpty) {
      return (
        <tr>
          <td colSpan={colSpan} className="text-muted py-3">
            {emptyMessage}
          </td>
        </tr>
      );
    }

    return null;
  },
);

AsyncTableState.displayName = "AsyncTableState";

export default AsyncTableState;
