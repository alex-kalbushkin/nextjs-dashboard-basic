import React from 'react';

export const ErrorMessages = ({
  errors = [],
  ariaDescribedBy,
}: {
  errors?: string[];
  ariaDescribedBy: string;
}) => {
  return (
    <div id={ariaDescribedBy} aria-atomic="true" aria-live="polite">
      {errors.map((error, errorKey) => (
        <p key={errorKey} className="my-2 text-sm text-red-600">
          {error}
        </p>
      ))}
    </div>
  );
};
