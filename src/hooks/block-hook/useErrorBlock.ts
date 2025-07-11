"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

interface UseErrorBlockOptions {
  maxAttempts?: number;
  blockDuration?: number;
}

type ErrorType = string;

const DEFAULT_MAX_ATTEMPTS = 5;
const DEFAULT_BLOCK_DURATION = 5 * 60 * 1000; // 5 minutes

export function useErrorBlock(options?: UseErrorBlockOptions) {
  const {
    maxAttempts = DEFAULT_MAX_ATTEMPTS,
    blockDuration = DEFAULT_BLOCK_DURATION,
  } = options || {};

  const [failedAttempts, setFailedAttempts] = useState<
    Record<ErrorType, number>
  >({});
  const [blocked, setBlocked] = useState<Record<ErrorType, boolean>>({});
  const [blockedMessage, setBlockedMessage] = useState<
    Record<ErrorType, string>
  >({});

  useEffect(() => {
    Object.entries(blocked).forEach(([type, isBlocked]) => {
      if (isBlocked && blockedMessage[type]) {
        toast.error(blockedMessage[type], {
          position: "top-right",
          duration: 3000,
        });

        const timer = setTimeout(() => {
          setBlocked((prev) => ({ ...prev, [type]: false }));
          console.log(failedAttempts);
          setBlockedMessage((prev) => {
            const updated = { ...prev };
            delete updated[type];
            return updated;
          });
          setFailedAttempts((prev) => ({ ...prev, [type]: 0 }));
        }, blockDuration);

        return () => clearTimeout(timer);
      }
    });
  }, [blocked, failedAttempts, blockedMessage, blockDuration]);

  const handleFailedAttempt = useCallback(
    (type: ErrorType) => {
      setFailedAttempts((prev) => {
        const newCount = (prev[type] || 0) + 1;

        if (newCount >= maxAttempts) {
          setBlocked((prevBlocked) => ({ ...prevBlocked, [type]: true }));
          setBlockedMessage((prevMessages) => ({
            ...prevMessages,
            [type]: `${
              type.charAt(0).toUpperCase() + type.slice(1)
            } blocked due to too many errors. Try again later.`,
          }));
        }

        return { ...prev, [type]: newCount };
      });
    },
    [maxAttempts]
  );

  const resetBlockState = useCallback((type: ErrorType) => {
    setFailedAttempts((prev) => ({ ...prev, [type]: 0 }));
    setBlocked((prev) => ({ ...prev, [type]: false }));
    setBlockedMessage((prev) => {
      const updated = { ...prev };
      delete updated[type];
      return updated;
    });
  }, []);

  const isBlocked = useCallback(
    (type: ErrorType) => !!blocked[type],
    [blocked]
  );
  const getBlockedMessage = useCallback(
    (type: ErrorType) => blockedMessage[type],
    [blockedMessage]
  );

  return {
    handleFailedAttempt,
    resetBlockState,
    isBlocked,
    getBlockedMessage,
  };
}
